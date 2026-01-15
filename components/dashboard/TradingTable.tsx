'use client';

import { useState, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Check } from 'lucide-react';
import { BidsWithUsers } from '@/db/queries/bids';
import { getAvatarInitial, getCompletionRate, formatPrice } from '@/lib/table-column-helper';
import { Badge } from '@/components/ui/badge';
import { TradeExpandedView } from './BuyExpandedView';
import { SellExpandedView } from './SellExpandedView';
import { TradingFilters } from './TradingFilters';
import { mockBids } from '@/lib/mock-bids';
import React from 'react';

interface TradingTableProps {
  bids: BidsWithUsers;
  currentPage: number;
  totalPages: number;
}

export function TradingTable({ bids, currentPage, totalPages }: TradingTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [favoriteBidIds, setFavoriteBidIds] = useLocalStorage<string[]>('favorite-bids', []);
  const [expandedBidId, setExpandedBidId] = useState<string | null>(null);

  // Get current trade type from URL (buy or sell)
  const currentTradeType = searchParams.get('type') || 'buy';

  // Use mock bids if no real bids are available (for testing)
  const displayBids = bids.length === 0 ? mockBids : bids;

  // Convert array to Set for efficient lookups
  const favorites = useMemo(() => new Set(favoriteBidIds), [favoriteBidIds]);

  const toggleFavorite = (id: string) => {
    setFavoriteBidIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((bidId) => bidId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedBidId((prev) => (prev === id ? null : id));
  };

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <>
      {/* Filters */}
      <TradingFilters />
      
      <Table className="border-separate border-spacing-y-2">
        <TableHeader>
          <TableRow className="bg-[#DBECFD08] rounded-xl">
            <TableHead className="w-12 rounded-l-xl">
              <div className="w-4 h-4 border border-[#3E3F4A] rounded-sm" />
            </TableHead>
            <TableHead className="text-[#7E7F8C]">Seller</TableHead>
            <TableHead className="text-[#7E7F8C]">Price</TableHead>
            <TableHead className="text-[#7E7F8C]">Order Limit</TableHead>
            <TableHead className="w-32 rounded-r-xl text-[#7E7F8C]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayBids.map((bid, index) => (
              <React.Fragment key={bid.id}>
                <TableRow key={bid.id} className={`rounded-xl ${index % 2 === 0 ? 'bg-[#0D171E]/20' : 'bg-[#0D171E]/60'}`}>
                  <TableCell className="rounded-l-xl">
                    <button
                      onClick={() => toggleFavorite(bid.id)}
                      className="cursor-pointer transition-colors"
                    >
                      <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${favorites.has(bid.id) ? 'border-[#3E3F4A]' : 'border-[#3E3F4A]'}`}>
                        {favorites.has(bid.id) && <Check className="w-3 h-3 text-primary" />}
                      </div>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                        {getAvatarInitial(bid)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {bid.creator.username ||
                              `${bid.creator.walletAddress.slice(0, 6)}...${bid.creator.walletAddress.slice(-4)}`}
                          </p>
                          <Badge variant="outline" className="text-xs text-green-500 border-green-500/20 bg-green-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                            Online
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {bid.creator.totalTrades || 0} Order(s) | {getCompletionRate(bid)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{formatPrice(bid.price, bid.fiatCurrency)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {(() => {
                        // Values are already human-readable from database
                        const minFormatted = Number(bid.minAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                        const maxFormatted = Number(bid.maxAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                        return `${minFormatted} - ${maxFormatted}`;
                      })()}
                    </p>
                  </TableCell>
                  <TableCell className="rounded-r-xl">
                    <Button variant="ghost" size="sm" onClick={() => toggleExpanded(bid.id)}>
                      {expandedBidId === bid.id ? 'Hide' : 'Start Trade'}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedBidId === bid.id && (
                  <TableRow key={`${bid.id}-expanded`}>
                    <TableCell colSpan={5} className="p-0">
                      <div className="px-4 py-4">
                        {currentTradeType === 'buy' ? (
                          <TradeExpandedView bid={bid} />
                        ) : (
                          <SellExpandedView bid={bid} />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    navigateToPage(currentPage - 1);
                  }
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {getPageNumbers().map((page, index) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToPage(page as number);
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) {
                    navigateToPage(currentPage + 1);
                  }
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
