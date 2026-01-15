"use client"

import { Card } from "@/components/ui/card"
import { AvailableHoursSection } from "./AvailableHoursSection"
import { LocationSection } from "./LocationSection"
import { PrivateOfferToggle } from "./PrivateOfferToggle"
import { ExpiresInSelector } from "./ExpiresInSelector"
import { SummaryFooter } from "./SummaryFooter"

interface PaymentAccount {
  id: string
  paymentMethod: string
}

interface OfferSummaryPanelProps {
  // Bid type
  bidType: "buy" | "sell"
  
  // Available hours
  availableHoursStart: string
  availableHoursEnd: string
  is24HourAccess: boolean
  isWorkdaysOnly: boolean
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  on24HourChange: (value: boolean) => void
  onWorkdaysChange: (value: boolean) => void
  endError?: string
  
  // Location
  isGlobal: boolean
  allowedCountries: string[]
  onGlobalChange: (value: boolean) => void
  onCountriesChange: (value: string[]) => void
  
  // Private offer
  isPrivate: boolean
  onPrivateChange: (value: boolean) => void
  
  // Expires in
  expiresIn: string
  onExpiresInChange: (value: string) => void
  
  // Summary footer
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

export function OfferSummaryPanel({
  bidType,
  availableHoursStart,
  availableHoursEnd,
  is24HourAccess,
  isWorkdaysOnly,
  onStartChange,
  onEndChange,
  on24HourChange,
  onWorkdaysChange,
  endError,
  isGlobal,
  allowedCountries,
  onGlobalChange,
  onCountriesChange,
  isPrivate,
  onPrivateChange,
  expiresIn,
  onExpiresInChange,
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
}: OfferSummaryPanelProps) {
  return (
    <Card className="flex-[3] p-6 bg-card/70 rounded-3xl border-0 flex flex-col">
      <div className="space-y-6 flex-1">
        <h3 className="text-xl font-semibold">Summary</h3>

        <AvailableHoursSection
          availableHoursStart={availableHoursStart}
          availableHoursEnd={availableHoursEnd}
          is24HourAccess={is24HourAccess}
          isWorkdaysOnly={isWorkdaysOnly}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
          on24HourChange={on24HourChange}
          onWorkdaysChange={onWorkdaysChange}
          endError={endError}
        />

        <LocationSection
          isGlobal={isGlobal}
          allowedCountries={allowedCountries}
          onGlobalChange={onGlobalChange}
          onCountriesChange={onCountriesChange}
        />

        <PrivateOfferToggle isPrivate={isPrivate} onPrivateChange={onPrivateChange} />

        <ExpiresInSelector value={expiresIn} onChange={onExpiresInChange} />
      </div>

      <SummaryFooter
        bidType={bidType}
        price={price}
        fiatCurrency={fiatCurrency}
        minAmount={minAmount}
        maxAmount={maxAmount}
        tokenSymbol={tokenSymbol}
        paymentMethods={paymentMethods}
        savedPaymentMethods={savedPaymentMethods}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        isConnected={isConnected}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </Card>
  )
}
