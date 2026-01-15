# Order Creation Flows: Buy vs Sell

## Overview

There are TWO distinct flows for creating orders, and the roles of buyer/seller are **switched** between them. This document clarifies the confusion.

---

## Flow 1: Buy Flow (Buyer Takes Sell Offer)

**Component:** `BuyExpandedView.tsx` (formerly `TradeExpandedView.tsx`)

### Participants:
- **Bid Creator (Maker):** Seller (created a sell offer)
- **Order Creator (Taker):** Buyer (you, viewing the offer)

### Process:
1. **Seller creates sell offer** (`bidType: "sell"`)
   - Seller has crypto locked in vault
   - Seller signs bid with EIP-712
   - Stored in database

2. **Buyer views offer** in `BuyExpandedView`
   - Sees seller's offer
   - Enters amount to buy
   - Selects payment method

3. **Buyer creates order**
   - Buyer signs `OrderIntent` with EIP-712
   - Buyer calls `OrderBook.create()`
   - **Buyer pays gas fees**
   - Contract locks seller's crypto
   - Order status: `locked`

### Data Flow:
```typescript
// In BuyExpandedView
const { createOrder } = useCreateOrder();

await createOrder({
  bidHash: bid.bidHash,        // Seller's bid
  amount: buyAmount,           // How much buyer wants
});

// Hook validates:
// - bid.bidType === 'sell'
// - bid.makerAddress (seller) has crypto in vault ✅
```

---

## Flow 2: Sell Flow (Seller Takes Buy Offer)

**Component:** `SellExpandedView.tsx`

### Participants:
- **Bid Creator (Maker):** Buyer (created a buy offer)
- **Order Creator (Taker):** Seller (you, viewing the offer)

### Process:
1. **Buyer creates buy offer** (`bidType: "buy"`)
   - Buyer wants to buy crypto
   - Buyer signs bid with EIP-712 (one per chain)
   - Stored in database (multiple records if multi-chain)

2. **Seller views offer** in `SellExpandedView`
   - Sees buyer's offer
   - Enters amount to sell
   - Selects payment method
   - **Selects which chain to send from** (for multi-chain offers)

3. **Seller creates order**
   - Seller signs `OrderIntent` with EIP-712
   - Seller calls `OrderBook.create()`
   - **Seller pays gas fees**
   - Contract locks seller's crypto
   - Order status: `locked`

### Data Flow:
```typescript
// In SellExpandedView
const { createOrder } = useCreateOrder();

await createOrder({
  bidHash: bid.bidHash,        // Buyer's bid
  amount: sellAmount,          // How much seller offers
});

// Hook validates:
// - bid.bidType === 'buy'
// - address (seller/taker) has crypto in vault ✅
```

---

## Key Difference: Who Has the Crypto?

| Aspect | Buy Flow (Take Sell Offer) | Sell Flow (Take Buy Offer) |
|--------|---------------------------|---------------------------|
| **Bid Type** | `sell` | `buy` |
| **Bid Creator** | Seller (maker) | Buyer (maker) |
| **Order Creator** | Buyer (taker) | Seller (taker) |
| **Who Has Crypto** | Maker (seller) | **Taker (seller)** |
| **Vault Check** | `bid.makerAddress` | `takerAddress` |
| **Gas Payer** | Buyer (taker) | Seller (taker) |

---

## Smart Contract Perspective

The `OrderBook.create()` function doesn't care about "buyer" or "seller" - it only cares about:

```solidity
function create(
  Bid memory bid,           // Maker's signed bid
  bytes memory makerSig,    // Maker's signature
  OrderIntent memory intent, // Taker's intent
  bytes memory takerSig     // Taker's signature
) {
  // Validate both signatures
  // Lock crypto from whoever has it
  // Create order
}
```

The contract locks crypto from **whoever has it in their vault**:
- For sell bids: locks from `bid.maker` (seller)
- For buy bids: locks from `intent.taker` (seller)

---

## Implementation in `useCreateOrder`

The hook now handles both flows correctly:

```typescript
async function validateBidAndBalance({
  bidHash,
  chainId,
  wagmiConfig,
  takerAddress,   // ← Who is taking the offer
  orderAmount,    // ← Specific amount for THIS order
}) {
  const bid = await getBidWithUserAction(bidHash);

  // Determine who has the crypto based on bid type
  const cryptoHolderAddress = bid.bidType === 'sell' 
    ? bid.makerAddress as Address  // Seller created sell offer
    : takerAddress;                 // Seller is taking buy offer

  // Check crypto holder has enough balance
  const cryptoHolderBalance = await readContract(wagmiConfig, {
    ...vaultConfig,
    functionName: "balanceOf",
    args: [cryptoHolderAddress, bid.fromToken],
  });

  // Validate holder has enough for THIS specific order amount
  // NOT the bid's maxAmount - that's just the upper limit!
  const orderAmountBigInt = BigInt(orderAmount);
  if (cryptoHolderBalance < orderAmountBigInt) {
    throw new Error(`Insufficient vault balance for this order`);
  }
}
```

### Key Insight:
The validation checks if the crypto holder has enough for **the specific order amount**, not the bid's `maxAmount`. The `maxAmount` is just the upper limit the bid accepts - the actual order can be any amount between `minAmount` and `maxAmount`.

---

## Multi-Chain Buy Offers

For buy offers that accept multiple chains:

1. **Buyer creates multiple bids** (one per chain)
   - Each with chain-specific EIP-712 signature
   - All linked by `bidGroupId`

2. **Seller selects chain** in `SellExpandedView`
   - Chooses which chain to send from
   - Must have vault balance on that chain
   - Uses the bid record for that specific chain

3. **Order created on selected chain**
   - Seller must be on the correct chain
   - Uses chain-specific bid signature
   - Locks seller's crypto on that chain

---

## Order Entity Mapping

**IMPORTANT:** In the `orders` table, the roles are normalized:
- `makerId` / `makerAddress` = **Always the Seller** (who has crypto)
- `takerId` / `takerAddress` = **Always the Buyer** (who pays fiat)

This is different from the bid's maker/taker! The mapping depends on bid type:

| Bid Type | Bid Maker | Bid Taker | Order Maker (Seller) | Order Taker (Buyer) |
|----------|-----------|-----------|---------------------|---------------------|
| `sell` | Seller | Buyer | Bid Maker | Bid Taker |
| `buy` | Buyer | Seller | Bid Taker | Bid Maker |

### Code Implementation:

```typescript
// In saveOrderToDatabase
const isSellBid = bid.bidType === 'sell';
const buyerId = isSellBid ? takerResult.user.id : bid.creator.id;
const sellerId = isSellBid ? bid.creator.id : takerResult.user.id;

const orderData = {
  makerId: sellerId,  // Always seller
  takerId: buyerId,   // Always buyer
  // ...
}
```

---

## Summary

**The confusion comes from the fact that "seller" means different things:**

- In **buy flow**: Seller = bid creator (maker)
- In **sell flow**: Seller = order creator (taker)

**The key insight:**
- The person with crypto in their vault is always the one who needs to be validated
- For sell bids: that's the maker
- For buy bids: that's the taker

**In the order entity**, roles are normalized:
- Maker = Seller (always)
- Taker = Buyer (always)

**Both flows use the same `useCreateOrder` hook**, which now correctly handles both cases by checking `bid.bidType` to determine who has the crypto and how to map the roles to the order entity.
