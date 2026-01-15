"use client"

import { Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RealtimeIndicatorProps {
  isConnected: boolean
  className?: string
  showLabel?: boolean
}

/**
 * Visual indicator for Supabase Realtime connection status
 * 
 * @example
 * <RealtimeIndicator isConnected={isConnected} showLabel />
 */
export function RealtimeIndicator({ 
  isConnected, 
  className,
  showLabel = false 
}: RealtimeIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isConnected ? (
        <>
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          {showLabel && (
            <span className="text-xs text-white flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Live updates
            </span>
          )}
        </>
      ) : (
        <>
          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
          {showLabel && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Connecting...
            </span>
          )}
        </>
      )}
    </div>
  )
}
