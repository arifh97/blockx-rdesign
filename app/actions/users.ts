'use server';

import { getOrCreateUser, getUserByWallet, getUserByPrivyId } from '@/db/queries/users';
import { verifyAuthentication } from '@/lib/auth';
import { type Address } from 'viem';

/**
 * Get or create a user in the database after successful authentication
 * This action verifies the user is authenticated via Privy and syncs their wallet
 * @param walletAddress - The wallet address from Privy (verified on client)
 * @param email - Optional email from Privy user data
 */
export async function syncUserAfterLogin(
  walletAddress: string,
  email?: string
) {
  try {
    // First, verify the user is authenticated via Privy and get their Privy ID
    const privyId = await verifyAuthentication();

    // Normalize wallet address to lowercase for consistency
    const normalizedAddress = walletAddress.toLowerCase();

    // Get existing user or create new one
    const user = await getOrCreateUser(privyId, normalizedAddress);

    // If user exists but email is missing and we have one from Privy, update it
    if (user && email && !user.email) {
      const { updateUserProfile } = await import('@/db/queries/users');
      await updateUserProfile(user.id, { email });
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Error syncing user after login:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync user',
    };
  }
}

/**
 * Get the current authenticated user
 * @returns The current user's data from the database
 */
export async function getCurrentUser() {
  try {
    // Verify authentication and get Privy ID
    const privyId = await verifyAuthentication();

    // Get user from database by Privy ID
    const user = await getUserByPrivyId(privyId);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get current user',
    };
  }
}

/**
 * Get or create a user by wallet address
 * Used when creating orders - we need to ensure both maker and taker exist in the database
 * @param walletAddress - The wallet address to look up or create
 */
export async function getOrCreateUserAction(walletAddress: Address) {
  try {
    // Verify authentication
    const privyId = await verifyAuthentication();

    // Normalize wallet address to lowercase for consistency
    const normalizedAddress = walletAddress.toLowerCase();

    // Try to get existing user by wallet address
    const existingUser = await getUserByWallet(normalizedAddress);
    
    if (existingUser) {
      return {
        success: true,
        user: existingUser,
      };
    }

    // If user doesn't exist, create with the authenticated user's privyId
    const newUser = await getOrCreateUser(privyId, normalizedAddress);

    return {
      success: true,
      user: newUser,
    };
  } catch (error) {
    console.error('Error getting/creating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get/create user',
    };
  }
}
