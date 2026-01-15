"use client"

import Image from "next/image"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import { SUPPORTED_CHAINS } from "@/lib/chains"

interface ChainSelectorProps {
  selectedChains: number[]
  onChainsChange: (chains: number[]) => void
  error?: string
}

// Create icon components for each chain
const ChainIcon = ({ src, alt }: { src?: string; alt: string }) => {
  if (!src) return null
  return <Image src={src} alt={alt} width={16} height={16} className="rounded-full" />
}

export function ChainSelector({ selectedChains, onChainsChange, error }: ChainSelectorProps) {
  // Convert chains to multi-select options
  const chainOptions = SUPPORTED_CHAINS.map((chain) => ({
    label: chain.name,
    value: chain.chain.id.toString(),
    icon: chain.logo ? (() => <ChainIcon src={chain.logo} alt={chain.name} />) : undefined,
  }))

  // Convert selected chain IDs to strings for MultiSelect
  const selectedValues = selectedChains.map((id) => id.toString())

  const handleChange = (values: string[]) => {
    // Convert back to numbers
    const chainIds = values.map((v) => parseInt(v, 10))
    onChainsChange(chainIds)
  }

  return (
    <div className="space-y-2 bg-[#FFFFFF08] rounded-xl p-4">
      <Label htmlFor="chains" className="text-sm text-muted-foreground">
        Select chains where you want to buy crypto
      </Label>
      <MultiSelect
        options={chainOptions}
        defaultValue={selectedValues}
        onValueChange={handleChange}
        placeholder="Select chains..."
        className="w-full"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      
      {/* Display selected chains with logos */}
      {selectedChains.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedChains.map((chainId) => {
            const chain = SUPPORTED_CHAINS.find((c) => c.chain.id === chainId)
            if (!chain) return null
            
            return (
              <div
                key={chainId}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#FFFFFF12] rounded-lg border border-[#FFFFFF20]"
              >
                {chain.logo ? (
                  <Image src={chain.logo} alt={chain.name} width={20} height={20} className="rounded-full" />
                ) : (
                  <span className="text-sm">{chain.icon}</span>
                )}
                <span className="text-sm font-medium">{chain.name}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
