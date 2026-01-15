"use client"

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { uploadChatFileAction } from '@/app/actions/upload-file'
import { validateFile } from '@/lib/file-utils'

interface UseFileUploadOptions {
  orderId: string
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

export function useFileUpload({ orderId, onSuccess, onError }: UseFileUploadOptions) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadChatFileAction(orderId, formData)

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Upload failed')
      }

      return result.url
    },
    onSuccess: (url) => {
      onSuccess?.(url)
      clearFile()
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      onError?.(errorMessage)
    },
  })

  const selectFile = useCallback((file: File) => {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      onError?.(validation.error || 'Invalid file')
      return false
    }

    setSelectedFile(file)

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }

    return true
  }, [onError])

  const clearFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
  }, [previewUrl])

  const uploadFile = useCallback(async (): Promise<string | null> => {
    if (!selectedFile) {
      onError?.('No file selected')
      return null
    }
    
    try {
      const url = await uploadMutation.mutateAsync(selectedFile)
      return url
    } catch {
      return null
    }
  }, [selectedFile, uploadMutation, onError])

  return {
    selectFile,
    clearFile,
    uploadFile,
    isUploading: uploadMutation.isPending,
    selectedFile,
    previewUrl,
  }
}
