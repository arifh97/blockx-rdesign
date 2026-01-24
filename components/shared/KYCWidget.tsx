'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Download } from 'lucide-react';
import Image from 'next/image';

export function KYCWidget() {
  return (
    <Card
      className="p-5 pt-6 rounded-[29px] bg-cover bg-top-center border-0"
      style={{ backgroundImage: 'url(/kyc-card-bg.png)', backgroundSize: '100% 100%' }}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16  rounded-full shadow-[-10px_29px_54.6px_-11px_#071017] flex items-center justify-center  mb-9">
          {/* <ShieldCheck className="h-6 w-6 text-white" /> */}
          <img src="kyc-check.png" alt="" />
        </div>

        <div>
          <h3 className="font-semibold text-sm md:text-2xl mb-2.5">Complete KYC</h3>
          <p className="text-xs md:text-base text-white/50 font-normal mb-2">
            Verify your identity to unlock higher limits and send up to $50,000.
          </p>
        </div>

        <Button
          className="get-start-btn relative z-1 w-full min-h-12.5 group bg-[rgba(255,255,255,0.02)] border border-solid border-[rgba(255,255,255,0.05)] h-8 text-sm lg:text-base font-medium text-white
         hover:bg-[rgba(65,253,254,0.10)]! hover:border-[#41FDFE] relative overflow-hidden z-1 transition-all duration-300 flex items-center justify-center gap-3"
        >
          <span className="
            pointer-events-none
            absolute inset-0
            rounded-[inherit]
            p-[1px]
            before:absolute before:inset-0
            before:rounded-[inherit]
            before:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0),rgba(255,255,255,0.05))]
            before:content-['']
            z-[-1]
          "
        />
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.75 14.25V16.5C0.75 17.0967 0.987053 17.669 1.40901 18.091C1.83097 18.5129 2.40326 18.75 3 18.75H16.5C17.0967 18.75 17.669 18.5129 18.091 18.091C18.5129 17.669 18.75 17.0967 18.75 16.5V14.25M5.25 5.25L9.75 0.75M9.75 0.75L14.25 5.25M9.75 0.75V14.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
          Start Verification          
        </Button>
      </div>
    </Card>
  );
}
