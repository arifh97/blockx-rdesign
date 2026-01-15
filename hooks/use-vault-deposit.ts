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
import { useCheckAndApproveToken } from "./check-and-approve-token"

interface DepositParams {
  tokenAddress: Address
  amount: string
  decimals: number
}

interface DepositResult {
  hash?: string
  error?: string
}

async function executeDeposit({
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
    functionName: "deposit",
    args: [tokenAddress, amount],
  })

  await waitForTransactionReceipt(wagmiConfig, { hash })
  return { hash }
}

export function useVaultDeposit() {
  const { address } = useAccount()
  const chainId = useChainId()
  const wagmiConfig = useConfig()
  const queryClient = useQueryClient()
  const checkAndApprove = useCheckAndApproveToken()

  const {
    mutateAsync: depositAsync,
    isPending: isDepositing,
    error,
    data: txHash,
  } = useMutation({
    mutationFn: async (params: DepositParams): Promise<DepositResult> => {
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

      // Step 1: Approve vault to spend tokens
      toast.info("Approving token spend...")
      const approved = await checkAndApprove({
        tokenAddress,
        spenderAddress: vaultAddress,
        amount: parsedAmount,
        userAddress: address,
      })

      if (!approved) {
        throw new Error("Token approval failed")
      }

      // Step 2: Deposit to vault
      toast.info("Depositing to vault...")
      const { hash } = await executeDeposit({
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
      
      toast.success("Deposit successful!", {
        description: `Transaction hash: ${data.hash?.slice(0, 10)}...`,
      })
    },
    onError(error) {
      if (error instanceof Error) {
        console.error(error.message)
        toast.error("Deposit failed", {
          description: error.message,
        })
      }
    },
  })

  const deposit = useCallback(
    async (params: DepositParams): Promise<DepositResult> => {
      try {
        const result = await depositAsync(params)
        return result
      } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message }
        return { error: "Unknown Error" }
      }
    },
    [depositAsync],
  )

  return {
    deposit,
    isLoading: isDepositing,
    error: error?.message || null,
    txHash: txHash?.hash || null,
  }
}
