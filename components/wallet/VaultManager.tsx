"use client"

import { useAccount, useChainId } from "wagmi"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAllVaultBalances } from "@/hooks/use-all-vault-balances"
import { getTokensByChain } from "@/lib/tokens"
import { ArrowLeftRight, Info } from "lucide-react"
import { DepositDialog } from "../shared/DepositDialog"
import { WithdrawDialog } from "../shared/WithdrawDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { KYCWalletBadge } from "./KYCWalletBadge"

export function VaultManager() {
  const { address } = useAccount()
  const chainId = useChainId()
  const tokens = getTokensByChain(chainId)

  const { allBalances, isLoading: isLoadingAllBalances } = useAllVaultBalances()

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vault Manager</CardTitle>
          <CardDescription>Connect your wallet to manage vault deposits</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Calculate totals across all tokens (in USD equivalent - simplified to just sum for now)
  const totalVaultBalance = allBalances.reduce((sum, balance) => {
    const total = parseFloat(balance.availableFormatted) + parseFloat(balance.totalLockedFormatted)
    return sum + total
  }, 0)

  const totalInTrade = allBalances.reduce((sum, balance) => {
    return sum + parseFloat(balance.totalLockedFormatted)
  }, 0)

  const totalAvailable = allBalances.reduce((sum, balance) => {
    return sum + parseFloat(balance.availableFormatted)
  }, 0)

  return (
    <TooltipProvider>
      <div className="space-y-4 md:space-y-6 mt-6 md:mt-12 px-4 md:px-0">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Wallet</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              View your total balance and manage funds in trade or available for new offers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <DepositDialog tokens={tokens} />
            <WithdrawDialog tokens={tokens} />
            <Link href="/create-offer" className="flex-1 md:flex-none">
              <Button className="gap-2 w-[150px] h-[44px] text-md">
                <ArrowLeftRight className="size-4 md:size-5" />
                Create Offer
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 items-start">
          {/* Vault Balance Card */}
          <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Summary Cards */}
              {isLoadingAllBalances ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading vault balances...</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {/* Total */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm text-muted-foreground">Total</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total balance in your vault</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-2xl sm:text-3xl font-semibold">$ {totalVaultBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>

                    {/* Available */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm text-muted-foreground">Available</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Funds available for new orders</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-2xl sm:text-3xl font-semibold">$ {totalAvailable.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>

                    {/* In Trade */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm text-muted-foreground">In trade</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Funds locked in active orders</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-2xl sm:text-3xl font-semibold">$ {totalInTrade.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>

                  

                  {/* Tokens Table */}
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <Table className="border-separate border-spacing-y-2">
                      <TableHeader>
                        <TableRow className="bg-[#DBECFD08] rounded-xl hover:bg-[#DBECFD08]">
                          <TableHead className="text-[#7E7F8C] font-normal rounded-l-xl text-xs sm:text-sm">Token</TableHead>
                          <TableHead className="text-right text-[#7E7F8C] font-normal text-xs sm:text-sm">Available</TableHead>
                          <TableHead className="text-right text-[#7E7F8C] font-normal text-xs sm:text-sm">In trade</TableHead>
                          <TableHead className="text-right text-[#7E7F8C] font-normal rounded-r-xl text-xs sm:text-sm">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allBalances.map((balance, index) => {
                          const total = balance.available + balance.totalLocked
                          const totalFormatted = (
                            parseFloat(balance.availableFormatted) + parseFloat(balance.totalLockedFormatted)
                          ).toFixed(balance.token.decimals === 6 ? 2 : 6)
                          
                          return (
                            <TableRow
                              key={balance.token.address}
                              className={`rounded-xl ${index % 2 === 0 ? 'bg-[#0D171E]/20' : 'bg-[#0D171E]/60'}`}
                            >
                              <TableCell className="rounded-l-xl">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                                    <AvatarImage src={balance.token.logoURI} alt={balance.token.symbol} />
                                    <AvatarFallback className="text-xs font-medium">
                                      {balance.token.symbol.slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm sm:text-base">{balance.token.symbol}</p>
                                    <p className="text-xs text-muted-foreground hidden sm:block">{balance.token.name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`text-xs sm:text-sm ${balance.available > BigInt(0) ? "font-medium" : "text-muted-foreground"}`}>
                                  {balance.availableFormatted} <span className="hidden sm:inline">{balance.token.symbol}</span>
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`text-xs sm:text-sm ${balance.totalLocked > BigInt(0) ? "font-medium" : "text-muted-foreground"}`}>
                                  {balance.totalLockedFormatted} <span className="hidden sm:inline">{balance.token.symbol}</span>
                                </span>
                              </TableCell>
                              <TableCell className="text-right rounded-r-xl">
                                <span className={`text-xs sm:text-sm ${total > BigInt(0) ? "font-semibold" : "text-muted-foreground"}`}>
                                  {totalFormatted} <span className="hidden sm:inline">{balance.token.symbol}</span>
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )
            }
            </div>
          </CardContent>
        </Card>

          {/* KYC Badge */}
          <KYCWalletBadge />
        </div>
      </div>
    </TooltipProvider>
  )
}
