'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useChainId } from 'wagmi';
import { getTokensByChain } from '@/lib/tokens';
import { useDebounceValue } from 'usehooks-ts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useCallback, useState } from 'react';
import { PAYMENT_METHODS, PAYMENT_METHOD_CODES } from '@/lib/constants';
import { SUPPORTED_CHAINS } from '@/lib/chains';
import Image from 'next/image';

export function TradingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const tokens = getTokensByChain(chainId);

  // Get current filter values from URL
  const currentToken = searchParams.get('token') || '';
  const currentChain = searchParams.get('chain') || '';
  const currentPaymentMethod = searchParams.get('payment') || '';
  const currentAmount = searchParams.get('amount') || '';
  const currentTradeType = searchParams.get('type') || 'buy';

  // Immediate input state for responsive UI
  const [amountInput, setAmountInput] = useState(currentAmount);
  
  // Debounced value for filter updates
  const [debouncedAmount] = useDebounceValue(amountInput, 1000);

  const updateFilters = useCallback((key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  // Update URL when debounced amount changes
  useEffect(() => {
    if (debouncedAmount !== currentAmount) {
      updateFilters('amount', debouncedAmount);
    }
  }, [debouncedAmount, updateFilters, currentAmount]);

  return (
    <div className="flex flex-wrap items-center gap-3 mt-12">
      {/* Token Filter */}
      <Select 
        value={currentToken || 'all'} 
        onValueChange={(value) => updateFilters('token', value)}
      >
        <SelectTrigger className="min-w-[200px] min-h-[50px] bg-[#DBECFD0D] backdrop-blur-md border-0">
          <SelectValue placeholder="Select Token" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tokens</SelectItem>
          {tokens
            .filter((token) => !token.isNative)
            .map((token) => (
              <SelectItem key={token.address} value={token.address}>
                <div className="flex items-center gap-2">
                  {token.logoURI ? (
                    <Image
                      src={token.logoURI}
                      alt={token.symbol}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center text-sm bg-muted rounded-full">
                      {token.symbol.charAt(0)}
                    </span>
                  )}
                  {token.symbol}
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Chain Filter */}
      <Select
        value={currentChain || 'all'}
        onValueChange={(value) => updateFilters('chain', value)}
      >
        <SelectTrigger className="min-w-[200px] min-h-[50px] bg-[#DBECFD0D] backdrop-blur-md border-0">
          <SelectValue placeholder="Select Chain" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Chains</SelectItem>
          {SUPPORTED_CHAINS.map((chain) => (
            <SelectItem key={chain.chain.id} value={chain.chain.id.toString()}>
              <div className="flex items-center gap-2">
                {chain.logo ? (
                  <Image
                    src={chain.logo}
                    alt={chain.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <span className="w-5 h-5 flex items-center justify-center text-sm">{chain.icon}</span>
                )}
                {chain.name}
              </div>
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
          <SelectValue placeholder="Payment Methods" />
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

      {/* Amount Filter */}
      <Input
        type="number"
        placeholder="Enter Amount"
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
        className="w-[200px] min-h-[50px] bg-[#DBECFD0D] backdrop-blur-md border-0"
      />

      {/* Buy/Sell Toggle Switch */}
      <div className="flex items-center ml-auto bg-[#DBECFD0D] rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateFilters('type', 'buy')}
          className={`min-h-[50px] min-w-[100px] rounded-lg px-6 transition-all border-0 ${
            currentTradeType === 'buy'
              ? 'bg-primary text-black font-semibold hover:bg-primary/90'
              : 'text-muted-foreground bg-transparent'
          }`}
        >
          Buy Crypto
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateFilters('type', 'sell')}
          className={`min-h-[50px] min-w-[100px] rounded-lg px-6 transition-all border-0 ${
            currentTradeType === 'sell'
              ? 'bg-primary text-black font-semibold hover:bg-primary/90'
              : 'text-muted-foreground bg-transparent '
          }`}
        >
          Sell Crypto
        </Button>
      </div>

    </div>
  );
}
