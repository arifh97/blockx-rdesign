'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import { Info, ClipboardCopy } from 'lucide-react';
import Image from 'next/image';
import { WithdrawStepper } from './WithdrawStepper';
import { useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';
import { isAddress } from 'viem';
import { getTokensByChain, getTokenBySymbol } from '@/lib/tokens';
import { useChainId } from 'wagmi';
import { useTokenBalance } from '@/hooks/use-token-balance';
import { useTokenTransfer } from '@/hooks/use-token-transfer';
import { useTransferFee } from '@/hooks/use-transfer-fee';
import { toast } from 'sonner';
import type { Address } from 'viem';
import { useEffect } from 'react';

const withdrawSchema = z.object({
  address: z.string().min(1, 'Address is required').refine(
    (val) => isAddress(val),
    'Invalid Ethereum address'
  ),
  asset: z.string().min(1, 'Please select an asset'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  )
});

export function WithdrawForm() {
  const chainId = useChainId();
  const supportedTokens = getTokensByChain(chainId);
  const { transfer, isLoading: isTransferring } = useTokenTransfer();
  const { estimate: estimateFee, fee, isLoading: isEstimatingFee } = useTransferFee();

  const form = useForm({
    defaultValues: {
      address: '',
      asset: '',
      amount: ''
    },
    validators: {
      onChange: withdrawSchema
    },
    onSubmit: async ({ value }) => {
      const token = getTokenBySymbol(chainId, value.asset);
      
      if (!token) {
        toast.error('Please select a valid token');
        return;
      }

      let adjustedAmount = value.amount;
      if (token.isNative && fee) {
        const requestedAmount = parseFloat(value.amount);
        const feeBuffer = parseFloat(fee.maxFeeEth) * 10;
        const amountAfterFee = requestedAmount - feeBuffer;
        
        if (amountAfterFee <= 0) {
          toast.error('Insufficient balance to cover network fees', {
            description: `Fee estimate: ${fee.maxFeeEth} ETH`,
          });
          return;
        }
        
        adjustedAmount = amountAfterFee.toString();
      }

      await transfer({
        tokenAddress: token.address,
        to: value.address as Address,
        amount: adjustedAmount,
        decimals: token.decimals,
      });
    }
  });

  // Subscribe to form state for reactivity
  const selectedAsset = useStore(form.store, (state) => state.values.asset);
  const addressValue = useStore(form.store, (state) => state.values.address);
  const amountValue = useStore(form.store, (state) => state.values.amount);

  // Get selected token details
  const selectedToken = selectedAsset ? getTokenBySymbol(chainId, selectedAsset) : undefined;
  
  // Get token address (undefined if no token selected)
  const tokenAddress = selectedToken?.address as `0x${string}` | undefined;

  // Fetch token balance
  // - undefined: no token selected, won't fetch
  // - 0x0000...0000: native ETH, will fetch native balance
  // - 0x...: ERC20 token, will fetch token balance
  const { balance, isLoading: isLoadingBalance } = useTokenBalance(tokenAddress);
  const availableBalance = parseFloat(balance) || 0;

  // Estimate fee when all required fields are filled
  useEffect(() => {
    if (selectedToken && addressValue && amountValue && isAddress(addressValue)) {
      estimateFee({
        tokenAddress: selectedToken.address,
        to: addressValue as Address,
        amount: amountValue,
        decimals: selectedToken.decimals,
      })
    }
  }, [selectedToken, addressValue, amountValue, estimateFee]);

  const networkFee = fee ? parseFloat(fee.maxFeeEth) : 0;

  // Track completion of each step independently
  const completedSteps = [
    !!addressValue,  // Step 1: Send To
    !!selectedAsset,    // Step 2: Asset
    !!amountValue    // Step 3: Withdrawal Amount
  ];

  const allStepsCompleted = completedSteps.every(step => step);

  const calculateReceiveAmount = () => {
    const amountNum = parseFloat(amountValue) || 0;
    return (amountNum - networkFee).toFixed(6);
  };

  const handleMaxClick = () => {
    form.setFieldValue('amount', availableBalance.toString());
  };

  return (
    <Card 
      className="p-6 rounded-3xl border-0 max-w-2xl mx-auto bg-[radial-gradient(circle_at_0%_0%,_#3bf9ff_0%,_#52a4fd60_12%,_#52a4fd30_16%,_transparent_20%,_transparent_100%)]"
    >
      <h2 className="text-2xl font-semibold mb-8">Enter Withdrawal Details</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex gap-8">
          {/* Stepper */}
          <WithdrawStepper completedSteps={completedSteps} totalSteps={3} />

          {/* Form Content */}
          <div className="flex-1 space-y-6">
            {/* Send To Section */}
            <form.Field
              name="address"
              children={(field) => (
                <Field>
                  <FieldLabel className="text-sm">Send To</FieldLabel>
                  <FieldContent>
                    <InputGroup className="bg-[#FFFFFF08] border-0 rounded-xl min-h-[50px]">
                      <InputGroupInput
                        placeholder="Enter Address"
                        className="placeholder:text-[#7E7F8C]"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-sm"
                          onClick={async () => {
                            try {
                              const text = await navigator.clipboard.readText();
                              field.handleChange(text);
                            } catch (err) {
                              console.error('Failed to read clipboard:', err);
                            }
                          }}
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldError errors={field.state.meta.errors} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Asset Section */}
            <form.Field
              name="asset"
              children={(field) => (
                <Field>
                  <FieldLabel className="text-sm">Asset</FieldLabel>
                  <FieldContent>
                    <Select 
                      value={field.state.value} 
                      onValueChange={(value) => {
                        field.handleChange(value);
                        // Clear amount when token changes
                        form.setFieldValue('amount', '');
                      }}
                    >
                      <SelectTrigger className="bg-[#FFFFFF08] border-0 rounded-xl w-full min-h-[50px] placeholder:text-[#7E7F8C]">
                        {selectedToken ? (
                          <div className="flex items-center gap-2">
                            {selectedToken.logoURI && (
                              <Image 
                                src={selectedToken.logoURI} 
                                alt={selectedToken.symbol} 
                                width={24} 
                                height={24} 
                                className="rounded-full"
                              />
                            )}
                            <span>{selectedToken.symbol} - {selectedToken.name}</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Select Crypto" className="placeholder:text-[#7E7F8C]" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {supportedTokens.map((token) => (
                          <SelectItem key={token.symbol} value={token.symbol.toLowerCase()}>
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
                              <span>{token.symbol} - {token.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Withdrawal Amount Section */}
            <form.Field
              name="amount"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Amount is required';
                  const numValue = parseFloat(value);
                  if (isNaN(numValue) || numValue <= 0) return 'Amount must be a positive number';
                  if (selectedToken && numValue > availableBalance) {
                    return `Insufficient balance. Available: ${availableBalance.toFixed(4)} ${selectedToken.symbol}`;
                  }
                  return undefined;
                }
              }}
              children={(field) => (
                <Field>
                  <FieldLabel className="text-sm">Withdrawal Amount</FieldLabel>
                  <FieldContent>
                    <InputGroup className="bg-[#FFFFFF08] border-0 rounded-xl min-h-[50px]">
                      <InputGroupInput
                        placeholder="Enter Amount"
                        className="placeholder:text-[#7E7F8C]"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        type="number"
                      />
                      <InputGroupAddon align="inline-end">
                        <span className="text-sm">
                          {selectedToken?.symbol || 'Token'}
                        </span>
                        <InputGroupButton
                          size="sm"
                          onClick={handleMaxClick}
                          className="text-primary hover:text-primary"
                          disabled={!selectedToken}
                        >
                          MAX
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldError errors={field.state.meta.errors.map(err => typeof err === 'string' ? { message: err } : err)} />
                  </FieldContent>
                </Field>
              )}
            />

             {/* Available Balance */}
             <div className="flex items-center justify-between text-sm mt-4">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>Available To Withdraw</span>
                      </div>
                      <span className="font-medium">
                        {isLoadingBalance ? 'Loading...' : `${availableBalance.toFixed(4)} ${selectedToken?.symbol || ''}`}
                      </span>
                    </div>

                    {/* Receive Amount */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#FFFFFF1A]">
                      <span className="text-sm">Receive Amount</span>
                      <span className="text-2xl font-semibold">{calculateReceiveAmount()}</span>
                    </div>

                    {/* Network Fee */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Network Fee</span>
                      <span className="text-sm font-medium">
                        {isEstimatingFee ? 'Estimating...' : `${networkFee.toFixed(9)} ETH`}
                      </span>
                    </div>

            {/* Withdraw Button */}
            <Button 
              type="submit"
              className="w-full h-14 text-lg font-semibold rounded-full mt-6"
              disabled={!allStepsCompleted || isTransferring}
            >
              {isTransferring ? 'Processing...' : 'Withdraw'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
