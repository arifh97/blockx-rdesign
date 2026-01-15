"use client"

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { Send, MoreVertical, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useRealtimeChat } from '@/hooks/use-realtime-chat'
import { useSendChatMessage } from '@/hooks/use-send-chat-message'
import { useFileUpload } from '@/hooks/use-file-upload'
import { toast } from 'sonner'
import type { ChatMessage } from '@/db/schema/chat-messages'
import { FilePreview, MessageAttachment } from '@/components/ui/file-preview'

interface OrderChatProps {
  orderId: string
  sellerName: string
  sellerInitials: string
  sellerAddress: string
  buyerAddress: string
  isOnline: boolean
  tradedCount?: number
  isBuyer: boolean
  currentUserAddress: string
  initialMessages?: ChatMessage[]
}

// ============= Sub-Components =============

interface ChatHeaderProps {
  sellerName: string
  sellerInitials: string
  isOnline: boolean
  tradedCount: number
}

const ChatHeader = memo(({ sellerName, sellerInitials, isOnline, tradedCount }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12 bg-primary/20">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {sellerInitials}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{sellerName}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={cn(isOnline ? 'text-green-500' : 'text-muted-foreground')}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <span>•</span>
            <span>Traded {tradedCount}</span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  )
})
ChatHeader.displayName = 'ChatHeader'

interface MessageItemProps {
  message: ChatMessage
  isOwn: boolean
  sellerInitials: string
  formatTime: (date: Date) => string
}

const MessageItem = memo(({ message, isOwn, sellerInitials, formatTime }: MessageItemProps) => {
  const content = message.messageEncrypted // TODO: Decrypt when encryption is implemented
  
  // Check if attachment is an image by looking at the URL extension
  const isImageAttachment = message.attachmentUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(message.attachmentUrl)

  return (
    <div
      className={cn(
        'flex gap-3',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {!isOwn && (
        <Avatar className="h-8 w-8 bg-primary/20 flex-shrink-0">
          <AvatarFallback className="bg-primary/20 text-primary text-xs">
            {sellerInitials}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn('space-y-2', isImageAttachment ? 'w-[70%]' : 'max-w-[70%]')}>
        {/* Attachment */}
        {message.attachmentUrl && (
          <MessageAttachment url={message.attachmentUrl} />
        )}
        
        {/* Message text */}
        {content && (
          <div
            className={cn(
              'rounded-lg p-3 text-sm',
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/50'
            )}
          >
            {content}
          </div>
        )}
        
        {/* Timestamp */}
        <div
          className={cn(
            'text-xs text-muted-foreground flex items-center gap-1',
            isOwn ? 'justify-end' : 'justify-start'
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  )
})
MessageItem.displayName = 'MessageItem'

interface MessagesAreaProps {
  messages: ChatMessage[]
  isConnected: boolean
  isBuyer: boolean
  sellerInitials: string
  sellerAddress: string
  buyerAddress: string
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

const MessagesArea = memo(({ 
  messages, 
  isConnected, 
  isBuyer, 
  sellerInitials,
  sellerAddress,
  buyerAddress,
  messagesEndRef 
}: MessagesAreaProps) => {
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  const getMessageSender = useCallback((senderAddress: string): 'buyer' | 'seller' | 'system' => {
    const normalizedSender = senderAddress.toLowerCase()
    const normalizedBuyer = buyerAddress.toLowerCase()
    const normalizedSeller = sellerAddress.toLowerCase()

    if (normalizedSender === normalizedBuyer) return 'buyer'
    if (normalizedSender === normalizedSeller) return 'seller'
    return 'system'
  }, [buyerAddress, sellerAddress])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Connection Status */}
      {!isConnected && (
        <div className="flex justify-center">
          <div className="bg-yellow-500/10 px-4 py-1 rounded-full text-xs text-yellow-600 dark:text-yellow-400">
            Connecting to chat...
          </div>
        </div>
      )}

      {/* Date Divider */}
      {messages.length > 0 && (
        <div className="flex justify-center">
          <div className="bg-background/50 px-4 py-1 rounded-full text-xs text-muted-foreground">
            Today
          </div>
        </div>
      )}

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground text-sm">No messages yet</p>
          <p className="text-muted-foreground text-xs mt-1">Start the conversation!</p>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => {
        const sender = getMessageSender(message.senderAddress)
        const isOwn = isBuyer ? sender === 'buyer' : sender === 'seller'

        return (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={isOwn}
            sellerInitials={sellerInitials}
            formatTime={formatTime}
          />
        )
      })}
      
      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
})
MessagesArea.displayName = 'MessagesArea'

interface ChatInputProps {
  inputValue: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  onFileSelect: () => void
  selectedFile: File | null
  filePreviewUrl: string | null
  onRemoveFile: () => void
  isUploading: boolean
}

const ChatInput = memo(({ 
  inputValue, 
  isLoading, 
  onInputChange, 
  onSend, 
  onKeyPress,
  onFileSelect,
  selectedFile,
  filePreviewUrl,
  onRemoveFile,
  isUploading
}: ChatInputProps) => {
  const canSend = (inputValue.trim() || selectedFile) && !isLoading && !isUploading

  return (
    <div className="p-4 border-t border-border">
      {/* File Preview */}
      {selectedFile && (
        <FilePreview
          file={selectedFile}
          previewUrl={filePreviewUrl}
          onRemove={onRemoveFile}
          isUploading={isUploading}
        />
      )}
      
      {/* Input Area */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="flex-shrink-0"
          onClick={onFileSelect}
          disabled={isUploading || !!selectedFile}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Enter Message"
          className="flex-1 bg-background/50 border-border"
          disabled={isUploading}
        />
        <Button
          onClick={onSend}
          disabled={!canSend}
          size="icon"
          className="flex-shrink-0 bg-primary hover:bg-primary/90"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
})
ChatInput.displayName = 'ChatInput'

// ============= Main Component =============

export function OrderChat({
  orderId,
  sellerName,
  sellerInitials,
  sellerAddress,
  buyerAddress,
  isOnline,
  tradedCount = 0,
  isBuyer,
  currentUserAddress,
  initialMessages = [],
}: OrderChatProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Memoize the callback to prevent re-subscriptions
  const handleNewMessage = useCallback((message: ChatMessage) => {
    // Show toast for new messages from other party
    if (message.senderAddress.toLowerCase() !== currentUserAddress.toLowerCase()) {
      toast.info('New message received')
    }
  }, [currentUserAddress])

  // Real-time chat subscription
  const { messages, isConnected } = useRealtimeChat({
    orderId,
    initialMessages,
    onNewMessage: handleNewMessage,
  })

  // Send message hook
  const { sendMessage, isLoading } = useSendChatMessage({
    orderId,
    onError: (error) => {
      toast.error(error)
    },
  })

  // File upload hook
  const {
    selectFile,
    clearFile,
    uploadFile,
    isUploading,
    selectedFile,
    previewUrl,
  } = useFileUpload({
    orderId,
    onError: (error) => {
      toast.error(error)
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = useCallback(async () => {
    if ((!inputValue.trim() && !selectedFile) || isLoading || isUploading) return

    const content = inputValue.trim()
    let attachmentUrl: string | undefined

    // Upload file first if selected
    if (selectedFile) {
      const url = await uploadFile()
      if (!url) {
        toast.error('Failed to upload file')
        return
      }
      attachmentUrl = url
    }

    // Clear input immediately for better UX
    setInputValue('')

    // Send message with optional attachment
    const result = await sendMessage(content || ' ', attachmentUrl)
    
    if (!result.success) {
      // Restore input value on error
      setInputValue(content)
    }
  }, [inputValue, selectedFile, isLoading, isUploading, sendMessage, uploadFile])

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      selectFile(file)
    }
    // Reset input to allow selecting the same file again
    e.target.value = ''
  }, [selectFile])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
  }, [])

  return (
    <div className="bg-card rounded-2xl border border-border flex flex-col h-[60vh] max-h-[60vh]">
      <ChatHeader
        sellerName={sellerName}
        sellerInitials={sellerInitials}
        isOnline={isOnline}
        tradedCount={tradedCount}
      />

      <MessagesArea
        messages={messages}
        isConnected={isConnected}
        isBuyer={isBuyer}
        sellerInitials={sellerInitials}
        sellerAddress={sellerAddress}
        buyerAddress={buyerAddress}
        messagesEndRef={messagesEndRef}
      />

      <ChatInput
        inputValue={inputValue}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        filePreviewUrl={previewUrl}
        onRemoveFile={clearFile}
        isUploading={isUploading}
      />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  )
}
