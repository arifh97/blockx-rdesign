"use client"

import { useState } from "react"
import Image from "next/image"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useChainId } from "wagmi"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Network, Check, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { SUPPORTED_CHAINS } from "@/lib/chains"

export function ChainSwitcher() {
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const chainId = useChainId()
  const [open, setOpen] = useState(false)

  const currentChain = SUPPORTED_CHAINS.find((c) => c.chain.id === chainId)

  // Get the active wallet
  const activeWallet = wallets[0]

  const handleSwitchChain = async (targetChainId: number) => {
    if (!activeWallet || !authenticated) {
      toast.error("No wallet connected")
      return
    }

    try {
      await activeWallet.switchChain(targetChainId)
      const chainName = SUPPORTED_CHAINS.find((c) => c.chain.id === targetChainId)?.name
      toast.success(`Switched to ${chainName}`)
      setOpen(false) // Close dialog after successful switch
    } catch (error) {
      console.error("Error switching chain:", error)
      toast.error("Failed to switch chain")
    }
  }

  if (!ready) {
    return null
  }

  const hasActiveWallet = authenticated && activeWallet

  // Show error state when no wallet is connected
  if (!hasActiveWallet) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 rounded-full bg-[#02101152] px-4 cursor-not-allowed"
              >
                <TriangleAlert className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-white">No Network</span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[250px]">
            <p className="font-medium mb-1">Wallet is not connected</p>
            <p className="text-xs">
              Please enable your wallet extension in browser or re-login if you used email/phone login methods and clear cookies.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-white rounded-full bg-[#02101152] px-4">
          
          <span className="flex items-center align-middle font-medium">
            {currentChain ? (
              <>
                {currentChain.logo ? (
                  <Image 
                    src={currentChain.logo} 
                    alt={currentChain.name} 
                    width={16} 
                    height={16} 
                    className="inline-block mr-1 rounded-full"
                  />
                ) : (
                  <span className="mr-1">{currentChain.icon}</span>
                )}
                {currentChain.name}
              </>
            ) : (
              "Select Network"
            )}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-[#FFFFFF1A]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Select Network</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {SUPPORTED_CHAINS.map(({ chain, name, icon, logo }) => (
            <button
              key={chain.id}
              className="flex items-center gap-3 p-4 rounded-lg border border-[#FFFFFF1A] bg-[#FFFFFF08] hover:bg-[#FFFFFF12] transition-colors cursor-pointer group"
              onClick={() => handleSwitchChain(chain.id)}
            >
              <div className="flex-shrink-0">
                {logo ? (
                  <Image 
                    src={logo} 
                    alt={name} 
                    width={32} 
                    height={32} 
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-2xl">{icon}</span>
                )}
              </div>
              <span className="text-base font-medium flex-1 text-left">{name}</span>
              {chainId === chain.id && (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
