'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar as CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Order statuses
const ORDER_STATUSES = [
  'open',
  'locked',
  'pending_payment',
  'payment_sent',
  'completed',
  'cancelled',
  'cancel_requested',
  'disputed',
] as const;

// Human-readable labels for statuses
const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  locked: 'Locked',
  pending_payment: 'Pending',
  payment_sent: 'Payment Sent',
  completed: 'Completed',
  cancelled: 'Cancelled',
  cancel_requested: 'Cancel Requested',
  disputed: 'Disputed',
};

// Asset options
const ASSETS = ['USDT', 'USDC', 'ETH', 'BTC'] as const;

// Payment types
const PAYMENT_TYPES = ['Bank Transfer', 'Mobile App', 'Cash In-Person', 'Cash Deposit'] as const;

// Payment methods (simplified)
const PAYMENT_METHODS = ['Wise', 'Revolut', 'Bank Transfer', 'Cash'] as const;

export function OrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

  // Get current filter values from URL
  const currentStatus = searchParams.get('status') || '';
  const currentAsset = searchParams.get('asset') || '';
  const currentPaymentType = searchParams.get('paymentType') || '';
  const currentPaymentMethod = searchParams.get('paymentMethod') || '';

  const updateFilters = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <Select 
          value={currentStatus || 'all'} 
          onValueChange={(value) => updateFilters('status', value)}
        >
          <SelectTrigger className="min-w-[120px] min-h-[40px] text-[#7E7F8C] bg-[#DBECFD0D] border-0 rounded-lg text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status] || status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Asset Filter */}
        <Select 
          value={currentAsset || 'all'} 
          onValueChange={(value) => updateFilters('asset', value)}
        >
          <SelectTrigger className="min-w-[100px] min-h-[40px] text-[#7E7F8C] bg-[#DBECFD0D] border-0 rounded-lg text-sm">
            <SelectValue placeholder="Asset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assets</SelectItem>
            {ASSETS.map((asset) => (
              <SelectItem key={asset} value={asset}>
                {asset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Type Filter */}
        <Select 
          value={currentPaymentType || 'all'} 
          onValueChange={(value) => updateFilters('paymentType', value)}
        >
          <SelectTrigger className="min-w-[140px] min-h-[40px] text-[#7E7F8C] bg-[#DBECFD0D] border-0 rounded-lg text-sm">
            <SelectValue placeholder="Payment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PAYMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Method Filter */}
        <Select 
          value={currentPaymentMethod || 'all'} 
          onValueChange={(value) => updateFilters('paymentMethod', value)}
        >
          <SelectTrigger className="min-w-[160px] min-h-[40px] text-[#7E7F8C] bg-[#DBECFD0D] border-0 rounded-lg text-sm">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            className="min-h-[40px] text-[#7E7F8C] hover:text-black bg-[#DBECFD0D] border-0 rounded-lg text-sm gap-2"
          >
            <span>
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                  </>
                ) : (
                  format(dateRange.from, "MMM d, yyyy")
                )
              ) : (
                "Date Range"
              )}
            </span>
            <CalendarIcon className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            className="rounded-lg border-0"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
