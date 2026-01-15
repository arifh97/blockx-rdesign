"use client"

import { useState } from "react"
import { CreateSellOfferForm } from "./CreateSellOfferForm"
import { CreateBuyOfferForm } from "./CreateBuyOfferForm"

interface CreateBidFormProps {
  onSuccess?: () => void
}

export function CreateBidForm({ onSuccess }: CreateBidFormProps = {}) {
  const [bidType, setBidType] = useState<"sell" | "buy">("sell")

  const handleBidTypeChange = (newType: "sell" | "buy") => {
    setBidType(newType)
  }

  return (
    <>
      {/* Render appropriate form based on bid type */}
      {bidType === "sell" ? (
        <CreateSellOfferForm onSuccess={onSuccess} onBidTypeChange={handleBidTypeChange} />
      ) : (
        <CreateBuyOfferForm onSuccess={onSuccess} onBidTypeChange={handleBidTypeChange} />
      )}
    </>
  )
}
