'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MessageCircle } from 'lucide-react'
import { type OrderWithUser } from "@/db/queries/orders"
import { getTokenSymbol } from '@/lib/tokens';
import { OrdersFilters } from './OrdersFilters';
import { type Address } from 'viem';
import { getChainLogo } from '@/lib/chains';

interface OrderListProps {
  orders: OrderWithUser[]
  userWallet?: string
}

export function OrderList({ orders, userWallet }: OrderListProps) {
  const searchParams = useSearchParams();

  // Get filter values from URL
  const statusFilter = searchParams.get('status');
  const assetFilter = searchParams.get('asset');

  // Filter orders based on URL params
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter && statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }
      // Asset filter - check token symbol
      if (assetFilter && assetFilter !== 'all') {
        const tokenSymbol = getTokenSymbol(order.fromToken as Address);
        if (tokenSymbol !== assetFilter) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, assetFilter]);

  if (!userWallet) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>Connect your wallet to view your orders</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show empty state if no orders at all
  if (orders.length === 0) {
    return (
      <Card className="border-border/40 bg-background/50">
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <Image 
              src="/no_offers_2.png" 
              alt="No orders" 
              width={200} 
              height={200}
              className="opacity-80"
            />
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">
                You don&apos;t have any orders yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Start trading to create your first order.
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant={"ghost"} className="min-w-[150px] min-h-[50px] text-md">
                Browse Offers
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 bg-[#07101799]">
      <CardContent className="">
        {/* Filters */}
        <OrdersFilters />

        {/* Table */}
        <Table className="border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow className="bg-[#DBECFD08] rounded-xl">
              <TableHead className="w-16 rounded-l-xl text-[#7E7F8C]">Chain</TableHead>
              <TableHead className="text-[#7E7F8C]">Order Type</TableHead>
              <TableHead className="text-[#7E7F8C]">Price</TableHead>
              <TableHead className="text-[#7E7F8C]">Fiat / Crypto Amount</TableHead>
              <TableHead className="text-[#7E7F8C]">Counterparty</TableHead>
              <TableHead className="rounded-r-xl text-[#7E7F8C]">Status</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No orders match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order, index) => (
                  <OrderRow key={order.id} order={order} index={index} />
                ))
              )}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function OrderRow({ order, index }: { order: OrderWithUser; index: number }) {
  const tokenSymbol = getTokenSymbol(order.fromToken as Address);
  const amountFormatted = Number(order.fromAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 5 });
  const priceFormatted = Number(order.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 });
  const totalFiat = (Number(order.fromAmount) * Number(order.price)).toFixed(2);
  
    
  // Counterparty info
  const otherPartyName = order.otherParty?.username || 
    (order.isMaker ? order.takerAddress : order.makerAddress).slice(0, 10) + '...';
  
  // Determine status badge
  const getStatusBadge = () => {
    const baseClasses = "px-4 py-1.5 rounded-full text-sm font-medium bg-transparent";
    switch (order.status) {
      case 'open':
      case 'locked':
        return <Badge className={`${baseClasses} text-blue-400 border border-blue-400/50`}>Open</Badge>;
      case 'pending_payment':
        return <Badge className={`${baseClasses} text-orange-400 border border-orange-400/50`}>Pending</Badge>;
      case 'payment_sent':
        return <Badge className={`${baseClasses} text-orange-400 border border-orange-400/50`}>Payment Sent</Badge>;
      case 'completed':
        return <Badge className={`${baseClasses} text-emerald-400 border border-emerald-400/50`}>Completed</Badge>;
      case 'cancelled':
        return <Badge className={`${baseClasses} text-red-400 border border-red-400/50`}>Cancelled</Badge>;
      case 'cancel_requested':
        return <Badge className={`${baseClasses} text-red-400 border border-red-400/50`}>Cancel Requested</Badge>;
      case 'disputed':
        return <Badge className={`${baseClasses} text-red-400 border border-red-400/50`}>Disputed</Badge>;
      default:
        return <Badge className={`${baseClasses} text-gray-400 border border-gray-400/50`}>{order.status}</Badge>;
    }
  };

  return (
    <TableRow className={`rounded-xl h-18 ${index % 2 === 0 ? 'bg-[#0D171E]/20' : 'bg-[#0D171E]/60'}`}>
      {/* Chain */}
      <TableCell className="rounded-l-xl">
        {getChainLogo(order.chainId) ? (
          <Image
            src={getChainLogo(order.chainId)!}
            alt="Chain"
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
            ?
          </div>
        )}
      </TableCell>
      {/* Order Type */}
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${order.isMaker ? 'bg-orange-500' : 'bg-green-500'}`}></span>
            <span className="font-medium">{order.isMaker ? 'Sell' : 'Buy'} {tokenSymbol}</span>
          </span>
        </div>
      </TableCell>
      {/* Price */}
      <TableCell>
        <div className="font-medium">{priceFormatted} {order.fiatCurrency || 'EUR'}</div>
      </TableCell>
      {/* Fiat / Crypto Amount */}
      <TableCell>
        <div>
          <div className="font-semibold">{totalFiat} {order.fiatCurrency || 'EUR'}</div>
          <div className="text-xs text-muted-foreground">{amountFormatted} {tokenSymbol}</div>
        </div>
      </TableCell>
      {/* Counterparty */}
      <TableCell>
        <div>
          <p className="font-medium text-sm mb-2">{otherPartyName}</p>
          <Link 
            href={`/orders/${order.orderId}`} 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3E3F4A] text-sm text-white/80 hover:bg-white/5 transition-colors"
          >
            <span>Chat</span>
            <MessageCircle className="w-4 h-4" />
          </Link>
        </div>
      </TableCell>
      {/* Status */}
      <TableCell className="rounded-r-xl">
        {getStatusBadge()}
      </TableCell>
    </TableRow>
  )
}
