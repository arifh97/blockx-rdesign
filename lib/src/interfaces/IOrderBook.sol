// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IOrderBook {
  enum BidType {
    SELL, // Maker is selling crypto
    BUY // Maker is buying crypto (wants to buy)
  }

  enum Status {
    None,
    Locked, // Order created, maker's crypto locked
    PaymentMarked, // Buyer marked payment sent (optional)
    PendingCancel, // Maker requested cancel, waiting for dispute window
    Filled,
    Canceled,
    Expired,
    Disputed
  }

  struct Bid {
    address maker;
    address base; // asset the maker sells
    address quote; // asset the maker buys (for crypto-crypto) or address(0) for fiat
    uint256 price; // quote per base with agreed decimals
    uint256 minAmount; // minimum fill amount per order
    uint256 maxAmount; // maximum total amount maker wants to sell
    uint8 kycLevel;
    uint256 expiresAt;
    uint256 nonce;
    BidType bidType; // SELL or BUY
    uint256 paymentWindow; // custom payment window in seconds (for fiat trades)
  }

  struct OrderIntent {
    bytes32 bidHash; // EIP-712 hash of Bid
    address taker;
    uint256 amount; // base amount (maker sells this much base)
    uint16 maxSlippageBps; // for crypto-crypto path
    uint256 expiresAt; // taker intent expiry
    uint256 nonce;
  }

  event OrderCreated(
    bytes32 indexed orderId,
    address indexed seller,
    address indexed buyer,
    address base,
    address quote,
    uint256 amount
  );
  event OrderLocked(bytes32 indexed orderId);
  event PaymentMarkedSent(bytes32 indexed orderId, address indexed buyer, uint256 timestamp);
  event CancelRequested(bytes32 indexed orderId, address indexed seller, uint256 timestamp);
  event OrderFilled(bytes32 indexed orderId);
  event OrderCanceled(bytes32 indexed orderId);
  event OrderExpired(bytes32 indexed orderId);
  event OrderAutoReleased(bytes32 indexed orderId);
  event DisputeOpened(bytes32 indexed orderId, address indexed by);
  event DisputeResolved(bytes32 indexed orderId, uint16 buyerShareBps, address indexed arbitrator);
  event BidCanceled(bytes32 indexed bidHash, address indexed maker);
}
