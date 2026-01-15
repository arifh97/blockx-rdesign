'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type Bid } from "@/db/schema/bids"

// Extended Bid type with payment info
type BidWithPaymentInfo = Bid & {
  paymentInfo?: string[] // Display labels (e.g., "My Chase Account" or "bank_transfer")
  paymentMethodCodes?: string[] // Method codes for filtering (e.g., "bank_transfer", "paypal")
}
import { getTokenSymbol } from '@/lib/tokens';
import { OffersFilters } from './OffersFilters';
import { type Address } from 'viem';
import { getChainLogo } from '@/lib/chains';

interface BidListProps {
  bids: BidWithPaymentInfo[]
  userWallet?: string
}

export function BidList({ bids, userWallet }: BidListProps) {
  const searchParams = useSearchParams();

  // Get filter values from URL
  const statusFilter = searchParams.get('status');
  const assetFilter = searchParams.get('asset');
  const paymentFilter = searchParams.get('payment');

  // Filter bids based on URL params
  const filteredBids = useMemo(() => {
    return bids.filter((bid) => {
      if (statusFilter && statusFilter !== 'all' && bid.status !== statusFilter) {
        return false;
      }
      if (assetFilter && assetFilter !== 'all' && bid.fromToken.toLowerCase() !== assetFilter.toLowerCase()) {
        return false;
      }
      if (paymentFilter && paymentFilter !== 'all') {
        if (!bid.paymentMethodCodes || !bid.paymentMethodCodes.includes(paymentFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [bids, statusFilter, assetFilter, paymentFilter]);

  if (!userWallet) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>Connect your wallet to view your offers</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show empty state if no bids at all
  if (bids.length === 0) {
    return (
      <Card className="border-border/40 bg-background/50">
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <Image 
              src="/no_offers_2.png" 
              alt="No offers" 
              width={200} 
              height={200}
              className="opacity-80"
            />
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">
                You don&apos;t have any offers yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Create one to start trading.
              </p>
            </div>
            <Link href="/create-offer">
              <Button variant={"ghost"} className="min-w-[150px] min-h-[50px] text-md">
                Create New Offer
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
        <OffersFilters />

        {/* Table */}
        <Table className="border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow className="bg-[#DBECFD08] rounded-xl">
              <TableHead className="w-12 rounded-l-xl">
                <div className="w-4 h-4 border border-[#3E3F4A] rounded-sm" />
              </TableHead>
              <TableHead className="w-16 text-[#7E7F8C]">Chain</TableHead>
              <TableHead className="text-[#7E7F8C]">Offer</TableHead>
              <TableHead className="text-[#7E7F8C]">Price</TableHead>
              <TableHead className="text-[#7E7F8C]">Order Limit</TableHead>
              <TableHead className="rounded-r-xl text-[#7E7F8C]">Payment Methods</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {filteredBids.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No offers match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredBids.map((bid, index) => (
                  <BidRow key={bid.id} bid={bid} index={index} />
                ))
              )}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function BidRow({ bid, index }: { bid: BidWithPaymentInfo; index: number }) {
  const tokenSymbol = getTokenSymbol(bid.fromToken as Address);
  const priceFormatted = Number(bid.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 });
  const minAmountFormatted = Number(bid.minAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 5 });
  const maxAmountFormatted = Number(bid.maxAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 5 });
  
  // Determine status badge
  const getStatusBadge = () => {
    const expiresAt = new Date(Number(bid.expiresAt) * 1000);
    const isExpired = expiresAt < new Date();
    
    if (isExpired) {
      return <Badge variant="secondary" className="text-xs">Expired</Badge>;
    }
    
    switch (bid.status) {
      case 'active':
        return <Badge variant="default" className="text-xs bg-blue-500">Active</Badge>;
      case 'completed':
        return <Badge variant="default" className="text-xs bg-green-500">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="text-xs">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{bid.status}</Badge>;
    }
  };

  return (
    <TableRow className={`rounded-xl h-18 ${index % 2 === 0 ? 'bg-[#0D171E]/20' : 'bg-[#0D171E]/60'}`}>
      <TableCell className="rounded-l-xl">
        <div className="w-4 h-4 border border-[#3E3F4A] rounded-sm" />
      </TableCell>
      <TableCell>
        {getChainLogo(bid.chainId) ? (
          <Image
            src={getChainLogo(bid.chainId)!}
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
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${bid.bidType === 'sell' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
            <span className="font-medium">{bid.bidType === 'sell' ? 'Sell' : 'Buy'} {tokenSymbol}</span>
          </span>
          <div className="text-xs text-muted-foreground">{getStatusBadge()}</div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-semibold">{priceFormatted} {bid.fiatCurrency || 'EUR'}</div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{minAmountFormatted} - {maxAmountFormatted} {tokenSymbol}</div>
          <div className="text-xs text-muted-foreground">
            {(Number(bid.minAmount) * Number(bid.price)).toFixed(2)} - {(Number(bid.maxAmount) * Number(bid.price)).toFixed(2)} {bid.fiatCurrency || 'EUR'}
          </div>
        </div>
      </TableCell>
      <TableCell className="rounded-r-xl">
        <div className="flex flex-wrap gap-1">
          {bid.paymentInfo && bid.paymentInfo.length > 0 ? (
            bid.paymentInfo.slice(0, 3).map((method, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="text-xs px-2 py-0.5"
                style={{
                  backgroundColor: getPaymentMethodColor(method),
                  color: 'white',
                  border: 'none'
                }}
              >
                {method}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No methods</span>
          )}
          {bid.paymentInfo && bid.paymentInfo.length > 3 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              +{bid.paymentInfo.length - 3}
            </Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

// Helper function to assign colors to payment methods
function getPaymentMethodColor(method: string): string {
  const colors: Record<string, string> = {
    'ADCB': '#FF6B35',
    'Revolut': '#7C3AED',
    'AllPay': '#3B82F6',
    'In person': '#10B981',
    'Paysend': '#8B5CF6',
    'Wise': '#06B6D4',
    'Cash App': '#22C55E',
    'Zelle': '#6366F1',
    'Bank Transfer': '#F59E0B',
    'PayPal': '#0EA5E9',
  };
  return colors[method] || '#6B7280';
}
