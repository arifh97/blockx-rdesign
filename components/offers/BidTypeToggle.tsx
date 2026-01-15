"use client"

import { Button } from "@/components/ui/button"

interface BidTypeToggleProps {
  value: "buy" | "sell"
  onChange: (value: "buy" | "sell") => void
  onPaymentMethodsReset: () => void
}

export function BidTypeToggle({ value, onChange, onPaymentMethodsReset }: BidTypeToggleProps) {
  const handleChange = (newValue: "buy" | "sell") => {
    onChange(newValue)
    onPaymentMethodsReset()
  }

  return (
    <div
      className="flex items-center mb-6 p-1.5 border-b"
      style={{
        borderImageSource:
          "linear-gradient(90deg, rgba(219, 236, 253, 0) 0%, rgba(219, 236, 253, 0.2) 49.67%, rgba(219, 236, 253, 0) 100%)",
        borderImageSlice: 1,
      }}
    >
      <Button
        type="button"
        onClick={() => handleChange("buy")}
        className={`flex-1 h-14 text-2xl font-medium rounded-lg transition-all ${
          value === "buy" ? "bg-transparent text-white" : "bg-transparent text-muted-foreground hover:bg-transparent"
        }`}
      >
        Buy Crypto
      </Button>
      <Button
        type="button"
        onClick={() => handleChange("sell")}
        className={`flex-1 h-14 text-2xl font-medium rounded-lg transition-all ${
          value === "sell" ? "bg-transparent text-white" : "bg-transparent text-muted-foreground hover:bg-transparent"
        }`}
      >
        Sell Crypto
      </Button>
    </div>
  )
}
