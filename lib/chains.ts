import { sepolia, baseSepolia, anvil } from "viem/chains"
import type { Chain, Transport } from "viem"
import { http } from "viem"

export interface SupportedChain {
  chain: Chain
  name: string
  icon: string
  logo?: string
}

// Development chains (includes all test chains)
const DEV_CHAINS: SupportedChain[] = [
  {
    chain: sepolia,
    name: "Ethereum Sepolia",
    icon: "⟠",
    logo: "/chains/Ethereum.png",
  },
  {
    chain: baseSepolia,
    name: "Base Sepolia",
    icon: "🔵",
    logo: "/chains/Base.png",
  },
  {
    chain: anvil,
    name: "Anvil (Local)",
    icon: "🔨",
    logo: undefined, // No logo for local chain
  },
]

// Production chains (only Base Sepolia for now)
const PROD_CHAINS: SupportedChain[] = [
  {
    chain: baseSepolia,
    name: "Base Sepolia",
    icon: "🔵",
    logo: "/chains/Base.png",
  },
  {
    chain: sepolia,
    name: "Ethereum Sepolia",
    icon: "⟠",
    logo: "/chains/Ethereum.png",
  },
]

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production'

// Export the appropriate chains based on environment
export const SUPPORTED_CHAINS: SupportedChain[] = isProduction ? PROD_CHAINS : DEV_CHAINS

// Export raw viem chains for Wagmi/Privy config
// Type assertion ensures at least one chain (required by Wagmi)
export const VIEM_CHAINS = (
  isProduction 
    ? [baseSepolia, sepolia]
    : [sepolia, baseSepolia, anvil]
) as [Chain, ...Chain[]]

// Export transports for Wagmi config
export const CHAIN_TRANSPORTS: Record<number, Transport> = isProduction
  ? {
      [baseSepolia.id]: http(),
      [sepolia.id]: http(),
    }
  : {
      [sepolia.id]: http(),
      [baseSepolia.id]: http(),
      [anvil.id]: http(),
    }

// Export default chain
export const DEFAULT_CHAIN = isProduction ? baseSepolia : anvil

// Helper to get chain by ID
export function getChainById(chainId: number): SupportedChain | undefined {
  return SUPPORTED_CHAINS.find((c) => c.chain.id === chainId)
}

// Helper to get chain name by ID
export function getChainName(chainId: number): string {
  const chain = getChainById(chainId)
  return chain?.name || `Chain ${chainId}`
}

// Helper to get chain logo by ID
export function getChainLogo(chainId: number): string | undefined {
  const chain = getChainById(chainId)
  return chain?.logo
}
