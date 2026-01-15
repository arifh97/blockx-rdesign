"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase-client'
import type { ChatMessage } from '@/db/schema/chat-messages'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Transform snake_case database columns to camelCase for TypeScript
 * Supabase Realtime sends raw database column names (snake_case)
 * but our Drizzle types expect camelCase
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformRealtimeMessage(dbMessage: Record<string, any>): ChatMessage {
  return {
    id: dbMessage.id as string,
    orderId: dbMessage.order_id as string,
    senderAddress: dbMessage.sender_address as string,
    messageEncrypted: dbMessage.message_encrypted as string,
    attachmentUrl: dbMessage.attachment_url as string | null,
    createdAt: dbMessage.created_at ? new Date(dbMessage.created_at) : new Date(),
  }
}

interface UseRealtimeChatOptions {
  orderId: string
  initialMessages?: ChatMessage[]
  onNewMessage?: (message: ChatMessage) => void
}

/**
 * Hook to subscribe to realtime chat messages for a specific order
 * 
 * @example
 * const { messages, isConnected, sendMessage } = useRealtimeChat({
 *   orderId: 'order_123',
 *   initialMessages: serverMessages,
 *   onNewMessage: (message) => {
 *     console.log('New message:', message)
 *   }
 * })
 */
export function useRealtimeChat({ 
  orderId, 
  initialMessages = [],
  onNewMessage 
}: UseRealtimeChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Use ref to store callback to prevent subscription resets
  const onNewMessageRef = useRef(onNewMessage)
  
  // Update ref when callback changes
  useEffect(() => {
    onNewMessageRef.current = onNewMessage
  }, [onNewMessage])

  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        // Create a channel for this specific order's chat
        // Using public channel since we have RSC-level security
        channel = supabase
          .channel(`order:${orderId}:chat`, {
            config: { private: false }
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT', // Only listen to new messages
              schema: 'public',
              table: 'chat_messages',
              // We'll filter client-side since we need to join with orders table
            },
            async (payload) => {
              console.log('Chat message received:', payload)

              if (payload.eventType === 'INSERT' && payload.new) {
                // Transform snake_case database columns to camelCase
                const newMessage = transformRealtimeMessage(payload.new)
                
                console.log('Transformed message:', newMessage)
                
                // Only add if we have a valid message
                if (newMessage && newMessage.id) {
                  setMessages((prev) => {
                    // Get the order UUID from existing messages (if any)
                    const orderInternalId = prev.length > 0 ? prev[0].orderId : null
                    
                    console.log('Current order UUID:', orderInternalId, 'New message order UUID:', newMessage.orderId)
                    
                    // Filter: Only process messages for THIS order (if we have existing messages to compare)
                    if (orderInternalId && newMessage.orderId !== orderInternalId) {
                      console.log('❌ Message for different order, ignoring')
                      return prev
                    }
                    
                    // Check if message already exists
                    const exists = prev.some(msg => msg.id === newMessage.id)
                    if (exists) {
                      console.log('⚠️ Message already exists, skipping')
                      return prev
                    }
                    
                    console.log('✅ Adding new message to UI')
                    const updated = [...prev, newMessage]
                    onNewMessageRef.current?.(newMessage)
                    return updated
                  })
                } else {
                  console.warn('Received invalid message update:', payload.new)
                }
              }
            }
          )
          .subscribe((status) => {
            console.log('Realtime chat subscription status:', status)
            
            if (status === 'SUBSCRIBED') {
              setIsConnected(true)
              setError(null)
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false)
              setError(new Error('Failed to connect to chat channel'))
            } else if (status === 'TIMED_OUT') {
              setIsConnected(false)
              setError(new Error('Chat connection timed out'))
            }
          })
      } catch (err) {
        console.error('Error setting up chat subscription:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
    }

    setupSubscription()

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        console.log('Unsubscribing from chat channel:', orderId)
        supabase.removeChannel(channel)
      }
    }
  }, [orderId]) // Only depend on orderId, not onNewMessage

  // Helper to add optimistic message (before server confirmation)
  const addOptimisticMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message])
  }, [])

  // Helper to replace optimistic message with server version
  const replaceOptimisticMessage = useCallback((tempId: string, serverMessage: ChatMessage) => {
    setMessages((prev) => 
      prev.map(msg => msg.id === tempId ? serverMessage : msg)
    )
  }, [])

  return {
    messages,
    isConnected,
    error,
    addOptimisticMessage,
    replaceOptimisticMessage,
  }
}
