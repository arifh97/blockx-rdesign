import { db } from "@/db"
import { orders, type NewOrder, type Order } from "@/db/schema/orders"
import { users } from "@/db/schema/users"
import { eq, or, and, ne, desc } from "drizzle-orm"

/**
 * Create a new order in the database
 */
export async function createOrder(orderData: NewOrder): Promise<Order> {
  const [order] = await db.insert(orders).values(orderData).returning()
  return order
}

/**
 * Get an order by its on-chain orderId
 */
export async function getOrderById(orderId: string): Promise<Order | undefined> {
  const [order] = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1)
  return order
}

/**
 * Get all orders for a specific maker address
 */
export async function getOrdersByMaker(makerAddress: string): Promise<Order[]> {
  return db.select().from(orders).where(eq(orders.makerAddress, makerAddress.toLowerCase()))
}

/**
 * Get all orders for a specific taker address
 */
export async function getOrdersByTaker(takerAddress: string): Promise<Order[]> {
  return db.select().from(orders).where(eq(orders.takerAddress, takerAddress.toLowerCase()))
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  const [order] = await db
    .update(orders)
    .set({ status })
    .where(eq(orders.orderId, orderId))
    .returning()
  return order
}

/**
 * Update order payment sent timestamp
 */
export async function updateOrderPaymentSent(orderId: string, timestamp: bigint): Promise<Order> {
  const [order] = await db
    .update(orders)
    .set({ paymentSentAt: timestamp })
    .where(eq(orders.orderId, orderId))
    .returning()
  return order
}

/**
 * Mark order as paid - updates both payment sent timestamp and status atomically
 */
export async function markOrderPaid(orderId: string, timestamp: bigint): Promise<Order> {
  const [order] = await db
    .update(orders)
    .set({ 
      paymentSentAt: timestamp,
      status: "payment_sent"
    })
    .where(eq(orders.orderId, orderId))
    .returning()
  return order
}

/**
 * Update order cancel requested timestamp
 */
export async function updateOrderCancelRequested(orderId: string, timestamp: bigint): Promise<Order> {
  const [order] = await db
    .update(orders)
    .set({ cancelRequestedAt: timestamp })
    .where(eq(orders.orderId, orderId))
    .returning()
  return order
}

/**
 * Get active orders for a user (where they are maker or taker)
 * Active means status is not 'completed' or 'cancelled'
 */
export async function getActiveOrdersForUser(userAddress: string): Promise<Order[]> {
  const normalizedAddress = userAddress.toLowerCase()
  
  return db
    .select()
    .from(orders)
    .where(
      and(
        or(
          eq(orders.makerAddress, normalizedAddress),
          eq(orders.takerAddress, normalizedAddress)
        ),
        ne(orders.status, 'completed'),
        ne(orders.status, 'cancelled')
      )
    )
    .orderBy(orders.openedAt)
}

/**
 * Get all orders for a user (where they are maker or taker) with other party details
 * Returns orders sorted by most recent first
 */
export async function getAllOrdersForUser(userAddress: string) {
  const normalizedAddress = userAddress.toLowerCase()
  
  const userOrders = await db
    .select()
    .from(orders)
    .where(
      or(
        eq(orders.makerAddress, normalizedAddress),
        eq(orders.takerAddress, normalizedAddress)
      )
    )
    .orderBy(desc(orders.openedAt))

  // Fetch user details for each order (the other party)
  const ordersWithUsers = await Promise.all(
    userOrders.map(async (order) => {
      // Determine if current user is maker or taker
      const isMaker = order.makerAddress.toLowerCase() === normalizedAddress
      const otherPartyId = isMaker ? order.takerId : order.makerId
      
      // Fetch the other party's details
      const [otherParty] = await db
        .select({
          id: users.id,
          username: users.username,
          walletAddress: users.walletAddress,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(eq(users.id, otherPartyId))
        .limit(1)
      
      return {
        ...order,
        otherParty: otherParty || null,
        isMaker,
      }
    })
  )

  return ordersWithUsers
}

export type OrderWithUser = Awaited<ReturnType<typeof getAllOrdersForUser>>[number]
