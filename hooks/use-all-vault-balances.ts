import { useQuery } from "@tanstack/react-query"
import { readContract } from "@wagmi/core"
import { type Address, formatUnits } from "viem"
import { useAccount, useChainId, useConfig } from "wagmi"
import { vaultConfig } from "@/lib/contracts"
import { getTokensByChain, type Token } from "@/lib/tokens"

export interface TokenVaultBalance {
  token: Token
  available: bigint
  totalLocked: bigint
  availableFormatted: string
  totalLockedFormatted: string
  hasBalance: boolean
}

export function useAllVaultBalances() {
  const { address } = useAccount()
  const chainId = useChainId()
  const wagmiConfig = useConfig()
  const tokens = getTokensByChain(chainId)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["allVaultBalances", address, chainId],
    queryFn: async (): Promise<TokenVaultBalance[]> => {
      if (!address) {
        return []
      }

      const vaultAddress = vaultConfig.address[
        chainId as keyof typeof vaultConfig.address
      ] as Address

      if (!vaultAddress || vaultAddress === "0x0000000000000000000000000000000000000000") {
        return []
      }

      // Fetch balances for all tokens in parallel
      const balancePromises = tokens.map(async (token) => {
        try {
          const result = await readContract(wagmiConfig, {
            ...vaultConfig,
            address: vaultAddress,
            functionName: "totalBalanceOf",
            args: [address, token.address],
          })

          const [available, totalLocked] = result as [bigint, bigint]

          return {
            token,
            available,
            totalLocked,
            availableFormatted: formatUnits(available, token.decimals),
            totalLockedFormatted: formatUnits(totalLocked, token.decimals),
            hasBalance: available > BigInt(0) || totalLocked > BigInt(0),
          }
        } catch (error) {
          console.error(`Error fetching balance for ${token.symbol}:`, error)
          return {
            token,
            available: BigInt(0),
            totalLocked: BigInt(0),
            availableFormatted: "0",
            totalLockedFormatted: "0",
            hasBalance: false,
          }
        }
      })

      const balances = await Promise.all(balancePromises)
      
      // Return all balances, sorted by: 1) has balance, 2) symbol
      return balances.sort((a, b) => {
        if (a.hasBalance && !b.hasBalance) return -1
        if (!a.hasBalance && b.hasBalance) return 1
        return a.token.symbol.localeCompare(b.token.symbol)
      })
    },
    enabled: !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  // Filter to only tokens with balances
  const tokensWithBalance = data?.filter((balance) => balance.hasBalance) || []

  return {
    allBalances: data || [],
    tokensWithBalance,
    isLoading,
    error: error?.message || null,
    refetch,
  }
}
