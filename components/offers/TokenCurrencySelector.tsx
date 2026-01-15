"use client"

import Image from "next/image"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FIAT_CURRENCIES } from "@/lib/constants"

interface Token {
  address: string
  symbol: string
  logoURI?: string
  isNative?: boolean
}

interface TokenCurrencySelectorProps {
  bidType: "buy" | "sell"
  tokens: Token[]
  selectedToken: string
  selectedCurrency: string
  onTokenChange: (value: string) => void
  onCurrencyChange: (value: string) => void
  error?: string
}

export function TokenCurrencySelector({
  bidType,
  tokens,
  selectedToken,
  selectedCurrency,
  onTokenChange,
  onCurrencyChange,
  error,
}: TokenCurrencySelectorProps) {
  const token = tokens.find((t) => t.address === selectedToken)
  const currency = FIAT_CURRENCIES.find((c) => c.code === selectedCurrency)

  return (
    <div className="grid grid-cols-2 gap-4 bg-[#FFFFFF08] rounded-xl p-4">
      {/* Token Selection */}
      <div className="space-y-2">
        <Label htmlFor="from-token" className="text-sm text-muted-foreground">
          {bidType === "sell" ? "I want to sell" : "I want to buy"}
        </Label>
        <Select value={selectedToken} onValueChange={onTokenChange}>
          <SelectTrigger id="from-token" className="min-h-15 border-0 w-full">
            <SelectValue placeholder="Select token">
              {selectedToken && token?.logoURI && (
                <div className="flex items-center gap-2">
                  <Image src={token.logoURI} alt={token.symbol} width={24} height={24} className="rounded-full" />
                  <span>{token.symbol}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tokens
              .filter((t) => !t.isNative)
              .map((token) => (
                <SelectItem key={token.address} value={token.address}>
                  <div className="flex items-center gap-2">
                    {token.logoURI && (
                      <Image src={token.logoURI} alt={token.symbol} width={24} height={24} className="rounded-full" />
                    )}
                    <span>{token.symbol}</span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {/* Fiat Currency */}
      <div className="space-y-2">
        <Label htmlFor="fiat-currency" className="text-sm text-muted-foreground">
          For
        </Label>
        <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
          <SelectTrigger id="fiat-currency" className="min-h-15 border-0 w-full">
            <SelectValue placeholder="Select currency">
              {selectedCurrency && currency && (
                <div className="flex items-center gap-2">
                  <Image
                    src={currency.logoURI}
                    alt={currency.code}
                    width={24}
                    height={24}
                    className="rounded-full bg-white"
                  />
                  <span>{currency.code}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FIAT_CURRENCIES.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                <div className="flex items-center gap-2">
                  <Image
                    src={currency.logoURI}
                    alt={currency.code}
                    width={24}
                    height={24}
                    className="rounded-full bg-white"
                  />
                  <span>{currency.code}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
