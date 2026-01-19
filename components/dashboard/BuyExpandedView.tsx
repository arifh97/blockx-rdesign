'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
import { ArrowRight } from 'lucide-react';
import { BidsWithUsers } from '@/db/queries/bids';
import { getTokenSymbol, getTokenByAddressAcrossChains } from '@/lib/tokens';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPaymentAccountsAction } from '@/app/actions/user-payment-accounts';
import { AddPaymentMethodDialog } from '@/components/payment/AddPaymentMethodDialog';

type TradeExpandedViewProps = {
  bid: BidsWithUsers[number];
};

export function TradeExpandedView({ bid }: TradeExpandedViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
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
  const receiveAmount = receiveAmountNum.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Validation - check if the calculated crypto amount is within limits
  const isAmountValid = receiveAmountNum >= minAmount && receiveAmountNum <= maxAmount && payAmountNum > 0;
  const amountError =
    payAmountNum === 0
      ? null
      : receiveAmountNum < minAmount
        ? `Minimum: ${minFiatAmount.toFixed(2)} ${bid.fiatCurrency}`
        : receiveAmountNum > maxAmount
          ? `Maximum: ${maxFiatAmount.toFixed(2)} ${bid.fiatCurrency}`
          : null;

  // Payment Method States
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);

  // Fetch user payment accounts
  const { data: paymentAccountsData, isLoading: isPaymentAccountsLoading } = useQuery({
    queryKey: ['paymentAccounts'],
    queryFn: async () => {
      const result = await getPaymentAccountsAction();
      if (result.success) {
        return result.data || [];
      }
      return [];
    },
    initialData: []
  });

  // Get payment method codes
  const bidPaymentMethodCodes: string[] = bid.paymentMethodCodes || [];
  const bidPaymentMethodNames = bidPaymentMethodCodes.map((code) => PAYMENT_METHODS[code]?.name || code).join(', ');

  // Filter matching payment accounts
  const matchingPaymentAccounts = paymentAccountsData.filter((account) =>
    bidPaymentMethodCodes.includes(account.paymentMethod)
  );

  const handleBuy = async () => {
    if (!isAmountValid) {
      toast.error('Invalid amount', {
        description: amountError || 'Please enter a valid amount'
      });
      return;
    }

    if (!selectedPaymentMethodId) {
      toast.error('Payment method required', {
        description: 'Please select a payment method'
      });
      return;
    }

    try {
      // Convert the calculated crypto amount to contract format
      const amountInWei = toContractValue(receiveAmountNum.toString(), tokenDecimals);
      const result = await createOrder({
        bidHash: bid.bidHash,
        amount: amountInWei.toString(),
        selectedPaymentAccountId: selectedPaymentMethodId
      });

      // Redirect to order page on success
      if (result.orderId) {
        router.push(`/orders/${result.orderId}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const [paymentMethod, setPaymentMethod] = useState('all');

  // Map payment method codes to display names
  const paymentMethodNames = bidPaymentMethodCodes.map((code) => PAYMENT_METHODS[code]?.name || code).join(', ');

  // Get chain info
  const chainLogo = getChainLogo(bid.chainId);
  const chainName = getChainName(bid.chainId);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side - Advertiser's Terms */}
        <div className="bg-[#0A151C] rounded-2xl p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                Advertiser&apos;s Terms <span className="text-red-500">*</span>
              </h3>

              <ul className="space-y-4 text-sm md:text-base text-[rgba(219,236,253,0.50)] mt-4 capitalize leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[rgba(219,236,253,0.50)]">•</span>
                  <span className="text-wrap">
                    No third-party payments are allowed. The sender's bank account name must match the name verified on
                    the platform. {paymentMethodNames || 'Not specified'}
                  </span>
                </li>
                <li className="flex items-start gap-2 whitespace-break-spaces">
                  <span className="text-[rgba(219,236,253,0.50)]">•</span>
                  <span>Available bank accounts for transfers: ADCB, Emirates NBD, Mashreq</span>
                </li>
                <li className="flex items-start gap-2 whitespace-break-spaces">
                  <span className="text-[rgba(219,236,253,0.50)]">•</span>
                  <span>Please complete payment within the time limit and upload proof of transfer if possible.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side - Buy Form */}
        <div className="bg-[#0A151C] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-5">Buy {tokenSymbol}</h3>

          <div className="space-y-2">
            {/* Your Pay */}
            <div className="relative z-1 rounded-3xl p-5">
              <img src="trade-payment-box-bg4.png" className="absolute top-0 left-0 w-full h-full -z-1" alt="" />
              <div className="flex justify-between items-center mb-3">
                <Label htmlFor="pay-amount" className="text-sm text-white/50 mb-2 block">
                  You pay
                </Label>
                <span className="text-sm font-medium leading-tight capitalize text-white/50">1 ETH $3,884.67</span>
              </div>
              <InputGroup className={`border-0  buy-usdc-input ${amountError ? 'border-red-500' : ''}`}>
                <InputGroupInput
                  id="pay-amount"
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="text-2xl lg:text-[32px] px-0 font-semibold h-auto"
                  placeholder="0"
                  min={minFiatAmount}
                  max={maxFiatAmount}
                />
                <InputGroupAddon align="inline-end">
                  <img
                    src={fiatLogoURI}
                    alt={bid.fiatCurrency || 'Currency'}
                    width={24}
                    height={24}
                    className="rounded-full bg-white  shadow-none!"
                  />
                  <span className="text-base font-medium text-white whitespace-nowrap">{bid.fiatCurrency}</span>
                </InputGroupAddon>
              </InputGroup>
              {amountError && <p className="text-xs text-red-500 mt-1">{amountError}</p>}
            </div>

            {/* Your Receive */}
            <div className="relative z-1 rounded-3xl overflow-hidden p-6">
              <img src="trade-payment-box-bg4.png" className="absolute top-0 left-0 w-full h-full -z-1" alt="" />
              <div className="flex justify-between items-center mb-3">
                <Label htmlFor="receive-amount" className="text-sm text-muted-foreground mb-2 block">
                  You receive
                </Label>
                <span className="text-sm font-medium leading-tight capitalize text-white/50">1 BTC: $101,246.66</span>
              </div>
              <InputGroup className="border-0! buy-usdc-input">
                <InputGroupInput
                  id="receive-amount"
                  type="text"
                  value={receiveAmount}
                  readOnly
                  className="text-[32px]! px-0 font-semibold text-white"
                  placeholder="0"
                />
                <InputGroupAddon align="inline-end">
                  <div className="flex items-center gap-2">
                    {tokenLogoURI ? (
                      <img src={tokenLogoURI} alt={tokenSymbol} width={24} height={24} className="rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
                    )}
                    <span className="text-base font-medium text-white whitespace-nowrap">{tokenSymbol}</span>
                  </div>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Payment Methods Section */}
            <div className="relative z-1 space-y-3">
              <img src="buy-trade-payment-box-bg.png" className="absolute top-0 left-0 w-full h-full -z-1" alt="" />

              {/* Payment Method Selection */}
              {matchingPaymentAccounts.length > 0 ? (
                <Select value={selectedPaymentMethodId} onValueChange={setSelectedPaymentMethodId}>
                  <SelectTrigger className="w-full min-h-14 cursor-pointer text-base font-medium text-white capitalize bg-transparent p-5">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {matchingPaymentAccounts.map((account) => {
                      const methodInfo = PAYMENT_METHODS[account.paymentMethod];
                      return (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            {methodInfo?.icon && <span>{methodInfo.icon}</span>}
                            <span>{account.label || methodInfo?.name || account.paymentMethod}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : (
                !isPaymentAccountsLoading && (
                  <div className="w-full rounded-3xl p-4 bg-[#FFFFFF08] border border-yellow-500/30 hidden">
                    <p className="text-sm text-yellow-500 mb-2">No matching payment methods found</p>
                    <p className="text-xs text-muted-foreground">
                      This seller accepts: {bidPaymentMethodNames || 'Not specified'}
                    </p>
                  </div>
                )
              )}

              {/* Add Payment Method Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 px-5! bg-transparent rounded-3xl flex  justify-between items-center gap-2 text-base font-medium border-0"
                onClick={() => setIsAddPaymentDialogOpen(true)}
              >
                <span className="flex items-center gap-2">
                  <img src="mastercard.svg" alt="" />
                  Add Payment Method
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13 5.5L8 10.5L3 5.5"
                    stroke="#7E7F8C"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>

            {/* Price and Fee */}
            <div className="space-y-4 pt-4 mb-5">
              <div className="flex justify-between text-sm md:text-base font-medium capitalize leading-tight">
                <span className="text-white/50">Price</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{formatPrice(bid.price, bid.fiatCurrency)}</span>
                  <button className="cursor-pointer hover:rotate-360 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M12.0173 7.01102H15.7613L13.3755 4.62377C12.6074 3.85567 11.6507 3.30331 10.6014 3.02222C9.5522 2.74113 8.44744 2.74121 7.39824 3.02246C6.34903 3.30371 5.39236 3.85621 4.62439 4.62442C3.85641 5.39263 3.30421 6.34947 3.02329 7.39877M2.23879 14.733V10.989M2.23879 10.989H5.98279M2.23879 10.989L4.62379 13.3763C5.39187 14.1444 6.34863 14.6967 7.39788 14.9778C8.44712 15.2589 9.55188 15.2588 10.6011 14.9776C11.6503 14.6963 12.607 14.1438 13.3749 13.3756C14.1429 12.6074 14.6951 11.6506 14.976 10.6013M15.7613 3.26702V7.00952"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-sm md:text-base font-medium capitalize leading-tight">
                <span className="text-white/50">Processing Fee</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{formatPrice(bid.price, bid.fiatCurrency)}</span>
                  <button className="cursor-pointer hover:opacity-50 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="0.75" y="0.75" width="16.5" height="16.5" rx="8.25" stroke="white" strokeWidth="1.5" />
                      <path
                        d="M5.0625 9C5.0625 9.14918 5.00324 9.29226 4.89775 9.39775C4.79226 9.50324 4.64918 9.5625 4.5 9.5625C4.35082 9.5625 4.20774 9.50324 4.10225 9.39775C3.99676 9.29226 3.9375 9.14918 3.9375 9C3.9375 8.85082 3.99676 8.70774 4.10225 8.60225C4.20774 8.49676 4.35082 8.4375 4.5 8.4375C4.64918 8.4375 4.79226 8.49676 4.89775 8.60225C5.00324 8.70774 5.0625 8.85082 5.0625 9ZM9.5625 9C9.5625 9.14918 9.50324 9.29226 9.39775 9.39775C9.29226 9.50324 9.14918 9.5625 9 9.5625C8.85082 9.5625 8.70774 9.50324 8.60225 9.39775C8.49676 9.29226 8.4375 9.14918 8.4375 9C8.4375 8.85082 8.49676 8.70774 8.60225 8.60225C8.70774 8.49676 8.85082 8.4375 9 8.4375C9.14918 8.4375 9.29226 8.49676 9.39775 8.60225C9.50324 8.70774 9.5625 8.85082 9.5625 9ZM14.0625 9C14.0625 9.14918 14.0032 9.29226 13.8977 9.39775C13.7923 9.50324 13.6492 9.5625 13.5 9.5625C13.3508 9.5625 13.2077 9.50324 13.1023 9.39775C12.9968 9.29226 12.9375 9.14918 12.9375 9C12.9375 8.85082 12.9968 8.70774 13.1023 8.60225C13.2077 8.49676 13.3508 8.4375 13.5 8.4375C13.6492 8.4375 13.7923 8.49676 13.8977 8.60225C14.0032 8.70774 14.0625 8.85082 14.0625 9Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Buy Button */}
            <Button
              className="w-full font-semibold py-7 text-base"
              onClick={handleBuy}
              disabled={!isAmountValid || !selectedPaymentMethodId || isLoading}
            >
              {isLoading ? 'Processing...' : `Buy ${tokenSymbol}`}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Payment Method Dialog */}
      <AddPaymentMethodDialog
        open={isAddPaymentDialogOpen}
        onOpenChange={setIsAddPaymentDialogOpen}
        onSave={(accountId) => {
          queryClient.invalidateQueries({ queryKey: ['paymentAccounts'] });
          setSelectedPaymentMethodId(accountId);
        }}
      />
    </div>
  );
}
