/**
 * File validation utilities for chat attachments
 */

export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
} as const

export const MAX_FILE_SIZE = {
  images: 5 * 1024 * 1024, // 5MB
  documents: 10 * 1024 * 1024, // 10MB
} as const

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.documents,
]

/**
 * Get the category of a file based on its MIME type
 */
export function getFileCategory(mimeType: string): 'images' | 'documents' | null {
  if ((ALLOWED_FILE_TYPES.images as readonly string[]).includes(mimeType)) return 'images'
  if ((ALLOWED_FILE_TYPES.documents as readonly string[]).includes(mimeType)) return 'documents'
  return null
}

/**
 * Validate a file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const category = getFileCategory(file.type)
  
  if (!category) {
    return {
      valid: false,
      error: 'File type not allowed. Please upload images, PDFs, or documents.',
    }
  }

  const maxSize = MAX_FILE_SIZE[category]
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size for ${category} is ${formatFileSize(maxSize)}.`,
    }
  }

  return { valid: true }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return (ALLOWED_FILE_TYPES.images as readonly string[]).includes(mimeType)
}

/**
 * Generate a unique file path for storage
 */
export function generateFilePath(orderId: string, fileName: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(7)
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  return `${orderId}/${timestamp}_${randomId}_${sanitizedName}`
}
