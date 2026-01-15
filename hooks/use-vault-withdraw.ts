import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  type Config,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core"
import { useCallback } from "react"
import { toast } from "sonner"
import { type Address, parseUnits } from "viem"
import { useAccount, useChainId, useConfig } from "wagmi"
import { vaultConfig } from "@/lib/contracts"

interface WithdrawParams {
  tokenAddress: Address
  amount: string
  decimals: number
}

interface WithdrawResult {
  hash?: string
  error?: string
}

async function executeWithdraw({
  tokenAddress,
  amount,
  vaultAddress,
  wagmiConfig,
}: {
  tokenAddress: Address
  amount: bigint
  vaultAddress: Address
  wagmiConfig: Config
}) {
  const hash = await writeContract(wagmiConfig, {
    ...vaultConfig,
    address: vaultAddress,
    functionName: "withdraw",
    args: [tokenAddress, amount],
  })

  await waitForTransactionReceipt(wagmiConfig, { hash })
  return { hash }
}

export function useVaultWithdraw() {
  const { address } = useAccount()
  const chainId = useChainId()
  const wagmiConfig = useConfig()
  const queryClient = useQueryClient()

  const {
    mutateAsync: withdrawAsync,
    isPending: isWithdrawing,
    error,
    data: txHash,
  } = useMutation({
    mutationFn: async (params: WithdrawParams): Promise<WithdrawResult> => {
      const { tokenAddress, amount, decimals } = params

      if (!address) {
        throw new Error("Wallet not connected")
      }

      if (!amount || Number.parseFloat(amount) === 0) {
        throw new Error("Invalid amount")
      }

      const parsedAmount = parseUnits(amount, decimals)
      const vaultAddress = vaultConfig.address[
        chainId as keyof typeof vaultConfig.address
      ] as Address

      if (!vaultAddress || vaultAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("Vault not deployed on this network")
      }

      toast.info("Withdrawing from vault...")
      const { hash } = await executeWithdraw({
        tokenAddress,
        amount: parsedAmount,
        vaultAddress,
        wagmiConfig,
      })

      return { hash }
    },
    onSuccess(data) {
      // Invalidate vault balance queries
      queryClient.invalidateQueries({ queryKey: ["vaultBalance"] })
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] })
      
      toast.success("Withdrawal successful!", {
        description: `Transaction hash: ${data.hash?.slice(0, 10)}...`,
      })
    },
    onError(error) {
      if (error instanceof Error) {
        console.error(error.message)
        toast.error("Withdrawal failed", {
          description: error.message,
        })
      }
    },
  })

  const withdraw = useCallback(
    async (params: WithdrawParams): Promise<WithdrawResult> => {
      try {
        const result = await withdrawAsync(params)
        return result
      } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message }
        return { error: "Unknown Error" }
      }
    },
    [withdrawAsync],
  )

  return {
    withdraw,
    isLoading: isWithdrawing,
    error: error?.message || null,
    txHash: txHash?.hash || null,
  }
}
