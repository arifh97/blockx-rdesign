import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type Config, readContract, writeContract, waitForTransactionReceipt } from "@wagmi/core"
import { useCallback } from "react"
import { toast } from "sonner"
import { type Address, erc20Abi, formatUnits } from "viem"
import { useAccount, useChainId, useConfig, useSignTypedData } from "wagmi"
import { orderBookAddress, vaultConfig } from "@/lib/contracts"
import { BID_EIP712_TYPES, type BidData, getOrderBookDomain, type BidMessage } from "@/lib/eip712"
import { createBidAction } from "@/app/actions/bids"
import { priceToContract, toContractValue } from "@/lib/contract-utils"
import { getTokensByChain } from "@/lib/tokens"
import { checkAndApproveToken } from "./check-and-approve-token"

export type BidFormValues = {
  bidType: "sell" | "buy"
  fromToken: string
  toToken: string
  price: string
  minAmount: string
  maxAmount: string
  kycLevel: string
  expiresIn: string
  fiatCurrency: string
  paymentMethods: string[]
  description: string
  availableHoursStart: string
  availableHoursEnd: string
  is24HourAccess: boolean
  isWorkdaysOnly: boolean
  timezone: string
  isGlobal: boolean
  allowedCountries: string[]
  isPrivate: boolean
  chainIds: number[] // For buy offers: which chains to accept
  paymentWindow: string // Payment window in seconds (e.g., "1800" for 30 minutes)
}

interface CreateBidResult {
  bidId?: string
  bidIds?: string[]
  bidGroupId?: string
  error?: string
}

/**
 * Ensures the user has sufficient balance in the vault for creating a sell offer.
 * If vault balance is insufficient, checks wallet balance and auto-deposits if possible.
 * 
 * Flow:
 * 1. Check vault balance
 * 2. If sufficient, return
 * 3. If insufficient, check wallet balance
 * 4. If wallet + vault >= required, deposit the difference
 * 5. If neither has enough, throw error
 */
async function ensureSufficientVaultBalance({
  address,
  fromToken,
  maxAmount,
  chainId,
  wagmiConfig,
}: {
  address: Address
  fromToken: Address
  maxAmount: string
  chainId: number
  wagmiConfig: Config
}) {
  // Get token decimals for conversion
  const tokens = getTokensByChain(chainId)
  const token = tokens.find((t) => t.address.toLowerCase() === fromToken.toLowerCase())
  const decimals = token?.decimals || 18
  const tokenSymbol = token?.symbol || "tokens"

  // Get vault address
  const vaultAddress = vaultConfig.address[chainId as keyof typeof vaultConfig.address] as Address

  if (!vaultAddress || vaultAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Vault not deployed on chain ${chainId}`)
  }

  // Convert maxAmount to contract format for comparison
  const requiredAmount = toContractValue(maxAmount, decimals)

  // Step 1: Check vault balance
  const vaultBalance = (await readContract(wagmiConfig, {
    ...vaultConfig,
    address: vaultAddress,
    functionName: "balanceOf",
    args: [address, fromToken],
  })) as bigint

  // If vault has enough, we're done
  if (vaultBalance >= requiredAmount) {
    return { vaultBalance, decimals }
  }

  // Step 2: Calculate how much more we need
  const shortfall = requiredAmount - vaultBalance
  const shortfallFormatted = formatUnits(shortfall, decimals)

  // Step 3: Check wallet balance
  const walletBalance = (await readContract(wagmiConfig, {
    address: fromToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  })) as bigint

  // Step 4: Check if wallet has enough to cover the shortfall
  if (walletBalance < shortfall) {
    const totalAvailable = vaultBalance + walletBalance
    const totalAvailableFormatted = formatUnits(totalAvailable, decimals)
    throw new Error(
      `Insufficient balance. Required: ${maxAmount} ${tokenSymbol}, Available: ${totalAvailableFormatted} ${tokenSymbol} (Vault: ${formatUnits(vaultBalance, decimals)}, Wallet: ${formatUnits(walletBalance, decimals)})`
    )
  }

  // Step 5: Auto-deposit the shortfall to vault
  toast.info(`Depositing ${shortfallFormatted} ${tokenSymbol} to vault...`)

  // Approve vault to spend tokens
  const approved = await checkAndApproveToken({
    tokenAddress: fromToken,
    spenderAddress: vaultAddress,
    amount: shortfall,
    userAddress: address,
    wagmiConfig,
  })

  if (!approved) {
    throw new Error("Token approval failed")
  }

  // Execute deposit
  const depositHash = await writeContract(wagmiConfig, {
    ...vaultConfig,
    address: vaultAddress,
    functionName: "deposit",
    args: [fromToken, shortfall],
  })

  await waitForTransactionReceipt(wagmiConfig, { hash: depositHash })

  toast.success(`Deposited ${shortfallFormatted} ${tokenSymbol} to vault`)

  // Return updated vault balance
  const newVaultBalance = vaultBalance + shortfall
  return { vaultBalance: newVaultBalance, decimals }
}

function validateBidParams(params: BidFormValues) {
  const { minAmount, maxAmount, price, paymentMethods, isGlobal, allowedCountries } = params

  // Validate amounts
  if (Number(minAmount) <= 0 || Number(maxAmount) <= 0) {
    throw new Error("Amounts must be greater than 0")
  }

  if (Number(minAmount) > Number(maxAmount)) {
    throw new Error("Min amount cannot be greater than max amount")
  }

  // Validate price
  if (Number(price) <= 0) {
    throw new Error("Price must be greater than 0")
  }

  // Validate payment methods
  if (paymentMethods.length === 0) {
    throw new Error("Please select at least one payment method")
  }

  // Validate location
  if (!isGlobal && allowedCountries.length === 0) {
    throw new Error("Please select at least one country or choose Global")
  }
}

function prepareBidMessage({
  address,
  params,
  decimals,
  chainId,
}: {
  address: Address
  params: BidFormValues
  decimals: number
  chainId: number
}) {
  const { fromToken, toToken, price, minAmount, maxAmount, kycLevel, expiresIn, bidType } = params

  // Generate nonce (timestamp + random)
  const nonce = BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000))

  // Calculate expiry timestamp
  const expiresAt = BigInt(Math.floor(Date.now() / 1000) + Number(expiresIn))

  // Convert to contract format for signing (bigint with proper decimals)
  const priceInWei = priceToContract(price)
  const minAmountInWei = toContractValue(minAmount, decimals)
  const maxAmountInWei = toContractValue(maxAmount, decimals)

  // Get OrderBook address for current chain
  const orderBookAddr = orderBookAddress[chainId as keyof typeof orderBookAddress] as Address

  if (!orderBookAddr || orderBookAddr === "0x0000000000000000000000000000000000000000") {
    throw new Error("OrderBook not deployed on this network")
  }

  // EIP-712 domain
  const domain = getOrderBookDomain(chainId, orderBookAddr)

  // Bid message (type-safe with BidMessage type)
  const message: BidMessage = {
    maker: address,
    base: fromToken as Address,
    quote: toToken as Address,
    price: priceInWei,
    minAmount: minAmountInWei,
    maxAmount: maxAmountInWei,
    kycLevel: Number(kycLevel),
    expiresAt: expiresAt,
    nonce: nonce,
    bidType: bidType === 'sell' ? 0 : 1, // 0 = SELL, 1 = BUY (enum in contract)
    paymentWindow: BigInt(params.paymentWindow), // Payment window in seconds
  }

  return { message, domain, nonce, expiresAt }
}

function prepareBidData({
  address,
  params,
  signature,
  nonce,
  expiresAt,
  decimals,
  chainId,
}: {
  address: Address
  params: BidFormValues
  signature: string
  nonce: bigint
  expiresAt: bigint
  decimals: number
  chainId: number
}): BidData {
  const {
    bidType,
    fromToken,
    toToken,
    price,
    minAmount,
    maxAmount,
    kycLevel,
    fiatCurrency,
    paymentMethods,
    description,
    is24HourAccess,
    availableHoursStart,
    availableHoursEnd,
    isWorkdaysOnly,
    timezone,
    isGlobal,
    allowedCountries,
    isPrivate,
  } = params

  // Generate availableHours JSON if not 24-hour access
  let availableHours: string | undefined
  if (!is24HourAccess && availableHoursStart && availableHoursEnd) {
    const schedule = {
      start: availableHoursStart,
      end: availableHoursEnd,
      workdaysOnly: isWorkdaysOnly,
      timezone: timezone,
    }
    availableHours = JSON.stringify(schedule)
  }

  // Generate access token for private offers
  const accessToken = isPrivate ? `${Date.now()}-${Math.random().toString(36).substring(2, 15)}` : undefined

  // Submit to backend with human-readable values
  const bidData: BidData = {
    maker: address,
    from: fromToken as Address,
    to: toToken as Address,
    price: price,
    minAmount: minAmount,
    maxAmount: maxAmount,
    kycLevel: Number(kycLevel),
    expiresAt: expiresAt.toString(),
    nonce: nonce.toString(),
    signature,
    tokenDecimals: decimals,
    fiatCurrency: fiatCurrency,
    paymentMethods: paymentMethods,
    description: description || undefined,
    bidType: bidType,
    chainId, // The specific chain this bid is for
    paymentWindow: Number(params.paymentWindow), // Payment window in seconds
    // Payment handling based on bid type
    ...(bidType === "sell" ? { paymentAccountIds: paymentMethods } : { paymentMethodTypes: paymentMethods }),
    // Customization fields
    availableHours,
    timezone: timezone,
    isGlobal: isGlobal,
    allowedCountries: isGlobal ? undefined : allowedCountries,
    isPrivate: isPrivate,
    accessToken,
  }

  return bidData
}

async function saveBidToDatabase(bidData: BidData) {
  const result = await createBidAction(bidData)

  if (!result.success) {
    throw new Error(result.error || "Failed to create bid")
  }

  return result
}

export function useCreateBid() {
  const { address } = useAccount()
  const chainId = useChainId()
  const wagmiConfig = useConfig()
  const { signTypedDataAsync } = useSignTypedData()
  const queryClient = useQueryClient()

  const {
    mutateAsync: createBidAsync,
    isPending: isCreating,
    error,
    data: result,
  } = useMutation({
    mutationFn: async (params: BidFormValues): Promise<CreateBidResult> => {
      if (!address) {
        throw new Error("Please connect your wallet")
      }

      // 1. Validate bid parameters
      validateBidParams(params)

      // 2. For buy offers with multiple chains, create separate bids for each chain
      if (params.bidType === "buy" && params.chainIds.length > 0) {
        // Generate a unique group ID for related bids
        const bidGroupId = `${address}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const createdBids: string[] = []

        for (const targetChainId of params.chainIds) {
          // Get token decimals for this chain
          const tokens = getTokensByChain(targetChainId)
          const token = tokens.find((t) => t.address.toLowerCase() === params.fromToken.toLowerCase())
          const decimals = token?.decimals || 18

          // Prepare bid message for this specific chain
          const { message, domain, nonce, expiresAt } = prepareBidMessage({
            address,
            params,
            decimals,
            chainId: targetChainId,  // Use target chain for signing
          })

          // Sign the bid for this chain
          const signature = await signTypedDataAsync({
            domain,
            types: BID_EIP712_TYPES,
            primaryType: "Bid",
            message,
          })

          // Prepare bid data with bidGroupId
          const bidData = prepareBidData({
            address,
            params,
            signature,
            nonce,
            expiresAt,
            decimals,
            chainId: targetChainId,
          })

          // Add bidGroupId to link related bids
          bidData.bidGroupId = bidGroupId

          // Save to database
          const saveResult = await saveBidToDatabase(bidData)
          if (saveResult.bid?.id) {
            createdBids.push(saveResult.bid.id)
          }
        }

        return { 
          bidIds: createdBids,
          bidGroupId,
        }
      }

      // 3. For sell offers (single chain flow)
      let decimals: number
      if (params.bidType === "sell") {
        // Check vault balance and auto-deposit from wallet if needed
        const result = await ensureSufficientVaultBalance({
          address,
          fromToken: params.fromToken as Address,
          maxAmount: params.maxAmount,
          chainId,
          wagmiConfig,
        })
        decimals = result.decimals
      } else {
        // Fallback for buy offers without chainIds
        const tokens = getTokensByChain(chainId)
        const token = tokens.find((t) => t.address.toLowerCase() === params.fromToken.toLowerCase())
        decimals = token?.decimals || 18
      }

      // 4. Prepare bid message for signing
      const { message, domain, nonce, expiresAt } = prepareBidMessage({
        address,
        params,
        decimals,
        chainId,
      })

      // 5. Sign the bid
      const signature = await signTypedDataAsync({
        domain,
        types: BID_EIP712_TYPES,
        primaryType: "Bid",
        message,
      })

      // 6. Prepare bid data for database
      const bidData = prepareBidData({
        address,
        params,
        signature,
        nonce,
        expiresAt,
        decimals,
        chainId,
      })

      // 7. Save bid to database
      const saveResult = await saveBidToDatabase(bidData)

      return { bidId: saveResult.bid?.id }
    },
    onSuccess(data) {
      // Invalidate queries to refetch the lists
      queryClient.invalidateQueries({ queryKey: ["myBids"] })
      queryClient.invalidateQueries({ queryKey: ["vaultBalance"] })
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] })

      if (data.bidIds && data.bidIds.length > 1) {
        toast.success("Multi-chain bid created successfully!", {
          description: `Created ${data.bidIds.length} bids across different chains`,
        })
      } else {
        toast.success("Bid created successfully!", {
          description: data.bidId ? `Bid ID: ${data.bidId.slice(0, 10)}...` : undefined,
        })
      }
    },
    onError(error) {
      if (error instanceof Error) {
        console.error(error.message)
        toast.error("Bid creation failed", {
          description: error.message,
        })
      }
    },
  })

  const createBid = useCallback(
    async (params: BidFormValues): Promise<CreateBidResult> => {
      try {
        const result = await createBidAsync(params)
        return result
      } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message }
        return { error: "Unknown Error" }
      }
    },
    [createBidAsync],
  )

  return {
    createBid,
    isLoading: isCreating,
    error: error?.message || null,
    bidId: result?.bidId || null,
  }
}
