'use client';

import { useState } from 'react';
import { useLoginWithEmail, useCreateWallet, User } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail } from 'lucide-react';
import { syncUserAfterLogin } from '@/app/actions/users';

interface EmailLoginFormProps {
  onError: (error: string) => void;
}

export function EmailLoginForm({ onError }: EmailLoginFormProps) {
  const router = useRouter();
  const { createWallet } = useCreateWallet();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Callback to create wallet and redirect after successful login
  const handleLoginComplete = async ({ user }: { user: User }) => {
    const hasWallet = user.linkedAccounts?.some((account) => account.type === 'wallet');

    let walletAddress: string | undefined;

    if (!hasWallet) {
      try {
        // Create embedded wallet for email/phone users
        const wallet = await createWallet();
        walletAddress = wallet.address;
      } catch {
        onError('Failed to create wallet. Please try again.');
        return;
      }
    } else {
      // Get existing wallet address
      const walletAccount = user.linkedAccounts.find(
        (account) => account.type === 'wallet'
      );
      if (walletAccount && 'address' in walletAccount) {
        walletAddress = walletAccount.address;
      }
    }

    // Sync user with database
    if (walletAddress) {
      const result = await syncUserAfterLogin(
        walletAddress,
        user.email?.address
      );

      if (!result.success) {
        onError('Login successful but failed to sync user data.');
        return;
      }
    }

    router.push('/dashboard');
  };

  // Initialize login hook with callbacks
  const { sendCode: sendEmailCode, loginWithCode: loginWithEmailCode } = useLoginWithEmail({
    onComplete: handleLoginComplete,
    onError: () => {
      onError('Login failed. Please try again.');
      setIsLoading(false);
    }
  });

  // Handle email code sending
  const handleSendEmailCode = async () => {
    if (!email) {
      onError('Please enter your email address');
      return;
    }
    try {
      setIsLoading(true);
      onError('');
      await sendEmailCode({ email });
      setCodeSent(true);
    } catch {
      onError('Failed to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email login with code
  const handleEmailLogin = async () => {
    if (!code || code.length !== 6) {
      onError('Please enter the 6-digit code');
      return;
    }
    try {
      setIsLoading(true);
      onError('');
      await loginWithEmailCode({ code });
      // Wallet creation and redirect handled by onComplete callback
    } catch {
      onError('Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!codeSent ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <InputGroup className="h-12 bg-[#FFFFFF08]">
              <InputGroupAddon>
                <Mail />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </InputGroup>
          </div>
          <Button
            onClick={handleSendEmailCode}
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading || !email}
          >
            {isLoading ? 'Sending...' : 'Send Code'}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to {email}</p>
            <InputOTP maxLength={6} value={code} onChange={setCode} disabled={isLoading}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button
            onClick={handleEmailLogin}
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify & Log In'}
          </Button>
          <Button variant="ghost" onClick={() => setCodeSent(false)} className="w-full" disabled={isLoading}>
            Use different email
          </Button>
        </>
      )}
    </div>
  );
}
