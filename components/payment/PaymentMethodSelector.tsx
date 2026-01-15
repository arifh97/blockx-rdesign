'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { PAYMENT_METHODS } from '@/lib/constants';
import { getPaymentAccountDetailsAction } from '@/app/actions/user-payment-accounts';
import { useQueries } from '@tanstack/react-query';

interface PaymentAccount {
  id: string;
  paymentMethod: string;
  label?: string | null;
  currency?: string | null;
  isDefault?: boolean | null;
  isVerified?: boolean | null;
  createdAt?: Date | null;
  paymentDetails?: string; // Decrypted details when available
}

interface PaymentMethodSelectorProps {
  savedPaymentMethods: PaymentAccount[];
  selectedPaymentMethods: string[];
  onPaymentMethodsChange: (methods: string[]) => void;
  onAddPaymentMethod: () => void;
}

// Helper component to display parsed payment details
function PaymentDetailsText({ details, method }: { details: string | Record<string, string>; method: string }) {
  // Parse details if it's a string, otherwise use as-is
  let parsed: Record<string, string>;
  if (typeof details === 'string') {
    try {
      parsed = JSON.parse(details);
    } catch {
      // If not JSON, display as plain text (legacy data)
      return <p className="text-white whitespace-pre-wrap text-sm">{details}</p>;
    }
  } else {
    parsed = details;
  }

  switch (method) {
    case 'bank_transfer':
    case 'cash_deposit_atm':
      return (
        <div className="text-white text-sm space-y-1">
          {parsed.accountHolderName && <div>{parsed.accountHolderName}</div>}
          {parsed.bankAccountNumber && <div>{parsed.bankAccountNumber}</div>}
          {parsed.bankName && <div>{parsed.bankName}</div>}
          {parsed.iban && <div>{parsed.iban}</div>}
        </div>
      );
    case 'mobile_banking_app':
      return (
        <div className="text-white text-sm space-y-1">
          {parsed.paymentApp && <div className="capitalize">{parsed.paymentApp}</div>}
          {parsed.paymentHandle && <div>{parsed.paymentHandle}</div>}
          {parsed.displayName && <div>{parsed.displayName}</div>}
        </div>
      );
    case 'cash_in_person':
      return (
        <div className="text-white text-sm space-y-1">
          {parsed.meetupLocation && <div>{parsed.meetupLocation}</div>}
          {parsed.contactHandle && <div>{parsed.contactHandle}</div>}
        </div>
      );
    default:
      // Fallback: render all key-value pairs
      return (
        <div className="text-white text-sm space-y-1">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key}>{String(value)}</div>
          ))}
        </div>
      );
  }
}

export function PaymentMethodSelector({
  savedPaymentMethods,
  selectedPaymentMethods,
  onPaymentMethodsChange,
  onAddPaymentMethod,
}: PaymentMethodSelectorProps) {
  const [selectedForAdd, setSelectedForAdd] = useState<string>('');

  // Fetch payment details for all selected accounts using TanStack Query
  const paymentDetailsQueries = useQueries({
    queries: selectedPaymentMethods.map((accountId) => ({
      queryKey: ['paymentAccountDetails', accountId],
      queryFn: async () => {
        const result = await getPaymentAccountDetailsAction(accountId);
        if (result.success && result.data) {
          return result.data.paymentDetails || '';
        }
        return '';
      },
      staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    }))
  });

  // Build payment details map from query results
  const paymentDetails: Record<string, string | Record<string, string>> = {};
  selectedPaymentMethods.forEach((accountId, index) => {
    const query = paymentDetailsQueries[index];
    if (query.data) {
      paymentDetails[accountId] = query.data;
    }
  });

  const handleAddToSelected = (accountId: string) => {
    if (accountId && !selectedPaymentMethods.includes(accountId)) {
      onPaymentMethodsChange([...selectedPaymentMethods, accountId]);
      setSelectedForAdd('');
    }
  };

  const handleRemoveSelected = (accountId: string) => {
    onPaymentMethodsChange(selectedPaymentMethods.filter((id) => id !== accountId));
  };

  const availableToAdd = savedPaymentMethods.filter((pm) => !selectedPaymentMethods.includes(pm.id));

  const selectedAccounts = savedPaymentMethods.filter((pm) => selectedPaymentMethods.includes(pm.id));

  return (
    <div className="space-y-3 bg-[#FFFFFF03] rounded-xl p-4">
      <Label className="text-base">Select how you&apos;d like to get paid</Label>

      {/* Selected Payment Methods as Cards */}
      <div className="space-y-3 mb-6">
        {selectedAccounts.map((account) => {
          const methodInfo = PAYMENT_METHODS[account.paymentMethod];
          return (
            <Card key={account.id} className="bg-gradient-to-br gap-2 from-[#00000021] to-[#2a7d8c] border-0 p-4 relative">
              {/* Header with label and close button */}
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold uppercase tracking-wide">
                  {account.label || methodInfo?.name || account.paymentMethod}
                </h3>
                <button onClick={() => handleRemoveSelected(account.id)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Payment Type and Method */}
              <div className="p-4 rounded-xl bg-[#DBECFD08]">
                 <p className="text-primary text-sm mb-1">Payment method</p>
                 <p className="text-white">{methodInfo?.name || account.paymentMethod}</p>
              </div>

              {/* Payment Details */}
              {paymentDetails[account.id] && (
                <div className="p-4 rounded-xl bg-[#DBECFD08]">
                  <p className="text-primary text-sm mb-1">Payment details</p>
                  <PaymentDetailsText details={paymentDetails[account.id]} method={account.paymentMethod} />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Payment Method Button */}
      {availableToAdd.length > 0 ? (
        <Select value={selectedForAdd} onValueChange={handleAddToSelected}>
          <SelectTrigger className="min-h-[64px] bg-[#FFFFFF08] border-0 w-full">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {availableToAdd.map((pm) => {
              const methodInfo = PAYMENT_METHODS[pm.paymentMethod];
              return (
                <SelectItem key={pm.id} value={pm.id}>
                  {pm.label || methodInfo?.name || pm.paymentMethod}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="w-full h-12 border-2 border-primary/30 text-primary hover:bg-primary/10"
        onClick={onAddPaymentMethod}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add payment method
      </Button>
    </div>
  );
}
