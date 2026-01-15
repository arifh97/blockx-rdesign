"use client"

import { useState } from "react"
import { type Address } from "viem"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useVaultDeposit } from "@/hooks/use-vault-deposit"
import { useTokenBalance } from "@/hooks/use-token-balance"
import type { Token } from "@/lib/tokens"

interface DepositDialogProps {
  tokens: Token[]
  defaultToken?: Address
  children?: React.ReactNode  // Optional custom trigger
}

export function DepositDialog({ tokens, defaultToken, children }: DepositDialogProps) {
  // Find the matching token from the list (case-insensitive)
  const matchedDefaultToken = defaultToken 
    ? tokens.find((t) => t.address.toLowerCase() === defaultToken.toLowerCase())?.address
    : tokens[0]?.address;  // Fallback to first token if no default provided

  const [depositAmount, setDepositAmount] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<Address | undefined>(matchedDefaultToken)
  
  const selectedTokenData = tokens.find((t) => t.address.toLowerCase() === selectedToken?.toLowerCase())
  const decimals = selectedTokenData?.decimals || 18
  
  const { deposit, isLoading: isDepositing } = useVaultDeposit()
  const { balance: walletBalance, isLoading: isLoadingWallet } = useTokenBalance(selectedToken)

  const handleDeposit = async () => {
    if (!selectedToken || !depositAmount) return

    await deposit({
      tokenAddress: selectedToken,
      amount: depositAmount,
      decimals,
    })

    setDepositAmount("")
    setOpen(false)
  }

  const handleMaxDeposit = () => {
    if (walletBalance) {
      setDepositAmount(walletBalance)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className='w-[130px] h-[44px] text-md relative bg-gradient-to-b from-[#FFFFFF05] to-[#FFFFFF15] border border-transparent text-white hover:bg-[#FFFFFF1A] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] before:absolute before:inset-0 before:rounded-[100px] before:p-[1px] before:bg-gradient-to-b before:from-[#FFFFFF40] before:to-[#FFFFFF10] before:-z-10 before:content-[""]'>
            <Image src="/icons/deposit.svg" alt="Deposit" width={15} height={15} />
            Deposit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image src="/icons/deposit.svg" alt="Deposit" width={15} height={15} />
            Deposit to Vault
          </DialogTitle>
          <DialogDescription>
            Deposit {selectedTokenData?.symbol || "tokens"} to create bids
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  disabled={isDepositing}
                  className="flex-1"
                />
                <Select
                  value={selectedToken}
                  onValueChange={(value: string) => setSelectedToken(value as Address)}
                >
                  <SelectTrigger className="w-[120px] min-h-12">
                    <SelectValue placeholder="Token">
                      {selectedToken && selectedTokenData?.logoURI && (
                        <div className="flex items-center gap-2">
                          <Image 
                            src={selectedTokenData.logoURI} 
                            alt={selectedTokenData.symbol} 
                            width={20} 
                            height={20}
                            className="rounded-full"
                          />
                          <span>{selectedTokenData.symbol}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.address} value={token.address}>
                        <div className="flex items-center gap-2">
                          {token.logoURI && (
                            <Image 
                              src={token.logoURI} 
                              alt={token.symbol} 
                              width={20} 
                              height={20}
                              className="rounded-full"
                            />
                          )}
                          <span>{token.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={handleMaxDeposit}
                disabled={isDepositing || !walletBalance}
                className="min-h-12"
              >
                Max
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Available: {isLoadingWallet ? "..." : walletBalance || "0"} {selectedTokenData?.symbol}
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleDeposit}
            disabled={isDepositing || !depositAmount || Number(depositAmount) <= 0}
          >
            {isDepositing ? "Depositing..." : "Deposit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
