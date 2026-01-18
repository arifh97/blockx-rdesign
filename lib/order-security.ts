"use server"

import { verifyAuthentication } from "@/lib/auth"
import { getOrderById } from "@/db/queries/orders"
import { getUserByPrivyId } from "@/db/queries/users"

/**
 * Verify that the current user has access to the order (buyer or seller only)
 * @throws Error if user doesn't have access
 */
export async function verifyOrderAccess(orderId: string) {
  // Verify authentication and get Privy user ID
  const privyUserId = await verifyAuthentication()
  
  // Get the user from database
  const user = await getUserByPrivyId(privyUserId)
  if (!user) {
    throw new Error("User not found")
  }

  // Get the order
  const order = await getOrderById(orderId)
  if (!order) {
    throw new Error("Order not found")
  }

  // Check if user is either the maker (seller) or taker (buyer)
  const isMaker = order.makerId === user.id
  const isTaker = order.takerId === user.id

  if (!isMaker && !isTaker) {
    throw new Error("Unauthorized: You don&apos;t have access to this order")
  }

  return {
    user,
    order,
    isMaker,
    isTaker,
  }
}

/**
 * Get order with user role information
 * Returns null if user doesn't have access
 */
export async function getOrderWithAccess(orderId: string) {
  try {
    return await verifyOrderAccess(orderId)
  } catch (error) {
    console.error("Order access verification failed:", error)
    return null
  }
}
