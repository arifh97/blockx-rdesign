"use server"

import { createChatMessage, getOrderInternalId, getChatMessagesByOrderId } from "@/db/queries/chat-messages"
import { verifyOrderAccess } from "@/lib/order-security"
import { getUserWalletAddress } from "@/lib/auth"

export interface SendChatMessageData {
  orderId: string
  content: string
  attachmentUrl?: string
}

/**
 * Send a chat message for an order
 * Security: Verifies user has access to the order (is buyer or seller)
 */
export async function sendChatMessageAction(data: SendChatMessageData) {
  try {
    // Verify user has access to this order
    await verifyOrderAccess(data.orderId)

    // Get the authenticated user's wallet address
    const senderAddress = await getUserWalletAddress()
    if (!senderAddress) {
      return {
        success: false,
        error: "User wallet address not found",
      }
    }

    // Get the internal order UUID
    const orderInternalId = await getOrderInternalId(data.orderId)
    if (!orderInternalId) {
      return {
        success: false,
        error: "Order not found",
      }
    }

    // For now, store messages as plain text
    // TODO: Implement client-side encryption before storing
    const messageEncrypted = data.content

    // Create the message in the database
    const message = await createChatMessage({
      orderId: orderInternalId,
      senderAddress: senderAddress.toLowerCase(),
      messageEncrypted,
      attachmentUrl: data.attachmentUrl,
    })

    return {
      success: true,
      message,
    }
  } catch (error) {
    console.error("Error sending chat message:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    }
  }
}

/**
 * Get all chat messages for an order
 * Security: Verifies user has access to the order
 */
export async function getChatMessagesAction(orderId: string) {
  try {
    // Verify user has access to this order
    await verifyOrderAccess(orderId)

    // Get all messages for this order
    const messages = await getChatMessagesByOrderId(orderId)

    return {
      success: true,
      messages,
    }
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch messages",
    }
  }
}
