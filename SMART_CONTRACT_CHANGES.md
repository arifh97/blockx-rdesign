# Smart Contract Changes for Buy/Sell Bid Support

## Overview

The current smart contract only supports sell bids (seller creates bid, buyer takes it). We need to add support for buy bids (buyer creates bid, seller takes it) by normalizing roles to `seller`/`buyer` instead of `maker`/`taker`.

---

## Required Smart Contract Changes

### 1. Add BidType Enum

```solidity
enum BidType {
    SELL,  // Maker is selling crypto
    BUY    // Maker is buying crypto (wants to buy)
}
```

### 2. Update Bid Struct

```solidity
struct Bid {
    address maker;
    address fromToken;
    address toToken;
    uint256 price;
    uint256 minAmount;
    uint256 maxAmount;
    uint8 kycLevel;
    uint256 expiresAt;
    uint256 nonce;
    BidType bidType;  // ← ADD THIS
}
```

**Important**: This changes the EIP-712 type hash! The frontend will automatically pick up the new structure from the ABI.

### 3. Update Order Struct

Replace `maker`/`taker` with `seller`/`buyer`:

```solidity
struct Order {
    bytes32 orderId;
    Bid bid;
    address seller;  // ← Who has the crypto (was: bid.maker or intent.taker)
    address buyer;   // ← Who pays fiat (was: intent.taker or bid.maker)
    uint256 amount;
    uint256 agreedFee;
    OrderStatus status;
    uint256 openedAt;
    uint256 paymentDeadline;
    uint256 confirmDeadline;
}
```

### 4. Update `create()` Function

Determine seller/buyer based on `bidType`:

```solidity
function create(
    Bid calldata bid,
    bytes calldata makerSig,
    OrderIntent calldata intent,
    bytes calldata takerSig
) external returns (bytes32) {
    // Verify signatures...
    
    // Determine seller and buyer based on bid type
    address seller;
    address buyer;
    
    if (bid.bidType == BidType.SELL) {
        seller = bid.maker;   // Maker is selling
        buyer = intent.taker; // Taker is buying
    } else {
        seller = intent.taker; // Taker is selling
        buyer = bid.maker;     // Maker is buying
    }
    
    // Create order with normalized roles
    Order memory order = Order({
        orderId: orderId,
        bid: bid,
        seller: seller,
        buyer: buyer,
        amount: intent.amount,
        agreedFee: fee,
        status: OrderStatus.Locked,
        openedAt: block.timestamp,
        paymentDeadline: block.timestamp + 30 minutes,
        confirmDeadline: block.timestamp + 24 hours
    });
    
    // Lock crypto from seller
    vault.lock(seller, bid.fromToken, intent.amount);
    
    // Store order
    orders[orderId] = order;
    
    emit OrderCreated(orderId, seller, buyer, intent.amount);
    
    return orderId;
}
```

### 5. Update Permission Checks

Replace all `maker`/`taker` checks with `seller`/`buyer`:

```solidity
function markPaymentSent(bytes32 orderId) external {
    Order storage order = orders[orderId];
    require(msg.sender == order.buyer, "ONLY_BUYER");  // ← Changed from ONLY_TAKER
    require(order.status == OrderStatus.Locked, "INVALID_STATUS");
    
    order.status = OrderStatus.PaymentSent;
    order.paymentSentAt = block.timestamp;
    
    emit PaymentSent(orderId, msg.sender);
}

function confirmAndRelease(bytes32 orderId) external {
    Order storage order = orders[orderId];
    require(msg.sender == order.seller, "ONLY_SELLER");  // ← Changed from ONLY_MAKER
    require(order.status == OrderStatus.PaymentSent, "INVALID_STATUS");
    
    // Release crypto to buyer
    vault.release(order.seller, order.buyer, order.bid.fromToken, order.amount);
    
    order.status = OrderStatus.Released;
    
    emit OrderReleased(orderId);
}

function cancelOrder(bytes32 orderId) external {
    Order storage order = orders[orderId];
    
    // Either party can cancel under certain conditions
    bool isSeller = msg.sender == order.seller;
    bool isBuyer = msg.sender == order.buyer;
    
    require(isSeller || isBuyer, "NOT_PARTICIPANT");
    
    // Cancel logic...
}
```

### 6. Update Events

```solidity
event OrderCreated(
    bytes32 indexed orderId,
    address indexed seller,  // ← Changed from maker
    address indexed buyer,   // ← Changed from taker
    uint256 amount
);

event PaymentSent(bytes32 indexed orderId, address indexed buyer);
event OrderReleased(bytes32 indexed orderId);
```

---

## Frontend Changes (Already Implemented)

### ✅ Database Schema
- `orders.makerId` = seller
- `orders.takerId` = buyer
- Determined at order creation based on `bid.bidType`

### ✅ Order Creation Logic
```typescript
// In useCreateOrder hook
const isSellBid = bid.bidType === 'sell';
const buyerId = isSellBid ? takerResult.user.id : bid.creator.id;
const sellerId = isSellBid ? bid.creator.id : takerResult.user.id;

const orderData = {
  makerId: sellerId,  // Seller
  takerId: buyerId,   // Buyer
  // ...
}
```

### ✅ UI Role Determination
```typescript
// In order page
const seller = await getUserById(order.makerId)
const buyer = await getUserById(order.takerId)
const isBuyer = isTaker  // Simple check, no bidType needed
```

### 🔄 Needs Update After Contract Deploy

Once you deploy the new contract:

1. **Update ABI** in `/lib/contracts.ts`
   - The EIP-712 types will automatically sync from the new ABI
   
2. **Update Contract Address** in `/lib/contracts.ts`
   - Point to the new deployed contract

3. **Test Order Creation**
   - Verify bid signing includes `bidType`
   - Verify order creation works for both sell and buy bids
   - Verify permissions work correctly

---

## Testing Checklist

### Sell Bid Flow (Existing)
- [ ] Seller creates sell bid with `bidType: SELL`
- [ ] Buyer takes bid and creates order
- [ ] Contract stores: `seller = bid.maker`, `buyer = intent.taker`
- [ ] Buyer can call `markPaymentSent()`
- [ ] Seller can call `confirmAndRelease()`

### Buy Bid Flow (New)
- [ ] Buyer creates buy bid with `bidType: BUY`
- [ ] Seller takes bid and creates order
- [ ] Contract stores: `seller = intent.taker`, `buyer = bid.maker`
- [ ] Buyer can call `markPaymentSent()`
- [ ] Seller can call `confirmAndRelease()`

---

## Migration Strategy

1. **Deploy new contract** with updated structs
2. **Update frontend** to point to new contract address
3. **Existing orders** on old contract remain accessible (read-only)
4. **New orders** use the new contract with proper buy/sell support

---

## Benefits of This Approach

✅ **Clearer Logic**: Seller/buyer roles are explicit, not inferred
✅ **Simpler Permissions**: No need to check bidType in every function
✅ **Better UX**: Frontend and contract use the same terminology
✅ **Future-Proof**: Easy to add new features based on buyer/seller roles
✅ **Gas Efficient**: No extra checks needed, roles determined once at creation
