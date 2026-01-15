import { useQuery } from "@tanstack/react-query"
import { type Address, formatUnits } from "viem"
import { useAccount, useChainId, useConfig } from "wagmi"
import { getBalance } from "@wagmi/core"
import { getTokensByChain, type Token } from "@/lib/tokens"

export interface TokenWalletBalance {
  token: Token
  balance: bigint
  balanceFormatted: string
}

export function useAllWalletBalances() {
  const { address } = useAccount()
  const chainId = useChainId()
  const wagmiConfig = useConfig()
  const tokens = getTokensByChain(chainId)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["allWalletBalances", address, chainId],
    queryFn: async (): Promise<TokenWalletBalance[]> => {
      if (!address) {
        return []
      }

      // Fetch balances for all tokens in parallel
      const balancePromises = tokens.map(async (token) => {
        try {
          // For native token (0x0000...0000), pass undefined to getBalance
          const tokenAddress = token.address === "0x0000000000000000000000000000000000000000"
            ? undefined
            : (token.address as Address)

          const balanceData = await getBalance(wagmiConfig, {
            address,
            token: tokenAddress,
          })

          return {
            token,
            balance: balanceData.value,
            balanceFormatted: formatUnits(balanceData.value, balanceData.decimals),
          }
        } catch (error) {
          console.error(`Error fetching wallet balance for ${token.symbol}:`, error)
          return {
            token,
            balance: BigInt(0),
            balanceFormatted: "0",
          }
        }
      })

      const balances = await Promise.all(balancePromises)
      return balances
    },
    enabled: !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  return {
    walletBalances: data || [],
    isLoading,
    error: error?.message || null,
    refetch,
  }
}
