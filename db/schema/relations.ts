import { relations } from "drizzle-orm";
import { users } from "./users";
import { bids } from "./bids";
import { orders } from "./orders";
import { chatMessages } from "./chat-messages";
import { disputes } from "./disputes";
import { userPaymentAccounts } from "./user-payment-accounts";
import { bidPaymentAccounts } from "./bid-payment-accounts";
import { bidPaymentPreferences } from "./bid-payment-preferences";

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  bids: many(bids),
  paymentAccounts: many(userPaymentAccounts),
}));

// Bid relations
export const bidsRelations = relations(bids, ({ one, many }) => ({
  creator: one(users, {
    fields: [bids.creatorId],
    references: [users.id],
  }),
  orders: many(orders),
  paymentAccounts: many(bidPaymentAccounts), // For sell offers with full payment details
  paymentPreferences: many(bidPaymentPreferences), // For buy offers with just method types
}));

// Order relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  bid: one(bids, {
    fields: [orders.bidId],
    references: [bids.id],
  }),
  chatMessages: many(chatMessages),
  dispute: one(disputes),
}));

// Chat message relations
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  order: one(orders, {
    fields: [chatMessages.orderId],
    references: [orders.id],
  }),
}));

// Dispute relations
export const disputesRelations = relations(disputes, ({ one }) => ({
  order: one(orders, {
    fields: [disputes.orderId],
    references: [orders.id],
  }),
}));

// User payment account relations
export const userPaymentAccountsRelations = relations(userPaymentAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [userPaymentAccounts.userId],
    references: [users.id],
  }),
  bidPaymentAccounts: many(bidPaymentAccounts),
}));

// Bid payment account relations (junction table)
export const bidPaymentAccountsRelations = relations(bidPaymentAccounts, ({ one }) => ({
  bid: one(bids, {
    fields: [bidPaymentAccounts.bidId],
    references: [bids.id],
  }),
  paymentAccount: one(userPaymentAccounts, {
    fields: [bidPaymentAccounts.paymentAccountId],
    references: [userPaymentAccounts.id],
  }),
}));

// Bid payment preference relations
export const bidPaymentPreferencesRelations = relations(bidPaymentPreferences, ({ one }) => ({
  bid: one(bids, {
    fields: [bidPaymentPreferences.bidId],
    references: [bids.id],
  }),
}));
