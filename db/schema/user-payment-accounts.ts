import { pgTable, text, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * User Payment Accounts
 * Stores saved payment account details for users to reuse across bids
 */
export const userPaymentAccounts = pgTable("user_payment_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Payment method type (e.g., 'bank_transfer', 'paypal', 'venmo')
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  
  // Encrypted JSON with payment details structure varies by payment method:
  // Bank: {accountHolder, bankName, accountNumber, routingNumber, iban, etc}
  // PayPal: {email, accountHolder}
  // Venmo: {username, phone, accountHolder}
  // PIX: {pixKey, pixKeyType, accountHolder}
  paymentDetailsEncrypted: text("payment_details_encrypted").notNull(),
  
  // User-friendly label for this account
  label: varchar("label", { length: 100 }), // "My Chase Account", "Work PayPal"
  
  // Currency this account supports
  currency: varchar("currency", { length: 3 }),
  
  // Default account for this payment method
  isDefault: boolean("is_default").default(false),
  
  // Whether account has been verified (e.g., micro-deposits, KYC)
  isVerified: boolean("is_verified").default(false),
  
  // Active status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserPaymentAccount = typeof userPaymentAccounts.$inferSelect;
export type NewUserPaymentAccount = typeof userPaymentAccounts.$inferInsert;
