import { db } from "@/db"
import { bids, type NewBid } from "@/db/schema/bids"
import { users } from "@/db/schema/users"
import { bidPaymentAccounts } from "@/db/schema/bid-payment-accounts"
import { bidPaymentPreferences } from "@/db/schema/bid-payment-preferences"
import { userPaymentAccounts } from "@/db/schema/user-payment-accounts"
import { eq, and, desc, gte, sql } from "drizzle-orm"

export async function createBid(bid: NewBid) {
  const [newBid] = await db.insert(bids).values(bid).returning()
  return newBid
}

export async function getBidByHash(bidHash: string) {
  const [bid] = await db.select().from(bids).where(eq(bids.bidHash, bidHash))
  return bid
}

export async function getBidsByMaker(makerAddress: string) {
  return db
    .select()
    .from(bids)
    .where(eq(bids.makerAddress, makerAddress))
    .orderBy(desc(bids.expiresAt))
}

export async function getActiveBidsByMaker(makerAddress: string) {
  // First get all active bids
  const activeBids = await db
    .select()
    .from(bids)
    .where(
      and(
        eq(bids.makerAddress, makerAddress),
        eq(bids.status, "active")
      )
    )
    .orderBy(desc(bids.expiresAt))

  // Then fetch payment information for each bid
  const bidsWithPayments = await Promise.all(
    activeBids.map(async (bid) => {
      let paymentInfo: string[] = []
      let paymentMethodCodes: string[] = []

      if (bid.bidType === "sell") {
        // For SELL offers: get payment account labels and method codes
        const accounts = await db
          .select({
            label: userPaymentAccounts.label,
            paymentMethod: userPaymentAccounts.paymentMethod,
          })
          .from(bidPaymentAccounts)
          .innerJoin(
            userPaymentAccounts,
            eq(bidPaymentAccounts.paymentAccountId, userPaymentAccounts.id)
          )
          .where(eq(bidPaymentAccounts.bidId, bid.id))

        paymentInfo = accounts.map(acc => acc.label || acc.paymentMethod)
        paymentMethodCodes = accounts.map(acc => acc.paymentMethod)
      } else if (bid.bidType === "buy") {
        // For BUY offers: get payment method types
        const preferences = await db
          .select({
            paymentMethodType: bidPaymentPreferences.paymentMethodType,
          })
          .from(bidPaymentPreferences)
          .where(eq(bidPaymentPreferences.bidId, bid.id))
          .orderBy(bidPaymentPreferences.priority)

        paymentInfo = preferences.map(pref => pref.paymentMethodType)
        paymentMethodCodes = preferences.map(pref => pref.paymentMethodType)
      }

      return {
        ...bid,
        paymentInfo, // Display labels for UI
        paymentMethodCodes, // Method codes for filtering
      }
    })
  )

  return bidsWithPayments
}

export async function updateBidStatus(bidHash: string, status: string) {
  const [updatedBid] = await db
    .update(bids)
    .set({ status })
    .where(eq(bids.bidHash, bidHash))
    .returning()
  return updatedBid
}

export async function getAllActiveBids() {
  return db
    .select()
    .from(bids)
    .where(eq(bids.status, "active"))
    .orderBy(desc(bids.expiresAt))
}

/**
 * Get active bids with creator user data for the trading table
 * Optionally filter by token address, payment method, amount, bid type, and exclude specific maker address
 */
export async function getActiveBidsWithUsers(
  tokenAddress?: string, 
  excludeMakerAddress?: string,
  paymentMethod?: string,
  minAmount?: string,
  bidType?: string,
  page: number = 1,
  pageSize: number = 10
) {
  // Build where conditions
  // Normalize token address to lowercase for case-insensitive comparison
  const normalizedTokenAddress = tokenAddress?.toLowerCase()
  const normalizedExcludeMaker = excludeMakerAddress?.toLowerCase()
  
  // Build conditions array
  // Filter by active status AND not expired (expiresAt > now)
  const nowTimestamp = BigInt(Math.floor(Date.now() / 1000))
  const conditionsArray = [
    eq(bids.status, "active"),
    gte(bids.expiresAt, nowTimestamp)
  ]
  
  if (normalizedTokenAddress) {
    conditionsArray.push(eq(bids.fromToken, normalizedTokenAddress))
  }
  
  if (normalizedExcludeMaker) {
    conditionsArray.push(sql`LOWER(${bids.makerAddress}) != ${normalizedExcludeMaker}`)
  }
  
  // Filter by payment method (check if array contains the method)
  if (paymentMethod) {
    conditionsArray.push(sql`${bids.paymentMethods} @> ARRAY[${paymentMethod}]::text[]`)
  }
  
  // Filter by minimum amount (check if bid's maxAmount is >= requested minAmount)
  if (minAmount) {
    conditionsArray.push(gte(bids.maxAmount, minAmount))
  }
  
  // Filter by bid type (buy or sell)
  if (bidType && (bidType === 'buy' || bidType === 'sell')) {
    conditionsArray.push(eq(bids.bidType, bidType))
  }
  
  const conditions = and(...conditionsArray)

  const offset = (page - 1) * pageSize

  const baseBids = await db
    .select({
      // Bid data
      id: bids.id,
      bidHash: bids.bidHash,
      makerAddress: bids.makerAddress,
      fromToken: bids.fromToken,
      toToken: bids.toToken,
      price: bids.price,
      minAmount: bids.minAmount,
      maxAmount: bids.maxAmount,
      kycLevel: bids.kycLevel,
      expiresAt: bids.expiresAt,
      status: bids.status,
      fiatCurrency: bids.fiatCurrency,
      paymentMethods: bids.paymentMethods,
      bidType: bids.bidType,
      chainId: bids.chainId,
      description: bids.description,
      // Creator/Seller user data
      creator: {
        id: users.id,
        username: users.username,
        walletAddress: users.walletAddress,
        avatarUrl: users.avatarUrl,
        kycLevel: users.kycLevel,
        totalTrades: users.totalTrades,
        successfulTrades: users.successfulTrades,
      },
    })
    .from(bids)
    .innerJoin(users, eq(bids.creatorId, users.id))
    .where(conditions)
    .orderBy(desc(bids.price))
    .limit(pageSize)
    .offset(offset)

  // Fetch payment method codes for each bid
  const bidsWithPaymentCodes = await Promise.all(
    baseBids.map(async (bid) => {
      let paymentMethodCodes: string[] = []

      if (bid.bidType === "sell") {
        // For SELL offers: get payment method codes from linked accounts
        const accounts = await db
          .select({
            paymentMethod: userPaymentAccounts.paymentMethod,
          })
          .from(bidPaymentAccounts)
          .innerJoin(
            userPaymentAccounts,
            eq(bidPaymentAccounts.paymentAccountId, userPaymentAccounts.id)
          )
          .where(eq(bidPaymentAccounts.bidId, bid.id))

        paymentMethodCodes = accounts.map(acc => acc.paymentMethod)
      } else if (bid.bidType === "buy") {
        // For BUY offers: get payment method types from preferences
        const preferences = await db
          .select({
            paymentMethodType: bidPaymentPreferences.paymentMethodType,
          })
          .from(bidPaymentPreferences)
          .where(eq(bidPaymentPreferences.bidId, bid.id))
          .orderBy(bidPaymentPreferences.priority)

        paymentMethodCodes = preferences.map(pref => pref.paymentMethodType)
      }

      return {
        ...bid,
        paymentMethodCodes, // Array of payment method codes for display
      }
    })
  )

  return bidsWithPaymentCodes
}

/**
 * Get total count of active bids for pagination
 */
export async function getActiveBidsCount(
  tokenAddress?: string, 
  excludeMakerAddress?: string,
  paymentMethod?: string,
  minAmount?: string,
  bidType?: string
) {
  const normalizedTokenAddress = tokenAddress?.toLowerCase()
  const normalizedExcludeMaker = excludeMakerAddress?.toLowerCase()
  
  // Filter by active status AND not expired (expiresAt > now)
  const nowTimestamp = BigInt(Math.floor(Date.now() / 1000))
  const conditionsArray = [
    eq(bids.status, "active"),
    gte(bids.expiresAt, nowTimestamp)
  ]
  
  if (normalizedTokenAddress) {
    conditionsArray.push(eq(bids.fromToken, normalizedTokenAddress))
  }
  
  if (normalizedExcludeMaker) {
    conditionsArray.push(sql`LOWER(${bids.makerAddress}) != ${normalizedExcludeMaker}`)
  }
  
  // Filter by payment method (check if array contains the method)
  if (paymentMethod) {
    conditionsArray.push(sql`${bids.paymentMethods} @> ARRAY[${paymentMethod}]::text[]`)
  }
  
  // Filter by minimum amount (check if bid's maxAmount is >= requested minAmount)
  if (minAmount) {
    conditionsArray.push(gte(bids.maxAmount, minAmount))
  }
  
  // Filter by bid type (buy or sell)
  if (bidType && (bidType === 'buy' || bidType === 'sell')) {
    conditionsArray.push(eq(bids.bidType, bidType))
  }
  
  const conditions = and(...conditionsArray)

  const result = await db
    .select({ count: bids.id })
    .from(bids)
    .where(conditions)
  
  return result.length
}

/**
 * Get a single bid with creator user data
 */
export async function getBidWithUser(bidHash: string) {
  const [result] = await db
    .select({
      // Bid data
      id: bids.id,
      bidHash: bids.bidHash,
      makerAddress: bids.makerAddress,
      fromToken: bids.fromToken,
      toToken: bids.toToken,
      price: bids.price,
      minAmount: bids.minAmount,
      maxAmount: bids.maxAmount,
      kycLevel: bids.kycLevel,
      expiresAt: bids.expiresAt,
      nonce: bids.nonce,
      signature: bids.signature,
      status: bids.status,
      fiatCurrency: bids.fiatCurrency,
      paymentMethods: bids.paymentMethods,
      bidType: bids.bidType,
      chainId: bids.chainId,
      paymentWindow: bids.paymentWindow,
      // Creator/Seller user data
      creator: {
        id: users.id,
        username: users.username,
        walletAddress: users.walletAddress,
        avatarUrl: users.avatarUrl,
        email: users.email,
        bio: users.bio,
        kycLevel: users.kycLevel,
        totalTrades: users.totalTrades,
        successfulTrades: users.successfulTrades,
      },
    })
    .from(bids)
    .innerJoin(users, eq(bids.creatorId, users.id))
    .where(eq(bids.bidHash, bidHash))

  return result
}

// Type exports for the query results
export type BidWithUser = Awaited<ReturnType<typeof getBidWithUser>>
export type BidsWithUsers = Awaited<ReturnType<typeof getActiveBidsWithUsers>>
