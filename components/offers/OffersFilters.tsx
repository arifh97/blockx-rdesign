'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useChainId } from 'wagmi';
import { getTokensByChain } from '@/lib/tokens';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PAYMENT_METHODS, PAYMENT_METHOD_CODES, BID_STATUSES } from '@/lib/constants';

export function OffersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const tokens = getTokensByChain(chainId);

  // Get current filter values from URL
  const currentStatus = searchParams.get('status') || '';
  const currentAsset = searchParams.get('asset') || '';
  const currentPaymentMethod = searchParams.get('payment') || '';

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
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Status Filter */}
      <Select 
        value={currentStatus || 'all'} 
        onValueChange={(value) => updateFilters('status', value)}
      >
        <SelectTrigger className="min-w-[200px] min-h-[50px] bg-[#DBECFD0D] backdrop-blur-md border-0">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {BID_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Asset Filter */}
      <Select 
        value={currentAsset || 'all'} 
        onValueChange={(value) => updateFilters('asset', value)}
      >
        <SelectTrigger className="min-w-[200px] min-h-[50px] bg-[#DBECFD0D] backdrop-blur-md border-0">
          <SelectValue placeholder="Asset" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assets</SelectItem>
          {tokens
            .filter((token) => !token.isNative)
            .map((token) => (
              <SelectItem key={token.address} value={token.address}>
                {token.symbol}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Payment Method Filter */}
      <Select
        value={currentPaymentMethod || 'all'}
        onValueChange={(value) => updateFilters('payment', value)}
      >
        <SelectTrigger className="min-w-[200px] min-h-[50px] bg-[#DBECFD0D] backdrop-blur-md border-0">
          <SelectValue placeholder="Payment Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Methods</SelectItem>
          {PAYMENT_METHOD_CODES.map((code) => (
            <SelectItem key={code} value={code}>
              {PAYMENT_METHODS[code].name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
