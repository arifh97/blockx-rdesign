'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActiveOrdersWidget } from '../dashboard/ActiveOrdersWidget';
import { KYCWidget } from './KYCWidget';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Wallet',
    href: '/wallet',
    icon: Wallet
  },
  // {
  //   name: 'P2P Express',
  //   href: '/p2p-express',
  //   icon: Zap
  // },
  // {
  //   name: 'History',
  //   href: '/history',
  //   icon: Clock
  // },
  // {
  //   name: 'Referral Program',
  //   href: '/referral',
  //   icon: Gift
  // },
  // {
  //   name: 'Support',
  //   href: '/support',
  //   icon: HelpCircle
  // },
  // {
  //   name: 'Settings',
  //   href: '/settings',
  //   icon: Settings
  // }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#FFFFFF03] backdrop-blur-[55px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border-r border-border h-auto min-h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <Link href="/dashboard">
          <Image src="/blockx-logo.svg" alt="BlockX" width={120} height={40} className="object-contain" />
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
                'flex items-center gap-3 px-4 py-3 rounded-[100px] border text-sm font-medium transition-colors',
                isActive
                  ? 'text-white bg-accent hover:text-foreground hover:bg-accent'
                  : 'text-muted-foreground bg-accent hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-5 w-5" />
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

      {/* KYC Widget */}
      <div className="px-3 mt-4 pb-6">
        <KYCWidget />
      </div>
    </aside>
  );
}
