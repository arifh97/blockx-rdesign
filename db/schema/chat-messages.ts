import { pgTable, text, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { orders } from "./orders";

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  senderAddress: varchar("sender_address", { length: 42 }).notNull(),
  messageEncrypted: text("message_encrypted").notNull(),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
