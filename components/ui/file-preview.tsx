"use client"

import { X, File, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatFileSize, isImageFile } from '@/lib/file-utils'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface FilePreviewProps {
  file: File
  previewUrl?: string | null
  onRemove: () => void
  isUploading?: boolean
}

export function FilePreview({ 
  file, 
  previewUrl, 
  onRemove, 
  isUploading = false 
}: FilePreviewProps) {
  const isImage = isImageFile(file.type)

  return (
    <div className="relative bg-background/50 border border-border rounded-lg p-3 mb-2">
      <div className="flex items-center gap-3">
        {/* File Icon/Preview */}
        <div className="flex-shrink-0">
          {isImage && previewUrl ? (
            <div className="relative w-20 h-20 rounded overflow-hidden">
              <Image
                src={previewUrl}
                alt={file.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
              <File className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
          
          {/* Loading Indicator */}
          {isUploading && (
            <div className="flex items-center gap-1.5 mt-1">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                Uploading...
              </p>
            </div>
          )}
        </div>

        {/* Remove Button */}
        {!isUploading && (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

interface MessageAttachmentProps {
  url: string
  fileName?: string
  className?: string
}

export function MessageAttachment({ url, fileName, className }: MessageAttachmentProps) {
  // Determine if it's an image based on URL extension
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  
  // Extract filename from URL if not provided
  const displayName = fileName || url.split('/').pop() || 'attachment'

  if (isImage) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("block rounded-lg overflow-hidden border border-border/50 hover:border-border transition-colors", className)}
      >
        <div className="relative w-full aspect-video bg-background/50">
          <Image
            src={url}
            alt={displayName}
            fill
            className="object-cover"
          />
        </div>
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:border-border bg-background/50 hover:bg-background transition-colors max-w-xs",
        className
      )}
    >
      <File className="h-5 w-5 text-primary flex-shrink-0" />
      <span className="text-sm truncate">{displayName}</span>
    </a>
  )
}
