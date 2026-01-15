"use server"

import { getActiveOrdersForUser } from "@/db/queries/orders"
import { getUserById, getUserByPrivyId } from "@/db/queries/users"
import { verifyAuthentication } from "@/lib/auth"

/**
 * Get active orders for the authenticated user
 * Returns orders with user details for display
 */
export async function getActiveOrdersAction() {
  try {
    const privyUserId = await verifyAuthentication()
    
    // Get the user from database
    const user = await getUserByPrivyId(privyUserId)
    
    if (!user) {
      return {
        success: false,
        error: "User not found",
        orders: [],
      }
    }

    const userAddress = user.walletAddress
    const orders = await getActiveOrdersForUser(userAddress)

    // Fetch user details for each order (the other party)
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        // Determine if current user is maker or taker
        const isMaker = order.makerAddress.toLowerCase() === userAddress.toLowerCase()
        const otherPartyId = isMaker ? order.takerId : order.makerId
        
        // Fetch the other party's details
        const otherParty = await getUserById(otherPartyId)
        
        return {
          ...order,
          otherParty,
          isMaker,
        }
      })
    )

    return {
      success: true,
      orders: ordersWithUsers,
    }
  } catch (error) {
    console.error("Error fetching active orders:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch active orders",
      orders: [],
    }
  }
}
