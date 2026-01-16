'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { useRealtimeOrders } from '@/hooks/use-realtime-orders';
import { getActiveOrdersAction } from '@/app/actions/active-orders';
import { useRefreshOnAuthError, isAuthError } from '@/hooks/use-authenticated-action';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, FileCheck } from 'lucide-react';
import Link from 'next/link';
import type { Order } from '@/db/schema/orders';
import type { User } from '@/db/schema/users';

interface OrderWithUser extends Order {
  otherParty: User | null;
  isMaker: boolean;
}

export function ActiveOrdersWidget() {
  const { user, authenticated } = usePrivy();
  const { refreshAndRetry } = useRefreshOnAuthError();

  // Get user's wallet address
  const userAddress = user?.wallet?.address;

  // Fetch initial active orders using React Query with automatic token refresh
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['active-orders', userAddress],
    queryFn: async () => {
      return refreshAndRetry(async () => {
        const result = await getActiveOrdersAction();
        if (!result.success) {
          // If it's an auth error, throw to trigger refresh
          if (isAuthError(result.error)) {
            throw new Error(result.error);
          }
          throw new Error(result.error || 'Failed to fetch active orders');
        }
        return result.orders as OrderWithUser[];
      });
    },
    enabled: authenticated && !!userAddress,
    staleTime: 30000, // Consider data fresh for 30 seconds
    // Disabled - layout handles token refresh on visibility change and calls router.refresh()
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry auth errors (they're handled by refreshAndRetry)
      if (error instanceof Error && isAuthError(error.message)) {
        return false;
      }
      return failureCount < 2;
    }
  });

  const initialOrders = data || [];

  // Subscribe to realtime updates for user's orders
  const { orders: realtimeOrders } = useRealtimeOrders({
    userAddress,
    initialOrders,
    onInsert: (newOrder) => {
      console.log('New order detected:', newOrder);
      // Refetch the active orders query
      refetch();
    },
    onUpdate: (updatedOrder) => {
      console.log('Order updated:', updatedOrder);
      // Refetch the active orders query
      refetch();
    }
  });

  // Filter out completed and cancelled orders from realtime updates
  const activeOrders = realtimeOrders.filter((order) => order.status !== 'completed' && order.status !== 'cancelled');

  // Don't show widget if not authenticated, loading, or no active orders
  if (!authenticated || !userAddress || isLoading || activeOrders.length === 0) {
    return null;
  }

  // Show only the first active order
  const firstOrder = activeOrders[1] as OrderWithUser;
  const otherParty = firstOrder.otherParty;
  const otherPartyName =
    otherParty?.username ||
    `${firstOrder.isMaker ? firstOrder.takerAddress : firstOrder.makerAddress}`.slice(0, 10) + '...';
  const otherPartyInitial = otherParty?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Active Orders</h3>
        {activeOrders.length > 1 ? (
          <Link href="/orders">
            <Button variant="link" className="text-xs text-cyan-500 hover:text-cyan-400 p-0 h-auto">
              See All ({activeOrders.length})
            </Button>
          </Link>
        ) : (
          <Link href="/orders">
            <Button variant="link" className="text-xs text-cyan-500 hover:text-cyan-400 p-0 h-auto">
              See All
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {/* Order Info - Real Data */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
            {otherPartyInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs truncate">{otherPartyName}</p>
            <p className="text-xs text-muted-foreground">{firstOrder.isMaker ? 'Sell' : 'Buy'} USDT</p>
          </div>
          <p className="font-semibold text-xs">{firstOrder.fromAmount} USDT</p>
        </div>

        {/* Action Buttons - TODO: Wire up real actions */}
        <div className="flex gap-1">
          <Link href={`/orders/${firstOrder.orderId}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs px-1" title="View Order">
              <MessageSquare className="h-3 w-3" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs px-1"
            title="Cancel Order - Not Implemented"
            disabled
          >
            <X className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs px-1"
            title="Mark as Paid - Not Implemented"
            disabled
          >
            <FileCheck className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
