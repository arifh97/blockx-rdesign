"use client"

import { useCallback } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { isAuthError } from "@/lib/auth-errors"

// Re-export for convenience
export { isAuthError, AUTH_ERROR_CODES } from "@/lib/auth-errors"
export type { AuthErrorCode } from "@/lib/auth-errors"

/**
 * Hook for authenticated calls with automatic token refresh on auth error.
 * Refreshes token and retries once if auth fails.
 */
export function useRefreshOnAuthError() {
  const { getAccessToken, logout, authenticated } = usePrivy()
  const router = useRouter()

  const refreshAndRetry = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      try {
        return await fn()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        
        if (isAuthError(errorMessage)) {
          console.log("[Auth] Auth error detected, refreshing token...")
          
          try {
            const newToken = await getAccessToken()
            
            if (!newToken) {
              if (authenticated) await logout()
              router.push("/login")
              throw new Error("Session expired. Please log in again.")
            }
            
            // Retry the original function
            return await fn()
          } catch {
            if (authenticated) await logout()
            router.push("/login")
            throw new Error("Session expired. Please log in again.")
          }
        }
        
        throw error
      }
    },
    [getAccessToken, logout, authenticated, router]
  )

  return { refreshAndRetry }
}
