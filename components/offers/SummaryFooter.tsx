"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PAYMENT_METHODS } from "@/lib/constants"

interface PaymentAccount {
  id: string
  paymentMethod: string
}

interface SummaryFooterProps {
  bidType: "buy" | "sell"
  price: string
  fiatCurrency: string
  minAmount: string
  maxAmount: string
  tokenSymbol: string
  paymentMethods: string[]
  savedPaymentMethods: PaymentAccount[]
  canSubmit: boolean
  isSubmitting: boolean
  isConnected: boolean
  onCancel: () => void
  onSubmit: () => void
}

export function SummaryFooter({
  bidType,
  price,
  fiatCurrency,
  minAmount,
  maxAmount,
  tokenSymbol,
  paymentMethods,
  savedPaymentMethods,
  canSubmit,
  isSubmitting,
  isConnected,
  onCancel,
  onSubmit,
}: SummaryFooterProps) {
  // Handle payment labels based on bid type
  const paymentLabels = paymentMethods
    ?.map((methodId) => {
      if (bidType === "sell") {
        // For sell bids: methodId is a payment account ID
        const account = savedPaymentMethods.find((pm) => pm.id === methodId)
        if (account) {
          const methodInfo = PAYMENT_METHODS[account.paymentMethod as keyof typeof PAYMENT_METHODS]
          return methodInfo?.name
        }
      } else {
        // For buy bids: methodId is a payment method type (e.g., "paypal", "revolut")
        const methodInfo = PAYMENT_METHODS[methodId as keyof typeof PAYMENT_METHODS]
        return methodInfo?.name
      }
      return null
    })
    .filter(Boolean)

  return (
    <div className="mt-auto pt-6">
      <div
        className="pt-4 border-t"
        style={{
          borderImageSource:
            "linear-gradient(90deg, rgba(219, 236, 253, 0) 0%, rgba(219, 236, 253, 0.2) 49.67%, rgba(219, 236, 253, 0) 100%)",
          borderImageSlice: 1,
        }}
      >
        {/* Price and Amount Summary */}
        <div className="space-y-2 mb-4">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Price:</span>
            <span className="text-sm font-medium">
              {price || "0"} {fiatCurrency || "USD"} / {tokenSymbol || "Token"}
            </span>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Amount:</span>
            <span className="text-sm font-medium">
              {minAmount || "0"} - {maxAmount || "0"} {tokenSymbol || "Token"}
            </span>
          </div>

          {/* Payment Methods */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Payment:</span>
            <div className="flex flex-wrap gap-2">
              {paymentLabels.length > 0 ? (
                paymentLabels.map((label, index) => (
                  <Badge key={index} className="text-sm font-medium">
                    {label}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-[56px] flex-1 rounded-[100px]"
            size="lg"
            onClick={onCancel}
          >
            Cancel changes
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            className="min-h-[56px] flex-1 bg-primary hover:bg-primary/90 rounded-[100px]"
            size="lg"
            disabled={!isConnected || !canSubmit || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create offer"}
          </Button>
        </div>
      </div>
    </div>
  )
}
