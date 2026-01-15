import type { Metadata } from 'next';
import { Inter_Tight } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'BlockX - Trustless P2P Crypto Trading',
  description:
    'Decentralized peer-to-peer platform for secure crypto-to-fiat and crypto-to-crypto exchanges with on-chain escrow protection',
  openGraph: {
    title: 'BlockX - Trustless P2P Crypto Trading',
    description:
      'Decentralized peer-to-peer platform for secure crypto-to-fiat and crypto-to-crypto exchanges with on-chain escrow protection.',
    url: 'https://block-x.io/',
    siteName: 'BlockX',
    images: [
      {
        url: '/blockx-logo.svg',
        width: 1200,
        height: 630,
        alt: 'BlockX - Trustless P2P Crypto Trading'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlockX - Trustless P2P Crypto Trading',
    description:
      'Decentralized peer-to-peer platform for secure crypto-to-fiat and crypto-to-crypto exchanges with on-chain escrow protection.',
    images: ['/blockx-logo.svg']
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
