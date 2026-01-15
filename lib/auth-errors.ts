// Auth error codes - these are checked by the client to trigger token refresh
// Kept in a separate file since "use server" files can only export async functions
export const AUTH_ERROR_CODES = {
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  INVALID_TOKEN: "INVALID_TOKEN",
} as const

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES]

// Check if an error message indicates an auth error that should trigger token refresh
export function isAuthError(error: string | undefined): boolean {
  if (!error) return false
  return (
    error === AUTH_ERROR_CODES.NOT_AUTHENTICATED ||
    error === AUTH_ERROR_CODES.INVALID_TOKEN ||
    error.toLowerCase().includes("not authenticated") ||
    (error.toLowerCase().includes("invalid") && error.toLowerCase().includes("token"))
  )
}
