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
// import { Check } from 'lucide-react';
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
          <TableRow className="bg-[#DBECFD08] rounded-lg!">
            <TableHead className="w-12 rounded-l-xl">
              <div className="w-5 h-5 ms-0.5 border border-[#7E7F8C] rounded-sm! cursor-pointer hover:border-white transition-all duration-300" />
            </TableHead>
            <TableHead className="text-[#7E7F8C]">Seller</TableHead>
            <TableHead className="text-[#7E7F8C]">Price</TableHead>
            <TableHead className="text-[#7E7F8C]">Order Limit</TableHead>
            <TableHead className="w-32 rounded-r-xl text-[#7E7F8C] text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayBids.map((bid, index) => (
            <React.Fragment key={bid.id}>
              <TableRow
                key={bid.id}
                className={`rounded-xl ${index % 2 === 0 ? 'bg-[#0D171E]/20' : 'bg-[#0D171E]/60'}`}
              >
                <TableCell className="rounded-l-xl">
                  <button onClick={() => toggleFavorite(bid.id)} className="cursor-pointer transition-colors">
                    {favorites.has(bid.id) ? (
                      // ACTIVE (filled) ICON
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                        <path
                          d="M11.8318 3.60622C11.8754 3.49989 11.9497 3.40893 12.0451 3.34491C12.1405 3.28089 12.2529 3.2467 12.3678 3.2467C12.4827 3.2467 12.595 3.28089 12.6904 3.34491C12.7859 3.40893 12.8601 3.49989 12.9037 3.60622L15.0938 8.87387C15.1348 8.97243 15.2022 9.05778 15.2886 9.12051C15.375 9.18325 15.477 9.22094 15.5834 9.22944L21.2705 9.68499C21.7848 9.72621 21.993 10.3683 21.6014 10.7033L17.2685 14.4157C17.1876 14.4849 17.1272 14.5751 17.0941 14.6764C17.0611 14.7776 17.0565 14.886 17.0809 14.9897L18.4053 20.5398C18.4319 20.6511 18.425 20.7679 18.3853 20.8753C18.3456 20.9826 18.275 21.0759 18.1823 21.1431C18.0897 21.2104 17.9792 21.2487 17.8648 21.2532C17.7504 21.2577 17.6372 21.2282 17.5396 21.1685L12.6698 18.1951C12.5788 18.1395 12.4743 18.1101 12.3678 18.1101C12.2612 18.1101 12.1567 18.1395 12.0658 18.1951L7.19598 21.1695C7.09833 21.2293 6.98516 21.2588 6.87076 21.2543C6.75636 21.2497 6.64587 21.2114 6.55323 21.1442C6.46059 21.0769 6.38997 20.9837 6.35028 20.8763C6.31059 20.7689 6.30361 20.6522 6.33023 20.5408L7.65462 14.9897C7.67918 14.8861 7.67466 14.7776 7.64157 14.6763C7.60847 14.575 7.54808 14.4848 7.46704 14.4157L3.13419 10.7033C3.04694 10.6289 2.98372 10.5303 2.95255 10.42C2.92137 10.3096 2.92364 10.1925 2.95907 10.0835C2.9945 9.97445 3.06149 9.87837 3.15156 9.80743C3.24163 9.73649 3.35072 9.69388 3.46503 9.68499L9.15215 9.22944C9.25856 9.22094 9.36057 9.18325 9.44694 9.12051C9.53332 9.05778 9.60071 8.97243 9.64171 8.87387L11.8318 3.60622Z"
                          fill="white"
                        />
                      </svg>
                    ) : (
                      // NORMAL (outline) ICON
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                        <path
                          d="M11.8318 3.60622C11.8754 3.49989 11.9497 3.40893 12.0451 3.34491C12.1405 3.28089 12.2529 3.2467 12.3678 3.2467C12.4827 3.2467 12.595 3.28089 12.6904 3.34491C12.7859 3.40893 12.8601 3.49989 12.9037 3.60622L15.0938 8.87386C15.1348 8.97243 15.2022 9.05778 15.2886 9.12051C15.375 9.18325 15.477 9.22094 15.5834 9.22944L21.2705 9.68499C21.7848 9.72621 21.993 10.3683 21.6014 10.7033L17.2685 14.4157C17.1876 14.4849 17.1272 14.5751 17.0941 14.6764C17.0611 14.7776 17.0565 14.886 17.0809 14.9897L18.4053 20.5398C18.4319 20.6511 18.425 20.7679 18.3853 20.8753C18.3456 20.9826 18.275 21.0759 18.1823 21.1431C18.0897 21.2104 17.9792 21.2487 17.8648 21.2532C17.7504 21.2577 17.6372 21.2282 17.5396 21.1685L12.6698 18.1951C12.5788 18.1395 12.4743 18.1101 12.3678 18.1101C12.2612 18.1101 12.1567 18.1395 12.0658 18.1951L7.19598 21.1695C7.09833 21.2293 6.98516 21.2588 6.87076 21.2543C6.75636 21.2497 6.64587 21.2114 6.55323 21.1442C6.46059 21.0769 6.38997 20.9837 6.35028 20.8763C6.31059 20.7689 6.30361 20.6522 6.33023 20.5408L7.65462 14.9897C7.67918 14.8861 7.67466 14.7776 7.64157 14.6763C7.60847 14.575 7.54808 14.4848 7.46704 14.4157L3.13419 10.7033C3.04694 10.6289 2.98372 10.5303 2.95255 10.42C2.92137 10.3096 2.92364 10.1925 2.95907 10.0835C2.9945 9.97445 3.06149 9.87837 3.15156 9.80743C3.24163 9.73649 3.35072 9.69388 3.46503 9.68499L9.15215 9.22944C9.25856 9.22094 9.36057 9.18325 9.44694 9.12051C9.53332 9.05778 9.60071 8.97243 9.64171 8.87386L11.8318 3.60622Z"
                          stroke="#7E7F8C"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9.75 h-9.75 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                      {getAvatarInitial(bid)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="font-medium text-sm md:text-[17px]">
                          {bid.creator.username ||
                            `${bid.creator.walletAddress.slice(0, 6)}...${bid.creator.walletAddress.slice(-4)}`}
                        </p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" fill="none">
                          <path
                            d="M12.1335 1.76325L7.99275 0.20925C7.24875 -0.06975 6.43875 -0.06975 5.70375 0.20925L1.554 1.76325C0.62325 2.1165 0 3.0195 0 4.01475V8.22075C0 10.0537 0.83775 11.6355 1.935 12.9292C3.024 14.2132 4.3635 15.2092 5.3685 15.8512C5.8245 16.14 6.336 16.2885 6.84825 16.2885C7.3605 16.2885 7.872 16.14 8.328 15.8512C10.3282 14.5672 13.6972 11.8777 13.6972 8.22075V4.01475C13.6972 3.0195 13.0635 2.1165 12.1335 1.76325ZM10.2165 6.5925L7.146 9.654C6.8295 9.9705 6.411 10.1287 6.0015 10.1287C5.583 10.1287 5.16375 9.9705 4.848 9.654L3.64725 8.45325C3.36825 8.18325 3.36825 7.737 3.64725 7.467C3.91725 7.188 4.3545 7.188 4.6335 7.467L5.8335 8.66775C5.9265 8.76075 6.066 8.76075 6.159 8.66775L9.2295 5.60625C9.4995 5.32725 9.93675 5.32725 10.2157 5.60625C10.4857 5.87625 10.4865 6.3225 10.2165 6.5925Z"
                            fill="white"
                          />
                        </svg>
                        <Badge
                          variant="outline"
                          className="text-xs text-[#25E297] border-[rgba(37,226,151,0.02)] bg-[rgba(37,226,151,0.09)] rounded-full"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#25E297] mr-0.5"></span>
                          Online
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {bid.creator.totalTrades || 0} Order(s) | {getCompletionRate(bid)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm md:text-[17px] font-medium capitalize text-white/80">
                    {formatPrice(bid.price, bid.fiatCurrency)}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm md:text-[17px] font-medium capitalize text-white/80">
                    {(() => {
                      // Values are already human-readable from database
                      const minFormatted = Number(bid.minAmount).toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                      });
                      const maxFormatted = Number(bid.maxAmount).toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                      });
                      return `${minFormatted} - ${maxFormatted}`;
                    })()}
                  </p>
                </TableCell>
                <TableCell className="rounded-r-xl">
                  <Button
                    className="min-w-22.25 flex items-center gap-1.5 bg-[rgba(65,253,254,0.03)] border border-solid border-[rgba(219,236,253,0.10)] rounded-[7px] text-[#41FDFE] text-xs font-medium hover:bg-[rgba(219,236,253,0.10)] hover:border-[rgba(219,236,253,0.20)] transition-all duration-300"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(bid.id)}
                  >
                    {expandedBidId === bid.id ? 'Hide' : 'Start Trade'}
                    {expandedBidId === bid.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2.25 7.875L6 4.125L9.75 7.875"
                          stroke="#DBECFD"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
              {expandedBidId === bid.id && (
                <TableRow key={`${bid.id}-expanded`}>
                  <TableCell colSpan={5} className="p-0 rounded-xl! bg-[rgba(219,236,253,0.05)]">
                    <div className="px-4 py-4 rounded-xl!">
                      {currentTradeType === 'buy' ? <TradeExpandedView bid={bid} /> : <SellExpandedView bid={bid} />}
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
