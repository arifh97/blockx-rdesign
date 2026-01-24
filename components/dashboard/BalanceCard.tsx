'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useTokenBalance } from '@/hooks/use-token-balance';
import { getTokensByChain, NATIVE_TOKEN, type Token } from '@/lib/tokens';
import { useChainId } from 'wagmi';
interface BalanceCardProps {
  initialTokenAddress?: string;
}

export function BalanceCard({ initialTokenAddress }: BalanceCardProps) {
  const chainId = useChainId();
  const supportedTokens = getTokensByChain(chainId);

  // Initialize selected token from initialTokenAddress or default to NATIVE_TOKEN
  const [selectedToken, setSelectedToken] = useState<Token>(() => {
    if (initialTokenAddress) {
      const token = supportedTokens.find((t) => t.address.toLowerCase() === initialTokenAddress.toLowerCase());
      if (token) return token;
    }
    return NATIVE_TOKEN;
  });

  const { balance, isLoading } = useTokenBalance(selectedToken.address);

  // Format balance for display
  // If balance < 1: show up to 4 decimal places, remove trailing zeros (e.g. 0.1234, 0.12)
  // If balance >= 1: always show 2 decimal places (e.g. 7,000.00)
  // Never remove significant digits
  const formatBalance = useMemo(() => {
    const num = parseFloat(balance);
    if (isNaN(num)) return { whole: '0', decimal: '00' };

    if (num >= 1) {
      // Always show 2 decimals for >= 1
      const parts = num.toFixed(2).split('.');
      const whole = parseFloat(parts[0]).toLocaleString('en-US');
      return { whole, decimal: parts[1] };
    } else {
      // Show up to 4 decimals, remove trailing zeros
      const parts = num.toFixed(4).split('.');
      const whole = parts[0];
      const decimal = (parts[1] || '').replace(/0+$/, '');
      return { whole, decimal };
    }
  }, [balance]);

  return (
    <div className="flex items-start justify-between">
      {/* Balance Section */}
      <div>
        <p className="text-sm lg:text-lg font-medium mb-1 text-white/50">Balance</p>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl lg:text-[34px] font-medium text-white flex">
            {isLoading ? (
              'Loading...'
            ) : (
              <>
                {selectedToken.symbol} {formatBalance.whole}
                {formatBalance.decimal && <span>.{formatBalance.decimal}</span>}
              </>
            )}
          </h2>
          <Select
            value={selectedToken.address}
            onValueChange={(value) => {
              const token = supportedTokens.find((t) => t.address === value);
              if (token) {
                setSelectedToken(token);
              }
            }}
          >
            <div className="h-7.75 w-7.75! bg-[rgba(255,255,255,0.04)] rounded-full inline-flex justify-center items-center p-0 border-transparent border-solid hover:border-white! transition-all cursor-pointer">
              <SelectTrigger className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0  border-transparent bg-transparent shadow-none data-[state=open]:ring-0 [&>svg]:opacity-100 [&>svg]:h-6.75 [&>svg]:w-6.75 cursor-pointer" />
            </div>
            <SelectContent>
              {supportedTokens.map((token) => (
                <SelectItem key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="w-32.5 h-11 text-base relative text-white bg-transparent">
          <img src="btn-bg.png" className="absolute top-0 left-0 w-full h-full -z-1" alt="" />
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M16.25 3.75L3.75 16.25M3.75 16.25H13.125M3.75 16.25V6.875" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Deposit
        </Button>
        <Button asChild className="w-[130px] h-[44px] text-base relative text-white bg-transparent">
          <Link href="/withdraw">
            <img src="btn-bg.png" className="absolute top-0 left-0 w-full h-full -z-1" alt="" />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3.75 16.25L16.25 3.75M16.25 3.75H6.875M16.25 3.75V13.125" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Withdraw
          </Link>
        </Button>

        <Button className="w-[130px] h-[44px] text-base relative text-[#071017] bg-[#41FDFE]">
          <img src="btn-bg.png" className="absolute top-0 left-0 w-full h-full -z-1" alt="" />
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M13.125 0.75L17.25 4.875M17.25 4.875L13.125 9M17.25 4.875L4.875 4.875M4.875 17.25L0.749999 13.125M0.749999 13.125L4.875 9M0.749999 13.125L13.125 13.125" stroke="#071017" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Swap
        </Button>
        {/* <Button className="min-w-[150px] min-h-[50px] text-md">
          <ArrowRightLeft className="size-6" />
          Swap
        </Button> */}
      </div>
    </div>
  );
}
