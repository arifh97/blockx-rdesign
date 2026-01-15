import { useEffect, useState } from "react"
import { useTokenBalance } from "./use-token-balance"

export const useIsEnoughBalance = (
  tokenAddress: `0x${string}` | undefined,
  amount: string,
) => {
  const [isEnoughBalance, setIsEnoughBalance] = useState<boolean>(false)
  const { balance } = useTokenBalance(tokenAddress)
  useEffect(() => {
    if (!balance || !amount) return
    setIsEnoughBalance(Number.parseFloat(amount) <= Number.parseFloat(balance))
  }, [balance, amount])

  return isEnoughBalance
}
