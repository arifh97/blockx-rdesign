import { db } from "@/db"
import { bidPaymentPreferences, type NewBidPaymentPreference } from "@/db/schema/bid-payment-preferences"
import { eq } from "drizzle-orm"

/**
 * Create multiple payment preferences for a bid (buy offers)
 */
export async function createBidPaymentPreferences(preferences: NewBidPaymentPreference[]) {
  if (preferences.length === 0) return []
  
  const newPreferences = await db
    .insert(bidPaymentPreferences)
    .values(preferences)
    .returning()
  return newPreferences
}

/**
 * Get all payment preferences for a specific bid
 */
export async function getBidPaymentPreferences(bidId: string) {
  return db
    .select()
    .from(bidPaymentPreferences)
    .where(eq(bidPaymentPreferences.bidId, bidId))
    .orderBy(bidPaymentPreferences.priority)
}

/**
 * Delete all payment preferences for a bid
 */
export async function deleteBidPaymentPreferences(bidId: string) {
  await db
    .delete(bidPaymentPreferences)
    .where(eq(bidPaymentPreferences.bidId, bidId))
}

/**
 * Update payment preferences for a bid (replace all)
 */
export async function updateBidPaymentPreferences(
  bidId: string,
  preferences: Omit<NewBidPaymentPreference, 'bidId'>[]
) {
  // Delete existing preferences
  await deleteBidPaymentPreferences(bidId)
  
  // Insert new preferences
  if (preferences.length > 0) {
    const preferencesWithBidId = preferences.map(p => ({ ...p, bidId }))
    return createBidPaymentPreferences(preferencesWithBidId)
  }
  
  return []
}
