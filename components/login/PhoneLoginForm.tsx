'use client';

import { useState } from 'react';
import { useLoginWithSms, useCreateWallet, User } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone } from 'lucide-react';
import { syncUserAfterLogin } from '@/app/actions/users';

interface PhoneLoginFormProps {
  onError: (error: string) => void;
}

export function PhoneLoginForm({ onError }: PhoneLoginFormProps) {
  const router = useRouter();
  const { createWallet } = useCreateWallet();

  const [phone, setPhone] = useState('');
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
  const { sendCode: sendSmsCode, loginWithCode: loginWithSmsCode } = useLoginWithSms({
    onComplete: handleLoginComplete,
    onError: () => {
      onError('Login failed. Please try again.');
      setIsLoading(false);
    }
  });

  // Handle SMS code sending
  const handleSendSmsCode = async () => {
    if (!phone) {
      onError('Please enter your phone number');
      return;
    }
    try {
      setIsLoading(true);
      onError('');
      await sendSmsCode({ phoneNumber: phone });
      setCodeSent(true);
    } catch {
      onError('Failed to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle SMS login with code
  const handleSmsLogin = async () => {
    if (!code || code.length !== 6) {
      onError('Please enter the 6-digit code');
      return;
    }
    try {
      setIsLoading(true);
      onError('');
      await loginWithSmsCode({ code });
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
            <Label htmlFor="phone">Phone Number</Label>
            <InputGroup className="h-12 bg-[#FFFFFF08]">
              <InputGroupAddon>
                <Phone />
              </InputGroupAddon>
              <InputGroupInput
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
            </InputGroup>
            <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
          </div>
          <Button
            onClick={handleSendSmsCode}
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading || !phone}
          >
            {isLoading ? 'Sending...' : 'Send Code'}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to {phone}</p>
            <InputOTP className='w-full' maxLength={6} value={code} onChange={setCode} disabled={isLoading}>
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
            onClick={handleSmsLogin}
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify & Log In'}
          </Button>
          <Button variant="ghost" onClick={() => setCodeSent(false)} className="w-full" disabled={isLoading}>
            Use different phone
          </Button>
        </>
      )}
    </div>
  );
}
