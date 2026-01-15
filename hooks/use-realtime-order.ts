"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import type { Order } from '@/db/schema/orders'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Transform snake_case database columns to camelCase for TypeScript
 * Supabase Realtime sends raw database column names (snake_case)
 * but our Drizzle types expect camelCase
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

interface UseRealtimeOrderOptions {
  orderId: string
  initialOrder: Order
  onUpdate?: (order: Order) => void
}

/**
 * Hook to subscribe to realtime updates for a specific order
 * 
 * @example
 * const { order, isConnected } = useRealtimeOrder({
 *   orderId: 'order_123',
 *   initialOrder: serverOrder,
 *   onUpdate: (updatedOrder) => {
 *     console.log('Order updated:', updatedOrder)
 *   }
 * })
 */
export function useRealtimeOrder({ orderId, initialOrder, onUpdate }: UseRealtimeOrderOptions) {
  const [order, setOrder] = useState<Order>(initialOrder)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        // Create a channel for this specific order
        channel = supabase
          .channel(`order:${orderId}`)
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'orders',
              filter: `order_id=eq.${orderId}`,
            },
            (payload) => {
              console.log('Order update received:', payload)

              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                // Transform snake_case database columns to camelCase
                const updatedOrder = transformRealtimeOrder(payload.new)
                
                // Only update if we have a valid order with orderId
                if (updatedOrder && updatedOrder.orderId) {
                  setOrder(updatedOrder)
                  onUpdate?.(updatedOrder)
                } else {
                  console.warn('Received invalid order update:', payload.new)
                }
              } else if (payload.eventType === 'DELETE') {
                console.log('Order deleted:', orderId)
              }
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
        console.log('Unsubscribing from order channel:', orderId)
        supabase.removeChannel(channel)
      }
    }
  }, [orderId, onUpdate])

  return {
    order,
    isConnected,
    error,
  }
}
