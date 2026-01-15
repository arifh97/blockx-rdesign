"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PriceInputProps {
  price: string
  onPriceChange: (value: string) => void
  tokenSymbol: string
  fiatCurrency: string
  error?: string
}

export function PriceInput({ price, onPriceChange, tokenSymbol, fiatCurrency, error }: PriceInputProps) {
  return (
    <div className="space-y-3 bg-[#FFFFFF03] rounded-xl p-4">
      <Label className="text-base">Price</Label>

      <div className="space-y-3">
        <Input
          id="price"
          type="number"
          step="0.01"
          placeholder="1.02"
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          className="h-15 border-0 bg-[#FFFFFF08] text-base"
        />
        <p className="text-sm text-muted-foreground">
          Exchange rate: 1 {tokenSymbol} = {price || "0"} {fiatCurrency}
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  )
}
