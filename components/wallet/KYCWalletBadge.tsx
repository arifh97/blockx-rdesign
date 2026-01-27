'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Upload } from 'lucide-react';

export function KYCWalletBadge() {
  return (
    <Card className="p-6 rounded-[40px] border-blue-500/20 relative z-1 overflow-hidden bg-[#021011]" >
      <img src="wshap.png" className='absolute bottom-0 left-0 w-full h-auto -z-1' alt="" />
      <div className="flex flex-col space-y-6">
        {/* Icon */}
        <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="20" fill="white" fill-opacity="0.08"/>
          <path d="M44.1598 21.9188C44.1096 21.5578 43.8498 21.2608 43.4987 21.1632L32.245 18.0336C32.0846 17.9889 31.9151 17.9889 31.7546 18.0336L20.5009 21.1632C20.1497 21.2608 19.89 21.5576 19.8397 21.9188C19.7745 22.3881 18.2854 33.4778 22.1047 38.9946C25.9196 44.5048 31.5473 45.9169 31.7849 45.9744C31.8556 45.9915 31.9276 45.9999 31.9998 45.9999C32.072 45.9999 32.144 45.9913 32.2146 45.9744C32.4524 45.9169 38.0801 44.5048 41.8948 38.9946C45.7142 33.478 44.2251 22.3883 44.1598 21.9188ZM39.257 28.3931L31.5808 36.0692C31.4022 36.2478 31.168 36.3373 30.9338 36.3373C30.6997 36.3373 30.4655 36.2479 30.2868 36.0692L25.5407 31.3231C25.3691 31.1516 25.2727 30.9188 25.2727 30.6761C25.2727 30.4335 25.3692 30.2007 25.5407 30.0291L26.4831 29.0868C26.8405 28.7296 27.4199 28.7294 27.7771 29.0868L30.9338 32.2435L37.0206 26.1566C37.1922 25.9849 37.4249 25.8886 37.6676 25.8886C37.9103 25.8886 38.1431 25.9849 38.3146 26.1566L39.257 27.099C39.6143 27.4563 39.6143 28.0357 39.257 28.3931Z" fill="white"/>
          </svg>

        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl lg:text-2xl font-semibold text-white leading-normal mb-2">
            Secure Your Account with KYC Verification
          </h3>
          <p className="text-sm leading-relaxed text-white/80">
            Unlock higher limits by verifying your identity and send up to $50,000.
          </p>
        </div>

        {/* Button */}
        <Button className="w-full mt-10 min-h-14.75 bg-[#FFFFFF05] border border-[#FFFFFF0D] hover:bg-[#FFFFFF0D] text-sm lg:text-base text-white font-medium relative overflow-hidden z-1 flex items-center justify-center gap-3 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 16.5V18.75C3 19.3467 3.23705 19.919 3.65901 20.341C4.08097 20.7629 4.65326 21 5.25 21H18.75C19.3467 21 19.919 20.7629 20.341 20.341C20.7629 19.919 21 19.3467 21 18.75V16.5M7.5 7.5L12 3M12 3L16.5 7.5M12 3V16.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
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
          Upload Documents
        </Button>
      </div>
    </Card>
  );
}
