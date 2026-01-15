"use client"

import { OrderStepper } from './OrderStepper'
import { SellerOrderStepper } from './SellerOrderStepper'
import { OrderChat } from './OrderChat'
import { useMarkOrderPaid } from '@/hooks/use-mark-order-paid'
import { useConfirmAndReleaseOrder } from '@/hooks/use-confirm-and-release-order'
import { useCancelOrder } from '@/hooks/use-cancel-order'
import { useRealtimeOrder } from '@/hooks/use-realtime-order'
import { RealtimeIndicator } from '@/components/shared/RealtimeIndicator'
import { useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { getTokenByAddress } from '@/lib/tokens'
import { getFiatCurrencyInfo } from '@/lib/constants'
import type { Order } from '@/db/schema/orders'
import type { User } from '@/db/schema/users'
import type { ChatMessage } from '@/db/schema/chat-messages'
import type { Address } from 'viem'

interface PaymentDetails {
  paymentMethod: string
  label: string | null
  details: string
  currency: string | null
}

interface OrderPageClientProps {
  order: Order
  seller: User
  buyer: User
  isBuyer: boolean
  currentUserAddress: string
  initialMessages: ChatMessage[]
  paymentDetails: PaymentDetails | null
  paymentInstructions?: string | null
  paymentReference: string | null
}

export function OrderPageClient({ 
  order: initialOrder, 
  seller, 
  buyer, 
  isBuyer,
  currentUserAddress,
  initialMessages,
  paymentDetails,
  paymentInstructions,
  paymentReference,
}: OrderPageClientProps) {
  const { markOrderPaid, isLoading: isMarkingPaid } = useMarkOrderPaid()
  const { confirmAndRelease, isLoading: isConfirming } = useConfirmAndReleaseOrder()
  const { cancelOrder, isLoading: isCancelling } = useCancelOrder()
  
  // Track previous status for toast notifications
  const previousStatusRef = useRef(initialOrder.status)
  
  // Subscribe to realtime updates for this order
  const { order, isConnected } = useRealtimeOrder({
    orderId: initialOrder.orderId,
    initialOrder,
    onUpdate: (updatedOrder) => {
      // Show toast notification when order status changes
      if (updatedOrder.status !== previousStatusRef.current) {
        toast.success(`Order status updated to: ${updatedOrder.status}`)
        previousStatusRef.current = updatedOrder.status
      }
    },
  })

  const handleMarkAsPaid = async () => {
    await markOrderPaid({ orderId: order.orderId })
    // Realtime subscription will update the order state automatically
  }

  const handleConfirmPayment = async () => {
    await confirmAndRelease({ orderId: order.orderId })
    // Realtime subscription will update the order state automatically
  }

  const handleCancelOrder = async () => {
    await cancelOrder({ orderId: order.orderId })
    // Realtime subscription will update the order state automatically
  }

  const isLoading = isMarkingPaid || isConfirming || isCancelling

  const sellerName = seller.username || seller.email || seller.walletAddress
  const sellerInitials = seller.username || seller.email ? sellerName.slice(0, 1).toUpperCase() : sellerName.slice(2, 4).toUpperCase()

  // Get token info for display (crypto)
  const tokenInfo = getTokenByAddress(order.chainId, order.fromToken as Address)
  
  // Calculate fiat amount for buyer (fromAmount * price)
  const fiatAmount = (parseFloat(order.fromAmount) * parseFloat(order.price)).toFixed(2)
  const fiatCurrency = order.fiatCurrency || 'USD'
  const fiatCurrencyInfo = getFiatCurrencyInfo(fiatCurrency)

  return (
    <div className="space-y-4">
      {/* Realtime Connection Indicator */}
      <div className="flex justify-end">
        <RealtimeIndicator isConnected={isConnected} showLabel />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Order Stepper (different for buyer vs seller) */}
        {isBuyer ? (
        <OrderStepper
          orderId={order.orderId}
          fiatAmount={fiatAmount}
          fiatCurrency={fiatCurrency}
          fiatCurrencyLogoURI={fiatCurrencyInfo?.logoURI}
          cryptoAmount={order.fromAmount}
          tokenSymbol={tokenInfo?.symbol || order.fromToken}
          tokenLogoURI={tokenInfo?.logoURI}
          paymentDetails={paymentDetails}
          paymentInstructions={paymentInstructions}
          paymentReference={paymentReference}
          onMarkAsPaid={handleMarkAsPaid}
          onCancelOrder={handleCancelOrder}
          isLoading={isLoading}
          isBuyer={isBuyer}
          paymentDeadline={order.paymentDeadline ?? undefined}
          orderStatus={order.status}
        />
      ) : (
        <SellerOrderStepper
          orderId={order.orderId}
          buyer={buyer}
          amount={order.fromAmount}
          tokenSymbol={tokenInfo?.symbol || order.fromToken}
          tokenLogoURI={tokenInfo?.logoURI}
          onConfirmPayment={handleConfirmPayment}
          onCancelOrder={handleCancelOrder}
          isLoading={isLoading}
          orderStatus={order.status}
        />
      )}

        {/* Right Side - Chat */}
        <OrderChat
          orderId={order.orderId}
          sellerName={sellerName}
          sellerInitials={sellerInitials}
          sellerAddress={seller.walletAddress}
          buyerAddress={buyer.walletAddress}
          isOnline={true}
          tradedCount={7}
          isBuyer={isBuyer}
          currentUserAddress={currentUserAddress}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  )
}
