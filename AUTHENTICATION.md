# BlockX Authentication Implementation

## Overview

This application uses **Privy** (`@privy-io/react-auth`) for authentication with custom UI components. Users can authenticate via:

- 🔗 **Wallet** (MetaMask, WalletConnect, etc.)
- 📧 **Email** (passwordless with OTP)
- 📱 **Phone/SMS** (passwordless with OTP)

## Architecture

### Provider Setup

The `PrivyProvider` is configured in `/components/providers/index.tsx` with:

- Email, SMS, and wallet login methods enabled
- **Automatic wallet creation disabled** (`createOnLogin: 'off'`) - required for whitelabel/custom UI
- Manual wallet creation using `useCreateWallet` hook after login
- Default country set to US for phone numbers
- Custom theme colors matching BlockX branding

**Important:** The `createOnLogin` config only works with Privy's default UI. For custom/whitelabel implementations, you must manually create wallets using the `useCreateWallet` hook.

### Authentication Flow

#### 1. **Wallet Authentication**

- User clicks "Connect Wallet"
- Privy's `login()` method opens wallet selection modal
- User connects their wallet (MetaMask, WalletConnect, etc.)
- Automatic redirect to dashboard upon success

#### 2. **Email Authentication**

- User enters email address
- `sendCode()` sends a 6-digit OTP to their email
- User enters the code using the InputOTP component
- `loginWithCode()` verifies the code and authenticates
- **Embedded wallet created automatically** if user has no wallets
- Automatic redirect to dashboard upon success

#### 3. **Phone/SMS Authentication**

- User enters phone number with country code (e.g., +1234567890)
- `sendCode()` sends a 6-digit OTP via SMS
- User enters the code using the InputOTP component
- `loginWithCode()` verifies the code and authenticates
- **Embedded wallet created automatically** if user has no wallets
- Automatic redirect to dashboard upon success

#### 4. **Embedded Wallet Creation**

After successful authentication (email/phone), the app automatically:

- Checks if user has any linked wallets
- If no wallets exist, creates an embedded Ethereum wallet using `createWallet()`
- User can then use this wallet for transactions without needing an external wallet

## Key Files

### `/components/providers/index.tsx`

Configures the PrivyProvider with:

```typescript
- loginMethods: ['email', 'sms', 'wallet']
- embeddedWallets: Creates wallets for users without external wallets
- intl.defaultCountry: 'US' for phone number formatting
```

### `/app/login/page.tsx`

Main login page with:

- Three authentication methods (wallet, email, phone)
- Custom UI using your design system
- OTP input for email/phone verification
- **Automatic embedded wallet creation** using `onComplete` callbacks
- `useLoginWithEmail` and `useLoginWithSms` hooks configured with callbacks
- Post-login: creates wallet if user has none, then redirects
- Error handling via `onError` callbacks
- Loading states for better UX

### `/app/dashboard/page.tsx`

Protected route that:

- Redirects unauthenticated users to login
- Displays user information (email, phone, wallet address)
- Shows linked accounts
- **Displays all connected wallets** with details (address, type, chain)
- Copy-to-clipboard functionality for wallet addresses
- Distinguishes between embedded and external wallets
- Provides logout functionality
- Demonstrates protected content

### `/app/page.tsx`

Root page that:

- Checks authentication status
- Redirects authenticated users to dashboard
- Redirects unauthenticated users to login

## Privy Hooks Used

### `usePrivy()`

- `ready`: Boolean indicating if Privy is initialized
- `authenticated`: Boolean indicating if user is logged in
- `user`: User object with account details
- `login()`: Opens wallet connection modal
- `logout()`: Logs out the user

### `useLoginWithEmail()`

- `sendCode({ email })`: Sends OTP to email
- `loginWithCode({ code })`: Verifies OTP and logs in

### `useLoginWithSms()`

- `sendCode({ phoneNumber })`: Sends OTP to phone
- `loginWithCode({ code })`: Verifies OTP and logs in

### `useCreateWallet()`

- `createWallet({ createAdditional?: boolean })`: Creates an embedded wallet for the authenticated user
- Returns a Promise with the created wallet
- **Required for whitelabel/custom UI** since `createOnLogin` config doesn't work
- Best practice: Call in `onComplete` callback of login hooks
- Usage:

  ```typescript
  const { createWallet } = useCreateWallet();

  const { loginWithCode } = useLoginWithEmail({
    onComplete: async ({ user }) => {
      if (!user.linkedAccounts?.some((a) => a.type === 'wallet')) {
        await createWallet();
      }
    }
  });
  ```

### `useWallets()` vs `usePrivy()` for Wallets

**Important distinction:**

- **`useWallets()`**: Returns all **connected** wallets (active in the current session)
  - Use this for signing transactions and taking onchain actions
  - Wallets have methods like `sign()`, `sendTransaction()`, etc.
- **`usePrivy()` → `user.linkedAccounts`**: Returns all **linked** wallets (associated with the user's account)
  - Use this to verify wallet ownership and display user's wallets
  - Filter by `account.type === 'wallet'` to get wallet accounts
  - Each wallet contains: `address`, `walletClient`, `chainId`, etc.

## Protected Routes

To protect a route:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function ProtectedPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return <div>Loading...</div>;
  }

  return <div>Protected content</div>;
}
```

## User Object Structure

The `user` object from Privy contains:

- `id`: Unique user identifier
- `email`: { address: string } if authenticated via email
- `phone`: { number: string } if authenticated via phone
- `wallet`: { address: string } if authenticated via wallet
- `linkedAccounts`: Array of all connected authentication methods
- `createdAt`: Account creation timestamp

## Environment Variables

Make sure you have the Privy App ID configured:

- The app ID is currently hardcoded in the provider: `cmguwl38r028ula0bsyhxp9dn`
- For production, consider moving this to an environment variable

## Testing the Implementation

1. **Test Wallet Login:**
   - Go to `/login`
   - Click "Connect Wallet"
   - Connect your wallet (MetaMask, etc.)
   - Should redirect to `/dashboard`

2. **Test Email Login:**
   - Go to `/login`
   - Switch to "Email" tab
   - Enter your email
   - Check your email for the 6-digit code
   - Enter the code
   - Should redirect to `/dashboard`

3. **Test Phone Login:**
   - Go to `/login`
   - Switch to "Phone" tab
   - Enter phone with country code (e.g., +1234567890)
   - Check your SMS for the 6-digit code
   - Enter the code
   - Should redirect to `/dashboard`

4. **Test Protected Route:**
   - Visit `/dashboard` without being logged in
   - Should redirect to `/login`
   - Log in and verify you can access `/dashboard`

5. **Test Logout:**
   - From `/dashboard`, click "Log Out"
   - Should redirect to `/login`
   - Verify you can't access `/dashboard` anymore

## UI Components Used

- **Button**: Custom button component with loading states
- **Input**: Text input for email and phone
- **InputOTP**: 6-digit OTP input component
- **Card**: Container components for layout
- **Avatar**: User avatar in dashboard header
- **Label**: Form labels

## Security Features

- ✅ Passwordless authentication (no password storage)
- ✅ OTP verification for email and phone
- ✅ Wallet signature verification
- ✅ Embedded wallets with enterprise-grade security
- ✅ Protected routes with authentication checks
- ✅ Automatic session management

## Next Steps

Consider adding:

- Multi-factor authentication (MFA)
- Social login (Google, Twitter, etc.)
- Account linking (connect multiple methods)
- Custom email/SMS templates
- Webhook integration for user events
- Token gating for specific features
