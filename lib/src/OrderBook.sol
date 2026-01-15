// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Pausable} from '@openzeppelin/contracts/utils/Pausable.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {ECDSA} from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import {IVault} from './interfaces/IVault.sol';
import {IOrderBook} from './interfaces/IOrderBook.sol';
import {IKYCRegistryV2} from './interfaces/IKYCRegistryV2.sol';
import {IFeeManagerV2} from './interfaces/IFeeManagerV2.sol';
import {INonceManagerV2} from './interfaces/INonceManagerV2.sol';
import {IDisputeManagerV2} from './interfaces/IDisputeManagerV2.sol';

contract OrderBook is Ownable, Pausable, ReentrancyGuard, IOrderBook {
  using SafeERC20 for IERC20;

  // MODULES
  IVault public immutable vault;
  IKYCRegistryV2 public kyc;
  IFeeManagerV2 public fees;
  INonceManagerV2 public nonces;
  IDisputeManagerV2 public disputeCfg;

  // STORAGE
  struct Order {
    Status status;
    address seller; // Who has the crypto (determined by bidType)
    address buyer; // Who pays fiat (determined by bidType)
    address base;
    address quote;
    uint256 baseAmount; // seller sells base
    uint256 openedAt;
    uint256 bidExpiry; // for reference
    uint256 takerExpiry;
    uint256 paymentDeadline; // when buyer must send fiat by
    uint256 confirmDeadline; // when seller must confirm by
    uint256 agreedFee; // fee locked at order creation (prevents fee changes)
  }

  // Timeouts for fiat trades
  uint256 public minPaymentWindow = 15 minutes; // minimum allowed payment window
  uint256 public maxPaymentWindow = 2 hours; // maximum allowed payment window
  uint256 public confirmWindow = 24 hours; // maker has 24h to confirm receipt
  uint256 public cancelDisputeWindow = 1 hours; // window to dispute a cancel request

  mapping(bytes32 => Order) public orders; // orderId => Order
  mapping(bytes32 => uint256) public disputeStakes; // orderId => stake amount
  mapping(bytes32 => address) public disputeInitiator; // orderId => who opened dispute
  mapping(bytes32 => uint256) public paymentSentAt; // orderId => timestamp when buyer marked payment
  mapping(bytes32 => uint256) public cancelRequestedAt; // orderId => timestamp when maker requested cancel
  mapping(bytes32 => bool) public canceledBids; // bidHash => canceled status (for reusable bids)

  // EIP-712
  bytes32 public constant BID_TYPEHASH =
    keccak256(
      'Bid(address maker,address base,address quote,uint256 price,uint256 minAmount,uint256 maxAmount,uint8 kycLevel,uint256 expiresAt,uint256 nonce,uint8 bidType,uint256 paymentWindow)'
    );
  bytes32 public constant OI_TYPEHASH =
    keccak256(
      'OrderIntent(bytes32 bidHash,address taker,uint256 amount,uint16 maxSlippageBps,uint256 expiresAt,uint256 nonce)'
    );
  bytes32 private immutable _DOMAIN_SEPARATOR;

  constructor(
    address admin,
    address _vault,
    address _kyc,
    address _fees,
    address _nonces,
    address _dispute
  ) Ownable(admin) {
    vault = IVault(_vault);
    kyc = IKYCRegistryV2(_kyc);
    fees = IFeeManagerV2(_fees);
    nonces = INonceManagerV2(_nonces);
    disputeCfg = IDisputeManagerV2(_dispute);
    _DOMAIN_SEPARATOR = keccak256(
      abi.encode(
        keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
        keccak256(bytes('OrderBook')),
        keccak256(bytes('1')),
        block.chainid,
        address(this)
      )
    );
  }

  function DOMAIN_SEPARATOR() external view returns (bytes32) {
    return _DOMAIN_SEPARATOR;
  }

  // Admin functions
  function setConfirmWindow(uint256 _window) external onlyOwner {
    confirmWindow = _window;
  }

  function setCancelDisputeWindow(uint256 _window) external onlyOwner {
    cancelDisputeWindow = _window;
  }

  function setMinPaymentWindow(uint256 _window) external onlyOwner {
    minPaymentWindow = _window;
  }

  function setMaxPaymentWindow(uint256 _window) external onlyOwner {
    maxPaymentWindow = _window;
  }

  function pause() external onlyOwner {
    _pause();
  }

  function unpause() external onlyOwner {
    _unpause();
  }

  // ------------ Helpers ------------
  function _hashBid(IOrderBook.Bid memory b) internal pure returns (bytes32) {
    return
      keccak256(
        abi.encode(
          BID_TYPEHASH,
          b.maker,
          b.base,
          b.quote,
          b.price,
          b.minAmount,
          b.maxAmount,
          b.kycLevel,
          b.expiresAt,
          b.nonce,
          uint8(b.bidType),
          b.paymentWindow
        )
      );
  }

  function _hashOI(IOrderBook.OrderIntent memory oi) internal pure returns (bytes32) {
    return
      keccak256(abi.encode(OI_TYPEHASH, oi.bidHash, oi.taker, oi.amount, oi.maxSlippageBps, oi.expiresAt, oi.nonce));
  }

  function _verify(bytes32 structHash, bytes calldata sig, address expected) internal view {
    bytes32 digest = keccak256(abi.encodePacked('\x19\x01', _DOMAIN_SEPARATOR, structHash));
    address signer = ECDSA.recover(digest, sig);
    require(signer == expected, 'BAD_SIG');
  }

  function _kycOk(address u, uint8 minLevel) internal view returns (bool) {
    (uint8 lvl, uint64 exp) = kyc.levelOf(u);
    return exp == 0 ? (minLevel == 0) : (block.timestamp < exp && lvl >= minLevel);
  }

  // ------------ Core paths ------------

  // Atomic swap for crypto-crypto trades only
  function createAndFill(
    IOrderBook.Bid calldata bid,
    bytes calldata makerSig,
    IOrderBook.OrderIntent calldata oi,
    bytes calldata takerSig,
    uint256 notionalQuote // amount*price with proper decimals adjustment (computed off-chain)
  ) external nonReentrant whenNotPaused {
    require(bid.quote != address(0), 'USE_CREATE_FOR_FIAT'); // Only for crypto-crypto
    require(block.timestamp < bid.expiresAt, 'BID_EXPIRED');
    require(block.timestamp < oi.expiresAt, 'OI_EXPIRED');

    bytes32 bidHash = _hashBid(bid);
    require(oi.bidHash == bidHash, 'BID_HASH_MISMATCH');
    require(!canceledBids[bidHash], 'BID_CANCELED');

    // Validate order amount is within bid's acceptable range
    require(oi.amount >= bid.minAmount, 'BELOW_MIN_AMOUNT');
    require(oi.amount <= bid.maxAmount, 'ABOVE_MAX_AMOUNT');

    _verify(bidHash, makerSig, bid.maker);
    _verify(_hashOI(oi), takerSig, oi.taker);

    // Only consume taker nonce (bid is reusable)
    require(!nonces.isUsed(oi.taker, oi.nonce), 'TAKER_NONCE_USED');
    nonces.markUsed(oi.taker, oi.nonce);

    // KYC
    require(_kycOk(bid.maker, bid.kycLevel), 'KYC_MAKER');
    require(_kycOk(oi.taker, bid.kycLevel), 'KYC_TAKER');

    // Determine seller and buyer based on bid type
    address seller;
    address buyer;

    if (bid.bidType == IOrderBook.BidType.SELL) {
      seller = bid.maker; // Maker is selling
      buyer = oi.taker; // Taker is buying
    } else {
      seller = oi.taker; // Taker is selling
      buyer = bid.maker; // Maker is buying
    }

    bytes32 orderId = keccak256(
      abi.encodePacked(
        keccak256(abi.encodePacked('\x19\x01', _DOMAIN_SEPARATOR, _hashBid(bid))),
        keccak256(abi.encodePacked('\x19\x01', _DOMAIN_SEPARATOR, _hashOI(oi)))
      )
    );

    // Atomic swap: lock both legs and transfer
    vault.lockForOrder(orderId, seller, bid.base, oi.amount);
    vault.lockForOrder(orderId, buyer, bid.quote, notionalQuote);

    vault.transferLocked(orderId, seller, buyer, bid.base, oi.amount);
    vault.transferLocked(orderId, buyer, seller, bid.quote, notionalQuote);

    // collect fees from quote token (buyer pays fees)
    (uint256 feeTotal, address[] memory recs, uint256[] memory amts) = fees.computeAndEmit(
      orderId,
      buyer,
      bid.quote,
      bid.base,
      bid.quote,
      false,
      notionalQuote
    );
    if (feeTotal > 0) {
      vault.lockForOrder(orderId, buyer, bid.quote, feeTotal);
      for (uint256 i; i < recs.length; i++) {
        if (amts[i] > 0) {
          vault.transferLocked(orderId, buyer, recs[i], bid.quote, amts[i]);
        }
      }
    }

    orders[orderId] = Order({
      status: Status.Filled,
      seller: seller,
      buyer: buyer,
      base: bid.base,
      quote: bid.quote,
      baseAmount: oi.amount,
      openedAt: block.timestamp,
      bidExpiry: bid.expiresAt,
      takerExpiry: oi.expiresAt,
      paymentDeadline: 0,
      confirmDeadline: 0,
      agreedFee: feeTotal // Store fee for record keeping
    });

    emit OrderCreated(orderId, seller, buyer, bid.base, bid.quote, oi.amount);
    emit OrderFilled(orderId);
  }

  // Two-step flow for fiat trades (crypto-fiat)
  // Step 1: Create order and lock maker's crypto
  function create(
    IOrderBook.Bid calldata bid,
    bytes calldata makerSig,
    IOrderBook.OrderIntent calldata oi,
    bytes calldata takerSig
  ) external nonReentrant whenNotPaused returns (bytes32 orderId) {
    require(bid.quote == address(0), 'USE_CREATE_AND_FILL_FOR_CRYPTO'); // Only for fiat trades
    require(block.timestamp < bid.expiresAt && block.timestamp < oi.expiresAt, 'EXPIRED');

    // Validate payment window is within allowed range
    require(bid.paymentWindow >= minPaymentWindow && bid.paymentWindow <= maxPaymentWindow, 'INVALID_PAYMENT_WINDOW');

    bytes32 bidHash = _hashBid(bid);
    require(oi.bidHash == bidHash, 'BID_HASH_MISMATCH');
    require(!canceledBids[bidHash], 'BID_CANCELED');

    // Validate order amount is within bid's acceptable range
    require(oi.amount >= bid.minAmount, 'BELOW_MIN_AMOUNT');
    require(oi.amount <= bid.maxAmount, 'ABOVE_MAX_AMOUNT');

    _verify(bidHash, makerSig, bid.maker);
    _verify(_hashOI(oi), takerSig, oi.taker);

    // Only consume taker nonce (bid is reusable)
    require(!nonces.isUsed(oi.taker, oi.nonce), 'NONCE_USED');
    nonces.markUsed(oi.taker, oi.nonce);
    require(_kycOk(bid.maker, bid.kycLevel) && _kycOk(oi.taker, bid.kycLevel), 'KYC');

    // Determine seller and buyer based on bid type
    address seller;
    address buyer;

    if (bid.bidType == IOrderBook.BidType.SELL) {
      seller = bid.maker; // Maker is selling
      buyer = oi.taker; // Taker is buying
    } else {
      seller = oi.taker; // Taker is selling
      buyer = bid.maker; // Maker is buying
    }

    orderId = keccak256(
      abi.encodePacked(
        keccak256(abi.encodePacked('\x19\x01', _DOMAIN_SEPARATOR, _hashBid(bid))),
        keccak256(abi.encodePacked('\x19\x01', _DOMAIN_SEPARATOR, _hashOI(oi)))
      )
    );

    uint256 paymentDL = block.timestamp + bid.paymentWindow; // Use bid's custom payment window
    uint256 confirmDL = block.timestamp + confirmWindow;

    // Calculate and lock fee at order creation (prevents fee changes)
    uint256 agreedFee = fees.quoteExact(
      bid.base,
      bid.quote,
      false, // buyer pays fee
      oi.amount
    );

    orders[orderId] = Order({
      status: Status.Locked,
      seller: seller,
      buyer: buyer,
      base: bid.base,
      quote: bid.quote,
      baseAmount: oi.amount,
      openedAt: block.timestamp,
      bidExpiry: bid.expiresAt,
      takerExpiry: oi.expiresAt,
      paymentDeadline: paymentDL,
      confirmDeadline: confirmDL,
      agreedFee: agreedFee
    });

    // Lock seller's crypto - will be released when seller confirms fiat receipt
    vault.lockForOrder(orderId, seller, bid.base, oi.amount);

    emit OrderCreated(orderId, seller, buyer, bid.base, bid.quote, oi.amount);
    emit OrderLocked(orderId);

    return orderId;
  }

  // Step 2: Seller confirms fiat payment received and releases crypto to buyer
  function confirmPaymentAndRelease(bytes32 orderId) external nonReentrant whenNotPaused {
    Order storage o = orders[orderId];
    require(o.status == Status.Locked || o.status == Status.PaymentMarked, 'BAD_STATE');
    require(msg.sender == o.seller, 'ONLY_SELLER');
    require(o.quote == address(0), 'ONLY_FIAT_TRADES');
    require(block.timestamp <= o.confirmDeadline, 'CONFIRM_EXPIRED');

    // Use agreed fee from order creation (prevents fee manipulation)
    uint256 feeTotal = o.agreedFee;

    // Transfer net amount to buyer (after fees)
    require(feeTotal < o.baseAmount, 'FEE_TOO_HIGH');
    uint256 netAmount = o.baseAmount - feeTotal;
    vault.transferLocked(orderId, o.seller, o.buyer, o.base, netAmount);

    // Transfer fees to recipients from seller's locked balance
    // We manually distribute the agreedFee to avoid recalculation
    if (feeTotal > 0) {
      // Emit fee event with agreedFee
      // We call computeAndEmit just for the event, but don't use the returned amounts
      fees.computeAndEmit(orderId, o.buyer, o.base, o.base, o.quote, false, 0);

      // Distribute agreedFee to recipients
      // Access FeeManager public arrays directly
      // Try up to 10 recipients (reasonable max)
      for (uint256 i; i < 10; i++) {
        try fees.recipients(i) returns (address recipient) {
          uint16 splitBps = fees.splitsBps(i);
          uint256 feeAmount = (feeTotal * splitBps) / 10000;

          if (feeAmount > 0) {
            vault.transferLocked(orderId, o.seller, recipient, o.base, feeAmount);
          }
        } catch {
          // No more recipients
          break;
        }
      }
    }

    o.status = Status.Filled;
    emit OrderFilled(orderId);
  }

  // OPTIONAL: Buyer marks payment sent (protects against cancel race condition)
  function markPaymentSent(bytes32 orderId) external nonReentrant whenNotPaused {
    Order storage o = orders[orderId];
    require(o.status == Status.Locked, 'BAD_STATE');
    require(msg.sender == o.buyer, 'ONLY_BUYER');
    require(o.quote == address(0), 'ONLY_FIAT_TRADES');
    require(block.timestamp <= o.paymentDeadline, 'PAYMENT_DEADLINE_PASSED');
    require(paymentSentAt[orderId] == 0, 'ALREADY_MARKED');

    // Change status to prevent seller from canceling
    o.status = Status.PaymentMarked;
    paymentSentAt[orderId] = block.timestamp;

    // Reset confirm deadline from NOW (not from order creation)
    o.confirmDeadline = block.timestamp + confirmWindow;

    emit PaymentMarkedSent(orderId, msg.sender, block.timestamp);
  }

  // Auto-release if seller doesn't confirm after buyer marked payment
  function autoRelease(bytes32 orderId) external nonReentrant whenNotPaused {
    Order storage o = orders[orderId];
    require(o.status == Status.PaymentMarked, 'BAD_STATE');
    require(block.timestamp > o.confirmDeadline, 'NOT_EXPIRED');

    // Use agreed fee from order creation
    uint256 feeTotal = o.agreedFee;

    // Transfer net amount to buyer
    require(feeTotal < o.baseAmount, 'FEE_TOO_HIGH');
    uint256 netAmount = o.baseAmount - feeTotal;
    vault.transferLocked(orderId, o.seller, o.buyer, o.base, netAmount);

    // Transfer fees
    if (feeTotal > 0) {
      // Emit fee event
      fees.computeAndEmit(orderId, o.buyer, o.base, o.base, o.quote, false, 0);

      // Distribute agreedFee to recipients
      for (uint256 i; i < 10; i++) {
        try fees.recipients(i) returns (address recipient) {
          uint16 splitBps = fees.splitsBps(i);
          uint256 feeAmount = (feeTotal * splitBps) / 10000;

          if (feeAmount > 0) {
            vault.transferLocked(orderId, o.seller, recipient, o.base, feeAmount);
          }
        } catch {
          break;
        }
      }
    }

    o.status = Status.Filled;
    emit OrderAutoReleased(orderId);
  }

  // Refund if seller doesn't confirm within deadline (when payment NOT marked)
  function refundExpired(bytes32 orderId) external nonReentrant whenNotPaused {
    Order storage o = orders[orderId];
    require(o.status == Status.Locked, 'BAD_STATE');
    require(o.quote == address(0), 'ONLY_FIAT_TRADES');
    require(paymentSentAt[orderId] == 0, 'PAYMENT_WAS_MARKED');
    require(block.timestamp > o.confirmDeadline, 'NOT_EXPIRED');

    // Return locked crypto to seller
    vault.unlockFromOrder(orderId, o.seller, o.base, o.baseAmount);

    o.status = Status.Expired;
    emit OrderExpired(orderId);
  }

  // Seller requests cancel (enters dispute window to protect buyer)
  function requestCancel(bytes32 orderId) external nonReentrant whenNotPaused {
    Order storage o = orders[orderId];
    require(o.status == Status.Locked, 'BAD_STATE');
    require(msg.sender == o.seller, 'ONLY_SELLER');
    require(o.quote == address(0), 'ONLY_FIAT_TRADES');

    // Can only cancel before payment deadline AND if no payment marked
    require(block.timestamp < o.paymentDeadline && paymentSentAt[orderId] == 0, 'CANNOT_CANCEL_AFTER_PAYMENT');

    // Enter PendingCancel state (funds still locked)
    o.status = Status.PendingCancel;
    cancelRequestedAt[orderId] = block.timestamp;

    emit CancelRequested(orderId, msg.sender, block.timestamp);
  }

  // Finalize cancel after dispute window passes
  function finalizeCancel(bytes32 orderId) external nonReentrant whenNotPaused {
    Order storage o = orders[orderId];
    require(o.status == Status.PendingCancel, 'BAD_STATE');

    // Wait for dispute window to pass
    require(block.timestamp > cancelRequestedAt[orderId] + cancelDisputeWindow, 'DISPUTE_WINDOW_ACTIVE');

    // No dispute opened, safe to unlock
    vault.unlockFromOrder(orderId, o.seller, o.base, o.baseAmount);
    o.status = Status.Canceled;
    emit OrderCanceled(orderId);
  }

  function openDispute(bytes32 orderId) external payable nonReentrant whenNotPaused {
    Order storage o = orders[orderId];
    require(
      o.status == Status.Locked || o.status == Status.PaymentMarked || o.status == Status.PendingCancel,
      'BAD_STATE'
    );
    require(msg.sender == o.seller || msg.sender == o.buyer, 'ONLY_PARTY');
    require(msg.value == disputeCfg.openStake(), 'STAKE');
    require(disputeStakes[orderId] == 0, 'DISPUTE_ALREADY_OPEN');

    // If disputing a cancel request, funds are already locked
    // If disputing from Locked/PaymentMarked, funds are already locked
    // No need to re-lock

    disputeStakes[orderId] = msg.value;
    disputeInitiator[orderId] = msg.sender;
    o.status = Status.Disputed;
    emit DisputeOpened(orderId, msg.sender);
  }

  // Arbitrator awards buyer share in bps (0 = all seller/maker, 10000 = all buyer/taker)
  function award(bytes32 orderId, uint16 buyerShareBps) external nonReentrant whenNotPaused {
    require(disputeCfg.isArbitrator(msg.sender), 'NOT_ARB');
    Order storage o = orders[orderId];
    require(o.status == Status.Disputed, 'BAD_STATE');
    require(buyerShareBps <= 10000, 'INVALID_BPS');

    // Split the locked funds based on arbitrator decision
    uint256 buyerAmount = (o.baseAmount * buyerShareBps) / 10000;
    uint256 sellerAmount = o.baseAmount - buyerAmount;

    // Cache values before state changes (checks-effects-interactions pattern)
    uint256 stake = disputeStakes[orderId];
    address initiator = disputeInitiator[orderId];
    uint256 arbFee = (stake * disputeCfg.resolutionFeeBps()) / 10000;
    uint256 refund = stake - arbFee;

    // Clear state BEFORE external calls
    disputeStakes[orderId] = 0;
    disputeInitiator[orderId] = address(0);
    o.status = Status.Filled;

    // Transfer buyer's share to buyer
    if (buyerAmount > 0) {
      vault.transferLocked(orderId, o.seller, o.buyer, o.base, buyerAmount);
    }

    // Return seller's share to seller
    if (sellerAmount > 0) {
      vault.unlockFromOrder(orderId, o.seller, o.base, sellerAmount);
    }

    // External calls AFTER state changes
    if (arbFee > 0) {
      payable(msg.sender).transfer(arbFee);
    }

    if (refund > 0) {
      payable(initiator).transfer(refund);
    }

    emit DisputeResolved(orderId, buyerShareBps, msg.sender);
  }

  // Cancel a bid to prevent further use (for reusable bids)
  function cancelBid(IOrderBook.Bid calldata bid, bytes calldata makerSig) external nonReentrant whenNotPaused {
    bytes32 bidHash = _hashBid(bid);
    require(!canceledBids[bidHash], 'ALREADY_CANCELED');
    require(block.timestamp < bid.expiresAt, 'BID_EXPIRED'); // Can only cancel active bids

    _verify(bidHash, makerSig, bid.maker);

    canceledBids[bidHash] = true;
    emit BidCanceled(bidHash, bid.maker);
  }
}
