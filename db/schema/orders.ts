import { pgTable, uuid, varchar, numeric, integer, bigint, text } from "drizzle-orm/pg-core";
import { bids } from "./bids";
import { users } from "./users";
import { userPaymentAccounts } from "./user-payment-accounts";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: varchar("order_id", { length: 66 }).notNull().unique(),
  bidId: uuid("bid_id").references(() => bids.id),
  makerId: uuid("maker_id").notNull().references(() => users.id), // Seller (who has crypto)
  takerId: uuid("taker_id").notNull().references(() => users.id), // Buyer (who pays fiat)
  makerAddress: varchar("maker_address", { length: 42 }).notNull(), // Seller's address
  takerAddress: varchar("taker_address", { length: 42 }).notNull(), // Buyer's address
  fromToken: varchar("from_token", { length: 42 }).notNull(),
  fromAmount: numeric("from_amount").notNull(), // Stores human-readable amount (e.g., 100)
  price: numeric("price").notNull(), // Stores human-readable price (e.g., 1.02)
  agreedFee: numeric("agreed_fee").notNull(), // Stores human-readable fee (e.g., 0.5)
  fiatCurrency: varchar("fiat_currency", { length: 3 }), // Snapshot of fiat currency (e.g., USD, EUR)
  chainId: integer("chain_id").notNull(), // Chain ID where the order is executed
  status: varchar("status", { length: 20 }).notNull(),
  openedAt: bigint("opened_at", { mode: "bigint" }).notNull(),
  paymentDeadline: bigint("payment_deadline", { mode: "bigint" }),
  confirmDeadline: bigint("confirm_deadline", { mode: "bigint" }),
  paymentSentAt: bigint("payment_sent_at", { mode: "bigint" }),
  cancelRequestedAt: bigint("cancel_requested_at", { mode: "bigint" }),
  txHash: varchar("tx_hash", { length: 66 }),
  
  // Payment details - immutable snapshot from bid at order creation time
  selectedPaymentAccountId: uuid("selected_payment_account_id").references(() => userPaymentAccounts.id),
  paymentMethod: varchar("payment_method", { length: 50 }), // Snapshot of payment method type
  paymentDetailsSnapshot: text("payment_details_snapshot"), // Encrypted copy of payment details
  paymentInstructions: text("payment_instructions"), // Copy of custom instructions
  paymentReference: varchar("payment_reference", { length: 100 }), // Auto-generated reference code for this order
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
