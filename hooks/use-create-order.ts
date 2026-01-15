import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type Config, waitForTransactionReceipt, writeContract, readContract, simulateContract } from "@wagmi/core"
import { useCallback } from "react"
import { toast } from "sonner"
import { type Address, parseEventLogs, erc20Abi, formatUnits } from "viem"
import { useAccount, useChainId, useConfig, useSignTypedData } from "wagmi"
import { orderBookConfig, orderBookAbi, vaultConfig } from "@/lib/contracts"
import { getOrderBookDomain, ORDER_INTENT_EIP712_TYPES } from "@/lib/eip712"
import { getBidWithUserAction, getBidPaymentAccountsAction } from "@/app/actions/bids"
import { createOrderAction } from "@/app/actions/orders"
import { getOrCreateUserAction } from "@/app/actions/users"
import { priceToContract, toContractValue, fromContractValue } from "@/lib/contract-utils"
import { getTokensByChain } from "@/lib/tokens"
import { getPaymentAccountDetailsAction } from "@/app/actions/user-payment-accounts"
import { checkAndApproveToken } from "./check-and-approve-token"


export type OrderIntentMessage = {
  bidHash: `0x${string}`
  taker: `0x${string}`
  amount: bigint
  maxSlippageBps: number
  expiresAt: bigint
  nonce: bigint
}

interface CreateOrderParams {
  bidHash: string
  amount: string  // Amount in contract format (wei/bigint as string) - already converted by caller
  maxSlippageBps?: number
  expiresIn?: number
  selectedPaymentAccountId?: string  // For sell flow: seller's payment account to receive fiat
}

interface CreateOrderResult {
  orderId?: `0x${string}`
  txHash?: `0x${string}`
  error?: string
}

/**
 * Validates bid status and ensures sufficient vault balance for the order.
 * For BUY bids (taker is seller), will auto-deposit from wallet if vault is insufficient.
 * For SELL bids (maker is seller), only validates - can't deposit for someone else.
 */
async function validateBidAndEnsureBalance({
  bidHash,
  chainId,
  wagmiConfig,
  takerAddress,
  orderAmount,
}: {
  bidHash: string
  chainId: number
  wagmiConfig: Config
  takerAddress: Address
  orderAmount: string  // Amount for this specific order (in contract format)
}) {
  // Fetch complete bid data with all required fields
  const bidResult = await getBidWithUserAction(bidHash)
  
  if (!bidResult.success || !bidResult.bid) {
    throw new Error(bidResult.error || "Bid not found")
  }

  const bid = bidResult.bid

  if (bid.status !== "active") {
    throw new Error("Bid is not active")
  }

  // Get token info
  const tokens = getTokensByChain(chainId)
  const token = tokens.find(t => t.address.toLowerCase() === bid.fromToken.toLowerCase())
  const decimals = token?.decimals || 18
  const tokenSymbol = token?.symbol || "tokens"
  const fromToken = bid.fromToken as Address

  // Get vault address
  const vaultAddress = vaultConfig.address[chainId as keyof typeof vaultConfig.address] as Address
  
  if (!vaultAddress || vaultAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Vault not deployed on chain ${chainId}`)
  }

  // Convert order amount to bigint for comparison
  const requiredAmount = BigInt(orderAmount)

  // Determine who has the crypto based on bid type
  // For SELL bids: maker (seller) has crypto
  // For BUY bids: taker (seller) has crypto
  const isBuyBid = bid.bidType === 'buy'
  const cryptoHolderAddress = isBuyBid ? takerAddress : bid.makerAddress as Address

  // Check crypto holder's vault balance
  const vaultBalance = await readContract(wagmiConfig, {
    ...vaultConfig,
    address: vaultAddress,
    functionName: "balanceOf",
    args: [cryptoHolderAddress, fromToken],
  }) as bigint

  // If vault has enough, we're done
  if (vaultBalance >= requiredAmount) {
    return bid
  }

  // Vault is insufficient - handle based on bid type
  if (!isBuyBid) {
    // SELL bid: maker is seller, we can't deposit for them
    const formattedRequired = fromContractValue(requiredAmount, decimals)
    const formattedAvailable = fromContractValue(vaultBalance, decimals)
    throw new Error(
      `Seller has insufficient vault balance. Required: ${formattedRequired} ${tokenSymbol}, Available: ${formattedAvailable} ${tokenSymbol}`
    )
  }

  // BUY bid: taker is seller, we can auto-deposit from their wallet
  const shortfall = requiredAmount - vaultBalance
  const shortfallFormatted = formatUnits(shortfall, decimals)

  // Check taker's wallet balance
  const walletBalance = await readContract(wagmiConfig, {
    address: fromToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [takerAddress],
  }) as bigint

  // Check if wallet has enough to cover the shortfall
  if (walletBalance < shortfall) {
    const totalAvailable = vaultBalance + walletBalance
    const totalAvailableFormatted = formatUnits(totalAvailable, decimals)
    throw new Error(
      `Insufficient balance. Required: ${fromContractValue(requiredAmount, decimals)} ${tokenSymbol}, Available: ${totalAvailableFormatted} ${tokenSymbol} (Vault: ${formatUnits(vaultBalance, decimals)}, Wallet: ${formatUnits(walletBalance, decimals)})`
    )
  }

  // Auto-deposit the shortfall to vault
  toast.info(`Depositing ${shortfallFormatted} ${tokenSymbol} to vault...`)

  // Approve vault to spend tokens
  const approved = await checkAndApproveToken({
    tokenAddress: fromToken,
    spenderAddress: vaultAddress,
    amount: shortfall,
    userAddress: takerAddress,
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

  return bid
}

function prepareOrderIntent({
  bid,
  address,
  chainId,
  amount,
  maxSlippageBps,
  expiresIn,
}: {
  bid: Awaited<ReturnType<typeof getBidWithUserAction>>["bid"]
  address: Address
  chainId: number
  amount: string
  maxSlippageBps: number
  expiresIn: number
}) {
  if (!bid) throw new Error("Bid is required")

  // Get token decimals for conversion
  const tokens = getTokensByChain(chainId)
  const token = tokens.find(t => t.address.toLowerCase() === bid.fromToken.toLowerCase())
  const decimals = token?.decimals || 18

  // Convert to contract format (bigint)
  const orderAmount = BigInt(amount)
  const minAmount = toContractValue(bid.minAmount, decimals)
  const maxAmount = toContractValue(bid.maxAmount, decimals)

  // Validate amount is within bid's range
  if (orderAmount < minAmount) {
    throw new Error(`Amount ${orderAmount} is below bid's minimum ${minAmount}`)
  }
  if (orderAmount > maxAmount) {
    throw new Error(`Amount ${orderAmount} exceeds bid's maximum ${maxAmount}`)
  }

  // Generate OrderIntent nonce (timestamp + random for uniqueness)
  const nonce = BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000))
  
  // Calculate expiry timestamp
  const expiresAt = BigInt(Math.floor(Date.now() / 1000) + expiresIn)

  // Prepare OrderIntent message
  const orderIntentMessage: OrderIntentMessage = {
    bidHash: bid.bidHash as `0x${string}`,
    taker: address,
    amount: orderAmount,
    maxSlippageBps,
    expiresAt,
    nonce,
  }

  // Get OrderBook domain for EIP-712 signing
  const orderBookAddr = orderBookConfig.address[chainId as keyof typeof orderBookConfig.address] as Address
  
  if (!orderBookAddr || orderBookAddr === "0x0000000000000000000000000000000000000000") {
    throw new Error(`OrderBook not deployed on chain ${chainId}`)
  }

  const domain = getOrderBookDomain(chainId, orderBookAddr)

  return { orderIntentMessage, domain, orderBookAddr }
}

async function createOrderOnChain({
  bid,
  address,
  orderIntentMessage,
  takerSig,
  orderBookAddr,
  maxSlippageBps,
  wagmiConfig,
  chainId,
}: {
  bid: Awaited<ReturnType<typeof getBidWithUserAction>>["bid"]
  address: Address
  orderIntentMessage: OrderIntentMessage
  takerSig: string
  orderBookAddr: Address
  maxSlippageBps: number
  wagmiConfig: Config
  chainId: number
}) {
  if (!bid) throw new Error("Bid is required")

  // Get token decimals for conversion
  const tokens = getTokensByChain(chainId)
  const token = tokens.find(t => t.address.toLowerCase() === bid.fromToken.toLowerCase())
  const decimals = token?.decimals || 18

  // Prepare Bid struct from database - convert human-readable values to contract format
  const bidStruct = {
    maker: bid.makerAddress as Address,
    base: bid.fromToken as Address,
    quote: bid.toToken as Address,
    price: priceToContract(bid.price),
    minAmount: toContractValue(bid.minAmount, decimals),
    maxAmount: toContractValue(bid.maxAmount, decimals),
    kycLevel: bid.kycLevel,
    expiresAt: bid.expiresAt,
    nonce: bid.nonce,
    bidType: bid.bidType === 'sell' ? 0 : 1, // 0 = SELL, 1 = BUY (enum in contract)
    paymentWindow: BigInt(bid.paymentWindow ?? 1800), // Payment window in seconds (default 30 min)
  }

  // Prepare OrderIntent struct
  const orderIntentStruct = {
    bidHash: bid.bidHash as `0x${string}`,
    taker: address,
    amount: orderIntentMessage.amount,
    maxSlippageBps,
    expiresAt: orderIntentMessage.expiresAt,
    nonce: orderIntentMessage.nonce,
  }

  // Simulate the transaction first to catch errors before sending
  const { request } = await simulateContract(wagmiConfig, {
    ...orderBookConfig,
    address: orderBookAddr,
    functionName: "create",
    args: [
      bidStruct,
      bid.signature as `0x${string}`, // makerSig
      orderIntentStruct,
      takerSig as `0x${string}`, // takerSig
    ],
  })

  // Call OrderBook.create() on-chain
  const hash = await writeContract(wagmiConfig, request)

  // Wait for transaction confirmation and get receipt
  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash })

  // Parse OrderCreated event from transaction logs using the ABI
  const logs = parseEventLogs({
    abi: orderBookAbi,
    eventName: "OrderCreated",
    logs: receipt.logs,
  })

  if (logs.length === 0 || !logs[0].args.orderId) {
    throw new Error("OrderCreated event not found in transaction logs")
  }

  const orderId = logs[0].args.orderId

  return { hash, orderId }
}

async function saveOrderToDatabase({
  orderId,
  bid,
  address,
  hash,
  orderAmount,
  chainId,
  selectedPaymentAccountId,
}: {
  orderId: `0x${string}`
  bid: Awaited<ReturnType<typeof getBidWithUserAction>>["bid"]
  address: Address
  hash: `0x${string}`
  orderAmount: bigint
  chainId: number
  selectedPaymentAccountId?: string
}) {
  if (!bid) throw new Error("Bid is required")

  // Get or create taker user
  const takerResult = await getOrCreateUserAction(address)
  if (!takerResult.success || !takerResult.user) {
    console.error("Failed to get/create taker user:", takerResult.error)
    throw new Error("Failed to get taker user")
  }

  // Get token decimals for conversion
  const tokens = getTokensByChain(chainId)
  const token = tokens.find(t => t.address.toLowerCase() === bid.fromToken.toLowerCase())
  const decimals = token?.decimals || 18

  // Determine buyer and seller based on bid type
  // For SELL bids: maker is seller, taker is buyer
  // For BUY bids: maker is buyer, taker is seller
  const isSellBid = bid.bidType === 'sell';
  const buyerId = isSellBid ? takerResult.user.id : bid.creator.id;
  const sellerId = isSellBid ? bid.creator.id : takerResult.user.id;
  const buyerAddress = isSellBid ? address : bid.makerAddress as Address;
  const sellerAddress = isSellBid ? bid.makerAddress as Address : address;

  // Determine which payment account to use
  let finalPaymentAccountId = selectedPaymentAccountId;
  
  // For SELL bids (buyer taking sell offer): fetch seller's payment accounts from bid
  if (isSellBid && !finalPaymentAccountId) {
    try {
      const paymentAccountsResult = await getBidPaymentAccountsAction(bid.id);
      if (paymentAccountsResult.success && paymentAccountsResult.accounts && paymentAccountsResult.accounts.length > 0) {
        // Use the first payment account from the bid
        finalPaymentAccountId = paymentAccountsResult.accounts[0].paymentAccountId;
      }
    } catch (error) {
      console.error("Failed to fetch bid payment accounts:", error);
      // Continue without payment account - buyer will get details via chat
    }
  }

  // Fetch payment account details to create snapshot
  let paymentMethod: string | undefined;
  let paymentDetailsSnapshot: string | undefined;
  let paymentInstructions: string | undefined;

  if (finalPaymentAccountId) {
    try {
      const accountDetailsResult = await getPaymentAccountDetailsAction(finalPaymentAccountId);
      if (accountDetailsResult.success && accountDetailsResult.data) {
        paymentMethod = accountDetailsResult.data.paymentMethod;
        paymentDetailsSnapshot = accountDetailsResult.data.paymentDetails; // Already decrypted by the action
        // Get custom instructions from bid payment account if this is a sell bid
        if (isSellBid) {
          const paymentAccountsResult = await getBidPaymentAccountsAction(bid.id);
          if (paymentAccountsResult.success && paymentAccountsResult.accounts) {
            const linkedAccount = paymentAccountsResult.accounts.find(
              acc => acc.paymentAccountId === finalPaymentAccountId
            );
            if (linkedAccount?.customInstructions) {
              paymentInstructions = linkedAccount.customInstructions;
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch payment account details for snapshot:", error);
    }
  }

  // Generate unique payment reference for this order
  const paymentReference = `BX-${orderId.slice(0, 10).toUpperCase()}`;

  const orderData = {
    orderId,
    bidId: bid.id,
    makerId: sellerId, // Seller (who has the crypto)
    takerId: buyerId,  // Buyer (who pays fiat)
    makerAddress: sellerAddress,
    takerAddress: buyerAddress,
    fromToken: bid.fromToken as Address,
    fromAmount: fromContractValue(orderAmount, decimals), // Convert back to human-readable
    price: bid.price, // Already human-readable
    agreedFee: "0", // Fee will be calculated on-chain
    fiatCurrency: bid.fiatCurrency, // Snapshot of fiat currency from bid
    chainId, // Chain ID where the order is executed
    status: "locked",
    openedAt: BigInt(Math.floor(Date.now() / 1000)),
    paymentDeadline: BigInt(Math.floor(Date.now() / 1000) + 1800), // 30 minutes
    confirmDeadline: BigInt(Math.floor(Date.now() / 1000) + 86400), // 24 hours
    txHash: hash,
    selectedPaymentAccountId: finalPaymentAccountId,
    paymentMethod,
    paymentDetailsSnapshot,
    paymentInstructions,
    paymentReference,
  }

  const dbResult = await createOrderAction(orderData)
  
  if (!dbResult.success) {
    console.error("Failed to save order to database:", dbResult.error)
    // Don't throw here - order was created on-chain successfully
  }
}

export function useCreateOrder() {
  const { address } = useAccount()
  const chainId = useChainId()
  const wagmiConfig = useConfig()
  const { signTypedDataAsync } = useSignTypedData()
  const queryClient = useQueryClient()

  const {
    mutateAsync: createOrderAsync,
    isPending: isCreating,
    error,
    data: result,
  } = useMutation({
    mutationFn: async (params: CreateOrderParams): Promise<CreateOrderResult> => {
      if (!address) {
        throw new Error("Wallet not connected")
      }

      const { bidHash, amount, maxSlippageBps = 0, expiresIn = 300, selectedPaymentAccountId } = params

      // 1. Validate bid and ensure seller has sufficient vault balance (auto-deposit if needed for BUY bids)
      const bid = await validateBidAndEnsureBalance({ 
        bidHash, 
        chainId, 
        wagmiConfig, 
        takerAddress: address,
        orderAmount: amount  // Pass the specific order amount for validation
      })

      // 2. Prepare OrderIntent data
      const { orderIntentMessage, domain, orderBookAddr } = prepareOrderIntent({
        bid,
        address,
        chainId,
        amount,
        maxSlippageBps,
        expiresIn,
      })

      // 3. Sign OrderIntent with buyer's wallet
      const takerSig = await signTypedDataAsync({
        domain,
        types: ORDER_INTENT_EIP712_TYPES,
        primaryType: "OrderIntent",
        message: orderIntentMessage,
      })

      // 4. Create order on-chain and wait for confirmation
      const { hash, orderId } = await createOrderOnChain({
        bid,
        address,
        orderIntentMessage,
        takerSig,
        orderBookAddr,
        maxSlippageBps,
        wagmiConfig,
        chainId,
      })

      // 5. Save order to database
      await saveOrderToDatabase({ 
        orderId, 
        bid, 
        address, 
        hash, 
        orderAmount: orderIntentMessage.amount, 
        chainId,
        selectedPaymentAccountId,
      })

      return { orderId, txHash: hash }
    },
    onSuccess(data) {
      // Invalidate balance queries in case auto-deposit occurred
      queryClient.invalidateQueries({ queryKey: ["vaultBalance"] })
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] })
      
      toast.success("Order created successfully!", {
        description: `Order ID: ${data.orderId?.slice(0, 10)}...`,
      })
    },
    onError(error) {
      if (error instanceof Error) {
        console.error(error.message)
        toast.error("Order creation failed", {
          description: error.message,
        })
      }
    },
  })

  const createOrder = useCallback(
    async (params: CreateOrderParams): Promise<CreateOrderResult> => {
      try {
        const result = await createOrderAsync(params)
        return result
      } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message }
        return { error: "Unknown Error" }
      }
    },
    [createOrderAsync],
  )

  return {
    createOrder,
    isLoading: isCreating,
    error: error?.message || null,
    orderId: result?.orderId || null,
    txHash: result?.txHash || null,
  }
}
