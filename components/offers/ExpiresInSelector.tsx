"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ExpiresInSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function ExpiresInSelector({ value, onChange }: ExpiresInSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Value is in seconds, convert to minutes for display
  const valueInSeconds = parseInt(value) || 1800
  const valueInMinutes = Math.floor(valueInSeconds / 60)
  
  // Handle input change - convert minutes back to seconds
  const handleMinutesChange = (minutes: string) => {
    const minutesNum = parseInt(minutes) || 0
    // Minimum 1 minute, maximum 24 hours (1440 minutes)
    const clampedMinutes = Math.max(1, Math.min(1440, minutesNum))
    const seconds = clampedMinutes * 60
    onChange(seconds.toString())
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-start justify-between w-full text-left">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white">Payment time limit</h3>
            {!isOpen && (
              <p className="text-muted-foreground mt-1">{valueInMinutes} mins</p>
            )}
          </div>
          <div className="ml-4">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          The period during which the Seller must receive the payment from the Buyer. When the time runs out, a dispute can be opened.
        </p>
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={valueInMinutes}
            onChange={(e) => handleMinutesChange(e.target.value)}
            className="w-24 bg-[#FFFFFF08] border-0 text-white"
            min="1"
            max="1440"
          />
          <span className="text-muted-foreground">mins</span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
