'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Download } from 'lucide-react';

export function KYCWidget() {
  return (
    <Card className="p-4 rounded-3xl border-blue-500/20" style={{ backgroundImage: 'url(/kyc-card-bg.png)', backgroundSize: '100% auto' }}>
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-1">Complete KYC</h3>
          <p className="text-xs text-muted-foreground">
            Verify Your Identity To Unlock Higher Limits And Send Up To $50,000
          </p>
        </div>

        <Button className="w-full min-h-[50px] bg-[#FFFFFF05] border border-[#FFFFFF0D] hover:bg-[#FFFFFF0D] h-8 text-xs text-white">
          <Download className="h-3 w-3 mr-1" />
          Start Verification
        </Button>
      </div>
    </Card>
  );
}
