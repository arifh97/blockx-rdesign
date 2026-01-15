/**
 * Payment Details Type Definitions
 * Defines the structure of payment details for different payment methods
 */

// Bank Transfer Details
export type BankTransferDetails = {
  accountHolderName: string;
  bankAccountNumber: string;
  bankName: string;
  iban?: string; // Optional
};

// Mobile Banking App Details (Revolut, Wise, etc.)
export type MobileBankingAppDetails = {
  paymentApp: 'revolut' | 'wise' | 'other';
  paymentHandle: string; // username, email, or phone number
  displayName?: string; // Optional
};

// Cash In-Person Details
export type CashInPersonDetails = {
  meetupLocation: string;
  contactHandle: string; // telegram or phone number
};

// Cash Deposit at ATM/Branch Details
export type CashDepositAtmDetails = {
  accountHolderName: string;
  bankAccountNumber: string;
  bankName: string;
  iban?: string; // Optional
};

// Union type for all payment details
export type PaymentDetails = 
  | { method: 'bank_transfer'; details: BankTransferDetails }
  | { method: 'mobile_banking_app'; details: MobileBankingAppDetails }
  | { method: 'cash_in_person'; details: CashInPersonDetails }
  | { method: 'cash_deposit_atm'; details: CashDepositAtmDetails };

// Helper type to extract details type for a specific payment method
export type PaymentDetailsFor<T extends PaymentDetails['method']> = 
  Extract<PaymentDetails, { method: T }>['details'];

// Payment method type codes
export type PaymentMethodType = 'bank_transfer' | 'mobile_banking_app' | 'cash_in_person' | 'cash_deposit_atm';

// Payment method categories
export const PAYMENT_CATEGORIES = {
  BANK: 'bank',
  DIGITAL_WALLET: 'digital_wallet',
  CASH: 'cash',
  REGIONAL: 'regional',
} as const;

export type PaymentCategory = typeof PAYMENT_CATEGORIES[keyof typeof PAYMENT_CATEGORIES];

// Payment method metadata
export type PaymentMethodMetadata = {
  code: string;
  name: string;
  category: PaymentCategory;
  icon?: string;
  region?: string; // ISO country code if region-specific
  processingTime?: string;
  fees?: string;
  supportedCurrencies?: string[];
  requiresVerification?: boolean;
};
