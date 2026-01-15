import { notFound } from 'next/navigation'
import { getOrderWithAccess } from '@/lib/order-security'
import { getUserById } from '@/db/queries/users'
import { getChatMessagesByOrderId } from '@/db/queries/chat-messages'
import { OrderPageClient } from '@/components/orders/OrderPageClient'
import { getOrderPaymentDetailsAction } from '@/app/actions/orders'

interface OrderPageProps {
  params: Promise<{
    orderId: string
  }>
}

/**
 * Individual Order Page - Server Component with Security Checks
 * 
 * Security Features:
 * 1. RSC-level authentication check via getOrderWithAccess
 * 2. Verifies user is either buyer or seller of the order
 * 3. Returns 404 if order doesn't exist or user lacks access
 * 4. All server actions have additional security checks
 */
export default async function OrderPage({ params }: OrderPageProps) {
  // Await params in Next.js 15
  const { orderId } = await params

  // Security Check #1: Verify authentication and order access
  // This runs on the server and checks:
  // - User is authenticated (via Privy token)
  // - Order exists
  // - User is either the maker (seller) or taker (buyer)
  const orderAccess = await getOrderWithAccess(orderId)

  // If user doesn't have access, show 404
  if (!orderAccess) {
    notFound()
  }

  const { order, isMaker, isTaker } = orderAccess

  // Additional safety check - user must be either maker or taker
  if (!isMaker && !isTaker) {
    notFound()
  }

  // Fetch seller and buyer details
  const seller = await getUserById(order.makerId)
  const buyer = await getUserById(order.takerId)

  if (!seller || !buyer) {
    notFound()
  }

  // Determine if current user is the buyer
  const isBuyer = isTaker
  
  // Get current user's wallet address
  const currentUserAddress = isBuyer ? buyer.walletAddress : seller.walletAddress

  // Fetch chat messages for this order
  const chatMessages = await getChatMessagesByOrderId(orderId)

  // Fetch payment details if user is buyer
  let paymentDetails: { paymentMethod: string; label: string | null; details: string; currency: string | null } | null = null
  let paymentInstructions: string | null = null
  let paymentReference: string | null = null
  if (isBuyer) {
    const paymentResult = await getOrderPaymentDetailsAction(orderId)
    if (paymentResult.success) {
      paymentDetails = paymentResult.paymentDetails ?? null
      paymentInstructions = paymentResult.paymentInstructions ?? null
      paymentReference = paymentResult.paymentReference ?? null
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Main Content - Client Component */}
      <OrderPageClient
        order={order}
        seller={seller}
        buyer={buyer}
        isBuyer={isBuyer}
        currentUserAddress={currentUserAddress}
        initialMessages={chatMessages}
        paymentDetails={paymentDetails}
        paymentInstructions={paymentInstructions}
        paymentReference={paymentReference}
      />
    </div>
  )
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: OrderPageProps) {
  const { orderId } = await params
  return {
    title: `Order ${orderId.slice(0, 10)}... | BlockX`,
    description: 'View and manage your order',
  }
}
