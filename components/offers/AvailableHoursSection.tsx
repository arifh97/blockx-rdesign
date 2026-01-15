"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AvailableHoursSectionProps {
  availableHoursStart: string
  availableHoursEnd: string
  is24HourAccess: boolean
  isWorkdaysOnly: boolean
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  on24HourChange: (value: boolean) => void
  onWorkdaysChange: (value: boolean) => void
  endError?: string
}

export function AvailableHoursSection({
  availableHoursStart,
  availableHoursEnd,
  is24HourAccess,
  isWorkdaysOnly,
  onStartChange,
  onEndChange,
  on24HourChange,
  onWorkdaysChange,
  endError,
}: AvailableHoursSectionProps) {
  return (
    <div className="space-y-3 bg-[#FFFFFF03] rounded-xl p-4">
      <Label className="text-base">Available hours</Label>

      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Select value={availableHoursStart} onValueChange={onStartChange} disabled={is24HourAccess}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, "0")
                return (
                  <SelectItem key={hour} value={`${hour}:00`}>
                    {hour}:00
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <span className="text-muted-foreground">—</span>

        <div className="flex-1">
          <div className="space-y-1">
            <Select value={availableHoursEnd} onValueChange={onEndChange} disabled={is24HourAccess}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, "0")
                  return (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {endError && <p className="text-xs text-destructive">{endError}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox id="24hour" checked={is24HourAccess} onCheckedChange={(checked) => on24HourChange(checked === true)} />
        <Label htmlFor="24hour" className="text-sm font-normal cursor-pointer">
          24-hour access
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="workdays" checked={isWorkdaysOnly} onCheckedChange={(checked) => onWorkdaysChange(checked === true)} />
        <Label htmlFor="workdays" className="text-sm font-normal cursor-pointer">
          Workdays only
        </Label>
      </div>
    </div>
  )
}
