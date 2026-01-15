"use client"

import { type Address } from "viem"
import { Plus } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DepositDialog } from "@/components/shared/DepositDialog"
import type { Token } from "@/lib/tokens"

interface AmountInputProps {
  minAmount: string
  maxAmount: string
  onMinAmountChange: (value: string) => void
  onMaxAmountChange: (value: string) => void
  availableBalance?: string
  tokenSymbol: string
  minError?: string
  maxError?: string
  tokens?: Token[]
  defaultToken?: Address
}

export function AmountInput({
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
  availableBalance,
  tokenSymbol,
  minError,
  maxError,
  tokens,
  defaultToken,
}: AmountInputProps) {
  const showDepositButton = availableBalance !== undefined && Number(availableBalance) === 0 && tokens && tokens.length > 0
  return (
    <div className="space-y-3 bg-[#FFFFFF03] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Amount</Label>
      </div>

      <div className="rounded-xl space-y-3">
        {/* From/To Inputs in one line */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              id="minAmount"
              type="number"
              step="0.01"
              placeholder="From"
              value={minAmount}
              onChange={(e) => onMinAmountChange(e.target.value)}
              className="h-15 border-0 bg-[#FFFFFF08] text-base"
            />
            {minError && <p className="text-xs text-destructive mt-1">{minError}</p>}
          </div>

          <span className="text-muted-foreground text-lg">—</span>

          <div className="flex-1">
            <Input
              id="maxAmount"
              type="number"
              step="0.01"
              placeholder="To"
              value={maxAmount}
              onChange={(e) => onMaxAmountChange(e.target.value)}
              className="h-15 border-0 bg-[#FFFFFF08] text-base"
            />
            {maxError && <p className="text-xs text-destructive mt-1">{maxError}</p>}
          </div>
        </div>

        {/* Balance Available - Only show for sell offers */}
        {availableBalance !== undefined && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Balance available: {availableBalance} {tokenSymbol}
            </p>
            {showDepositButton && (
              <DepositDialog tokens={tokens!} defaultToken={defaultToken}>
                <button
                  type="button"
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </DepositDialog>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
