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
  DropdownMenuTrigger
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
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';

  const displayName = dbUser?.username || dbUser?.email || shortAddress;
  const displaySecondary = dbUser?.username || dbUser?.email ? shortAddress : dbUser?.email || '';
  return (
    <header className="h-23.75 top-0 z-10 bg-[rgba(255,255,255,0.01)] backdrop-blur-[27.5px] border-b border-solid border-[rgba(255,255,255,0.02)]">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-80">
          <div className="relative  shadow-none outline-none">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_2019_5952)">
                <circle cx="9.16669" cy="9.16667" r="7.5" stroke="#DBECFD" strokeOpacity="0.5" strokeWidth="1.5" />
                <path
                  d="M18.1767 17.479C18.1244 17.5579 18.03 17.6523 17.8411 17.8412C17.6523 18.03 17.5579 18.1244 17.479 18.1767C17.0168 18.4827 16.3916 18.325 16.1299 17.8363C16.0853 17.7529 16.0469 17.625 15.9703 17.3692C15.8865 17.0896 15.8446 16.9499 15.8365 16.8515C15.7889 16.2724 16.2723 15.7889 16.8515 15.8365C16.9498 15.8446 17.0896 15.8865 17.3691 15.9703C17.625 16.0469 17.7529 16.0853 17.8363 16.1299C18.325 16.3916 18.4827 17.0168 18.1767 17.479Z"
                  stroke="#DBECFD"
                  strokeOpacity="0.5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_2019_5952">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>

            <Input
              placeholder="Search"
              className="pl-10 bg-[rgba(219,236,253,0.04)] backdrop-blur-[25.013517379760742px] rounded-full border border-solid! border-[rgba(219,236,253,0.02)]! 
              text-[rgba(219,236,253,0.50)] placeholder:text-[rgba(219,236,253,0.50)] shadow-none outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden">
            <ChainSwitcher />
          </div>

          <Button variant="ghost" className="rounded-full bg-[#02101152] border border-solid border-white/50 size-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="size-6"
            >
              <path
                d="M12 20.25C16.97 20.25 21 16.556 21 12C21 7.444 16.97 3.75 12 3.75C7.03 3.75 3 7.444 3 12C3 14.104 3.859 16.023 5.273 17.48C5.705 17.927 6.013 18.52 5.859 19.121C5.69037 19.7782 5.37478 20.3885 4.936 20.906C5.28714 20.9691 5.64324 21.0005 6 21C7.282 21 8.47 20.598 9.445 19.913C10.255 20.133 11.113 20.25 12 20.25Z"
                stroke="white"
                strokeOpacity="0.7"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <Button variant="ghost" className="rounded-full bg-[#02101152] border border-solid border-white/50 relative  size-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="size-6"
            >
              <path
                d="M14.857 17.082C16.7202 16.8614 18.5509 16.4217 20.311 15.772C18.8204 14.1208 17.9967 11.9745 18 9.75V9C18 7.4087 17.3678 5.88258 16.2426 4.75736C15.1174 3.63214 13.5913 3 12 3C10.4087 3 8.88257 3.63214 7.75735 4.75736C6.63213 5.88258 5.99999 7.4087 5.99999 9V9.75C6.00301 11.9746 5.17898 14.121 3.68799 15.772C5.42099 16.412 7.24799 16.857 9.14299 17.082M14.857 17.082C12.959 17.3071 11.041 17.3071 9.14299 17.082M14.857 17.082C15.0011 17.5319 15.0369 18.0094 14.9616 18.4757C14.8862 18.942 14.7018 19.384 14.4234 19.7656C14.1449 20.1472 13.7803 20.4576 13.3592 20.6716C12.9381 20.8856 12.4724 20.9972 12 20.9972C11.5276 20.9972 11.0619 20.8856 10.6408 20.6716C10.2197 20.4576 9.85506 20.1472 9.57661 19.7656C9.29816 19.384 9.11375 18.942 9.0384 18.4757C8.96305 18.0094 8.99889 17.5319 9.14299 17.082"
                stroke="white"
                strokeOpacity="0.7"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute top-2.5 right-2.75 w-2.75 h-2.75 border border-solid border-[#145989] rounded-full bg-[#41FDFE] z-1"></span>
          </Button>

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full bg-[#02101152] border border-solid border-white/50  size-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.25 9C8.25 6.92893 9.92893 5.25 12 5.25C14.0711 5.25 15.75 6.92893 15.75 9C15.75 11.0711 14.0711 12.75 12 12.75C9.92893 12.75 8.25 11.0711 8.25 9ZM12 6.75C10.7574 6.75 9.75 7.75736 9.75 9C9.75 10.2426 10.7574 11.25 12 11.25C13.2426 11.25 14.25 10.2426 14.25 9C14.25 7.75736 13.2426 6.75 12 6.75Z"
                    fill="white"
                    fillOpacity="0.7"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12ZM12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 14.5456 3.77827 16.851 5.4421 18.5235C5.6225 17.5504 5.97694 16.6329 6.68837 15.8951C7.75252 14.7915 9.45416 14.25 12 14.25C14.5457 14.25 16.2474 14.7915 17.3115 15.8951C18.023 16.6329 18.3774 17.5505 18.5578 18.5236C20.2217 16.8511 21.25 14.5456 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75ZM17.1937 19.6554C17.0918 18.4435 16.8286 17.5553 16.2318 16.9363C15.5823 16.2628 14.3789 15.75 12 15.75C9.62099 15.75 8.41761 16.2628 7.76815 16.9363C7.17127 17.5553 6.90811 18.4434 6.80622 19.6553C8.28684 20.6618 10.0747 21.25 12 21.25C13.9252 21.25 15.7131 20.6618 17.1937 19.6554Z"
                    fill="white"
                    fillOpacity="0.7"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] border-[#FFFFFF1A] rounded-xl p-0">
              {/* User Info Header */}
              <div className="flex items-center gap-3 p-4 pb-3">
                <div className="h-10 w-10 rounded-full bg-[#FFFFFF1A] flex items-center justify-center overflow-hidden">
                  {dbUser?.avatarUrl ? (
                    <Image
                      src={dbUser.avatarUrl}
                      alt={displayName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
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
