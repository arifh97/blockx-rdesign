'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
import { ArrowRight, Check } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPaymentAccountsAction } from '@/app/actions/user-payment-accounts';
import { AddPaymentMethodDialog } from '@/components/payment/AddPaymentMethodDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BidsWithUsers } from '@/db/queries/bids';
import { getTokenSymbol, getTokenByAddressAcrossChains, getTokensByChain } from '@/lib/tokens';
import { FIAT_CURRENCIES, PAYMENT_METHODS } from '@/lib/constants';
import { useChainId } from 'wagmi';
import { useCreateOrder } from '@/hooks/use-create-order';
import { getChainName, getChainLogo, SUPPORTED_CHAINS } from '@/lib/chains';
import { useRouter } from 'next/navigation';
import { type Address } from 'viem';
import { toContractValue } from '@/lib/contract-utils';
import Image from 'next/image';
import { toast } from 'sonner';
import { DepositDialog } from '@/components/shared/DepositDialog';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useTokenBalance } from '@/hooks/use-token-balance';

type SellExpandedViewProps = {
  bid: BidsWithUsers[number];
};

export function SellExpandedView({ bid }: SellExpandedViewProps) {
  const router = useRouter();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { createOrder, isLoading: isCreatingOrder } = useCreateOrder();
  const tokenSymbol = getTokenSymbol(bid.fromToken as Address);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isNetworkDialogOpen, setIsNetworkDialogOpen] = useState(false);

  // Get token decimals and logo
  const token = getTokenByAddressAcrossChains(bid.fromToken as Address);
  const tokenDecimals = token?.decimals || 18;
  const tokenLogoURI = token?.logoURI;
  
  // Get tokens for current chain (for DepositDialog)
  const tokens = getTokensByChain(chainId);

  const actualPrice = parseFloat(bid.price);
  const minAmount = parseFloat(bid.minAmount);
  const maxAmount = parseFloat(bid.maxAmount);

  // User input for amount they want to sell (within min/max range)
  const [sellAmount, setSellAmount] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const sellAmountNum = parseFloat(sellAmount) || 0;

  // Calculate receive amount: amount * price (2 decimals)
  const receiveAmountNum = sellAmountNum * actualPrice;
  const receiveAmount = receiveAmountNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Validation
  const isAmountValid = sellAmountNum >= minAmount && sellAmountNum <= maxAmount && sellAmountNum > 0;
  const amountError =
    sellAmountNum === 0
      ? null
      : sellAmountNum < minAmount
        ? `Minimum: ${minAmount} ${tokenSymbol}`
        : sellAmountNum > maxAmount
          ? `Maximum: ${maxAmount} ${tokenSymbol}`
          : null;

  const handleSell = async () => {
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
      // Convert sell amount to contract format (wei/bigint)
      const amountInWei = toContractValue(sellAmount, tokenDecimals);

      // Create order on-chain with selected payment account
      const result = await createOrder({
        bidHash: bid.bidHash,
        amount: amountInWei.toString(),
        selectedPaymentAccountId: selectedPaymentMethodId,
      });

      // Redirect to order page on success
      if (result.orderId) {
        router.push(`/orders/${result.orderId}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      // Error toast is already shown by the hook
    }
  };

  const bidPaymentMethodCodes: string[] = bid.paymentMethodCodes || [];
  // Map payment method codes to display names
  const bidPaymentMethodNames = bidPaymentMethodCodes
    .map(code => PAYMENT_METHODS[code]?.name || code)
    .join(', ');

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

  // Filter user payment accounts that match bid's accepted payment methods
  const matchingPaymentAccounts = paymentAccountsData.filter((account) =>
    bidPaymentMethodCodes.includes(account.paymentMethod)
  );

  // Get fiat currency info
  const fiatCurrency = FIAT_CURRENCIES.find((c) => c.code === bid.fiatCurrency);
  const fiatLogoURI = fiatCurrency?.logoURI || '/currencies/dollar.svg';

  // Get wallet balance for the token
  const { balance } = useTokenBalance(bid.fromToken as Address);
  const availableBalance = parseFloat(balance || '0');
  const networkName = getChainName(chainId);

  // Handle network switch
  const activeWallet = wallets[0];
  const handleSwitchChain = async (targetChainId: number) => {
    if (!activeWallet || !authenticated) {
      toast.error("No wallet connected");
      return;
    }

    try {
      await activeWallet.switchChain(targetChainId);
      const chainName = SUPPORTED_CHAINS.find((c) => c.chain.id === targetChainId)?.name;
      toast.success(`Switched to ${chainName}`);
      setIsNetworkDialogOpen(false);
    } catch (error) {
      console.error("Error switching chain:", error);
      toast.error("Failed to switch chain");
    }
  };

  // Get chain info for the bid
  const bidChainLogo = getChainLogo(bid.chainId);
  const bidChainName = getChainName(bid.chainId);

  return (
    <div className="bg-[#0A151C] rounded-xl p-6 border border-[#DBECFD20] relative">
      {/* Chain Icon - Top Right */}
      {bidChainLogo && (
        <div className="absolute top-4 right-4" title={bidChainName}>
          <Image
            src={bidChainLogo}
            alt={bidChainName}
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
                      Available Payment Methods:{' '}
                      {isPaymentAccountsLoading ? 'Loading...' : (bidPaymentMethodNames || 'Not specified')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2 whitespace-break-spaces">
                    <span className="text-white mt-0.5">•</span>
                    <span>Please Complete Payment Within The Time Limit And Upload Proof Of Transfer If Possible.</span>
                  </li>
                </ul>
            </div>
          </div>
        </div>

        {/* Right Side - Sell Form */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-6">Sell {tokenSymbol}</h3>

          <div className="space-y-6">
            {/* You Sell */}
            <div className="bg-[#FFFFFF08] rounded-3xl p-6">
              <Label htmlFor="sell-amount" className="text-sm text-muted-foreground mb-2 block">
                You sell
              </Label>
              <InputGroup className={`border-0 my-4 ${amountError ? 'border-red-500' : ''}`}>
                <InputGroupInput
                  id="sell-amount"
                  type="number"
                  step="0.01"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="!text-[32px] font-semibold h-auto px-0"
                  placeholder="0"
                  min={minAmount}
                  max={maxAmount}
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
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Available: {availableBalance.toLocaleString()} {tokenSymbol}
                  </span>
                  <DepositDialog 
                    tokens={tokens} 
                    defaultToken={bid.fromToken as Address}
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full size-6"
                    >
                      <Plus/>
                    </Button>
                  </DepositDialog>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>From Network: {networkName}</span>
                  <Dialog open={isNetworkDialogOpen} onOpenChange={setIsNetworkDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="text-primary hover:text-cyan-400 flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                        Change
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md border-[#FFFFFF1A]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Select Network</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-2 py-4">
                        {SUPPORTED_CHAINS.map(({ chain, name, icon, logo }) => (
                          <button
                            key={chain.id}
                            className="flex items-center gap-3 p-4 rounded-lg border border-[#FFFFFF1A] bg-[#FFFFFF08] hover:bg-[#FFFFFF12] transition-colors cursor-pointer group"
                            onClick={() => handleSwitchChain(chain.id)}
                          >
                            <div className="flex-shrink-0">
                              {logo ? (
                                <Image 
                                  src={logo} 
                                  alt={name} 
                                  width={32} 
                                  height={32} 
                                  className="rounded-full"
                                />
                              ) : (
                                <span className="text-2xl">{icon}</span>
                              )}
                            </div>
                            <span className="text-base font-medium flex-1 text-left">{name}</span>
                            {chainId === chain.id && (
                              <Check className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              {amountError && <p className="text-xs text-red-500 mt-1">{amountError}</p>}
            </div>

            {/* Your Receive */}
            <div className="bg-[#FFFFFF08] rounded-3xl p-6">
              <Label htmlFor="receive-amount" className="text-sm text-muted-foreground mb-2 block">
                Your receive
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
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground mb-2 block">Payment Method</Label>
              {matchingPaymentAccounts.length > 0 ? (
                <Select value={selectedPaymentMethodId} onValueChange={setSelectedPaymentMethodId}>
                  <SelectTrigger className="min-h-12 bg-[#FFFFFF08] border-0 w-full rounded-3xl">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {matchingPaymentAccounts.map((account) => {
                      const methodInfo = PAYMENT_METHODS[account.paymentMethod];
                      return (
                        <SelectItem key={account.id} value={account.id}>
                          {account.label || methodInfo?.name || account.paymentMethod}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : (
                !isPaymentAccountsLoading && (
                  <div className="w-full rounded-3xl p-4 bg-[#FFFFFF08] border border-yellow-500/30">
                    <p className="text-sm text-yellow-500 mb-2">No matching payment methods found</p>
                    <p className="text-xs text-muted-foreground">
                      This seller accepts: {bidPaymentMethodNames || 'Not specified'}
                    </p>
                  </div>
                )
              )}
              {/* Always show Add Payment Method button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-primary/30 text-primary hover:bg-primary/10 rounded-3xl"
                onClick={() => setIsAddPaymentDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>

           
            {/* Sell Button */}
            <Button 
              className="w-full font-semibold py-6 text-base" 
              onClick={handleSell} 
              disabled={!isAmountValid || !selectedPaymentMethodId || isCreatingOrder}
            >
              {isCreatingOrder ? 'Creating Order...' : `Sell ${tokenSymbol}`}
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
          // Invalidate payment accounts query to refetch
          queryClient.invalidateQueries({ queryKey: ['paymentAccounts'] });
          // Auto-select the newly added payment method
          setSelectedPaymentMethodId(accountId);
        }}
      />
    </div>
  );
}
