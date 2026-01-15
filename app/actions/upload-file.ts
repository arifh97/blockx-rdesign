"use server"

import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyOrderAccess } from '@/lib/order-security'
import { validateFile, generateFilePath } from '@/lib/file-utils'

const STORAGE_BUCKET = 'chat-attachments'

export interface UploadFileResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage for chat attachments
 * Security: Verifies user has access to the order via Privy auth
 */
export async function uploadChatFileAction(
  orderId: string,
  formData: FormData
): Promise<UploadFileResult> {
  try {
    // Verify user has access to this order (uses Privy auth internally)
    await verifyOrderAccess(orderId)

    // Extract file from FormData
    const file = formData.get('file') as File
    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      }
    }

    // Validate file (type and size)
    const validation = validateFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    // Generate unique file path
    const filePath = generateFilePath(orderId, file.name)

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return {
        success: false,
        error: 'Failed to upload file. Please try again.',
      }
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    }
  }
}

/**
 * Delete a file from Supabase Storage
 * Security: Verifies user has access to the order
 */
export async function deleteChatFileAction(
  orderId: string,
  fileUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify user has access to this order
    await verifyOrderAccess(orderId)

    // Extract file path from URL
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split(`/${STORAGE_BUCKET}/`)
    if (pathParts.length < 2) {
      return {
        success: false,
        error: 'Invalid file URL',
      }
    }
    const filePath = pathParts[1]

    // Verify the file belongs to this order
    if (!filePath.startsWith(orderId)) {
      return {
        success: false,
        error: 'Unauthorized: File does not belong to this order',
      }
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (deleteError) {
      console.error('Supabase delete error:', deleteError)
      return {
        success: false,
        error: 'Failed to delete file',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file',
    }
  }
}
