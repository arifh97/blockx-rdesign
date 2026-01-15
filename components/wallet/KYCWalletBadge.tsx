'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Upload } from 'lucide-react';

export function KYCWalletBadge() {
  return (
    <Card className="p-6 rounded-[40px] border-blue-500/20" style={{ backgroundImage: 'url(/kyc-card-bg.png)', backgroundSize: '100% 100%' }}>
      <div className="flex flex-col space-y-6">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white leading-tight">
            Secure Your Account with KYC Verification
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Unlock higher limits by verifying your identity and send up to $50,000.
          </p>
        </div>

        {/* Button */}
        <Button className="w-full min-h-[50px] bg-[#FFFFFF05] border border-[#FFFFFF0D] hover:bg-[#FFFFFF0D] text-sm text-white font-normal">
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>
    </Card>
  );
}
