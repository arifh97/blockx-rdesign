import { useMutation } from "@tanstack/react-query"
import {
  type Config,
  sendTransaction,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core"
import { useCallback } from "react"
import { toast } from "sonner"
import { type Address, erc20Abi, parseUnits } from "viem"
import { useAccount, useChainId, useConfig } from "wagmi"
import { NATIVE_TOKEN } from "@/lib/tokens"
import { useCheckAndApproveToken } from "./check-and-approve-token"

interface TransferParams {
  tokenAddress: Address | 'native'
  to: Address
  amount: string
  decimals: number
}

interface TransferResult {
  hash?: string
  error?: string
}

async function executeNativeTransfer({
  to,
  value,
  wagmiConfig,
}: {
  to: Address
  value: bigint
  wagmiConfig: Config
}) {
  const hash = await sendTransaction(wagmiConfig, {
    to,
    value,
  })

  await waitForTransactionReceipt(wagmiConfig, { hash })
  return { hash }
}

async function executeERC20Transfer({
  tokenAddress,
  to,
  amount,
  wagmiConfig,
}: {
  tokenAddress: Address
  to: Address
  amount: bigint
  wagmiConfig: Config
}) {
  const hash = await writeContract(wagmiConfig, {
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [to, amount],
  })

  await waitForTransactionReceipt(wagmiConfig, { hash })
  return { hash }
}

export function useTokenTransfer() {
  const { address } = useAccount()
  const wagmiConfig = useConfig()

  // Use mutation for transfer functionality
  const {
    mutateAsync: transferAsync,
    isPending: isTransferring,
    error,
    data: txHash,
  } = useMutation({
    mutationFn: async (params: TransferParams): Promise<TransferResult> => {
      const { tokenAddress, to, amount, decimals } = params

      if (!address) {
        throw new Error("Wallet not connected")
      }

      if (!amount || Number.parseFloat(amount) === 0) {
        throw new Error("Invalid amount")
      }

      const parsedAmount = parseUnits(amount, decimals)

      // Native token transfer (ETH, BNB, etc.)
      if (tokenAddress === 'native' || tokenAddress === NATIVE_TOKEN.address) {
        const { hash } = await executeNativeTransfer({
          to,
          value: parsedAmount,
          wagmiConfig,
        })

        return { hash }
      }

      // ERC20 token transfer
      const { hash } = await executeERC20Transfer({
        tokenAddress,
        to,
        amount: parsedAmount,
        wagmiConfig,
      })

      return { hash }
    },
    onSuccess(data) {
      toast.success("Transfer successful!", {
        description: `Transaction hash: ${data.hash}`,
      })
    },
    onError(error) {
      if (error instanceof Error) {
        console.error(error.message)
        toast.error("Transfer failed", {
          description: error.message,
        })
      }
    },
  })

  const transfer = useCallback(
    async (params: TransferParams): Promise<TransferResult> => {
      try {
        const result = await transferAsync(params)
        return result
      } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message }
        return { error: "Unknown Error" }
      }
    },
    [transferAsync],
  )

  return {
    transfer,
    isLoading: isTransferring,
    error: error?.message || null,
    txHash: txHash?.hash || null,
  }
}
