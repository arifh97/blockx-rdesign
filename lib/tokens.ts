import { type Address, zeroAddress } from 'viem';
import { mainnet, sepolia, base, anvil, baseSepolia } from 'viem/chains';

export interface Token {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  isNative?: boolean;
}

export const NATIVE_TOKEN: Token = {
  address: zeroAddress,
  symbol: 'ETH',
  name: 'Ethereum',
  decimals: 18,
  logoURI: '/tokens/eth.png',
  isNative: true
};

// Token addresses by chain
const TOKENS_BY_CHAIN: Record<number, Token[]> = {
  // Ethereum Mainnet
  [mainnet.id]: [
    NATIVE_TOKEN,
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: '/tokens/usdt.png'
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: '/tokens/usdc.png'
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: '/tokens/eth.png'
    }
  ],
  
  // Sepolia Testnet
  [sepolia.id]: [
    NATIVE_TOKEN,
    {
      address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
      symbol: 'USDT',
      name: 'Tether USD (Testnet)',
      decimals: 6,
      logoURI: '/tokens/usdt.png'
    },
    {
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      symbol: 'USDC',
      name: 'USD Coin (Testnet)',
      decimals: 18,
      logoURI: '/tokens/usdc.png'
    },
    {
      address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
      symbol: 'WETH',
      name: 'Wrapped Ether (Testnet)',
      decimals: 18,
      logoURI: '/tokens/eth.png'
    }
  ],
  
  // Base
  [base.id]: [
    NATIVE_TOKEN,
    {
      address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: '/tokens/usdt.png'
    },
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: '/tokens/usdc.png'
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: '/tokens/eth.png'
    }
  ],
  [baseSepolia.id]: [
    NATIVE_TOKEN,
     {
      address: '0x323e78f944A9a1FcF3a10efcC5319DBb0bB6e673',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: '/tokens/usdt.png'
    },
    {
      address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
      logoURI: '/tokens/usdc.png'
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: '/tokens/eth.png'
    }
  ],
  // Anvil
  [anvil.id]: [
    NATIVE_TOKEN,
    {
      address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: '/tokens/usdt.png'
    },
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: '/tokens/usdc.png'
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: '/tokens/eth.png'
    }
  ]
};

/**
 * Get supported tokens for a specific chain
 * @param chainId - The chain ID to get tokens for
 * @returns Array of supported tokens for the chain
 */
export function getTokensByChain(chainId: number): Token[] {
  return TOKENS_BY_CHAIN[chainId] || [];
}

/**
 * Get a specific token by chain and symbol
 * @param chainId - The chain ID
 * @param symbol - The token symbol (e.g., 'USDT', 'ETH')
 * @returns The token if found, undefined otherwise
 */
export function getTokenBySymbol(chainId: number, symbol: string): Token | undefined {
  const tokens = getTokensByChain(chainId);
  return tokens.find((token) => token.symbol.toLowerCase() === symbol.toLowerCase());
}

/**
 * Get all supported chain IDs
 * @returns Array of supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(TOKENS_BY_CHAIN).map(Number);
}

/**
 * Check if a chain is supported
 * @param chainId - The chain ID to check
 * @returns True if the chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in TOKENS_BY_CHAIN;
}

/**
 * Get token symbol by address, searching across all chains
 * @param address - The token address
 * @returns The token symbol if found, the shortened address otherwise
 */
export function getTokenSymbol(address: Address): string {
  const token = getTokenByAddressAcrossChains(address);
  return token?.symbol || `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get token info by address for a specific chain
 * @param chainId - The chain ID
 * @param address - The token address
 * @returns The token if found, undefined otherwise
 */
export function getTokenByAddress(chainId: number, address: Address): Token | undefined {
  const tokens = getTokensByChain(chainId);
  return tokens.find((t) => t.address.toLowerCase() === address.toLowerCase());
}

/**
 * Get token info by address, searching across all chains
 * @param address - The token address
 * @returns The token if found, undefined otherwise
 */
export function getTokenByAddressAcrossChains(address: Address): Token | undefined {
  const normalizedAddress = address.toLowerCase();
  for (const tokens of Object.values(TOKENS_BY_CHAIN)) {
    const token = tokens.find((t) => t.address.toLowerCase() === normalizedAddress);
    if (token) return token;
  }
  return undefined;
}
