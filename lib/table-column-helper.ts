import { BidsWithUsers } from "@/db/queries/bids";
import { getTokensByChain } from "@/lib/tokens";
import { type Address } from "viem";

// Helper function to calculate completion rate
export const getCompletionRate = (bid: BidsWithUsers[number]) => {
    if (!bid.creator.totalTrades || bid.creator.totalTrades === 0) return '0.00%';
    const successfulTrades = bid.creator.successfulTrades || 0;
    const rate = (successfulTrades / bid.creator.totalTrades) * 100;
    return `${rate.toFixed(2)}%`;
  };

  // Helper function to get user avatar initial
export const getAvatarInitial = (bid: BidsWithUsers[number]) => {
    if (bid.creator.username) {
      return bid.creator.username.charAt(0).toUpperCase();
    }
    return bid.creator.walletAddress.slice(2, 3).toUpperCase();
  };

  // Helper function to format price
  // Price is now stored as human-readable value (e.g., 1.02)
export const formatPrice = (price: string, currency?: string | null) => {
    const numPrice = parseFloat(price);
    // Format with up to 8 decimal places, remove trailing zeros
    return `${numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${currency || 'USDT'}`;
  };

  // Helper function to format amount range
  // Amount is now stored as human-readable value (e.g., 100, 1000)
export const formatOrderLimit = (amount: string, tokenAddress: Address, chainId: number, currency?: string | null) => {
    const tokens = getTokensByChain(chainId);
    const token = tokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    
    const numAmount = parseFloat(amount);
    // Format with appropriate decimal places based on token
    return `Up to ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: token?.decimals || 18 })} ${token?.symbol || 'USDT'}`;
  };