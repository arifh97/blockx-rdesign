import { useMutation } from "@tanstack/react-query"
import { type Config, waitForTransactionReceipt, writeContract } from "@wagmi/core"
import { useCallback } from "react"
import { toast } from "sonner"
import { useAccount, useChainId, useConfig } from "wagmi"
import { orderBookConfig } from "@/lib/contracts"
import { type Address } from "viem"
import { confirmOrderAction } from "@/app/actions/orders"

interface ConfirmAndReleaseParams {
  orderId: string
}

interface ConfirmAndReleaseResult {
  txHash?: `0x${string}`
  error?: string
}

async function confirmPaymentAndReleaseOnChain({
  orderId,
  orderBookAddr,
  wagmiConfig,
}: {
  orderId: string
  orderBookAddr: Address
  wagmiConfig: Config
}) {
  // Call OrderBook.confirmPaymentAndRelease() on-chain
  const hash = await writeContract(wagmiConfig, {
    ...orderBookConfig,
    address: orderBookAddr,
    functionName: "confirmPaymentAndRelease",
    args: [orderId as `0x${string}`],
  })

  // Wait for transaction confirmation
  await waitForTransactionReceipt(wagmiConfig, { hash })

  return hash
}

async function updateOrderInDatabase({
  orderId,
}: {
  orderId: string
}) {
  const dbResult = await confirmOrderAction(orderId)
  
  if (!dbResult.success) {
    console.error("Failed to update order in database:", dbResult.error)
    // Don't throw here - transaction was successful on-chain
  }
}

export function useConfirmAndReleaseOrder() {
  const { address } = useAccount()
  const chainId = useChainId()
  const wagmiConfig = useConfig()

  const {
    mutateAsync: confirmAndReleaseAsync,
    isPending: isConfirming,
    error,
    data: result,
  } = useMutation({
    mutationFn: async (params: ConfirmAndReleaseParams): Promise<ConfirmAndReleaseResult> => {
      if (!address) {
        throw new Error("Wallet not connected")
      }

      const { orderId } = params

      // Get OrderBook address for current chain
      const orderBookAddr = orderBookConfig.address[chainId as keyof typeof orderBookConfig.address] as Address
      
      if (!orderBookAddr || orderBookAddr === "0x0000000000000000000000000000000000000000") {
        throw new Error(`OrderBook not deployed on chain ${chainId}`)
      }

      // 1. Confirm payment and release crypto on-chain
      const hash = await confirmPaymentAndReleaseOnChain({
        orderId,
        orderBookAddr,
        wagmiConfig,
      })

      // 2. Update order in database
      await updateOrderInDatabase({ orderId })

      return { txHash: hash }
    },
    onSuccess(data) {
      toast.success("Payment confirmed and crypto released!", {
        description: `Transaction: ${data.txHash?.slice(0, 10)}...`,
      })
    },
    onError(error) {
      if (error instanceof Error) {
        console.error(error.message)
        toast.error("Failed to confirm payment", {
          description: error.message,
        })
      }
    },
  })

  const confirmAndRelease = useCallback(
    async (params: ConfirmAndReleaseParams): Promise<ConfirmAndReleaseResult> => {
      try {
        const result = await confirmAndReleaseAsync(params)
        return result
      } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message }
        return { error: "Unknown Error" }
      }
    },
    [confirmAndReleaseAsync],
  )

  return {
    confirmAndRelease,
    isLoading: isConfirming,
    error: error?.message || null,
    txHash: result?.txHash || null,
  }
}
