"use server"

import { createOrder, getOrderById, updateOrderCancelRequested, updateOrderStatus, markOrderPaid, getAllOrdersForUser } from "@/db/queries/orders"
import { type NewOrder } from "@/db/schema/orders"
import { verifyAuthentication } from "@/lib/auth"
import { verifyOrderAccess } from "@/lib/order-security"
import { type Address } from "viem"
import { getUserPaymentAccountById } from "@/db/queries/user-payment-accounts"
import { decrypt } from "@/lib/encryption"
import { getUserById, getUserByPrivyId } from "@/db/queries/users"

export interface CreateOrderData {
  orderId: string
  bidId?: string
  makerId: string
  takerId: string
  makerAddress: Address
  takerAddress: Address
  fromToken: Address
  fromAmount: string
  price: string
  agreedFee: string
  fiatCurrency?: string | null
  chainId: number
  status: string
  openedAt: bigint
  paymentDeadline?: bigint
  confirmDeadline?: bigint
  txHash: string
  selectedPaymentAccountId?: string
  paymentMethod?: string
  paymentDetailsSnapshot?: string
  paymentInstructions?: string
  paymentReference?: string
}

export async function createOrderAction(orderData: CreateOrderData) {
  try {
    // Verify authentication
    await verifyAuthentication()

    // Check if order already exists
    const existingOrder = await getOrderById(orderData.orderId)
    if (existingOrder) {
      throw new Error("Order already exists")
    }

    // Create order in database
    const newOrder: NewOrder = {
      orderId: orderData.orderId,
      bidId: orderData.bidId,
      makerId: orderData.makerId,
      takerId: orderData.takerId,
      makerAddress: orderData.makerAddress.toLowerCase(),
      takerAddress: orderData.takerAddress.toLowerCase(),
      fromToken: orderData.fromToken.toLowerCase(),
      fromAmount: orderData.fromAmount,
      price: orderData.price,
      agreedFee: orderData.agreedFee,
      fiatCurrency: orderData.fiatCurrency,
      chainId: orderData.chainId,
      status: orderData.status,
      openedAt: orderData.openedAt,
      paymentDeadline: orderData.paymentDeadline,
      confirmDeadline: orderData.confirmDeadline,
      txHash: orderData.txHash,
      selectedPaymentAccountId: orderData.selectedPaymentAccountId,
      paymentMethod: orderData.paymentMethod,
      paymentDetailsSnapshot: orderData.paymentDetailsSnapshot,
      paymentInstructions: orderData.paymentInstructions,
      paymentReference: orderData.paymentReference,
    }

    const order = await createOrder(newOrder)

    return {
      success: true,
      order,
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    }
  }
}

export async function getOrderByIdAction(orderId: string) {
  try {
    await verifyAuthentication()
    
    const order = await getOrderById(orderId)

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      }
    }

    return {
      success: true,
      order,
    }
  } catch (error) {
    console.error("Error fetching order:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch order",
    }
  }
}

/**
 * Mark order as paid - only accessible by the buyer (taker)
 */
export async function markOrderAsPaidAction(orderId: string) {
  try {
    // Verify user has access to this order
    const { order, isTaker } = await verifyOrderAccess(orderId)

    // Only the buyer (taker) can mark as paid
    if (!isTaker) {
      return {
        success: false,
        error: "Only the buyer can mark the order as paid",
      }
    }

    // Check if order is in correct status
    if (order.status !== "pending_payment" && order.status !== "open" && order.status !== "locked") {
      return {
        success: false,
        error: "Order cannot be marked as paid in current status",
      }
    }

    // Update order with payment sent timestamp and status atomically
    const timestamp = BigInt(Date.now())
    await markOrderPaid(orderId, timestamp)

    return {
      success: true,
      message: "Order marked as paid successfully",
    }
  } catch (error) {
    console.error("Error marking order as paid:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark order as paid",
    }
  }
}

/**
 * Confirm payment and complete order - only accessible by the seller (maker)
 */
export async function confirmOrderAction(orderId: string) {
  try {
    // Verify user has access to this order
    const { order, isMaker } = await verifyOrderAccess(orderId)

    // Only the seller (maker) can confirm payment
    if (!isMaker) {
      return {
        success: false,
        error: "Only the seller can confirm payment",
      }
    }

    // Check if order is in correct status
    if (order.status !== "payment_sent" && order.status !== "locked") {
      return {
        success: false,
        error: "Order cannot be confirmed in current status",
      }
    }

    // Update order status to completed
    await updateOrderStatus(orderId, "completed")

    return {
      success: true,
      message: "Order confirmed and completed successfully",
    }
  } catch (error) {
    console.error("Error confirming order:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to confirm order",
    }
  }
}

/**
 * Cancel order - accessible by both buyer and seller
 */
export async function cancelOrderAction(orderId: string) {
  try {
    // Verify user has access to this order
    const { order } = await verifyOrderAccess(orderId)

    // Check if order can be cancelled
    if (order.status === "completed" || order.status === "cancelled") {
      return {
        success: false,
        error: "Order cannot be cancelled in current status",
      }
    }

    // Update order with cancel requested timestamp
    const timestamp = BigInt(Date.now())
    await updateOrderCancelRequested(orderId, timestamp)
    await updateOrderStatus(orderId, "cancel_requested")

    return {
      success: true,
      message: "Cancellation request submitted successfully",
    }
  } catch (error) {
    console.error("Error cancelling order:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    }
  }
}

/**
 * Get payment details for an order
 * Returns payment details from the immutable snapshot stored at order creation
 */
export async function getOrderPaymentDetailsAction(orderId: string) {
  try {
    // Verify user has access to this order
    const { order, isTaker } = await verifyOrderAccess(orderId)

    // Only buyer should see payment details
    if (!isTaker) {
      return {
        success: false,
        error: "Only the buyer can view payment details",
      }
    }

    // Return snapshot data if available
    if (order.paymentDetailsSnapshot) {
      return {
        success: true,
        paymentDetails: {
          paymentMethod: order.paymentMethod || "Unknown",
          label: null, // Snapshot doesn't store label
          details: order.paymentDetailsSnapshot,
          currency: null,
        },
        paymentInstructions: order.paymentInstructions,
        paymentReference: order.paymentReference,
      }
    }

    // Fallback: If no snapshot exists (legacy orders), try to fetch from payment account
    if (order.selectedPaymentAccountId) {
      try {
        const seller = await getUserById(order.makerId)
        if (seller) {
          const paymentAccount = await getUserPaymentAccountById(
            order.selectedPaymentAccountId,
            seller.id
          )

          if (paymentAccount) {
            const decryptedDetails = decrypt(paymentAccount.paymentDetailsEncrypted)
            return {
              success: true,
              paymentDetails: {
                paymentMethod: paymentAccount.paymentMethod,
                label: paymentAccount.label,
                details: decryptedDetails,
                currency: paymentAccount.currency,
              },
              paymentReference: order.paymentReference,
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch payment account as fallback:", error)
      }
    }

    // No payment details available
    return {
      success: true,
      paymentDetails: null,
      paymentReference: order.paymentReference,
    }
  } catch (error) {
    console.error("Error getting payment details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get payment details",
    }
  }
}

/**
 * Get all orders for the authenticated user
 * Returns orders with user details for display
 */
export async function getMyOrdersAction() {
  try {
    const privyUserId = await verifyAuthentication()
    
    // Get the user from database
    const user = await getUserByPrivyId(privyUserId)
    
    if (!user) {
      return {
        success: false,
        error: "User not found",
        orders: [],
        userWallet: undefined,
      }
    }

    const userAddress = user.walletAddress
    const orders = await getAllOrdersForUser(userAddress)

    return {
      success: true,
      orders,
      userWallet: userAddress,
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
      orders: [],
      userWallet: undefined,
    }
  }
}
