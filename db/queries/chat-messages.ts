import { db } from "@/db"
import { chatMessages, type NewChatMessage, type ChatMessage } from "@/db/schema/chat-messages"
import { orders } from "@/db/schema/orders"
import { eq } from "drizzle-orm"

/**
 * Get all chat messages for a specific order
 * Returns messages ordered by creation time (oldest first)
 */
export async function getChatMessagesByOrderId(orderId: string): Promise<ChatMessage[]> {
  // First get the order's internal UUID
  const [order] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.orderId, orderId))
    .limit(1)

  if (!order) {
    return []
  }

  // Get all messages for this order
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.orderId, order.id))
    .orderBy(chatMessages.createdAt) // Oldest first for chat display
}

/**
 * Create a new chat message
 */
export async function createChatMessage(messageData: NewChatMessage): Promise<ChatMessage> {
  const [message] = await db
    .insert(chatMessages)
    .values(messageData)
    .returning()
  
  return message
}

/**
 * Get the internal order UUID from orderId (for creating messages)
 */
export async function getOrderInternalId(orderId: string): Promise<string | undefined> {
  const [order] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.orderId, orderId))
    .limit(1)

  return order?.id
}
