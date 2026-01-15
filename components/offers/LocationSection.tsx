"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { COUNTRIES } from "@/lib/countries"

interface LocationSectionProps {
  isGlobal: boolean
  allowedCountries: string[]
  onGlobalChange: (value: boolean) => void
  onCountriesChange: (value: string[]) => void
}

export function LocationSection({
  isGlobal,
  allowedCountries,
  onGlobalChange,
  onCountriesChange,
}: LocationSectionProps) {
  return (
    <div className="space-y-3 bg-[#FFFFFF03] rounded-xl p-4">
      <Label className="text-base">Location</Label>
      <Select value={isGlobal ? "global" : "specific"} onValueChange={(value) => onGlobalChange(value === "global")}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="global">Global</SelectItem>
          <SelectItem value="specific">Specific countries</SelectItem>
        </SelectContent>
      </Select>

      {/* Show country selector when Specific countries is selected */}
      {!isGlobal && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Select countries</Label>
          <MultiSelect
            options={COUNTRIES}
            defaultValue={allowedCountries}
            onValueChange={onCountriesChange}
            placeholder="Select countries..."
            maxCount={3}
            className="w-full bg-[#FFFFFF08] border-input data-[placeholder]:text-muted-foreground text-sm min-h-9 shadow-xs"
            popoverClassName="w-[300px]"
          />
          {allowedCountries.length === 0 && (
            <p className="text-xs text-muted-foreground">Select at least one country</p>
          )}
        </div>
      )}
    </div>
  )
}
