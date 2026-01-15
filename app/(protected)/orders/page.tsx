import { OrderList } from "@/components/orders/OrderList"
import { getMyOrdersAction } from "@/app/actions/orders"

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const result = await getMyOrdersAction()
  const orders = result.orders
  const userWallet = result.success ? result.userWallet : undefined

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your trading orders
          </p>
        </div>
      </div>

      {/* Order List */}
      <OrderList orders={orders} userWallet={userWallet} />
    </div>
  )
}
