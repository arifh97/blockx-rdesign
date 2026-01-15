"use client"

import { useState } from 'react'
import { sendChatMessageAction } from '@/app/actions/chat-messages'
import type { ChatMessage } from '@/db/schema/chat-messages'

interface UseSendChatMessageOptions {
  orderId: string
  onSuccess?: (message: ChatMessage) => void
  onError?: (error: string) => void
}

export function useSendChatMessage({ orderId, onSuccess, onError }: UseSendChatMessageOptions) {
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (content: string, attachmentUrl?: string) => {
    if (!content.trim() && !attachmentUrl) {
      onError?.('Message cannot be empty')
      return { success: false, error: 'Message cannot be empty' }
    }

    setIsLoading(true)

    try {
      const result = await sendChatMessageAction({
        orderId,
        content: content.trim(),
        attachmentUrl,
      })

      if (result.success && result.message) {
        onSuccess?.(result.message)
        return { success: true, message: result.message }
      } else {
        onError?.(result.error || 'Failed to send message')
        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      onError?.(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendMessage,
    isLoading,
  }
}
