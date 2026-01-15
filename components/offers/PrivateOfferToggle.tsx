"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface PrivateOfferToggleProps {
  isPrivate: boolean
  onPrivateChange: (value: boolean) => void
}

export function PrivateOfferToggle({ isPrivate, onPrivateChange }: PrivateOfferToggleProps) {
  return (
    <div className="space-y-3 bg-[#FFFFFF03] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Private offer</Label>
        <Switch checked={isPrivate} onCheckedChange={onPrivateChange} />
      </div>
      <div className="flex gap-2 text-sm text-muted-foreground">
        <div className="w-4 h-4 rounded-full border border-muted-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
          i
        </div>
        <p>Your offer will only be accessible via the link and won&apos;t appear in the public offer list.</p>
      </div>
    </div>
  )
}
