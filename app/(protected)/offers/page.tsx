import Link from "next/link"
import { BidList } from "@/components/offers/BidList"
import { Button } from "@/components/ui/button"
import { getMyBidsAction } from "@/app/actions/bids"

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic'

export default async function OffersPage() {
  const result = await getMyBidsAction()
  const bids = result.bids
  const userWallet = result.success ? result.userWallet : undefined

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Offers</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your active offers
          </p>
        </div>
        <Link href="/create-offer">
          <Button className="min-w-[150px] min-h-[50px] text-md">
            New Offer
          </Button>
        </Link>
      </div>

      {/* Bid List */}
      <BidList bids={bids} userWallet={userWallet} />
    </div>
  )
}
