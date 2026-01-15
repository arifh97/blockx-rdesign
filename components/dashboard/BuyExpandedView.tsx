'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { BidsWithUsers } from '@/db/queries/bids';
import { getTokenSymbol, getTokenByAddressAcrossChains } from '@/lib/tokens';
import { formatPrice } from '@/lib/table-column-helper';
import { PAYMENT_METHODS } from '@/lib/constants';
import { type Address } from 'viem';
import { useCreateOrder } from '@/hooks/use-create-order';
import { toast } from 'sonner';
import { toContractValue } from '@/lib/contract-utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FIAT_CURRENCIES } from '@/lib/constants';
import { getChainLogo, getChainName } from '@/lib/chains';

type TradeExpandedViewProps = {
  bid: BidsWithUsers[number];
};

export function TradeExpandedView({ bid }: TradeExpandedViewProps) {
  const router = useRouter();
  const tokenSymbol = getTokenSymbol(bid.fromToken as Address);
  const { createOrder, isLoading } = useCreateOrder();

  // Get token decimals and logo
  const token = getTokenByAddressAcrossChains(bid.fromToken as Address);
  const tokenDecimals = token?.decimals || 18;
  const tokenLogoURI = token?.logoURI;

  // Get fiat currency info
  const fiatCurrency = FIAT_CURRENCIES.find((c) => c.code === bid.fiatCurrency);
  const fiatLogoURI = fiatCurrency?.logoURI || '/currencies/dollar.svg';

  // Values are already human-readable from database
  const actualPrice = parseFloat(bid.price);
  const minAmount = parseFloat(bid.minAmount);
  const maxAmount = parseFloat(bid.maxAmount);
  
  // Calculate min/max fiat amounts based on crypto limits
  const minFiatAmount = minAmount * actualPrice;
  const maxFiatAmount = maxAmount * actualPrice;
  
  // User input for fiat amount they want to pay
  const [payAmount, setPayAmount] = useState<string>(minFiatAmount.toFixed(2));
  const payAmountNum = parseFloat(payAmount) || 0;
  
  // Calculate crypto amount to receive: fiatAmount / price
  const receiveAmountNum = payAmountNum / actualPrice;
  const receiveAmount = receiveAmountNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  

  // Validation - check if the calculated crypto amount is within limits
  const isAmountValid = receiveAmountNum >= minAmount && receiveAmountNum <= maxAmount && payAmountNum > 0;
  const amountError = payAmountNum === 0
    ? null
    : receiveAmountNum < minAmount 
    ? `Minimum: ${minFiatAmount.toFixed(2)} ${bid.fiatCurrency}`
    : receiveAmountNum > maxAmount 
    ? `Maximum: ${maxFiatAmount.toFixed(2)} ${bid.fiatCurrency}`
    : null;

  const handleBuy = async () => {
    if (!isAmountValid) {
      toast.error(amountError || 'Invalid amount');
      return;
    }

    try {
      // Convert the calculated crypto amount to contract format
      const amountInWei = toContractValue(receiveAmountNum.toString(), tokenDecimals);
      const result = await createOrder({
        bidHash: bid.bidHash,
        amount: amountInWei.toString(),
      });

      // Redirect to order page on success
      if (result.orderId) {
        router.push(`/orders/${result.orderId}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  // Get payment method codes (already fetched from junction tables in query)
  const paymentMethodCodes: string[] = bid.paymentMethodCodes || [];

  // Map payment method codes to display names
  const paymentMethodNames = paymentMethodCodes
    .map(code => PAYMENT_METHODS[code]?.name || code)
    .join(', ');

  // Get chain info
  const chainLogo = getChainLogo(bid.chainId);
  const chainName = getChainName(bid.chainId);

  return (
    <div className="bg-[#0A151C] rounded-xl p-6 border border-[#DBECFD20] relative">
      {/* Chain Icon - Top Right */}
      {chainLogo && (
        <div className="absolute top-4 right-4" title={chainName}>
          <Image
            src={chainLogo}
            alt={chainName}
            width={28}
            height={28}
            className="rounded-full"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Advertiser's Terms */}
        <div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                Advertiser&apos;s Terms <span className="text-red-500">*</span>
              </h3>
              {bid.description ? (
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {bid.description}
                </div>
              ) : (<span className="text-sm text-muted-foreground">No terms specified</span>)}

              <ul className="space-y-3 text-sm text-muted-foreground mt-4">
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">•</span>
                  <span>
                    Available Payment Methods: {paymentMethodNames || 'Not specified'}
                  </span>
                </li>
                <li className="flex items-start gap-2 whitespace-break-spaces">
                  <span className="text-white mt-0.5">•</span>
                  <span>
                    Please Complete Payment Within The Time Limit And Upload Proof Of Transfer If Possible.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side - Buy Form */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-6">Buy {tokenSymbol}</h3>

          <div className="space-y-6">
            {/* Your Pay */}
            <div className="bg-[#FFFFFF08] rounded-3xl p-6">
              <Label htmlFor="pay-amount" className="text-sm text-muted-foreground mb-2 block">
                You pay
              </Label>
              <InputGroup className={`border-0 my-4 ${amountError ? 'border-red-500' : ''}`}>
                <InputGroupInput
                  id="pay-amount"
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="!text-[32px] px-0 font-semibold h-auto"
                  placeholder="0"
                  min={minFiatAmount}
                  max={maxFiatAmount}
                />
                <InputGroupAddon align="inline-end">
                  <Image
                    src={fiatLogoURI}
                    alt={bid.fiatCurrency || 'Currency'}
                    width={24}
                    height={24}
                    className="rounded-full bg-white"
                  />
                  <span className="text-base font-medium text-white whitespace-nowrap">{bid.fiatCurrency}</span>
                </InputGroupAddon>
              </InputGroup>
              {amountError && (
                <p className="text-xs text-red-500 mt-1">{amountError}</p>
              )}
            </div>

            {/* Your Receive */}
            <div className="bg-[#FFFFFF08] rounded-3xl p-6">
              <Label htmlFor="receive-amount" className="text-sm text-muted-foreground mb-2 block">
                You receive
              </Label>
              <InputGroup className="border-0">
                <InputGroupInput
                  id="receive-amount"
                  type="text"
                  value={receiveAmount}
                  readOnly
                  className="!text-[32px] px-0 font-semibold text-white"
                  placeholder="0"
                />
                <InputGroupAddon align="inline-end">
                  <div className="flex items-center gap-2">
                    {tokenLogoURI ? (
                      <Image src={tokenLogoURI} alt={tokenSymbol} width={24} height={24} className="rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
                    )}
                    <span className="text-base font-medium text-white whitespace-nowrap">{tokenSymbol}</span>
                  </div>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Payment Methods */}
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Available Payment Methods</Label>
              <div className="rounded-lg p-4 space-y-2 hover:border-primary border" style={{ backgroundColor: '#FFFFFF08' }}>
                {paymentMethodCodes.length > 0 ? (
                  paymentMethodCodes.map((code: string) => (
                    <div key={code} className="flex items-center gap-2 text-sm text-white">
                      <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                      <span>{PAYMENT_METHODS[code]?.name || code}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">N/A - Seller will provide in order chat</p>
                )}
              </div>
            </div>

            {/* Price and Fee */}
            <div className="space-y-2 pt-4 border-t border-[#DBECFD20]">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{formatPrice(bid.price, bid.fiatCurrency)}</span>
                  <RefreshCw className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Buy Button */}
            <Button 
              className="w-full font-semibold py-6 text-base"
              onClick={handleBuy}
              disabled={!isAmountValid || isLoading}
            >
              {isLoading ? 'Processing...' : `Buy ${tokenSymbol}`}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
