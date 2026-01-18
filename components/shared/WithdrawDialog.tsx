'use client';

import { useState } from 'react';
import { type Address } from 'viem';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useVaultWithdraw } from '@/hooks/use-vault-withdraw';
import { useVaultBalance } from '@/hooks/use-vault-balance';
import type { Token } from '@/lib/tokens';

interface WithdrawDialogProps {
  tokens: Token[];
  defaultToken?: Address;
}

export function WithdrawDialog({ tokens, defaultToken }: WithdrawDialogProps) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Address | undefined>(defaultToken);

  const selectedTokenData = tokens.find((t) => t.address === selectedToken);
  const decimals = selectedTokenData?.decimals || 18;

  const { withdraw, isLoading: isWithdrawing } = useVaultWithdraw();
  const { balance: vaultBalance, isLoading: isLoadingVault } = useVaultBalance(selectedToken, decimals);

  const handleWithdraw = async () => {
    if (!selectedToken || !withdrawAmount) return;

    await withdraw({
      tokenAddress: selectedToken,
      amount: withdrawAmount,
      decimals
    });

    setWithdrawAmount('');
    setOpen(false);
  };

  const handleMaxWithdraw = () => {
    if (vaultBalance?.availableFormatted) {
      setWithdrawAmount(vaultBalance.availableFormatted);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='w-[130px] h-[44px] text-md relative bg-gradient-to-b from-[#FFFFFF05] to-[#FFFFFF15] border border-transparent text-white hover:bg-[#FFFFFF1A] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] before:absolute before:inset-0 before:rounded-[100px] before:p-[1px] before:bg-gradient-to-b before:from-[#FFFFFF40] before:to-[#FFFFFF10] before:-z-10 before:content-[""]'>
          <Image src="/icons/withdraw.svg" alt="Withdraw" width={15} height={15} />
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image src="/icons/withdraw.svg" alt="Withdraw" width={15} height={15} />
            Withdraw from Vault
          </DialogTitle>
          <DialogDescription>
            Withdraw available {selectedTokenData?.symbol || 'tokens'} back to wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={isWithdrawing}
                  className="flex-1"
                />
                <Select value={selectedToken} onValueChange={(value: string) => setSelectedToken(value as Address)}>
                  <SelectTrigger className="w-[120px] min-h-12">
                    <SelectValue placeholder="Token">
                      {selectedToken && selectedTokenData?.logoURI && (
                        <div className="flex items-center gap-2">
                          <Image
                            src={selectedTokenData.logoURI}
                            alt={selectedTokenData.symbol}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <span>{selectedTokenData.symbol}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.address} value={token.address}>
                        <div className="flex items-center gap-2">
                          {token.logoURI && (
                            <Image
                              src={token.logoURI}
                              alt={token.symbol}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          )}
                          <span>{token.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={handleMaxWithdraw}
                disabled={isWithdrawing || !vaultBalance?.availableFormatted}
                className="min-h-12"
              >
                Max
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Available: {isLoadingVault ? '...' : vaultBalance?.availableFormatted || '0'} {selectedTokenData?.symbol}
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleWithdraw}
            disabled={isWithdrawing || !withdrawAmount || Number(withdrawAmount) <= 0}
          >
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
