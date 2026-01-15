import { pgTable, text, uuid, varchar, numeric, smallint, integer, bigint, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

// Define bid type enum
export const bidTypeEnum = pgEnum("bid_type", ["sell", "buy"]);

export const bids = pgTable("bids", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => users.id),
  bidHash: varchar("bid_hash", { length: 66 }).notNull().unique(),
  makerAddress: varchar("maker_address", { length: 42 }).notNull(),
  fromToken: varchar("from_token", { length: 42 }).notNull(),
  toToken: varchar("to_token", { length: 42 }).default("0x0000000000000000000000000000000000000000"),
  price: numeric("price").notNull(), // Stores human-readable price (e.g., 1.02)
  minAmount: numeric("min_amount").notNull(), // Stores human-readable amount (e.g., 100)
  maxAmount: numeric("max_amount").notNull(), // Stores human-readable amount (e.g., 1000)
  kycLevel: smallint("kyc_level").notNull(),
  expiresAt: bigint("expires_at", { mode: "bigint" }).notNull(),
  nonce: bigint("nonce", { mode: "bigint" }).notNull(),
  signature: text("signature").notNull(),
  status: varchar("status", { length: 20 }).default("active"),
  fiatCurrency: varchar("fiat_currency", { length: 3 }),
  paymentMethods: text("payment_methods").array(),
  description: text("description"),
  
  // Bid type: sell (user selling crypto) or buy (user buying crypto)
  bidType: bidTypeEnum("bid_type").notNull().default("sell"),
  
  // Chain ID - the specific chain this bid is for
  // Each bid is chain-specific with its own EIP-712 signature
  // For multi-chain buy offers, separate bids are created per chain (linked by bidGroupId)
  chainId: integer("chain_id").notNull(),
  
  // Payment window in seconds (for fiat trades)
  // Default: 1800 (30 minutes)
  paymentWindow: integer("payment_window").notNull().default(1800),
  
  // Bid Group ID - links related bids created together (for multi-chain buy offers)
  // Multiple bids with same bidGroupId represent the same offer on different chains
  bidGroupId: varchar("bid_group_id", { length: 64 }),
  
  // Available hours/schedule
  availableHours: text("available_hours"), // JSON string with schedule data
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  
  // Location filtering
  isGlobal: boolean("is_global").default(true),
  allowedCountries: text("allowed_countries").array(), // ISO country codes ['US', 'CA', 'GB']
  
  // Privacy/Visibility
  isPrivate: boolean("is_private").default(false),
  accessToken: varchar("access_token", { length: 64 }), // Unique token for direct link access
});

export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;
