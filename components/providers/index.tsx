'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { VIEM_CHAINS, CHAIN_TRANSPORTS, DEFAULT_CHAIN } from '@/lib/chains';

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: VIEM_CHAINS,
  transports: CHAIN_TRANSPORTS,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmguwl38r028ula0bsyhxp9dn"
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
          logo: '/blockx-logo.svg'
        },
        defaultChain: DEFAULT_CHAIN,
        supportedChains: [...VIEM_CHAINS],
        loginMethods: ['email', 'sms', 'wallet'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'off' // Disabled for whitelabel UI
          },
          solana: {
            createOnLogin: 'off' // Disabled for whitelabel UI
          }
        },
        // Default country for phone numbers
        intl: {
          defaultCountry: 'US'
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
