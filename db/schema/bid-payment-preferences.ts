import { pgTable, text, uuid, varchar, smallint } from "drizzle-orm/pg-core";
import { bids } from "./bids";

/**
 * Bid Payment Preferences
 * For BUY offers: stores payment method TYPES that the buyer is willing to use
 * (not full payment details, just the method types like "bank_transfer", "cash", etc.)
 * 
 * This is different from bid_payment_accounts which stores actual payment details
 * for SELL offers where the seller needs to provide their account information.
 */
export const bidPaymentPreferences = pgTable("bid_payment_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  bidId: uuid("bid_id")
    .notNull()
    .references(() => bids.id, { onDelete: "cascade" }),
  
  // Payment method type code (e.g., 'bank_transfer', 'paypal', 'cash')
  paymentMethodType: varchar("payment_method_type", { length: 50 }).notNull(),
  
  // Optional: Priority/order preference (lower number = higher priority)
  priority: smallint("priority").default(0),
  
  // Optional: Custom notes for this payment method preference
  // e.g., "Prefer Chase or Wells Fargo", "Available for in-person meetups on weekends"
  notes: text("notes"),
});

export type BidPaymentPreference = typeof bidPaymentPreferences.$inferSelect;
export type NewBidPaymentPreference = typeof bidPaymentPreferences.$inferInsert;
