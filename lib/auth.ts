"use server"

import { PrivyClient } from "@privy-io/node"
import { cookies } from "next/headers"
import { getUserByPrivyId } from "@/db/queries/users"
import { AUTH_ERROR_CODES } from "./auth-errors"

const PRIVY_APP_ID = process.env.PRIVY_APP_ID!
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!

// Initialize Privy client
const privy = new PrivyClient({
  appId: PRIVY_APP_ID,
  appSecret: PRIVY_APP_SECRET,
})

/**
 * Verify user is authenticated via Privy token and return user ID
 * @throws Error with specific code if not authenticated or token is invalid/expired
 * 
 * Error codes:
 * - NOT_AUTHENTICATED: No token present (user never logged in or cookie cleared)
 * - INVALID_TOKEN: Token is invalid or expired (client should refresh via getAccessToken)
 */
export async function verifyAuthentication(): Promise<string> {
  const cookieStore = await cookies()
  const authToken = cookieStore.get("privy-token")?.value

  if (!authToken) {
    throw new Error(AUTH_ERROR_CODES.NOT_AUTHENTICATED)
  }

  try {
    // Verify the access token and get user claims
    const verifiedClaims = await privy.utils().auth().verifyAuthToken(authToken)
    return verifiedClaims.user_id
  } catch (error) {
    console.error("Auth verification failed:", error)
    // Token is invalid or expired - client should call getAccessToken() to refresh
    throw new Error(AUTH_ERROR_CODES.INVALID_TOKEN)
  }
}

/**
 * Get the authenticated user's wallet address
 * @throws Error if not authenticated or user has no wallet
 */
export async function getUserWalletAddress(): Promise<string> {
  const privyUserId = await verifyAuthentication()
  
  // Get user from database
  const user = await getUserByPrivyId(privyUserId)
  
  if (!user || !user.walletAddress) {
    throw new Error("User wallet address not found")
  }
  
  return user.walletAddress
}

/**
 * Get the Privy client instance
 */
export async function getPrivyClient() {
  return privy
}
