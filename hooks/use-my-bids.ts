import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { getMyBidsByAddressAction } from "@/app/actions/bids"
import { type Bid } from "@/db/schema/bids"

export function useMyBids() {
  const { address } = useAccount()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["myBids", address],
    queryFn: async () => {
      if (!address) {
        return []
      }

      const result = await getMyBidsByAddressAction(address)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch bids")
      }

      return result.bids || []
    },
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })

  return {
    bids: (data || []) as Bid[],
    isLoading,
    error: error?.message || null,
    refetch,
  }
}
