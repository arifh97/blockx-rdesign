"use client"

import { useAccount, useChainId } from "wagmi"
import { useForm, useStore } from "@tanstack/react-form"
import { type Address } from "viem"
import { Card } from "@/components/ui/card"
import { getTokensByChain } from "@/lib/tokens"
import { useCreateBid, type BidFormValues } from "@/hooks/use-create-bid"
import { PaymentMethodTypeSelector } from "@/components/payment/PaymentMethodTypeSelector"
import { BidTypeToggle } from "./BidTypeToggle"
import { TokenCurrencySelector } from "./TokenCurrencySelector"
import { AmountInput } from "./AmountInput"
import { PriceInput } from "./PriceInput"
import { OfferDescriptionInput } from "./OfferDescriptionInput"
import { OfferSummaryPanel } from "./OfferSummaryPanel"
import { ChainSelector } from "./ChainSelector"

interface CreateBuyOfferFormProps {
  onSuccess?: () => void
  onBidTypeChange?: (bidType: "sell" | "buy") => void
}

export function CreateBuyOfferForm({ onSuccess, onBidTypeChange }: CreateBuyOfferFormProps = {}) {
  const { address } = useAccount()
  const chainId = useChainId()
  const tokens = getTokensByChain(chainId)
  const { createBid, isLoading } = useCreateBid()

  // Initialize form with TanStack Form
  const form = useForm({
    defaultValues: {
      bidType: "buy" as const,
      fromToken: (tokens[1]?.address as Address) || ("" as Address),
      toToken: "0x0000000000000000000000000000000000000000" as Address,
      price: "",
      minAmount: "",
      maxAmount: "",
      kycLevel: "0",
      expiresIn: "1800", // 30 minutes
      fiatCurrency: "USD",
      paymentMethods: [] as string[],
      description: "",
      availableHoursStart: "00:00",
      availableHoursEnd: "00:00",
      is24HourAccess: true,
      isWorkdaysOnly: false,
      timezone: "UTC",
      isGlobal: true,
      allowedCountries: [] as string[],
      isPrivate: false,
      chainIds: [] as number[],
      paymentWindow: "1800", // 30 minutes default
    } as BidFormValues,
    onSubmit: async ({ value }) => {
      const result = await createBid(value)

      if (!result.error) {
        // Reset form on success
        form.reset()
        // Call success callback if provided
        onSuccess?.()
      }
    },
  })

  // Get current form values
  const fromTokenValue = useStore(form.store, (state) => state.values.fromToken)
  const fiatCurrencyValue = useStore(form.store, (state) => state.values.fiatCurrency)
  const priceValue = useStore(form.store, (state) => state.values.price)
  const minAmountValue = useStore(form.store, (state) => state.values.minAmount)
  const maxAmountValue = useStore(form.store, (state) => state.values.maxAmount)
  const paymentMethodsValue = useStore(form.store, (state) => state.values.paymentMethods)

  const selectedToken = tokens.find((t) => t.address === fromTokenValue)

  // Validation helpers
  const validateTimeRange = (start: string, end: string) => {
    if (!start || !end) return undefined
    const startHour = parseInt(start.split(":")[0])
    const endHour = parseInt(end.split(":")[0])
    if (endHour <= startHour) {
      return "End time must be after start time"
    }
    return undefined
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Left Column - Form (70%) */}
      <Card className="flex-[7] p-6 rounded-3xl border-0" style={{ backgroundImage: "url(/card-bg.png)", backgroundSize: "100% 100%" }}>
        {/* Buy/Sell Toggle */}
        {onBidTypeChange && (
          <BidTypeToggle
            value="buy"
            onChange={onBidTypeChange}
            onPaymentMethodsReset={() => {
              // Payment methods will be reset when switching forms
            }}
          />
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          {/* Token and Currency Selection */}
          <form.Field name="fromToken" validators={{ onChange: ({ value }) => (!value ? "Please select a token" : undefined) }}>
            {(field) => (
              <form.Subscribe selector={(state) => state.values.fiatCurrency}>
                {(fiatCurrency) => (
                  <form.Field name="fiatCurrency">
                    {(currencyField) => (
                      <TokenCurrencySelector
                        bidType="buy"
                        tokens={tokens}
                        selectedToken={field.state.value}
                        selectedCurrency={fiatCurrency}
                        onTokenChange={field.handleChange}
                        onCurrencyChange={currencyField.handleChange}
                        error={field.state.meta.errors?.[0]}
                      />
                    )}
                  </form.Field>
                )}
              </form.Subscribe>
            )}
          </form.Field>

          {/* Amount Input - No vault balance for buy offers */}
          <form.Field
            name="minAmount"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Minimum amount is required"
                if (isNaN(Number(value)) || Number(value) <= 0) return "Amount must be a positive number"
                return undefined
              },
            }}
          >
            {(minField) => (
              <form.Field
                name="maxAmount"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return "Maximum amount is required"
                    if (isNaN(Number(value)) || Number(value) <= 0) return "Amount must be a positive number"
                    const minAmount = form.getFieldValue("minAmount")
                    if (minAmount && Number(value) < Number(minAmount)) {
                      return "Max amount must be greater than or equal to min amount"
                    }
                    return undefined
                  },
                }}
              >
                {(maxField) => (
                  <AmountInput
                    minAmount={minField.state.value}
                    maxAmount={maxField.state.value}
                    onMinAmountChange={minField.handleChange}
                    onMaxAmountChange={maxField.handleChange}
                    tokenSymbol={selectedToken?.symbol || "USDT"}
                    minError={minField.state.meta.errors?.[0]}
                    maxError={maxField.state.meta.errors?.[0]}
                  />
                )}
              </form.Field>
            )}
          </form.Field>

          {/* Price Input */}
          <form.Field
            name="price"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Price is required"
                if (isNaN(Number(value)) || Number(value) <= 0) return "Price must be a positive number"
                return undefined
              },
            }}
          >
            {(field) => (
              <PriceInput
                price={field.state.value}
                onPriceChange={field.handleChange}
                tokenSymbol={selectedToken?.symbol || "Token"}
                fiatCurrency={fiatCurrencyValue}
                error={field.state.meta.errors?.[0]}
              />
            )}
          </form.Field>

          {/* Payment Method Types - Buy specific */}
          <form.Field name="paymentMethods">
            {(field) => (
              <PaymentMethodTypeSelector
                selectedPaymentMethodTypes={field.state.value}
                onPaymentMethodTypesChange={field.handleChange}
              />
            )}
          </form.Field>

          {/* Chain Selection - Buy offers only */}
          <form.Field
            name="chainIds"
            validators={{
              onChange: ({ value }) => {
                if (!value || value.length === 0) {
                  return "Please select at least one chain"
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <ChainSelector
                selectedChains={field.state.value}
                onChainsChange={field.handleChange}
                error={field.state.meta.errors?.[0]}
              />
            )}
          </form.Field>

          {/* Offer Description */}
          <form.Field name="description">
            {(field) => <OfferDescriptionInput value={field.state.value} onChange={field.handleChange} />}
          </form.Field>
        </form>
      </Card>

      {/* Right Column - Summary (30%) */}
      <form.Subscribe
        selector={(state) => [
          state.values.availableHoursStart,
          state.values.availableHoursEnd,
          state.values.is24HourAccess,
          state.values.isWorkdaysOnly,
          state.values.isGlobal,
          state.values.allowedCountries,
          state.values.isPrivate,
          state.values.expiresIn,
          state.canSubmit,
          state.isSubmitting,
        ]}
      >
        {([
          availableHoursStart,
          availableHoursEnd,
          is24HourAccess,
          isWorkdaysOnly,
          isGlobal,
          allowedCountries,
          isPrivate,
          expiresIn,
          canSubmit,
          isSubmitting,
        ]) => (
          <OfferSummaryPanel
            // Bid type
            bidType="buy"
            // Available hours
            availableHoursStart={availableHoursStart as string}
            availableHoursEnd={availableHoursEnd as string}
            is24HourAccess={is24HourAccess as boolean}
            isWorkdaysOnly={isWorkdaysOnly as boolean}
            onStartChange={(value) => form.setFieldValue("availableHoursStart", value)}
            onEndChange={(value) => form.setFieldValue("availableHoursEnd", value)}
            on24HourChange={(value) => form.setFieldValue("is24HourAccess", value)}
            onWorkdaysChange={(value) => form.setFieldValue("isWorkdaysOnly", value)}
            endError={!is24HourAccess ? validateTimeRange(availableHoursStart as string, availableHoursEnd as string) : undefined}
            // Location
            isGlobal={isGlobal as boolean}
            allowedCountries={allowedCountries as string[]}
            onGlobalChange={(value) => form.setFieldValue("isGlobal", value)}
            onCountriesChange={(value) => form.setFieldValue("allowedCountries", value)}
            // Private offer
            isPrivate={isPrivate as boolean}
            onPrivateChange={(value) => form.setFieldValue("isPrivate", value)}
            // Expires in
            expiresIn={expiresIn as string}
            onExpiresInChange={(value) => form.setFieldValue("expiresIn", value)}
            // Summary footer
            price={priceValue}
            fiatCurrency={fiatCurrencyValue}
            minAmount={minAmountValue}
            maxAmount={maxAmountValue}
            tokenSymbol={selectedToken?.symbol || "Token"}
            paymentMethods={paymentMethodsValue}
            savedPaymentMethods={[]}
            canSubmit={canSubmit as boolean}
            isSubmitting={(isSubmitting as boolean) || isLoading}
            isConnected={!!address}
            onCancel={() => form.reset()}
            onSubmit={() => form.handleSubmit()}
          />
        )}
      </form.Subscribe>
    </div>
  )
}
