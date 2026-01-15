"use client"

import { Check, Copy, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePaymentCountdown } from '@/hooks/use-payment-countdown'
import { toast } from 'sonner'
import Image from 'next/image'

interface PaymentDetails {
  paymentMethod: string
  label: string | null
  details: string
  currency: string | null
}

interface OrderStepperProps {
  orderId: string
  fiatAmount: string
  fiatCurrency: string
  fiatCurrencyLogoURI?: string
  cryptoAmount: string
  tokenSymbol: string
  tokenLogoURI?: string
  paymentDetails: PaymentDetails | null
  paymentInstructions?: string | null
  paymentReference: string | null
  onMarkAsPaid: () => void
  onCancelOrder: () => void
  isLoading?: boolean
  isBuyer: boolean
  paymentDeadline?: bigint
  orderStatus: string
}

interface OrderHeaderProps {
  paymentDeadline?: bigint
  isPaymentSent: boolean
  isCompleted: boolean
}

function OrderHeader({ paymentDeadline, isPaymentSent, isCompleted }: OrderHeaderProps) {
  const countdown = usePaymentCountdown(paymentDeadline)

  if (isCompleted) {
    return (
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-primary">
          Order Completed
        </h2>
        <p className="text-sm text-muted-foreground">
          The seller has confirmed receipt and released the crypto to your wallet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">
        {isPaymentSent ? (
          "Payment Sent - Waiting for Confirmation"
        ) : (
          <>
            Pay The Seller Within{' '}
            <span className={cn(
              "text-primary",
              countdown.isExpired && "text-destructive"
            )}>
              {countdown.formatted}
            </span>
          </>
        )}
      </h2>
      {countdown.isExpired && !isPaymentSent && (
        <p className="text-sm text-destructive">
          Payment deadline has expired
        </p>
      )}
    </div>
  )
}

export function OrderStepper({
  orderId,
  fiatAmount,
  fiatCurrency,
  fiatCurrencyLogoURI,
  cryptoAmount,
  tokenSymbol,
  tokenLogoURI,
  paymentDetails,
  paymentInstructions,
  paymentReference,
  onMarkAsPaid,
  onCancelOrder,
  isLoading = false,
  isBuyer,
  paymentDeadline,
  orderStatus,
}: OrderStepperProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const isPaymentSent = orderStatus === "payment_sent"
  const isCompleted = orderStatus === "completed"
  const isStep3Completed = isPaymentSent || isCompleted

  const steps = [
    {
      title: "Order Created",
      completed: true,
    },
    {
      title: "Transfer Details",
      completed: true,
    },
    {
      title: "Notify Seller",
      completed: isStep3Completed,
    },
  ]

  return (
    <div className="bg-card rounded-2xl border border-border p-8 space-y-8">
      {/* Header with Countdown */}
      <OrderHeader 
        paymentDeadline={paymentDeadline}
        isPaymentSent={isPaymentSent}
        isCompleted={isCompleted}
      />

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
            <div className={cn('w-0.5 flex-1 transition-colors', 'bg-primary')} />
          </div>

          {/* Step 3 Indicator */}
          <div className="flex flex-col items-center h-[100px]">
            <div
              className={cn(
                'w-[25px] h-[25px] rotate-45 rounded-sm flex items-center justify-center transition-colors',
                isStep3Completed 
                  ? 'bg-primary' 
                  : 'bg-[#41FDFE1A] border border-[#FFFFFF08]'
              )}
            >
              <div className="-rotate-45">
                {isStep3Completed ? (
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
          </div>

          {/* Step 2: Transfer Details */}
          <div className="space-y-4 flex-1">
            <h3 className="text-lg font-semibold">{steps[1].title}</h3>
            
            <div className="space-y-3 bg-background/50 rounded-lg p-4">
              {/* Order Number */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-left">
                  <span className="text-sm text-muted-foreground">Order Number</span>
                  <button
                    onClick={() => copyToClipboard(orderId, 'Order Number')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-sm font-mono text-right">
                  {orderId ? orderId.slice(0, 20) + '...' : 'Loading...'}
                </span>
              </div>

              {/* Amount To Pay (Fiat) */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-left">
                  <span className="text-sm text-muted-foreground">Amount To Pay</span>
                  <button
                    onClick={() => copyToClipboard(`${fiatAmount} ${fiatCurrency}`, 'Amount')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {fiatCurrencyLogoURI && (
                    <Image 
                      src={fiatCurrencyLogoURI} 
                      alt={fiatCurrency}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm font-mono text-right font-semibold">
                    {fiatAmount} {fiatCurrency}
                  </span>
                </div>
              </div>

              {/* Crypto Amount You'll Receive */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">You&apos;ll Receive</span>
                <div className="flex items-center gap-2">
                  {tokenLogoURI && (
                    <Image 
                      src={tokenLogoURI} 
                      alt={tokenSymbol}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm font-mono text-right">
                    {cryptoAmount} {tokenSymbol}
                  </span>
                </div>
              </div>

              {/* Payment Reference */}
              {paymentReference && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-sm text-muted-foreground">Payment Reference</span>
                    <button
                      onClick={() => copyToClipboard(paymentReference, 'Payment Reference')}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-mono text-right">
                    {paymentReference}
                  </span>
                </div>
              )}

              {/* Payment Details */}
              {paymentDetails ? (
                <>
                  {/* Payment Details (plain text) */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Payment Details</span>
                      <button
                        onClick={() => copyToClipboard(paymentDetails.details, 'Payment Details')}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-sm font-mono text-left whitespace-pre-wrap bg-background rounded p-2">
                      {paymentDetails.details}
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  {paymentInstructions && (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-muted-foreground">Payment Instructions</span>
                      <div className="text-sm text-left whitespace-pre-wrap bg-amber-500/10 border border-amber-500/20 rounded p-2">
                        {paymentInstructions}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Payment details will be provided by the seller in the chat
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Action Buttons */}
          <div className="space-y-4 h-[100px]">
            <h3 className="text-lg font-semibold">{steps[2].title}</h3>
            
            {isCompleted ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-primary font-medium">
                  ✓ Payment confirmed and crypto released
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                {isBuyer && (
                  <Button
                    onClick={onMarkAsPaid}
                    disabled={isLoading || isStep3Completed}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  >
                    {isStep3Completed ? "Payment Sent" : "Mark as Paid"}
                  </Button>
                )}
                <Button
                  onClick={onCancelOrder}
                  disabled={isLoading || isCompleted}
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  Cancel Order
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Sent Notification - Only show for buyer when payment is marked as sent */}
      {isBuyer && orderStatus === "payment_sent" && (
        <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-primary mb-1">
              Waiting for Seller Confirmation
            </h4>
            <p className="text-sm text-muted-foreground">
              Your payment has been marked as sent. The seller will review and confirm receipt of the payment. 
              Once confirmed, the crypto will be released to your wallet and the order will be completed.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
