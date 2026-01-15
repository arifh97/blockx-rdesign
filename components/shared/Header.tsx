'use client';

import { Search, HelpCircle, Bell, User, UserCircle, CreditCard, Tag, LogOut, Edit } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChainSwitcher } from './ChainSwitcher';
import { useCurrentUser } from '@/hooks/use-current-user';

export function Header() {
  const { logout } = usePrivy();
  const { disconnect } = useDisconnect();
  
  // Fetch current user with React Query
  const { data: userResult } = useCurrentUser();
  const dbUser = userResult?.success ? userResult.user : null;

  const handleLogout = () => {
    disconnect();
    logout();
  };

  // Get display name and address from database only
  const walletAddress = dbUser?.walletAddress || '';
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';
  
  const displayName = dbUser?.username || dbUser?.email || shortAddress;
  const displaySecondary = dbUser?.username || dbUser?.email ? shortAddress : dbUser?.email || '';
  return (
    <header className="h-23.75 top-0 z-10 bg-[rgba(255,255,255,0.01)] backdrop-blur-[27.5px] border-b border-solid border-[rgba(255,255,255,0.02)]">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-80">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-10 bg-[rgba(219,236,253,0.04)] rounded-full border border-solid! border-[rgba(219,236,253,0.02)]! text-[rgba(219,236,253,0.50)] placeholder:text-[rgba(219,236,253,0.50)]" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ChainSwitcher />
          
          <Button variant="ghost" size="icon" className="rounded-full bg-[#02101152]">
            <HelpCircle className="h-6 w-6 text-white" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-[#02101152] relative">
            <Bell className="h-6 w-6 text-white" />
            <span className='absolute top-1.75 right-1.75 w-2.75 h-2.75 border border-solid border-[#145989] rounded-full bg-[#41FDFE] z-1'></span>
          </Button>
          
          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-[#02101152]">
                <User className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] border-[#FFFFFF1A] rounded-xl p-0">
              {/* User Info Header */}
              <div className="flex items-center gap-3 p-4 pb-3">
                <div className="h-10 w-10 rounded-full bg-[#FFFFFF1A] flex items-center justify-center overflow-hidden">
                  {dbUser?.avatarUrl ? (
                    <Image src={dbUser.avatarUrl} alt={displayName} width={40} height={40} className="rounded-full object-cover" />
                  ) : (
                    <UserCircle className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  {displaySecondary && <p className="text-xs truncate">{displaySecondary}</p>}
                </div>
                <Link href="/profile">
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <DropdownMenuSeparator className="bg-[#FFFFFF1A] my-0" />

              {/* Menu Items */}
              <div className="p-2">
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer py-2.5 px-3 rounded-md hover:bg-[#DBECFD05]">
                    <UserCircle className="h-4 w-4" />
                    <span className="text-sm">My Profile</span>
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuItem className="cursor-pointer py-2.5 px-3 rounded-md hover:bg-[#DBECFD05]">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Payment Methods</span>
                </DropdownMenuItem>
                
                <Link href="/offers">
                  <DropdownMenuItem className="cursor-pointer py-2.5 px-3 rounded-md hover:bg-[#DBECFD05]">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm">My Offers</span>
                  </DropdownMenuItem>
                </Link>
              </div>

              <DropdownMenuSeparator className="bg-[#FFFFFF1A] my-0" />

              {/* Log Out */}
              <div className="p-2">
                <DropdownMenuItem 
                  variant="destructive"
                  className="cursor-pointer py-2.5 px-3 rounded-md bg-[#FB080A1A]"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Log Out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
