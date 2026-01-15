import { pgTable, text, uuid, varchar, integer, bigint } from "drizzle-orm/pg-core";
import { orders } from "./orders";

export const disputes = pgTable("disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .unique()
    .references(() => orders.id),
  initiatorAddress: varchar("initiator_address", { length: 42 }).notNull(),
  reason: text("reason").notNull(),
  evidenceUrls: text("evidence_urls").array(),
  status: varchar("status", { length: 20 }).default("open"),
  buyerShareBps: integer("buyer_share_bps"),
  resolvedAt: bigint("resolved_at", { mode: "bigint" }),
});

export type Dispute = typeof disputes.$inferSelect;
export type NewDispute = typeof disputes.$inferInsert;
