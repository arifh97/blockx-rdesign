"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface OfferDescriptionInputProps {
  value: string
  onChange: (value: string) => void
}

export function OfferDescriptionInput({ value, onChange }: OfferDescriptionInputProps) {
  return (
    <div className="space-y-3 bg-[#FFFFFF03] rounded-xl p-4">
      <Label className="text-base">Offer Description</Label>

      <div className="space-y-2">
        <Textarea
          id="description"
          placeholder="Add any additional details about your offer (optional)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[100px] border border-border bg-[#07101799] text-base resize-none"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Optional: Add payment instructions, trading hours, or any other relevant information
        </p>
      </div>
    </div>
  )
}
