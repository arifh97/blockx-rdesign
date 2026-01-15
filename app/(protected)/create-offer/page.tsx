"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CreateBidForm } from "@/components/offers/CreateBidForm"
import { CreateOfferStepper } from "@/components/offers/CreateOfferStepper"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CreateOfferPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/offers")
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/offers">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="size-4" />
            Back to Offers
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Offer</h1>
        <p className="text-muted-foreground mt-2">
          Create a new offer to sell tokens for fiat. Ensure you have sufficient balance in the vault.
        </p>
      </div>

      {/* Create Bid Form */}
      <CreateBidForm onSuccess={handleSuccess} />

      {/* Stepper */}
      <CreateOfferStepper />
    </div>
  )
}
