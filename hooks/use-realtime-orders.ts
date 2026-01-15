"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import type { Order } from '@/db/schema/orders'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Transform snake_case database columns to camelCase for TypeScript
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformRealtimeOrder(dbOrder: Record<string, any>): Order {
  return {
    id: dbOrder.id as string,
    orderId: dbOrder.order_id as string,
    bidId: dbOrder.bid_id as string | null,
    makerId: dbOrder.maker_id as string,
    takerId: dbOrder.taker_id as string,
    makerAddress: dbOrder.maker_address as string,
    takerAddress: dbOrder.taker_address as string,
    fromToken: dbOrder.from_token as string,
    fromAmount: dbOrder.from_amount as string,
    price: dbOrder.price as string,
    agreedFee: dbOrder.agreed_fee as string,
    fiatCurrency: dbOrder.fiat_currency as string | null,
    chainId: dbOrder.chain_id as number,
    status: dbOrder.status as string,
    openedAt: dbOrder.opened_at as bigint,
    paymentDeadline: dbOrder.payment_deadline as bigint | null,
    confirmDeadline: dbOrder.confirm_deadline as bigint | null,
    paymentSentAt: dbOrder.payment_sent_at as bigint | null,
    cancelRequestedAt: dbOrder.cancel_requested_at as bigint | null,
    txHash: dbOrder.tx_hash as string | null,
    selectedPaymentAccountId: dbOrder.selected_payment_account_id as string | null,
    paymentMethod: dbOrder.payment_method as string | null,
    paymentDetailsSnapshot: dbOrder.payment_details_snapshot as string | null,
    paymentInstructions: dbOrder.payment_instructions as string | null,
    paymentReference: dbOrder.payment_reference as string | null,
  }
}

interface UseRealtimeOrdersOptions {
  userAddress?: string // Filter orders by user address (maker or taker)
  initialOrders?: Order[]
  onInsert?: (order: Order) => void
  onUpdate?: (order: Order) => void
  onDelete?: (orderId: string) => void
}

/**
 * Hook to subscribe to realtime updates for multiple orders
 * Useful for dashboard views showing all user orders
 * 
 * @example
 * const { orders, isConnected } = useRealtimeOrders({
 *   userAddress: '0x123...',
 *   initialOrders: serverOrders,
 *   onUpdate: (order) => {
 *     toast.success(`Order ${order.orderId} updated!`)
 *   }
 * })
 */
export function useRealtimeOrders({
  userAddress,
  initialOrders = [],
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Sync orders when initialOrders changes (e.g., after query loads)
  useEffect(() => {
    if (initialOrders.length > 0) {
      setOrders(initialOrders)
    }
  }, [initialOrders])

  useEffect(() => {
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        // Create a channel for all orders (optionally filtered by user)
        const channelName = userAddress ? `orders:user:${userAddress}` : 'orders:all'
        
        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'orders',
              // Optional: filter by user address
              ...(userAddress && {
                filter: `maker_address=eq.${userAddress.toLowerCase()},taker_address=eq.${userAddress.toLowerCase()}`,
              }),
            },
            (payload) => {
              console.log('New order inserted:', payload)
              const newOrder = transformRealtimeOrder(payload.new)
              
              // Check if order involves the user (if filtering)
              if (!userAddress || 
                  newOrder.makerAddress.toLowerCase() === userAddress.toLowerCase() ||
                  newOrder.takerAddress.toLowerCase() === userAddress.toLowerCase()) {
                setOrders((prev) => [newOrder, ...prev])
                onInsert?.(newOrder)
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'orders',
              ...(userAddress && {
                filter: `maker_address=eq.${userAddress.toLowerCase()},taker_address=eq.${userAddress.toLowerCase()}`,
              }),
            },
            (payload) => {
              console.log('Order updated:', payload)
              const updatedOrder = transformRealtimeOrder(payload.new)
              
              setOrders((prev) =>
                prev.map((order) =>
                  order.orderId === updatedOrder.orderId ? updatedOrder : order
                )
              )
              onUpdate?.(updatedOrder)
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'orders',
              ...(userAddress && {
                filter: `maker_address=eq.${userAddress.toLowerCase()},taker_address=eq.${userAddress.toLowerCase()}`,
              }),
            },
            (payload) => {
              console.log('Order deleted:', payload)
              const deletedOrder = payload.old as Order
              
              setOrders((prev) =>
                prev.filter((order) => order.orderId !== deletedOrder.orderId)
              )
              onDelete?.(deletedOrder.orderId)
            }
          )
          .subscribe((status) => {
            console.log('Realtime subscription status:', status)
            
            if (status === 'SUBSCRIBED') {
              setIsConnected(true)
              setError(null)
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false)
              setError(new Error('Failed to connect to realtime channel'))
            } else if (status === 'TIMED_OUT') {
              setIsConnected(false)
              setError(new Error('Realtime connection timed out'))
            }
          })
      } catch (err) {
        console.error('Error setting up realtime subscription:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
    }

    setupSubscription()

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        console.log('Unsubscribing from orders channel')
        supabase.removeChannel(channel)
      }
    }
  }, [userAddress, onInsert, onUpdate, onDelete])

  return {
    orders,
    isConnected,
    error,
  }
}
