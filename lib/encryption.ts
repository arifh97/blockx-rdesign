import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"

// Ensure encryption key is set and valid
if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set")
}

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex")

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)")
}

/**
 * Encrypts a string using AES-256-GCM
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: iv:authTag:encrypted
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
  
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  
  const authTag = cipher.getAuthTag()
  
  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
}

/**
 * Decrypts a string that was encrypted with the encrypt function
 * @param encrypted - Encrypted string in format: iv:authTag:encrypted
 * @returns Decrypted plain text
 */
export function decrypt(encrypted: string): string {
  const parts = encrypted.split(":")
  
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format")
  }
  
  const [ivHex, authTagHex, encryptedData] = parts
  
  const iv = Buffer.from(ivHex, "hex")
  const authTag = Buffer.from(authTagHex, "hex")
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
  
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encryptedData, "hex", "utf8")
  decrypted += decipher.final("utf8")
  
  return decrypted
}

/**
 * Generates a random encryption key
 * Use this to generate a new key for the ENCRYPTION_KEY environment variable
 */
export function generateKey(): string {
  return crypto.randomBytes(32).toString("hex")
}
