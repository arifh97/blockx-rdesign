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
    <div className="flex items-center justify-between">
      {/* Balance Section */}
      <div>
        <p className="text-sm font-medium mb-1">Balance</p>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl">
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
            <SelectTrigger className="h-6 w-6 p-0 border-0 bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 shadow-none data-[state=open]:ring-0 [&>svg]:opacity-100 [&>svg]:h-6 [&>svg]:w-6" />
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
        <Button className='w-[130px] h-[44px] text-md relative bg-gradient-to-b from-[#FFFFFF05] to-[#FFFFFF15] border border-transparent text-white hover:bg-[#FFFFFF1A] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] before:absolute before:inset-0 before:rounded-[100px] before:p-[1px] before:bg-gradient-to-b before:from-[#FFFFFF40] before:to-[#FFFFFF10] before:-z-10 before:content-[""]'>
          <Image src="/icons/deposit.svg" alt="Deposit" width={15} height={15} />
          Deposit
        </Button>
        <Button
          asChild
          className='w-[130px] h-[44px] text-md relative bg-gradient-to-b from-[#FFFFFF05] to-[#FFFFFF15] border border-transparent text-white hover:bg-[#FFFFFF1A] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] before:absolute before:inset-0 before:rounded-[100px] before:p-[1px] before:bg-gradient-to-b before:from-[#FFFFFF40] before:to-[#FFFFFF10] before:-z-10 before:content-[""]'
        >
          <Link href="/withdraw">
            <Image src="/icons/withdraw.svg" alt="Withdraw" width={15} height={15} />
            Withdraw
          </Link>
        </Button>
        {/* <Button className="min-w-[150px] min-h-[50px] text-md">
          <ArrowRightLeft className="size-6" />
          Swap
        </Button> */}
      </div>
    </div>
  );
}
