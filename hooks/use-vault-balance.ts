import { useQuery } from "@tanstack/react-query"
import { readContract } from "@wagmi/core"
import { type Address, formatUnits } from "viem"
import { useAccount, useChainId, useConfig } from "wagmi"
import { vaultConfig } from "@/lib/contracts"
import { toast } from "sonner"

interface VaultBalanceResult {
  available: bigint
  totalLocked: bigint
  availableFormatted: string
  totalLockedFormatted: string
}

export function useVaultBalance(tokenAddress: Address | undefined, decimals: number = 18) {
  const { address } = useAccount()
  const chainId = useChainId()
  const wagmiConfig = useConfig()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vaultBalance", address, tokenAddress, chainId],
    queryFn: async (): Promise<VaultBalanceResult> => {
      if (!address || !tokenAddress) {
        return {
          available: BigInt(0),
          totalLocked: BigInt(0),
          availableFormatted: "0",
          totalLockedFormatted: "0",
        }
      }

      const vaultAddress = vaultConfig.address[
        chainId as keyof typeof vaultConfig.address
      ] as Address

      if (!vaultAddress || vaultAddress === "0x0000000000000000000000000000000000000000") {
        toast.error(`Vault not deployed on this network ${chainId}`)
      }

      const result = await readContract(wagmiConfig, {
        ...vaultConfig,
        address: vaultAddress,
        functionName: "totalBalanceOf",
        args: [address, tokenAddress],
      })

      const [available, totalLocked] = result as [bigint, bigint]

      return {
        available,
        totalLocked,
        availableFormatted: formatUnits(available, decimals),
        totalLockedFormatted: formatUnits(totalLocked, decimals),
      }
    },
    enabled: !!address && !!tokenAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  return {
    balance: data,
    isLoading,
    error: error?.message || null,
    refetch,
  }
}
