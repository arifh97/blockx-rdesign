"use client"

import { Check, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { User as UserType } from '@/db/schema/users'
import Image from 'next/image'

interface SellerOrderStepperProps {
  orderId: string
  buyer: UserType
  amount: string
  tokenSymbol: string
  tokenLogoURI?: string
  onConfirmPayment: () => void
  onCancelOrder: () => void
  isLoading?: boolean
  orderStatus: string
}

export function SellerOrderStepper({
  orderId,
  buyer,
  amount,
  tokenSymbol,
  tokenLogoURI,
  onConfirmPayment,
  onCancelOrder,
  isLoading = false,
  orderStatus,
}: SellerOrderStepperProps) {
  const buyerName = buyer.username || `${buyer.walletAddress.slice(0, 6)}...${buyer.walletAddress.slice(-4)}`
  const buyerInitials = buyer.username ? buyer.username.charAt(0).toUpperCase() : buyer.walletAddress.slice(2, 3).toUpperCase()

  const steps = [
    {
      title: "Order Created",
      completed: true,
    },
    {
      title: "Buyer Information",
      completed: true,
    },
    {
      title: "Confirm Payment",
      completed: orderStatus === "completed",
    },
  ]

  const isPaymentSent = orderStatus === "payment_sent"
  const isCompleted = orderStatus === "completed"

  return (
    <div className="bg-card rounded-2xl border border-border p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          {isCompleted ? "Order Completed" : isPaymentSent ? "Payment Received - Confirm & Release" : "Waiting for Buyer Payment"}
        </h2>
        {isPaymentSent && !isCompleted && (
          <p className="text-sm text-muted-foreground">
            The buyer has marked the payment as sent. Please verify receipt and confirm to release the crypto.
          </p>
        )}
      </div>

      {/* Stepper */}
      <div className="flex gap-6">
        {/* Vertical Stepper */}
        <div className="flex flex-col items-center gap-0">
          {/* Step 1 Indicator */}
          <div className="flex flex-col items-center h-[60px]">
            <div
              className={cn(
                'w-[25px] h-[25px] rotate-45 rounded-sm flex items-center justify-center transition-colors',
                'bg-primary'
              )}
            >
              <div className="-rotate-45">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className={cn('w-0.5 flex-1 transition-colors', 'bg-primary')} />
          </div>

          {/* Step 2 Indicator */}
          <div className="flex flex-col items-center flex-1">
            <div
              className={cn(
                'w-[25px] h-[25px] rotate-45 rounded-sm flex items-center justify-center transition-colors',
                'bg-primary'
              )}
            >
              <div className="-rotate-45">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className={cn('w-0.5 flex-1 transition-colors', isPaymentSent || isCompleted ? 'bg-primary' : 'bg-border')} />
          </div>

          {/* Step 3 Indicator */}
          <div className="flex flex-col items-center h-[120px]">
            <div
              className={cn(
                'w-[25px] h-[25px] rotate-45 rounded-sm flex items-center justify-center transition-colors',
                isCompleted ? 'bg-primary' : 'bg-[#41FDFE1A] border border-[#FFFFFF08]'
              )}
            >
              <div className="-rotate-45">
                {isCompleted ? (
                  <Check className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">3</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 flex flex-col gap-0">
          {/* Step 1: Order Created */}
          <div className="space-y-2 h-[60px]">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{steps[0].title}</h3>
              <Badge variant="secondary" className="capitalize">
                {orderStatus.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Order ID: {orderId ? `${orderId.slice(0, 10)}...${orderId.slice(-8)}` : 'Loading...'}
            </p>
          </div>

          {/* Step 2: Buyer Information */}
          <div className="space-y-4 flex-1">
            <h3 className="text-lg font-semibold">{steps[1].title}</h3>
            
            <div className="space-y-4 bg-background/50 rounded-lg p-4">
              {/* Buyer Profile */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {buyerInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{buyerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {buyer.totalTrades || 0} trades • {buyer.successfulTrades || 0} successful
                  </p>
                </div>
              </div>

              {/* Amount to Receive */}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount to Receive</span>
                  <div className="flex items-center gap-2">
                    {tokenLogoURI && (
                      <Image 
                        src={tokenLogoURI} 
                        alt={tokenSymbol}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-lg font-semibold">{amount} {tokenSymbol}</span>
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Buyer Wallet</span>
                <span className="text-sm font-mono">
                  {buyer.walletAddress.slice(0, 6)}...{buyer.walletAddress.slice(-4)}
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Confirm Payment */}
          <div className="space-y-4 h-[120px]">
            <h3 className="text-lg font-semibold">{steps[2].title}</h3>
            
            {isCompleted ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-primary font-medium">
                  ✓ Payment confirmed and crypto released
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                {isPaymentSent && (
                  <Button
                    onClick={onConfirmPayment}
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Confirm Payment & Release
                  </Button>
                )}
                <Button
                  onClick={onCancelOrder}
                  disabled={isLoading}
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Cancel Order
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Waiting for Payment Notification - Show when payment not yet sent */}
      {!isPaymentSent && !isCompleted && (
        <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">
              Waiting for Buyer Payment
            </h4>
            <p className="text-sm text-muted-foreground">
              The buyer is currently making the payment. Once they mark it as sent, you&apos;ll be able to confirm receipt and release the crypto.
            </p>
          </div>
        </div>
      )}

      {/* Payment Sent Notification - Show when payment is marked as sent */}
      {isPaymentSent && !isCompleted && (
        <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
          <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-primary mb-1">
              Payment Marked as Sent
            </h4>
            <p className="text-sm text-muted-foreground">
              The buyer has marked the payment as sent. Please verify that you have received the payment in your bank account, 
              then click &quot;Confirm Payment &amp; Release&quot; to complete the order and release the crypto to the buyer.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
