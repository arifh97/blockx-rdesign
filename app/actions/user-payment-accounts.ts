"use server"

import { verifyAuthentication } from "@/lib/auth"
import { getUserByPrivyId } from "@/db/queries/users"
import {
  createUserPaymentAccount,
  getUserPaymentAccounts,
  getUserPaymentAccountById,
  updateUserPaymentAccount,
  deleteUserPaymentAccount,
} from "@/db/queries/user-payment-accounts"
import type { NewUserPaymentAccount } from "@/db/schema/user-payment-accounts"

import { encrypt, decrypt } from "@/lib/encryption"

/**
 * Encrypts payment details as plain text using AES-256-GCM
 */
function encryptPaymentDetails(details: string): string {
  return encrypt(details)
}

/**
 * Decrypts payment details
 */
function decryptPaymentDetails(encrypted: string): string {
  return decrypt(encrypted)
}

interface CreatePaymentAccountInput {
  paymentMethod: string
  label: string
  paymentDetails: string  // Plain text instead of structured object
  currency?: string
  isDefault?: boolean
}

export async function createPaymentAccountAction(input: CreatePaymentAccountInput) {
  try {
    // Verify authentication
    const privyId = await verifyAuthentication()
    const user = await getUserByPrivyId(privyId)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Encrypt payment details
    const encryptedDetails = encryptPaymentDetails(input.paymentDetails)

    // Create payment account
    const accountData: NewUserPaymentAccount = {
      userId: user.id,
      paymentMethod: input.paymentMethod,
      label: input.label || undefined,
      paymentDetailsEncrypted: encryptedDetails,
      currency: input.currency,
      isDefault: input.isDefault || false,
      isVerified: false,
      isActive: true,
    }

    const account = await createUserPaymentAccount(accountData)

    return {
      success: true,
      data: {
        id: account.id,
        paymentMethod: account.paymentMethod,
        label: account.label,
        currency: account.currency,
        isDefault: account.isDefault,
      },
    }
  } catch (error) {
    console.error("Error creating payment account:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create payment account",
    }
  }
}

export async function getPaymentAccountsAction() {
  try {
    // Verify authentication
    const privyId = await verifyAuthentication()
    const user = await getUserByPrivyId(privyId)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const accounts = await getUserPaymentAccounts(user.id)

    // Return accounts without decrypting details (for listing purposes)
    return {
      success: true,
      data: accounts.map((account) => ({
        id: account.id,
        paymentMethod: account.paymentMethod,
        label: account.label,
        currency: account.currency,
        isDefault: account.isDefault,
        isVerified: account.isVerified,
        createdAt: account.createdAt,
      })),
    }
  } catch (error) {
    console.error("Error getting payment accounts:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get payment accounts",
    }
  }
}

export async function getPaymentAccountDetailsAction(accountId: string) {
  try {
    // Verify authentication
    const privyId = await verifyAuthentication()
    const user = await getUserByPrivyId(privyId)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const account = await getUserPaymentAccountById(accountId, user.id)

    if (!account) {
      return { success: false, error: "Payment account not found" }
    }

    // Decrypt payment details (plain text)
    const paymentDetails = decryptPaymentDetails(account.paymentDetailsEncrypted)

    return {
      success: true,
      data: {
        id: account.id,
        paymentMethod: account.paymentMethod,
        label: account.label,
        currency: account.currency,
        isDefault: account.isDefault,
        isVerified: account.isVerified,
        paymentDetails,  // Returns plain text string
      },
    }
  } catch (error) {
    console.error("Error getting payment account details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get payment account details",
    }
  }
}

export async function updatePaymentAccountAction(
  accountId: string,
  input: Partial<CreatePaymentAccountInput>
) {
  try {
    // Verify authentication
    const privyId = await verifyAuthentication()
    const user = await getUserByPrivyId(privyId)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const updateData: Partial<NewUserPaymentAccount> = {}

    if (input.label !== undefined) updateData.label = input.label
    if (input.currency !== undefined) updateData.currency = input.currency
    if (input.isDefault !== undefined) updateData.isDefault = input.isDefault
    if (input.paymentDetails) {
      updateData.paymentDetailsEncrypted = encryptPaymentDetails(input.paymentDetails)
    }

    const account = await updateUserPaymentAccount(accountId, user.id, updateData)

    if (!account) {
      return { success: false, error: "Payment account not found" }
    }

    return {
      success: true,
      data: {
        id: account.id,
        paymentMethod: account.paymentMethod,
        label: account.label,
        currency: account.currency,
        isDefault: account.isDefault,
      },
    }
  } catch (error) {
    console.error("Error updating payment account:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update payment account",
    }
  }
}

export async function deletePaymentAccountAction(accountId: string) {
  try {
    // Verify authentication
    const privyId = await verifyAuthentication()
    const user = await getUserByPrivyId(privyId)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    await deleteUserPaymentAccount(accountId, user.id)

    return { success: true }
  } catch (error) {
    console.error("Error deleting payment account:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete payment account",
    }
  }
}
