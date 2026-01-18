import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { TradingTable } from '@/components/dashboard/TradingTable';
import { Card } from '@/components/ui/card';
import { getActiveBidsWithUsers, getActiveBidsCount } from '@/db/queries/bids';
import { verifyAuthentication } from '@/lib/auth';
import { getUserByPrivyId } from '@/db/queries/users';
import Image from 'next/image';

interface DashboardPageProps {
  searchParams: Promise<{
    token?: string;
    page?: string;
    payment?: string;
    amount?: string;
    type?: string;
  }>;
}

const PAGE_SIZE = 10;

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const selectedTokenAddress = params.token;
  const currentPage = parseInt(params.page || '1', 10);
  const paymentMethod = params.payment;
  const minAmount = params.amount;
  const userTradeType = params.type || 'buy'; // Default to 'buy' if not specified

  const bidType = userTradeType === 'buy' ? 'sell' : userTradeType === 'sell' ? 'buy' : undefined;

  // Get current user's wallet address to exclude their bids
  let currentUserWallet: string | undefined;
  try {
    const privyId = await verifyAuthentication();
    const user = await getUserByPrivyId(privyId);
    currentUserWallet = user?.walletAddress;
  } catch {
    console.log('User not authenticated, showing all bids');
  }

  // Fetch bids excluding current user's bids with pagination and filters
  const [bids, totalCount] = await Promise.all([
    getActiveBidsWithUsers(
      selectedTokenAddress,
      currentUserWallet,
      paymentMethod,
      minAmount,
      bidType,
      currentPage,
      PAGE_SIZE
    ),
    getActiveBidsCount(selectedTokenAddress, currentUserWallet, paymentMethod, minAmount, bidType)
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="max-w-335 mx-auto space-y-6">
      <Card className="p-6 rounded-3xl gap-y-2 bg-[#071017] backdrop-blur-[6px] overflow-hidden relative z-1 border border-solid border-[rgba(255,255,255,0.05)]">
        <Image
          src="balance-card-shap.png"
          className="backdrop-blur-sm absolute top-0 left-0 -z-1 w-auto h-auto"
          alt=""
        />
        {/* Top Section: Balance Card */}
        <BalanceCard initialTokenAddress={selectedTokenAddress} />

        {/* Trading Table */}
        <TradingTable bids={bids} currentPage={currentPage} totalPages={totalPages} />
      </Card>
    </div>
  );
}
