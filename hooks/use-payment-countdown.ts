import { useEffect, useState } from 'react'

interface CountdownTime {
  minutes: number
  seconds: number
  isExpired: boolean
  formatted: string
}

/**
 * Custom hook for payment deadline countdown
 * @param deadline - Payment deadline as bigint timestamp in milliseconds
 * @returns Countdown time object with minutes, seconds, and formatted string
 */
export function usePaymentCountdown(deadline?: bigint): CountdownTime {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>(() => 
    calculateTimeLeft(deadline)
  )

  useEffect(() => {
    if (!deadline) {
      return
    }

    // Update immediately
    setTimeLeft(calculateTimeLeft(deadline))

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline))
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  return timeLeft
}

function calculateTimeLeft(deadline?: bigint): CountdownTime {
  if (!deadline) {
    return {
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: '00:00',
    }
  }

  const now = Date.now()
  const deadlineNum = Number(deadline)
  
  // Check if deadline is in seconds (Unix timestamp) or milliseconds
  // If the number is less than a reasonable year 2000 timestamp in ms, it's likely in seconds
  const deadlineMs = deadlineNum < 10000000000 ? deadlineNum * 1000 : deadlineNum
  
  const diff = deadlineMs - now

  if (diff <= 0) {
    return {
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: '00:00',
    }
  }

  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return {
    minutes,
    seconds,
    isExpired: false,
    formatted: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  }
}
