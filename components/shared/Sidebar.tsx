'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dashboard, wallet, clock, referral, support, settings } from '../../lib/icons';
import { cn } from '@/lib/utils';
import { ActiveOrdersWidget } from '../dashboard/ActiveOrdersWidget';
import { KYCWidget } from './KYCWidget';
import { util } from 'zod';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: dashboard
  },
  {
    name: 'Wallet',
    href: '/wallet',
    icon: wallet
  },
  // {
  //   name: 'P2P Express',
  //   href: '/p2p-express',
  //   icon: clock
  // },
  {
    name: 'History',
    href: '/history',
    icon: clock
  },
  {
    name: 'Referral Program',
    href: '/referral',
    icon: referral
  },
  {
    name: 'Support',
    href: '/support',
    icon: support
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: settings
  }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-81 bg-[#FFFFFF03] backdrop-blur-[27px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border-r border-border h-auto min-h-screen sticky top-0 flex flex-col">
      <div className="p-6 pt-8 mb-9.25">
        <Link href="/dashboard">
          <img src="/blockx-logo.svg" alt="BlockX" width={160} height={40} className="object-contain" />
        </Link>
      </div>

      <nav className="px-3 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'navigation-item flex items-center gap-3 px-4 py-3 rounded-[100px] border text-sm font-medium transition-colors',
                isActive
                  ? 'text-white bg-accent hover:text-foreground hover:bg-accent'
                  : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className={cn('h-6 w-6 transition-colors', isActive ? 'active ' : 'fill-muted-foreground')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Gradient separator */}
      <div className="px-3 my-3">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Active Orders Widget */}
      <div className="px-3 mt-6">
        <ActiveOrdersWidget />
      </div>
      <div className="px-3">
        <div className="active-order mb-10 w-full px-3.75 py-4 rounded-[18px] relative">
          <img src="active-order-bg.png" className="absolute top-0 left-0 w-full h-full -z-1 object-fill" alt="" />
          <div className="flex justify-between items-center gap-2 mb-4">
            <h3 className="text-white text-sm md:text-base lg:text-lg font-medium capitalize">Active Orders</h3>
            <a
              href="#"
              className="text-white/50 font-medium capitalize text-xs lg:text-sm transition-colors hover:text-white"
            >
              Sell all
            </a>
          </div>
          <div className="px-3.25 relative z-1  pt-4 pb-3.75  rounded-[12px] overflow-hidden">
            <img src="active-order-shap.png" className="absolute top-0 left-0 w-full h-full -z-1 object-fill" alt="" />
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#927EFF] w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold capitalize">
                  j
                </span>
                <div>
                  <h4 className="text-sm text-white font-bold capitalize">Jessy_trader77</h4>
                  <p className="text-white/50 font-medium text-xs md:text-sm capitalize mt-1">Buy USDT</p>
                </div>
              </div>
              <span className="text-white font-medium capitalize text-sm">AED 100</span>
            </div>
            <div className="separator w-full h-[0.632px] bg-[rgba(255,255,255,0.05)] my-3.25"></div>
            <div className="btns flex gap-1 justify-center items-center">
              <button className="relative grow rounded-[29px] py-2 px-2.5 z-1 flex items-center gap-1 text-xs font-medium text-white cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300 bg-[rgba(255,255,255,0.02)] border border-solid border-[rgba(255,255,255,0.05)] hover:border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M4.9751 6.92273C4.9751 6.9801 4.95231 7.03512 4.91174 7.07568C4.87118 7.11625 4.81616 7.13904 4.75879 7.13904C4.70142 7.13904 4.6464 7.11625 4.60584 7.07568C4.56527 7.03512 4.54248 6.9801 4.54248 6.92273C4.54248 6.86536 4.56527 6.81034 4.60584 6.76978C4.6464 6.72921 4.70142 6.70642 4.75879 6.70642C4.81616 6.70642 4.87118 6.72921 4.91174 6.76978C4.95231 6.81034 4.9751 6.86536 4.9751 6.92273ZM4.9751 6.92273H4.75879M7.13818 6.92273C7.13818 6.9801 7.11539 7.03512 7.07483 7.07568C7.03426 7.11625 6.97924 7.13904 6.92188 7.13904C6.86451 7.13904 6.80949 7.11625 6.76892 7.07568C6.72836 7.03512 6.70557 6.9801 6.70557 6.92273C6.70557 6.86536 6.72836 6.81034 6.76892 6.76978C6.80949 6.72921 6.86451 6.70642 6.92188 6.70642C6.97924 6.70642 7.03426 6.72921 7.07483 6.76978C7.11539 6.81034 7.13818 6.86536 7.13818 6.92273ZM7.13818 6.92273H6.92188M9.30127 6.92273C9.30127 6.9801 9.27848 7.03512 9.23791 7.07568C9.19735 7.11625 9.14233 7.13904 9.08496 7.13904C9.02759 7.13904 8.97257 7.11625 8.93201 7.07568C8.89144 7.03512 8.86865 6.9801 8.86865 6.92273C8.86865 6.86536 8.89144 6.81034 8.93201 6.76978C8.97257 6.72921 9.02759 6.70642 9.08496 6.70642C9.14233 6.70642 9.19735 6.72921 9.23791 6.76978C9.27848 6.81034 9.30127 6.86536 9.30127 6.92273ZM9.30127 6.92273H9.08496M12.1133 6.92273C12.1133 9.55074 9.78869 11.6815 6.92188 11.6815C6.42418 11.6821 5.92861 11.6168 5.44809 11.4871C4.77076 11.9635 3.9445 12.1799 3.12061 12.0968C3.02901 12.088 2.9378 12.0755 2.8472 12.0593C3.13149 11.7243 3.32566 11.3223 3.41133 10.8913C3.46324 10.6277 3.33461 10.3716 3.14195 10.1841C2.26691 9.3327 1.73047 8.1854 1.73047 6.92273C1.73047 4.29472 4.05507 2.16394 6.92188 2.16394C9.78869 2.16394 12.1133 4.29472 12.1133 6.92273Z"
                    stroke="white"
                    strokeWidth="1.03828"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Chat
              </button>
              <button className="relative grow rounded-[29px] py-2 px-2.5 z-1 flex items-center gap-1 text-xs font-medium text-white cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300 bg-[rgba(255,255,255,0.02)] border border-solid border-[rgba(255,255,255,0.05)] hover:border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M3.1582 9.47326L9.47399 3.15747M3.1582 3.15747L9.47399 9.47326"
                    stroke="white"
                    strokeWidth="0.947368"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Cancel
              </button>
              <button className="relative grow rounded-[29px] py-2 px-2.5 z-1 flex items-center gap-1 text-xs font-medium text-white cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300  hover:border-white/10 bg-[rgba(255,255,255,0.02)] border border-solid border-[rgba(255,255,255,0.05)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M5.92105 5.92072L5.94263 5.91019C6.01012 5.87648 6.08586 5.86281 6.16088 5.8708C6.2359 5.8788 6.30705 5.90812 6.36592 5.9553C6.42479 6.00249 6.4689 6.06555 6.49304 6.13703C6.51717 6.20851 6.52032 6.2854 6.50211 6.35861L6.12948 7.85125C6.11113 7.92449 6.11418 8.00146 6.13826 8.07303C6.16234 8.1446 6.20644 8.20776 6.26534 8.25501C6.32423 8.30227 6.39544 8.33165 6.47053 8.33966C6.54561 8.34766 6.62141 8.33397 6.68895 8.30019L6.71053 8.28914M11.0526 6.31546C11.0526 6.93751 10.9301 7.55347 10.6921 8.12817C10.454 8.70287 10.1051 9.22505 9.66524 9.66491C9.22539 10.1048 8.7032 10.4537 8.1285 10.6917C7.5538 10.9298 6.93784 11.0523 6.31579 11.0523C5.69374 11.0523 5.07778 10.9298 4.50308 10.6917C3.92838 10.4537 3.40619 10.1048 2.96634 9.66491C2.52648 9.22505 2.17757 8.70287 1.93952 8.12817C1.70147 7.55347 1.57895 6.93751 1.57895 6.31546C1.57895 5.05917 2.07801 3.85433 2.96634 2.966C3.85467 2.07767 5.0595 1.57861 6.31579 1.57861C7.57208 1.57861 8.77691 2.07767 9.66524 2.966C10.5536 3.85433 11.0526 5.05917 11.0526 6.31546ZM6.31579 4.34177H6.32V4.34598H6.31579V4.34177Z"
                    stroke="white"
                    strokeWidth="0.947368"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Appeal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Widget */}
      <div className="px-3 pb-6">
        <KYCWidget />
      </div>
    </aside>
  );
}
