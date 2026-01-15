"use server"

import { createBid, getActiveBidsByMaker, getBidByHash, getBidWithUser } from "@/db/queries/bids"
import { type NewBid } from "@/db/schema/bids"
import { getOrCreateUser } from "@/db/queries/users"
import { verifyAuthentication } from "@/lib/auth"
import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem"
import { BID_TYPEHASH, BidData } from "@/lib/eip712"
import { priceToContract, toContractValue } from "@/lib/contract-utils"
import { createBidPaymentAccounts, getBidPaymentAccounts } from "@/db/queries/bid-payment-accounts"
import { createBidPaymentPreferences } from "@/db/queries/bid-payment-preferences"

function computeBidHash(
  bid: Omit<BidData, "signature" | "fiatCurrency" | "paymentMethods">,
  tokenDecimals: number
): string {
  // Encode with BID_TYPEHASH as first parameter - matches contract's _hashBid function
  // Contract struct: Bid(address maker,address base,address quote,uint256 price,uint256 minAmount,uint256 maxAmount,uint8 kycLevel,uint256 expiresAt,uint256 nonce,uint8 bidType,uint256 paymentWindow)
  const encoded = encodeAbiParameters(
    parseAbiParameters("bytes32,address,address,address,uint256,uint256,uint256,uint8,uint256,uint256,uint8,uint256"),
    [
      BID_TYPEHASH,
      bid.maker,
      bid.from,  // maps to base
      bid.to,    // maps to quote
      priceToContract(bid.price), // Convert human-readable price to contract format
      toContractValue(bid.minAmount, tokenDecimals), // Convert with token decimals
      toContractValue(bid.maxAmount, tokenDecimals), // Convert with token decimals
      bid.kycLevel,
      BigInt(bid.expiresAt),
      BigInt(bid.nonce),
      bid.bidType === 'buy' ? 1 : 0, // 0 = SELL, 1 = BUY (matches contract enum)
      BigInt(bid.paymentWindow), // Payment window in seconds
    ]
  )
  return keccak256(encoded)
}

export async function createBidAction(bidData: BidData) {
  try {
    // Verify authentication and get Privy ID
    const privyId = await verifyAuthentication()

    // Get or create user by Privy ID and wallet address
    const user = await getOrCreateUser(privyId, bidData.maker.toLowerCase())
    if (!user) {
      throw new Error("Failed to get or create user")
    }

    // Compute bid hash using token decimals for contract conversion
    const bidHash = computeBidHash(bidData, bidData.tokenDecimals)

    // Check if bid already exists
    const existingBid = await getBidByHash(bidHash)
    if (existingBid) {
      throw new Error("Bid already exists")
    }

    // Create bid in database
    const newBid: NewBid = {
      creatorId: user.id,
      bidHash,
      makerAddress: bidData.maker.toLowerCase(),
      fromToken: bidData.from.toLowerCase(),
      toToken: bidData.to.toLowerCase(),
      price: bidData.price,
      minAmount: bidData.minAmount,
      maxAmount: bidData.maxAmount,
      kycLevel: bidData.kycLevel,
      expiresAt: BigInt(bidData.expiresAt),
      nonce: BigInt(bidData.nonce),
      signature: bidData.signature,
      status: "active",
      fiatCurrency: bidData.fiatCurrency,
      paymentMethods: bidData.paymentMethods,
      description: bidData.description,
      bidType: bidData.bidType || "sell",
      // Each bid is for a specific chain (chainId is required)
      chainId: bidData.chainId,
      paymentWindow: bidData.paymentWindow, // Payment window in seconds
      bidGroupId: bidData.bidGroupId, // For multi-chain buy offers
      availableHours: bidData.availableHours,
      timezone: bidData.timezone,
      isGlobal: bidData.isGlobal,
      allowedCountries: bidData.allowedCountries,
      isPrivate: bidData.isPrivate,
      accessToken: bidData.accessToken,
    }

    const bid = await createBid(newBid)

    // Handle payment storage based on bid type
    if (bidData.bidType === "sell") {
      // For SELL bids: link to full payment account details
      if (bidData.paymentAccountIds && bidData.paymentAccountIds.length > 0) {
        const paymentAccounts = bidData.paymentAccountIds.map(accountId => ({
          bidId: bid.id,
          paymentAccountId: accountId,
        }))
        await createBidPaymentAccounts(paymentAccounts)
      }
    } else if (bidData.bidType === "buy") {
      // For BUY bids: store payment method preferences (types only)
      if (bidData.paymentMethodTypes && bidData.paymentMethodTypes.length > 0) {
        const paymentPreferences = bidData.paymentMethodTypes.map((methodType, index) => ({
          bidId: bid.id,
          paymentMethodType: methodType,
          priority: index, // Use array index as priority
        }))
        await createBidPaymentPreferences(paymentPreferences)
      }
    }

    return {
      success: true,
      bid,
    }
  } catch (error) {
    console.error("Error creating bid:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create bid",
    }
  }
}

export async function getMyBidsByAddressAction(address: string) {
  try {
    await verifyAuthentication()
    
    const bids = await getActiveBidsByMaker(address.toLowerCase())

    return {
      success: true,
      bids,
    }
  } catch (error) {
    console.error("Error fetching bids:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch bids",
    }
  }
}

export async function getMyBidsAction() {
  try {
    const privyId = await verifyAuthentication()
    const user = await getOrCreateUser(privyId, "")
    
    if (!user?.walletAddress) {
      return {
        success: false,
        error: "User wallet not found",
        bids: [],
      }
    }
    
    const bids = await getActiveBidsByMaker(user.walletAddress.toLowerCase())

    return {
      success: true,
      bids,
      userWallet: user.walletAddress,
    }
  } catch (error) {
    console.error("Error fetching user bids:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch bids",
      bids: [],
    }
  }
}

export async function getBidWithUserAction(bidHash: string) {
  try {
    await verifyAuthentication()
    
    const bid = await getBidWithUser(bidHash)

    if (!bid) {
      return {
        success: false,
        error: "Bid not found",
      }
    }

    return {
      success: true,
      bid,
    }
  } catch (error) {
    console.error("Error fetching bid:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch bid",
    }
  }
}

export async function getBidPaymentAccountsAction(bidId: string) {
  try {
    await verifyAuthentication()
    
    const accounts = await getBidPaymentAccounts(bidId)

    return {
      success: true,
      accounts,
    }
  } catch (error) {
    console.error("Error fetching bid payment accounts:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch bid payment accounts",
      accounts: [],
    }
  }
}
