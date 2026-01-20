'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
import { ArrowRight, Check, Plus } from 'lucide-react';
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
import { formatPrice } from '@/lib/table-column-helper';
import { useRouter } from 'next/navigation';
import { type Address } from 'viem';
import { toContractValue } from '@/lib/contract-utils';
import Image from 'next/image';
import { toast } from 'sonner';
import { DepositDialog } from '@/components/shared/DepositDialog';
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
  const [isRecipientNetworkDialogOpen, setIsRecipientNetworkDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const sellAmountNum = parseFloat(sellAmount) || 0;

  // Calculate receive amount: amount * price (2 decimals)
  const receiveAmountNum = sellAmountNum * actualPrice;
  const receiveAmount = receiveAmountNum.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

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

    // Check if it's a default payment method
    if (selectedPaymentMethodId.startsWith('default-')) {
      toast.error('Please add your payment method', {
        description: 'Click "Recipient\'s Wallet Network" to add your actual payment method'
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
        selectedPaymentAccountId: selectedPaymentMethodId
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
  const bidPaymentMethodNames = bidPaymentMethodCodes.map((code) => PAYMENT_METHODS[code]?.name || code).join(', ');

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

  // Default payment methods to show when user has none
  const defaultPaymentMethods = [
    { id: 'default-national-bank', name: 'Any national bank', isDefault: true },
    { id: 'default-mbank', name: 'mBank', isDefault: true },
    { id: 'default-paypal', name: 'PayPal', isDefault: true },
    { id: 'default-dubai-islamic', name: 'Dubai Islamic Bank', isDefault: true },
    { id: 'default-adcb', name: 'ADCB', isDefault: true }
  ];

  // Filter user payment accounts that match bid's accepted payment methods
  const matchingPaymentAccounts = paymentAccountsData.filter((account) =>
    bidPaymentMethodCodes.includes(account.paymentMethod)
  );

  // Combine user accounts with default methods if user has no accounts
  const allPaymentOptions = matchingPaymentAccounts.length > 0 ? matchingPaymentAccounts : defaultPaymentMethods;

  // Filter accounts based on search
  // const filteredAccounts = allPaymentOptions.filter((account) => {
  //   if ('isDefault' in account) {
  //     return account.name.toLowerCase().includes(search.toLowerCase());
  //   }
  //   const name = account.label || PAYMENT_METHODS[account.paymentMethod]?.name || account.paymentMethod;
  //   return name.toLowerCase().includes(search.toLowerCase());
  // });
  // Filter accounts based on search
  const filteredAccounts = allPaymentOptions.filter((account) => {
    let name: string;

    if ('name' in account) {
      // Default payment method with 'name' property
      name = account.name;
    } else {
      // User's actual payment account
      name = account.label || PAYMENT_METHODS[account.paymentMethod]?.name || account.paymentMethod;
    }

    return name.toLowerCase().includes(search.toLowerCase());
  });
  // Get fiat currency info
  const fiatCurrency = FIAT_CURRENCIES.find((c) => c.code === bid.fiatCurrency);
  const fiatLogoURI = fiatCurrency?.logoURI || '/currencies/aed2.png';

  // Get wallet balance for the token
  const { balance } = useTokenBalance(bid.fromToken as Address);
  const availableBalance = parseFloat(balance || '0');
  const networkName = getChainName(chainId);

  // Handle network switch
  const activeWallet = wallets[0];
  const handleSwitchChain = async (targetChainId: number) => {
    if (!activeWallet || !authenticated) {
      toast.error('No wallet connected');
      return;
    }

    try {
      await activeWallet.switchChain(targetChainId);
      const chainName = SUPPORTED_CHAINS.find((c) => c.chain.id === targetChainId)?.name;
      toast.success(`Switched to ${chainName}`);
      setIsNetworkDialogOpen(false);
    } catch (error) {
      console.error('Error switching chain:', error);
      toast.error('Failed to switch chain');
    }
  };

  // Get chain info for the bid
  const bidChainLogo = getChainLogo(bid.chainId);
  const bidChainName = getChainName(bid.chainId);

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
                    the platform.
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

        {/* Right Side - Sell Form */}
        <div className="bg-[#0A151C] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-5">Sell {tokenSymbol}</h3>

          <div className="space-y-2">
            {/* You Sell */}
            <div className="rounded-3xl overflow-hidden p-6 relative z-1  bg-[rgba(255,255,255,0.03)] border border-solid border-[rgba(255,255,255,0.02)]">
              <Label htmlFor="sell-amount" className="text-sm text-white/50 mb-2 block">
                You sell
              </Label>
              <InputGroup className={`border-0 my-4  buy-usdc-input ${amountError ? 'border-red-500' : ''}`}>
                <InputGroupInput
                  id="sell-amount"
                  type="number"
                  step="0.01"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="text-2xl lg:text-[32px] px-0 font-semibold h-auto outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-white placeholder:text-white"
                  placeholder="0"
                  min={minAmount}
                  max={maxAmount}
                />
                <InputGroupAddon align="inline-end" className="pe-0">
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
              <div className="space-y-1 mt-4">
                <div className="flex items-center gap-2 text-sm text-[rgba(219,236,253,0.50)]">
                  <span>
                    Available: {availableBalance.toLocaleString()} {tokenSymbol}
                  </span>
                  <DepositDialog tokens={tokens} defaultToken={bid.fromToken as Address}>
                    <Button variant="ghost" size="sm" className="rounded-full size-6">
                      <Plus />
                    </Button>
                  </DepositDialog>
                  <span className="text-xs">Add</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[rgba(219,236,253,0.50)]">
                  <span>From Network: {networkName}</span>
                  <Dialog open={isNetworkDialogOpen} onOpenChange={setIsNetworkDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="text-primary hover:text-cyan-400 flex items-center gap-1 cursor-pointer">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                        <span className="text-xs">Change</span>
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
                                <img src={logo} alt={name} width={32} height={32} className="rounded-full" />
                              ) : (
                                <span className="text-2xl">{icon}</span>
                              )}
                            </div>
                            <span className="text-base font-medium flex-1 text-left">{name}</span>
                            {chainId === chain.id && <Check className="h-5 w-5 text-primary flex-shrink-0" />}
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
            <div className="rounded-3xl p-6 relative z-1 overflow-hidden  bg-[rgba(255,255,255,0.03)] border border-solid border-[rgba(255,255,255,0.02)]">
              <Label htmlFor="receive-amount" className="text-sm font-semibold text-white/50 mb-2.75 block">
                Your receive
              </Label>
              <InputGroup className="border-0  buy-usdc-input">
                <InputGroupInput
                  id="receive-amount"
                  type="text"
                  value={receiveAmount}
                  readOnly
                  className="text-2xl lg:text-[32px] px-0 font-semibold text-white"
                  placeholder="0"
                />
                <InputGroupAddon align="inline-end" className="pe-0">
                  <img
                    src={fiatLogoURI}
                    alt={bid.fiatCurrency || 'Currency'}
                    width={24}
                    height={24}
                    className="rounded-full bg-white p-0"
                  />
                  <span className="text-base font-medium text-white whitespace-nowrap p-0">{bid.fiatCurrency}</span>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Payment Method */}
            <div className="space-y-3 text-white!">
              <Select value={selectedPaymentMethodId} onValueChange={setSelectedPaymentMethodId}>
                {/* Trigger */}
                <SelectTrigger
                  className="min-h-14 w-full rounded-3xl px-5  bg-[rgba(255,255,255,0.03)] border border-solid border-[rgba(255,255,255,0.02)]  text-base
                    text-white!  placeholder:text-white!
                    outline-none ring-0
                    focus:outline-none focus:ring-0
                    focus-visible:outline-none focus-visible:ring-0
                    data-[state=open]:ring-0 cursor-pointer relative z-1 "
                >
                  <SelectValue className="text-white! placeholder:text-white!" placeholder="Select payment method" />
                </SelectTrigger>

                {/* Dropdown */}
                <SelectContent
                  className="mt-2 rounded-2xl border-0
                    bg-[#101B23]
                    overflow-hidden"
                >
                  {/* Search */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 px-3 py-4 rounded-xl bg-[#FFFFFF08]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <g clipPath="url(#clip0_2019_27650)">
                          <circle
                            cx="9.16675"
                            cy="9.16675"
                            r="7.5"
                            stroke="#DBECFD"
                            strokeOpacity="0.5"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M18.1766 17.4789C18.1243 17.5578 18.0299 17.6522 17.8411 17.8411C17.6522 18.0299 17.5578 18.1243 17.4789 18.1766C17.0168 18.4826 16.3915 18.3249 16.1299 17.8363C16.0852 17.7528 16.0469 17.6249 15.9702 17.3691C15.8864 17.0895 15.8446 16.9498 15.8365 16.8514C15.7888 16.2723 16.2723 15.7888 16.8514 15.8365C16.9498 15.8446 17.0895 15.8864 17.3691 15.9702C17.6249 16.0469 17.7528 16.0852 17.8363 16.1299C18.3249 16.3915 18.4826 17.0168 18.1766 17.4789Z"
                            stroke="#DBECFD"
                            strokeOpacity="0.5"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_2019_27650">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>

                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Select payment method"
                        className="w-full bg-transparent text-sm ms-1 font-medium
                          placeholder:text-[rgba(219,236,253,0.50)]
                          outline-none ring-0
                          focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-60 overflow-y-auto px-2 pb-2 space-y-2">
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((account) => {
                        // Determine the display name
                        let displayName: string;

                        if ('name' in account) {
                          // Default payment method
                          displayName = account.name;
                        } else {
                          // User's actual payment method
                          const methodInfo = PAYMENT_METHODS[account.paymentMethod];
                          displayName = account.label || methodInfo?.name || account.paymentMethod;
                        }

                        return (
                          <SelectItem
                            key={account.id}
                            value={account.id}
                            className="rounded-xl px-4 py-3.5 text-sm
                            text-white
                            focus:bg-[#FFFFFF0F]
                            bg-[rgba(255,255,255,0.01)]
                            data-[state=checked]:bg-[#FFFFFF14]
                            cursor-pointer"
                          >
                            {displayName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <div className="px-4 py-6 text-sm text-[#7E7F8C]">No payment method found</div>
                    )}
                  </div>
                </SelectContent>
              </Select>

              {/* Always show Add Payment Method button */}
              <Dialog open={isRecipientNetworkDialogOpen} onOpenChange={setIsRecipientNetworkDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full relative z-1 h-14 text-white text-base font-medium rounded-3xl flex items-center justify-between gap-2 px-5!  bg-[rgba(255,255,255,0.03)] border border-solid border-[rgba(255,255,255,0.02)]"
                  >
                    Recipient's Wallet Network
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M5.5 3L10.5 8L5.5 13"
                        stroke="#7E7F8C"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </DialogTrigger>

                {/* Recipient Network Modal */}
                <DialogContent className="max-w-141.25 bg-[#09141D] backdrop-blur-[6px] rounded-[29px] border-[#FFFFFF1A] p-5.5 gap-0">
                  <DialogHeader className="mb-6 ">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-lg font-medium capitalize text-white">
                        Recipient's Wallet Network
                      </DialogTitle>
                    </div>
                  </DialogHeader>

                  <div className="p-5 space-y-4 bg-[rgba(219,236,253,0.01)] rounded-[29px]">
                    <p className="text-[15px] text-white font-medium mt-2 mb-4">
                      Select the network where your crypto is stored to ensure it's sent to the correct recipient
                      address
                    </p>
                    {SUPPORTED_CHAINS.map(({ chain, name, icon, logo }) => {
                      const hasBalance = chainId === chain.id && availableBalance > 0;

                      return (
                        <button
                          key={chain.id}
                          className="flex items-center justify-between gap-3 p-4 px-5 rounded-[12px] bg-[rgba(255,255,255,0.02)] hover:bg-[#FFFFFF12] transition-colors cursor-pointer group w-full"
                          onClick={() => {
                            handleSwitchChain(chain.id);
                            setIsRecipientNetworkDialogOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {logo ? (
                                <img src={logo} alt={name} width={32} height={32} className="rounded-full" />
                              ) : (
                                <span className="text-2xl">{icon}</span>
                              )}
                            </div>
                            <span className="text-base md:text-[17px] capitalize font-medium text-white">{name}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {!hasBalance && <span className="text-sm text-white/50">No balance</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

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

            {/* Sell Button */}
            <Button
              className="w-full font-semibold py-7 text-base cursor-pointer"
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
