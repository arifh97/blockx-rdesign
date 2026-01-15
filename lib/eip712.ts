import { orderBookAbi } from "./contracts"
import { Address, keccak256 } from "viem"

/**
 * Extract EIP-712 types from the OrderBook ABI
 * This ensures the frontend types always match the smart contract
 */

// Find the Bid struct from the ABI
const bidAbiItem = orderBookAbi.find(
  (item) => 
    item.type === "function" && 
    item.inputs?.[0]?.name === "bid" &&
    item.inputs[0].type === "tuple"
)

if (!bidAbiItem || bidAbiItem.type !== "function" || !bidAbiItem.inputs?.[0]) {
  throw new Error("Bid struct not found in OrderBook ABI")
}

const bidInput = bidAbiItem.inputs[0]

if (bidInput.type !== "tuple" || !bidInput.components) {
  throw new Error("Bid components not found in OrderBook ABI")
}

const bidComponents = bidInput.components

// Find the OrderIntent struct from the ABI
const orderIntentAbiItem = orderBookAbi.find(
  (item) => 
    item.type === "function" && 
    item.inputs?.some(input => input.name === "oi" && input.type === "tuple")
)

if (!orderIntentAbiItem || orderIntentAbiItem.type !== "function") {
  throw new Error("OrderIntent struct not found in OrderBook ABI")
}

const orderIntentInput = orderIntentAbiItem.inputs?.find(input => input.name === "oi")

if (!orderIntentInput || orderIntentInput.type !== "tuple" || !orderIntentInput.components) {
  throw new Error("OrderIntent components not found in OrderBook ABI")
}

const orderIntentComponents = orderIntentInput.components

/**
 * EIP-712 Bid type definition extracted from smart contract ABI
 * This is automatically synced with the contract structure
 */
export const BID_EIP712_TYPES = {
  Bid: bidComponents.map((component: { name: string; type: string }) => ({
    name: component.name,
    type: component.type,
  })),
} as const

/**
 * Generate the Bid type string from ABI components
 * Format: "Bid(type1 name1,type2 name2,...)"
 */
const bidTypeString = `Bid(${bidComponents.map((c: { name: string; type: string }) => `${c.type} ${c.name}`).join(",")})`

/**
 * BID_TYPEHASH constant - matches OrderBook.sol BID_TYPEHASH
 * This is the keccak256 hash of the Bid struct type string, derived from the ABI
 */
export const BID_TYPEHASH = keccak256(
  new TextEncoder().encode(bidTypeString)
)

/**
 * EIP-712 OrderIntent type definition extracted from smart contract ABI
 * This is automatically synced with the contract structure
 */
export const ORDER_INTENT_EIP712_TYPES = {
  OrderIntent: orderIntentComponents.map((component: { name: string; type: string }) => ({
    name: component.name,
    type: component.type,
  })),
} as const

/**
 * Generate the OrderIntent type string from ABI components
 * Format: "OrderIntent(type1 name1,type2 name2,...)"
 */
const orderIntentTypeString = `OrderIntent(${orderIntentComponents.map((c: { name: string; type: string }) => `${c.type} ${c.name}`).join(",")})`

/**
 * OI_TYPEHASH constant - matches OrderBook.sol OI_TYPEHASH
 * This is the keccak256 hash of the OrderIntent struct type string, derived from the ABI
 */
export const OI_TYPEHASH = keccak256(
  new TextEncoder().encode(orderIntentTypeString)
)

/**
 * EIP-712 domain for OrderBook
 */
export function getOrderBookDomain(chainId: number, verifyingContract: `0x${string}`) {
  return {
    name: "OrderBook",
    version: "1",
    chainId: BigInt(chainId),
    verifyingContract,
  } as const
}

/**
 * BidMessage - Used for EIP-712 wallet signing
 * 
 * Purpose: This type represents the exact structure that gets signed by the user's wallet
 * when creating a bid. It is automatically derived from the contract's Bid struct ABI.
 * 
 * Used in: CreateBidForm.tsx (signTypedDataAsync)
 */
export type BidMessage = {
  [K in typeof bidComponents[number] as K['name']]: 
    K['type'] extends 'address' ? `0x${string}` :
    K['type'] extends 'uint256' ? bigint :
    K['type'] extends 'uint8' ? number :
    K['type'] extends 'bytes32' ? `0x${string}` :
    never
}

/**
 * BidData - Used for server actions and database storage
 * 
 * Purpose: This type represents the bid data that gets sent to the server and stored
 * in the database. It includes the signature and additional metadata not part of the
 * on-chain struct.
 * 
 * Note: from/to in FE/BE maps to base/quote in smart contract
 * Note: price, minAmount, maxAmount are stored as human-readable strings (e.g., "1.02", "100")
 * 
 * Used in: app/actions/bids.ts (createBidAction, computeBidHash)
 */
export interface BidData {
  maker: Address
  from: Address  // maps to "base" in contract
  to: Address    // maps to "quote" in contract
  price: string  // Human-readable price (e.g., "1.02")
  minAmount: string  // Human-readable amount (e.g., "100")
  maxAmount: string  // Human-readable amount (e.g., "1000")
  kycLevel: number
  expiresAt: string
  nonce: string
  signature: string
  tokenDecimals: number  // Required for contract conversion
  fiatCurrency?: string
  paymentMethods?: string[]
  description?: string
  
  // Bid type and chain
  bidType?: "sell" | "buy"  // Type of bid: sell or buy crypto
  chainId: number  // The specific chain this bid is for (used for EIP-712 signing)
  bidGroupId?: string  // Links related bids created together (for multi-chain buy offers)
  
  // Payment window in seconds (for fiat trades)
  paymentWindow: number  // e.g., 1800 for 30 minutes
  
  // Payment handling (differs by bid type)
  // For SELL bids: array of payment account IDs (full details)
  paymentAccountIds?: string[]
  // For BUY bids: array of payment method types (just the method codes)
  paymentMethodTypes?: string[]
  
  // Customization fields
  availableHours?: string  // JSON string with schedule data
  timezone?: string
  isGlobal?: boolean
  allowedCountries?: string[]
  isPrivate?: boolean
  accessToken?: string
}