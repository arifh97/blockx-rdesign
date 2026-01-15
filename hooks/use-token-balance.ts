import { formatUnits } from "viem"
import { useAccount, useBalance } from "wagmi"

export const useTokenBalance = (tokenAddress: `0x${string}` | undefined) => {
  const { address, isConnected } = useAccount()
  
  // Handle token address:
  // - undefined: don't fetch anything (no token selected)
  // - 0x0000...0000 (zeroAddress): fetch native ETH balance (pass undefined to useBalance)
  // - any other address: fetch ERC20 token balance
  const _tokenAddress =
    tokenAddress === "0x0000000000000000000000000000000000000000"
      ? undefined
      : tokenAddress

  const {
    data: balanceData,
    isLoading,
    refetch,
    error,
    isError,
  } = useBalance({
    address: address,
    token: _tokenAddress,
    query: {
      enabled: !!tokenAddress && !!address && isConnected,
      refetchOnWindowFocus: true,
    },
  })

  const balance = balanceData
    ? formatUnits(balanceData.value, balanceData.decimals)
    : "0"
  return { balance, isLoading, refetch, error, isError, ...balanceData }
}
