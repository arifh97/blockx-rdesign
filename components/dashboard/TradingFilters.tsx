'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useChainId } from 'wagmi';
import { getTokensByChain } from '@/lib/tokens';
import { useDebounceValue } from 'usehooks-ts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useCallback, useState } from 'react';
import { PAYMENT_METHODS, PAYMENT_METHOD_CODES } from '@/lib/constants';
// import { SUPPORTED_CHAINS } from '@/lib/chains';
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

  const updateFilters = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Reset to page 1 when filters change
      params.set('page', '1');

      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Update URL when debounced amount changes
  useEffect(() => {
    if (debouncedAmount !== currentAmount) {
      updateFilters('amount', debouncedAmount);
    }
  }, [debouncedAmount, updateFilters, currentAmount]);

  return (
    <div className="flex flex-wrap items-center gap-3 mt-8">
      {/* Token Filter */}
      <Select value={currentToken || 'all'} onValueChange={(value) => updateFilters('token', value)}>
        <SelectTrigger className="min-w-34.5 min-h-12.5 bg-[#DBECFD0D] backdrop-blur-[31px] border-0 rounded-[12px] cursor-pointer text-[17px] font-medium text-[#7E7F8C] capitalize">
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
                    <img src={token.logoURI} alt={token.symbol} width={20} height={20} className="rounded-full" />
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

      {/* Payment Method Filter */}
      <Select value={currentPaymentMethod || 'all'} onValueChange={(value) => updateFilters('payment', value)}>
        <SelectTrigger className="min-w-62 min-h-12.5 cursor-pointer bg-[#DBECFD0D] backdrop-blur-[31px] border-0 rounded-[12px] text-[17px] font-medium text-[#7E7F8C] capitalize">
          <SelectValue placeholder="Payment Methods" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <img src="wallet.svg" alt="" /> Payment Methods
          </SelectItem>
          {PAYMENT_METHOD_CODES.map((code) => (
            <SelectItem key={code} value={code}>
              {PAYMENT_METHODS[code].name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Amount Filter */}
      <div className="w-61.25 min-h-12.5 bg-[#DBECFD0D] backdrop-blur-[31px] border-0 rounded-[12px]">
        <Input
          type="number"
          placeholder="Enter Amount"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          className=" text-[17px] font-medium capitalize placeholder:text-[17px] placeholder:font-medium text-[#7E7F8C]"
        />
        <span className="absolute right-3.75 top-1/2 -translate-y-1/2 text-white text-[17px] font-medium capitalize">
          BTC
        </span>
      </div>

      {/* Buy/Sell Toggle Switch */}
      <div className="flex items-center ml-auto bg-[#DBECFD0D] rounded-[11px] p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateFilters('type', 'buy')}
          className={`min-h-[50px] min-w-[100px] text-[17px] font-semibold capitalize rounded-[12px] px-6 transition-all border-0 ${
            currentTradeType === 'buy'
              ? 'bg-primary text-black font-semibold hover:bg-primary/90'
              : 'text-muted-foreground bg-transparent'
          }`}
        >
          Buy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateFilters('type', 'sell')}
          className={`min-h-[50px] min-w-[100px] text-[17px] font-semibold capitalize rounded-[12px] px-6 transition-all border-0 ${
            currentTradeType === 'sell'
              ? 'bg-primary text-black font-semibold hover:bg-primary/90'
              : 'text-muted-foreground bg-transparent '
          }`}
        >
          Sell
        </Button>
      </div>
    </div>
  );
}
