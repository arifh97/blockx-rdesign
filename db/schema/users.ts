import { pgTable, text, timestamp, uuid, varchar, smallint, bigint, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  privyId: varchar("privy_id", { length: 255 }).notNull().unique(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  username: varchar("username", { length: 50 }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  kycLevel: smallint("kyc_level").default(0),
  kycExpiry: bigint("kyc_expiry", { mode: "bigint" }),
  totalTrades: integer("total_trades").default(0),
  successfulTrades: integer("successful_trades").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
