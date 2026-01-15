//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DisputeManagerV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x3a74621065Af1a6f940D48D2ED812C85b99856CE)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xeD7E8596049A8bc50bD9BE138DB72B55D9a55765)
 */
export const disputeManagerV2Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'admin', internalType: 'address', type: 'address' },
      { name: 'openStake_', internalType: 'uint256', type: 'uint256' },
      { name: 'resolutionFeeBps_', internalType: 'uint16', type: 'uint16' },
      { name: 'cooldown_', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ARBITRATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: '_cooldown',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: '_openStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: '_resolutionFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cooldown',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'a', internalType: 'address', type: 'address' }],
    name: 'grantArbitrator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'a', internalType: 'address', type: 'address' }],
    name: 'isArbitrator',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'openStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resolutionFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'openStake_', internalType: 'uint256', type: 'uint256' },
      { name: 'resolutionFeeBps_', internalType: 'uint16', type: 'uint16' },
      { name: 'cooldown_', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setParams',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'a', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'ArbitratorGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'openStake',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'resolutionFeeBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'cooldown',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DisputeParamsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x3a74621065Af1a6f940D48D2ED812C85b99856CE)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xeD7E8596049A8bc50bD9BE138DB72B55D9a55765)
 */
export const disputeManagerV2Address = {
  1: '0x0000000000000000000000000000000000000000',
  137: '0x0000000000000000000000000000000000000000',
  8453: '0x0000000000000000000000000000000000000000',
  31337: '0x55D38D63b3Db9C7b309EbC46E7C805314C4659B4',
  42161: '0x0000000000000000000000000000000000000000',
  80001: '0x0000000000000000000000000000000000000000',
  84532: '0x3a74621065Af1a6f940D48D2ED812C85b99856CE',
  421614: '0x0000000000000000000000000000000000000000',
  11155111: '0xeD7E8596049A8bc50bD9BE138DB72B55D9a55765',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x3a74621065Af1a6f940D48D2ED812C85b99856CE)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xeD7E8596049A8bc50bD9BE138DB72B55D9a55765)
 */
export const disputeManagerV2Config = {
  address: disputeManagerV2Address,
  abi: disputeManagerV2Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FeeManagerV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x05559ee18226E1b091EB7066E07D294812936b66)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0d74Dc6FbB084419Fb3Cea26596933C9a822C0D0)
 */
export const feeManagerV2Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'orderId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'payer', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'base', internalType: 'address', type: 'address' },
      { name: 'quoteToken', internalType: 'address', type: 'address' },
      { name: 'isMaker', internalType: 'bool', type: 'bool' },
      { name: 'notional', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'computeAndEmit',
    outputs: [
      { name: 'totalFee', internalType: 'uint256', type: 'uint256' },
      { name: '_rec', internalType: 'address[]', type: 'address[]' },
      { name: '_amts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'feeByPair',
    outputs: [
      { name: 'makerBps', internalType: 'uint16', type: 'uint16' },
      { name: 'takerBps', internalType: 'uint16', type: 'uint16' },
      { name: 'minFixed', internalType: 'uint256', type: 'uint256' },
      { name: 'set', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'base', internalType: 'address', type: 'address' },
      { name: 'quoteToken', internalType: 'address', type: 'address' },
    ],
    name: 'quote',
    outputs: [
      {
        name: 'fq',
        internalType: 'struct IFeeManagerV2.FeeQuote',
        type: 'tuple',
        components: [
          { name: 'makerBps', internalType: 'uint16', type: 'uint16' },
          { name: 'takerBps', internalType: 'uint16', type: 'uint16' },
          { name: 'minFixed', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'base', internalType: 'address', type: 'address' },
      { name: 'quoteToken', internalType: 'address', type: 'address' },
      { name: 'isMaker', internalType: 'bool', type: 'bool' },
      { name: 'notional', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'quoteExact',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'recipients',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'base', internalType: 'address', type: 'address' },
      { name: '_quote', internalType: 'address', type: 'address' },
      { name: 'makerBps', internalType: 'uint16', type: 'uint16' },
      { name: 'takerBps', internalType: 'uint16', type: 'uint16' },
      { name: 'minFixed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recips', internalType: 'address[]', type: 'address[]' },
      { name: 'splits', internalType: 'uint16[]', type: 'uint16[]' },
    ],
    name: 'setFeeRecipients',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'splitsBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'base', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'quote',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'makerBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'takerBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'minFixed',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FeeConfigSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'recipients',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
      {
        name: 'splitsBps',
        internalType: 'uint16[]',
        type: 'uint16[]',
        indexed: false,
      },
    ],
    name: 'FeeRecipientsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'payer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amountTotal',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'recipients',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
      {
        name: 'amounts',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'FeesPaid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x05559ee18226E1b091EB7066E07D294812936b66)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0d74Dc6FbB084419Fb3Cea26596933C9a822C0D0)
 */
export const feeManagerV2Address = {
  1: '0x0000000000000000000000000000000000000000',
  137: '0x0000000000000000000000000000000000000000',
  8453: '0x0000000000000000000000000000000000000000',
  31337: '0xB63D75E7604E37E6eD12f8048Ff101A5ed2aBdB5',
  42161: '0x0000000000000000000000000000000000000000',
  80001: '0x0000000000000000000000000000000000000000',
  84532: '0x05559ee18226E1b091EB7066E07D294812936b66',
  421614: '0x0000000000000000000000000000000000000000',
  11155111: '0x0d74Dc6FbB084419Fb3Cea26596933C9a822C0D0',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x05559ee18226E1b091EB7066E07D294812936b66)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0d74Dc6FbB084419Fb3Cea26596933C9a822C0D0)
 */
export const feeManagerV2Config = {
  address: feeManagerV2Address,
  abi: feeManagerV2Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KYCRegistryV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x87a4c652D91DEDc9f77dF56b5c3A0bf53A9bd2a3)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x3dDE6305A5e98453DC11A13D3738A56F18f559E1)
 */
export const kycRegistryV2Abi = [
  {
    type: 'constructor',
    inputs: [{ name: 'admin', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ATTESTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ATTEST_TYPEHASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subject', internalType: 'address', type: 'address' },
      { name: 'newLevel', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'downgrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'levelOf',
    outputs: [
      { name: 'level', internalType: 'uint8', type: 'uint8' },
      { name: 'expiry', internalType: 'uint64', type: 'uint64' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'minLevelRequired',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'subject', internalType: 'address', type: 'address' }],
    name: 'revoke',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'att',
        internalType: 'struct IKYCRegistryV2.Attestation',
        type: 'tuple',
        components: [
          { name: 'subject', internalType: 'address', type: 'address' },
          { name: 'level', internalType: 'uint8', type: 'uint8' },
          { name: 'expiry', internalType: 'uint64', type: 'uint64' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'sig', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setKyc',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subject',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'level', internalType: 'uint8', type: 'uint8', indexed: false },
      {
        name: 'expiry',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'KycUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x87a4c652D91DEDc9f77dF56b5c3A0bf53A9bd2a3)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x3dDE6305A5e98453DC11A13D3738A56F18f559E1)
 */
export const kycRegistryV2Address = {
  1: '0x0000000000000000000000000000000000000000',
  137: '0x0000000000000000000000000000000000000000',
  8453: '0x0000000000000000000000000000000000000000',
  31337: '0xAed9a79d7e88C34FdB4A09A29F53A2Cf1e2bedB9',
  42161: '0x0000000000000000000000000000000000000000',
  80001: '0x0000000000000000000000000000000000000000',
  84532: '0x87a4c652D91DEDc9f77dF56b5c3A0bf53A9bd2a3',
  421614: '0x0000000000000000000000000000000000000000',
  11155111: '0x3dDE6305A5e98453DC11A13D3738A56F18f559E1',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x87a4c652D91DEDc9f77dF56b5c3A0bf53A9bd2a3)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x3dDE6305A5e98453DC11A13D3738A56F18f559E1)
 */
export const kycRegistryV2Config = {
  address: kycRegistryV2Address,
  abi: kycRegistryV2Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NonceManagerV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6b06efbc16B35252639c5a030a8132AEDdDF2338)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5DA2eB28cbC919eC671F9bcB0D9A86778811Fabd)
 */
export const nonceManagerV2Abi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'CANCEL_TYPEHASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newMin', internalType: 'uint256', type: 'uint256' }],
    name: 'cancelAllBefore',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'hash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sig', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'cancelByHash',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isOperator',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isUsed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'markUsed',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'minValid',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'minValidNonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'op', internalType: 'address', type: 'address' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'setOperator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'used',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'newMinValid',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CancelAllBefore',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      { name: 'hash', internalType: 'bytes32', type: 'bytes32', indexed: true },
    ],
    name: 'CanceledByHash',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'NonceUsed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6b06efbc16B35252639c5a030a8132AEDdDF2338)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5DA2eB28cbC919eC671F9bcB0D9A86778811Fabd)
 */
export const nonceManagerV2Address = {
  1: '0x0000000000000000000000000000000000000000',
  137: '0x0000000000000000000000000000000000000000',
  8453: '0x0000000000000000000000000000000000000000',
  31337: '0xfA08F1d3ef7742Cb844a1A4F959BECfCB853c5AE',
  42161: '0x0000000000000000000000000000000000000000',
  80001: '0x0000000000000000000000000000000000000000',
  84532: '0x6b06efbc16B35252639c5a030a8132AEDdDF2338',
  421614: '0x0000000000000000000000000000000000000000',
  11155111: '0x5DA2eB28cbC919eC671F9bcB0D9A86778811Fabd',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6b06efbc16B35252639c5a030a8132AEDdDF2338)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5DA2eB28cbC919eC671F9bcB0D9A86778811Fabd)
 */
export const nonceManagerV2Config = {
  address: nonceManagerV2Address,
  abi: nonceManagerV2Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OrderBook
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x616CF9370d365Ee9fE97d6CcBD8433DecBF419d1)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x7540CD198AF08e05914a48991d6f194BBb5221Db)
 */
export const orderBookAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'admin', internalType: 'address', type: 'address' },
      { name: '_vault', internalType: 'address', type: 'address' },
      { name: '_kyc', internalType: 'address', type: 'address' },
      { name: '_fees', internalType: 'address', type: 'address' },
      { name: '_nonces', internalType: 'address', type: 'address' },
      { name: '_dispute', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'BID_TYPEHASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'OI_TYPEHASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VAULT',
    outputs: [{ name: '', internalType: 'contract IVault', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'orderId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'autoRelease',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'orderId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'buyerShareBps', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'award',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'bid',
        internalType: 'struct IOrderBook.Bid',
        type: 'tuple',
        components: [
          { name: 'maker', internalType: 'address', type: 'address' },
          { name: 'base', internalType: 'address', type: 'address' },
          { name: 'quote', internalType: 'address', type: 'address' },
          { name: 'price', internalType: 'uint256', type: 'uint256' },
          { name: 'minAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'maxAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'kycLevel', internalType: 'uint8', type: 'uint8' },
          { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          {
            name: 'bidType',
            internalType: 'enum IOrderBook.BidType',
            type: 'uint8',
          },
          { name: 'paymentWindow', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'makerSig', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'cancelBid',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelDisputeWindow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cancelRequestedAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'canceledBids',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'orderId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'confirmPaymentAndRelease',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'confirmWindow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'bid',
        internalType: 'struct IOrderBook.Bid',
        type: 'tuple',
        components: [
          { name: 'maker', internalType: 'address', type: 'address' },
          { name: 'base', internalType: 'address', type: 'address' },
          { name: 'quote', internalType: 'address', type: 'address' },
          { name: 'price', internalType: 'uint256', type: 'uint256' },
          { name: 'minAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'maxAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'kycLevel', internalType: 'uint8', type: 'uint8' },
          { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          {
            name: 'bidType',
            internalType: 'enum IOrderBook.BidType',
            type: 'uint8',
          },
          { name: 'paymentWindow', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'makerSig', internalType: 'bytes', type: 'bytes' },
      {
        name: 'oi',
        internalType: 'struct IOrderBook.OrderIntent',
        type: 'tuple',
        components: [
          { name: 'bidHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'taker', internalType: 'address', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'maxSlippageBps', internalType: 'uint16', type: 'uint16' },
          { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'takerSig', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'create',
    outputs: [{ name: 'orderId', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'bid',
        internalType: 'struct IOrderBook.Bid',
        type: 'tuple',
        components: [
          { name: 'maker', internalType: 'address', type: 'address' },
          { name: 'base', internalType: 'address', type: 'address' },
          { name: 'quote', internalType: 'address', type: 'address' },
          { name: 'price', internalType: 'uint256', type: 'uint256' },
          { name: 'minAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'maxAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'kycLevel', internalType: 'uint8', type: 'uint8' },
          { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          {
            name: 'bidType',
            internalType: 'enum IOrderBook.BidType',
            type: 'uint8',
          },
          { name: 'paymentWindow', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'makerSig', internalType: 'bytes', type: 'bytes' },
      {
        name: 'oi',
        internalType: 'struct IOrderBook.OrderIntent',
        type: 'tuple',
        components: [
          { name: 'bidHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'taker', internalType: 'address', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'maxSlippageBps', internalType: 'uint16', type: 'uint16' },
          { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'takerSig', internalType: 'bytes', type: 'bytes' },
      { name: 'notionalQuote', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createAndFill',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'disputeCfg',
    outputs: [
      { name: '', internalType: 'contract IDisputeManagerV2', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'disputeInitiator',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'disputeStakes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fees',
    outputs: [
      { name: '', internalType: 'contract IFeeManagerV2', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'orderId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'finalizeCancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'kyc',
    outputs: [
      { name: '', internalType: 'contract IKYCRegistryV2', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'orderId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'markPaymentSent',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxPaymentWindow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minPaymentWindow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nonces',
    outputs: [
      { name: '', internalType: 'contract INonceManagerV2', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'orderId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'openDispute',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'orders',
    outputs: [
      { name: 'status', internalType: 'enum IOrderBook.Status', type: 'uint8' },
      { name: 'seller', internalType: 'address', type: 'address' },
      { name: 'buyer', internalType: 'address', type: 'address' },
      { name: 'base', internalType: 'address', type: 'address' },
      { name: 'quote', internalType: 'address', type: 'address' },
      { name: 'baseAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'openedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'bidExpiry', internalType: 'uint256', type: 'uint256' },
      { name: 'takerExpiry', internalType: 'uint256', type: 'uint256' },
      { name: 'paymentDeadline', internalType: 'uint256', type: 'uint256' },
      { name: 'confirmDeadline', internalType: 'uint256', type: 'uint256' },
      { name: 'agreedFee', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'paymentSentAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'orderId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'refundExpired',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'orderId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'requestCancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_window', internalType: 'uint256', type: 'uint256' }],
    name: 'setCancelDisputeWindow',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_window', internalType: 'uint256', type: 'uint256' }],
    name: 'setConfirmWindow',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_window', internalType: 'uint256', type: 'uint256' }],
    name: 'setMaxPaymentWindow',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_window', internalType: 'uint256', type: 'uint256' }],
    name: 'setMinPaymentWindow',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bidHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'maker',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BidCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CancelRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'DisputeOpened',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'buyerShareBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'arbitrator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'DisputeResolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'OrderAutoReleased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'OrderCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'base',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'quote',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'OrderCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'OrderExpired',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'OrderFilled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'OrderLocked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PaymentMarkedSent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x616CF9370d365Ee9fE97d6CcBD8433DecBF419d1)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x7540CD198AF08e05914a48991d6f194BBb5221Db)
 */
export const orderBookAddress = {
  1: '0x0000000000000000000000000000000000000000',
  137: '0x0000000000000000000000000000000000000000',
  8453: '0x0000000000000000000000000000000000000000',
  31337: '0xC797150244da1477A5fF553Fd63AA0eDc3BC984B',
  42161: '0x0000000000000000000000000000000000000000',
  80001: '0x0000000000000000000000000000000000000000',
  84532: '0x616CF9370d365Ee9fE97d6CcBD8433DecBF419d1',
  421614: '0x0000000000000000000000000000000000000000',
  11155111: '0x7540CD198AF08e05914a48991d6f194BBb5221Db',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x616CF9370d365Ee9fE97d6CcBD8433DecBF419d1)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x7540CD198AF08e05914a48991d6f194BBb5221Db)
 */
export const orderBookConfig = {
  address: orderBookAddress,
  abi: orderBookAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Vault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xb0628Ebc32e5253532702C0E75EfB5081741A242)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF6504C00348CA0df56D919C9C56b19471315144d)
 */
export const vaultAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'canLockAmount',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'depositWithPermit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'getBalanceBreakdown',
    outputs: [
      { name: 'available', internalType: 'uint256', type: 'uint256' },
      { name: 'walletBalance', internalType: 'uint256', type: 'uint256' },
      { name: 'vaultTotal', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isOperator',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'orderId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'lockForOrder',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'orderId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'lockedOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'op', internalType: 'address', type: 'address' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'setOperator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'totalBalanceOf',
    outputs: [
      { name: 'available', internalType: 'uint256', type: 'uint256' },
      { name: 'totalLocked', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'orderId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferLocked',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'orderId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unlockFromOrder',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Locked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransferredLocked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Unlocked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdraw',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xb0628Ebc32e5253532702C0E75EfB5081741A242)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF6504C00348CA0df56D919C9C56b19471315144d)
 */
export const vaultAddress = {
  1: '0x0000000000000000000000000000000000000000',
  137: '0x0000000000000000000000000000000000000000',
  8453: '0x0000000000000000000000000000000000000000',
  31337: '0x2315f5B94E8574F3c7a14eC7d7D14096F81d5111',
  42161: '0x0000000000000000000000000000000000000000',
  80001: '0x0000000000000000000000000000000000000000',
  84532: '0xb0628Ebc32e5253532702C0E75EfB5081741A242',
  421614: '0x0000000000000000000000000000000000000000',
  11155111: '0xF6504C00348CA0df56D919C9C56b19471315144d',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x0000000000000000000000000000000000000000)
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Polygon Mumbai Polygon Scan__](https://mumbai.polygonscan.com/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xb0628Ebc32e5253532702C0E75EfB5081741A242)
 * - [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xF6504C00348CA0df56D919C9C56b19471315144d)
 */
export const vaultConfig = { address: vaultAddress, abi: vaultAbi } as const
