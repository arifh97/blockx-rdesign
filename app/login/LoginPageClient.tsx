'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WalletLoginForm } from '@/components/login/WalletLoginForm';
import { EmailLoginForm } from '@/components/login/EmailLoginForm';
import { PhoneLoginForm } from '@/components/login/PhoneLoginForm';

export function LoginPageClient() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();

  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'email' | 'phone'>('wallet');
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  // Reset state when switching methods
  const handleMethodChange = (method: 'wallet' | 'email' | 'phone') => {
    setSelectedMethod(method);
    setError('');
  };

  return (
    <div className="w-full max-w-2xl relative z-10">
      <Card className="rounded-3xl border p-8 bg-[#DBECFD08] min-h-[35vh]">
        <CardContent className="space-y-6 px-0">
          <div>
            <h1 className="text-3xl font-bold mb-2">Log In</h1>
            <p className="text-muted-foreground">Choose how you want to continue.</p>
          </div>

          {/* Method selector */}
          <div className="flex gap-2 rounded-3xl p-1 bg-[#FFFFFF08]">
            <Button
              variant={selectedMethod === 'wallet' ? 'default' : 'ghost'}
              onClick={() => handleMethodChange('wallet')}
              className={`flex-1 py-2.5 px-4 rounded-3xl text-sm font-medium transition-colors border-0 ${
                selectedMethod === 'wallet'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-[#FFFFFF08] text-muted-foreground hover:text-foreground hover:bg-transparent'
              }`}
            >
              Wallet
            </Button>
            <Button
              variant={selectedMethod === 'email' ? 'default' : 'ghost'}
              onClick={() => handleMethodChange('email')}
              className={`flex-1 py-2.5 px-4 rounded-3xl text-sm font-medium transition-colors border-0 ${
                selectedMethod === 'email'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-[#FFFFFF08] text-muted-foreground hover:text-foreground hover:bg-transparent'
              }`}
            >
              Email
            </Button>
            <Button
              variant={selectedMethod === 'phone' ? 'default' : 'ghost'}
              onClick={() => handleMethodChange('phone')}
              className={`flex-1 py-2.5 px-4 rounded-3xl text-sm font-medium transition-colors border-0 ${
                selectedMethod === 'phone'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-[#FFFFFF08] text-muted-foreground hover:text-foreground hover:bg-transparent'
              }`}
            >
              Phone
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Conditional content based on selected method */}
          {selectedMethod === 'wallet' ? (
            <WalletLoginForm onError={setError} />
          ) : selectedMethod === 'email' ? (
            <EmailLoginForm onError={setError} />
          ) : (
            <PhoneLoginForm onError={setError} />
          )}

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t Have An Account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign Up
            </Link>
          </p>

          {/* Terms and privacy */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            By connecting a wallet, you agree to BlockX&apos;s{' '}
            <Link href="/terms" className="text-foreground hover:underline">
              Terms of Service
            </Link>{' '}
            and consent to its{' '}
            <Link href="/privacy" className="text-foreground hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
