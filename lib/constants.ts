import { bidTypeEnum } from "@/db/schema/bids";
import { type PaymentCategory } from "@/lib/payment-types";

/**
 * Payment Methods
 * Comprehensive list of supported payment methods for P2P trading
 */

export type PaymentMethodInfo = {
  code: string;
  name: string;
  category: PaymentCategory;
  icon?: string;
  region?: string; // ISO country code if region-specific
  processingTime?: string;
  supportedCurrencies?: string[];
};

export const PAYMENT_METHODS: Record<string, PaymentMethodInfo> = {
  // Bank Transfer
  bank_transfer: {
    code: 'bank_transfer',
    name: 'Bank Transfer',
    category: 'bank',
    icon: '🏦',
    processingTime: '1-3 business days',
  },
  
  // Mobile Banking App (Revolut, Wise, etc.)
  mobile_banking_app: {
    code: 'mobile_banking_app',
    name: 'Mobile Banking App',
    category: 'digital_wallet',
    icon: '📱',
    processingTime: 'Instant',
  },
  
  // Cash In-Person
  cash_in_person: {
    code: 'cash_in_person',
    name: 'Cash In-Person',
    category: 'cash',
    icon: '💵',
    processingTime: 'Instant',
  },
  
  // Cash Deposit at ATM/Branch
  cash_deposit_atm: {
    code: 'cash_deposit_atm',
    name: 'Cash Deposit at ATM',
    category: 'cash',
    icon: '🏧',
    processingTime: '1-2 business days',
  },
} as const;

// Helper to get array of payment method codes for backward compatibility
export const PAYMENT_METHOD_CODES = Object.keys(PAYMENT_METHODS);

// Type helpers
export type PaymentMethodCode = keyof typeof PAYMENT_METHODS;
export type PaymentMethod = PaymentMethodInfo;

/**
 * Fiat Currencies
 * List of supported fiat currencies with their display information
 */
export const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', logoURI: '/currencies/dollar.svg' },
  { code: 'EUR', name: 'Euro', logoURI: '/currencies/eur.png' },
  { code: 'GBP', name: 'British Pound', logoURI: '/currencies/gbp.png' },
  { code: 'JPY', name: 'Japanese Yen', logoURI: '/currencies/jpy.png' },
  { code: 'AED', name: 'Emirates Dirham', logoURI: '/currencies/AED.png' },
] as const;

export type FiatCurrency = typeof FIAT_CURRENCIES[number]['code'];

/**
 * Get fiat currency info by code
 */
export function getFiatCurrencyInfo(code: string) {
  return FIAT_CURRENCIES.find(c => c.code === code);
}

/**
 * Bid/Offer Types
 * Indicates whether user is selling or buying crypto
 * Derived from the database enum for single source of truth
 */
export const BID_TYPES = bidTypeEnum.enumValues;
export type BidType = typeof BID_TYPES[number];

/**
 * Bid/Offer Statuses
 * Possible states for bids and offers
 */
export const BID_STATUSES = [
  'active',
  'completed',
  'cancelled',
  'expired'
] as const;

export type BidStatus = typeof BID_STATUSES[number];
