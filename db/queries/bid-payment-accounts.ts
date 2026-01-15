import { db } from "@/db"
import { bidPaymentAccounts, type NewBidPaymentAccount } from "@/db/schema/bid-payment-accounts"
import { userPaymentAccounts } from "@/db/schema/user-payment-accounts"
import { eq } from "drizzle-orm"

/**
 * Create multiple payment account links for a bid (sell offers)
 */
export async function createBidPaymentAccounts(accounts: NewBidPaymentAccount[]) {
  if (accounts.length === 0) return []
  
  const newAccounts = await db
    .insert(bidPaymentAccounts)
    .values(accounts)
    .returning()
  return newAccounts
}

/**
 * Get all payment accounts for a specific bid with full account details
 */
export async function getBidPaymentAccountsWithDetails(bidId: string) {
  return db
    .select({
      id: bidPaymentAccounts.id,
      bidId: bidPaymentAccounts.bidId,
      paymentAccountId: bidPaymentAccounts.paymentAccountId,
      customInstructions: bidPaymentAccounts.customInstructions,
      paymentAccount: {
        id: userPaymentAccounts.id,
        paymentMethod: userPaymentAccounts.paymentMethod,
        label: userPaymentAccounts.label,
        currency: userPaymentAccounts.currency,
        isVerified: userPaymentAccounts.isVerified,
      }
    })
    .from(bidPaymentAccounts)
    .innerJoin(
      userPaymentAccounts, 
      eq(bidPaymentAccounts.paymentAccountId, userPaymentAccounts.id)
    )
    .where(eq(bidPaymentAccounts.bidId, bidId))
}

/**
 * Get all payment account IDs for a specific bid
 */
export async function getBidPaymentAccounts(bidId: string) {
  return db
    .select()
    .from(bidPaymentAccounts)
    .where(eq(bidPaymentAccounts.bidId, bidId))
}

/**
 * Delete all payment accounts for a bid
 */
export async function deleteBidPaymentAccounts(bidId: string) {
  await db
    .delete(bidPaymentAccounts)
    .where(eq(bidPaymentAccounts.bidId, bidId))
}

/**
 * Update payment accounts for a bid (replace all)
 */
export async function updateBidPaymentAccounts(
  bidId: string,
  accounts: Omit<NewBidPaymentAccount, 'bidId'>[]
) {
  // Delete existing accounts
  await deleteBidPaymentAccounts(bidId)
  
  // Insert new accounts
  if (accounts.length > 0) {
    const accountsWithBidId = accounts.map(a => ({ ...a, bidId }))
    return createBidPaymentAccounts(accountsWithBidId)
  }
  
  return []
}
