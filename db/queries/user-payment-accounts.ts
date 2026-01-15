import { db } from "@/db"
import { userPaymentAccounts, type NewUserPaymentAccount } from "@/db/schema/user-payment-accounts"
import { eq, and } from "drizzle-orm"

/**
 * Create a new user payment account
 */
export async function createUserPaymentAccount(data: NewUserPaymentAccount) {
  const [account] = await db
    .insert(userPaymentAccounts)
    .values(data)
    .returning()
  return account
}

/**
 * Get all active payment accounts for a user
 */
export async function getUserPaymentAccounts(userId: string) {
  return db
    .select()
    .from(userPaymentAccounts)
    .where(
      and(
        eq(userPaymentAccounts.userId, userId),
        eq(userPaymentAccounts.isActive, true)
      )
    )
    .orderBy(userPaymentAccounts.createdAt)
}

/**
 * Get a specific payment account by ID
 */
export async function getUserPaymentAccountById(id: string, userId: string) {
  const [account] = await db
    .select()
    .from(userPaymentAccounts)
    .where(
      and(
        eq(userPaymentAccounts.id, id),
        eq(userPaymentAccounts.userId, userId)
      )
    )
  return account
}

/**
 * Update a payment account
 */
export async function updateUserPaymentAccount(
  id: string,
  userId: string,
  data: Partial<NewUserPaymentAccount>
) {
  const [account] = await db
    .update(userPaymentAccounts)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(userPaymentAccounts.id, id),
        eq(userPaymentAccounts.userId, userId)
      )
    )
    .returning()
  return account
}

/**
 * Delete (soft delete) a payment account
 */
export async function deleteUserPaymentAccount(id: string, userId: string) {
  const [account] = await db
    .update(userPaymentAccounts)
    .set({ isActive: false, updatedAt: new Date() })
    .where(
      and(
        eq(userPaymentAccounts.id, id),
        eq(userPaymentAccounts.userId, userId)
      )
    )
    .returning()
  return account
}
