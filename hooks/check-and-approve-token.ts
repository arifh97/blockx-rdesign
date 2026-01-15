import { useMutation } from "@tanstack/react-query"
import {
  type Config,
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core"
import { type Address, erc20Abi, zeroAddress } from "viem"
import { useConfig } from "wagmi"

type Args = {
  tokenAddress: Address
  spenderAddress: Address
  amount: bigint
  userAddress: Address | undefined
  wagmiConfig: Config
}

/**
 * Generic helper to verify ERC20 allowance and request approval if insufficient.
 *
 * @param tokenAddress - ERC20 contract address that user is spending
 * @param spenderAddress - Contract address that will spend the tokens (router, factory, etc.)
 * @param amount - Required allowance amount
 * @param userAddress - Connected wallet address
 * @returns `true` if allowance is now sufficient, otherwise `false`
 */
export async function checkAndApproveToken({
  amount,
  spenderAddress,
  tokenAddress,
  userAddress,
  wagmiConfig,
}: Args): Promise<boolean> {
  if (!userAddress || userAddress === zeroAddress) return false

  // Read current allowance
  const allowance: bigint = await readContract(wagmiConfig, {
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [userAddress, spenderAddress],
  })

  if (allowance >= amount) return true

  // Grant approval (set to exact amount to reduce unnecessary gas)
  const hash = await writeContract(wagmiConfig, {
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: [spenderAddress, amount],
  })

  const receipt = await waitForTransactionReceipt(wagmiConfig, {
    hash,
  })
  return receipt.status === "success"
}

export const useCheckAndApproveToken = () => {
  const wagmiConfig = useConfig()
  const { mutateAsync } = useMutation({
    mutationFn: async ({
      tokenAddress,
      spenderAddress,
      amount,
      userAddress,
    }: Omit<Args, "wagmiConfig">) => {
      return checkAndApproveToken({
        tokenAddress,
        spenderAddress,
        amount,
        userAddress,
        wagmiConfig,
      })
    },
  })

  return mutateAsync
}
