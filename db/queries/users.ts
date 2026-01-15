import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get a user by their Privy ID
 */
export async function getUserByPrivyId(privyId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.privyId, privyId),
  });

  return user;
}

/**
 * Get a user by their wallet address
 */
export async function getUserByWallet(walletAddress: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.walletAddress, walletAddress),
  });

  return user;
}

/**
 * Get a user by their ID
 */
export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user;
}

/**
 * Create a new user
 */
export async function createUser(data: {
  privyId: string;
  walletAddress: string;
  email?: string;
  username?: string;
}) {
  const [user] = await db
    .insert(users)
    .values({
      privyId: data.privyId,
      walletAddress: data.walletAddress,
      email: data.email,
      username: data.username,
    })
    .returning();

  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    username?: string;
    bio?: string;
    avatarUrl?: string;
    email?: string;
  }
) {
  const [updatedUser] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updatedUser;
}

/**
 * Get or create a user by Privy ID and wallet address
 */
export async function getOrCreateUser(privyId: string, walletAddress: string) {
  let user = await getUserByPrivyId(privyId);

  if (!user) {
    await createUser({ privyId, walletAddress });
    // Fetch the newly created user
    user = await getUserByPrivyId(privyId);
  }

  return user;
}
