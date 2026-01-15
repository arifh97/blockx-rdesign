import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { bids } from "./bids";
import { userPaymentAccounts } from "./user-payment-accounts";

/**
 * Bid Payment Accounts
 * Junction table linking bids to specific payment accounts
 * A bid can have multiple payment methods, each linked to a specific payment account
 */
export const bidPaymentAccounts = pgTable("bid_payment_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  bidId: uuid("bid_id")
    .notNull()
    .references(() => bids.id, { onDelete: "cascade" }),
  paymentAccountId: uuid("payment_account_id")
    .notNull()
    .references(() => userPaymentAccounts.id, { onDelete: "cascade" }),
  
  // Optional: Custom instructions specific to this bid
  // e.g., "Include order reference in transfer memo"
  customInstructions: text("custom_instructions"),
});

export type BidPaymentAccount = typeof bidPaymentAccounts.$inferSelect;
export type NewBidPaymentAccount = typeof bidPaymentAccounts.$inferInsert;
