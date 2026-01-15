'use client';

import { useConnectWallet, useLoginWithSiwe } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { useChainId } from 'wagmi';
import { syncUserAfterLogin } from '@/app/actions/users';
import Image from 'next/image';

interface WalletLoginFormProps {
  onError: (error: string) => void;
}

export function WalletLoginForm({ onError }: WalletLoginFormProps) {
  const chainId = useChainId();
  const { generateSiweMessage, loginWithSiwe, state } = useLoginWithSiwe({
    onComplete: async ({ user }) => {
      // Get wallet address from linked accounts
      const walletAccount = user.linkedAccounts.find((account) => account.type === 'wallet');

      if (walletAccount && 'address' in walletAccount) {
        // Sync user with database
        const result = await syncUserAfterLogin(walletAccount.address, user.email?.address);

        if (!result.success) {
          console.error('Failed to sync user:', result.error);
          onError('Login successful but failed to sync user data.');
        } else {
          console.log('User synced with database:', result.user);
        }
      }
    },
    onError: () => {
      onError('Failed to log in with wallet. Please try again.');
    }
  });
  const { connectWallet } = useConnectWallet({
    onSuccess: async ({ wallet }) => {
      // SIWE only works with Ethereum wallets
      if (wallet.walletClientType === 'solana') {
        onError('Please connect an Ethereum wallet.');
        return;
      }

      // Generate SIWE message and sign it
      const message = await generateSiweMessage({
        address: wallet.address,
        chainId: `eip155:${chainId}`
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const signature = await (wallet as any).sign(message);
      await loginWithSiwe({ signature, message });
    },
    onError: () => {
      onError('Failed to connect wallet. Please try again.');
    }
  });

  const handleWalletLogin = async () => {
    try {
      await connectWallet({
        walletList: ['metamask', 'detected_ethereum_wallets', 'wallet_connect', 'wallet_connect_qr']
      });
    } catch {
      onError('Failed to log in with wallet. Please try again.');
    }
  };

  const isLoading =
    state.status === 'generating-message' ||
    state.status === 'awaiting-signature' ||
    state.status === 'submitting-signature';

  const walletProviders = [
    {
      name: 'MetaMask',
      icon: '/metamask.svg'
    },
    {
      name: 'Trust Wallet',
      icon: '/trust.png'
    },
    {
      name: 'WalletConnect',
      icon: '/wallet-connect.png'
    },
    {
      name: 'Ledger',
      icon: '/ledger.png'
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Connect your wallet to log in. Sign a message to verify your identity.
      </p>

      {/* Wallet Provider Options */}
      <div className="space-y-2">
        {walletProviders.map((provider) => (
          <button
            key={provider.name}
            onClick={handleWalletLogin}
            disabled={isLoading}
            className="cursor-pointer flex items-center gap-3 w-full px-4 py-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full overflow-hidden">
              <Image src={provider.icon} alt={provider.name} width={32} height={32} className="object-contain" />
            </div>
            <span className="text-base font-medium text-white">{provider.name}</span>
          </button>
        ))}
      </div>

      <Button onClick={handleWalletLogin} className="w-full h-12 text-base font-semibold" disabled={isLoading}>
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </div>
  );
}
