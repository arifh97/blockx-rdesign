'use client';

import { useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAYMENT_METHODS } from '@/lib/constants';
import Image from "next/image";

import {
  createPaymentAccountAction,
  getPaymentAccountsAction,
  deletePaymentAccountAction,
  getPaymentAccountDetailsAction
} from '@/app/actions/user-payment-accounts';
import { toast } from 'sonner';
import { Plus, X, Loader2 } from 'lucide-react';
import type {
  PaymentMethodType,
  BankTransferDetails,
  MobileBankingAppDetails,
  CashInPersonDetails,
  CashDepositAtmDetails
} from '@/lib/payment-types';

type DialogStep = 'list' | 'form';

interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (accountId: string) => void;
}

// Payment method options for the list view
const PAYMENT_METHOD_OPTIONS: { type: PaymentMethodType; name: string; icon: string }[] = [
  { type: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
  { type: 'mobile_banking_app', name: 'Mobile Banking App', icon: '📱' },
  { type: 'cash_in_person', name: 'Cash In-Person', icon: '💵' },
  { type: 'cash_deposit_atm', name: 'Cash Deposit at ATM', icon: '🏧' }
];

export function AddPaymentMethodDialog({ open, onOpenChange, onSave }: AddPaymentMethodDialogProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<DialogStep>('list');
  const [selectedType, setSelectedType] = useState<PaymentMethodType | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch existing payment accounts
  const { data: paymentAccounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['paymentAccounts'],
    queryFn: async () => {
      const result = await getPaymentAccountsAction();
      if (result.success) {
        return result.data || [];
      }
      return [];
    },
    enabled: open
  });

  // Form for adding new payment method
  const form = useForm({
    defaultValues: {
      // Bank Transfer / Cash Deposit at ATM fields
      accountHolderName: '',
      bankAccountNumber: '',
      bankName: '',
      iban: '',
      // Mobile Banking App fields
      paymentApp: '' as 'revolut' | 'wise' | 'other' | '',
      paymentHandle: '',
      displayName: '',
      // Cash In-Person fields
      meetupLocation: '',
      contactHandle: '',
      // Common
      label: ''
    },
    onSubmit: async ({ value }) => {
      if (!selectedType) return;

      // Build payment details based on selected type
      let paymentDetails: string;
      let label = value.label;

      switch (selectedType) {
        case 'bank_transfer': {
          if (!value.accountHolderName || !value.bankAccountNumber || !value.bankName) {
            toast.error('Please fill in all required fields');
            return;
          }
          const details: BankTransferDetails = {
            accountHolderName: value.accountHolderName,
            bankAccountNumber: value.bankAccountNumber,
            bankName: value.bankName,
            ...(value.iban && { iban: value.iban })
          };
          paymentDetails = JSON.stringify(details);
          if (!label) label = `${value.bankName} - ${value.accountHolderName}`;
          break;
        }
        case 'mobile_banking_app': {
          if (!value.paymentApp || !value.paymentHandle) {
            toast.error('Please fill in all required fields');
            return;
          }
          const details: MobileBankingAppDetails = {
            paymentApp: value.paymentApp as 'revolut' | 'wise' | 'other',
            paymentHandle: value.paymentHandle,
            ...(value.displayName && { displayName: value.displayName })
          };
          paymentDetails = JSON.stringify(details);
          if (!label)
            label = `${value.paymentApp.charAt(0).toUpperCase() + value.paymentApp.slice(1)} - ${value.paymentHandle}`;
          break;
        }
        case 'cash_in_person': {
          if (!value.meetupLocation || !value.contactHandle) {
            toast.error('Please fill in all required fields');
            return;
          }
          const details: CashInPersonDetails = {
            meetupLocation: value.meetupLocation,
            contactHandle: value.contactHandle
          };
          paymentDetails = JSON.stringify(details);
          if (!label) label = `Cash - ${value.meetupLocation}`;
          break;
        }
        case 'cash_deposit_atm': {
          if (!value.accountHolderName || !value.bankAccountNumber || !value.bankName) {
            toast.error('Please fill in all required fields');
            return;
          }
          const details: CashDepositAtmDetails = {
            accountHolderName: value.accountHolderName,
            bankAccountNumber: value.bankAccountNumber,
            bankName: value.bankName,
            ...(value.iban && { iban: value.iban })
          };
          paymentDetails = JSON.stringify(details);
          if (!label) label = `ATM Deposit - ${value.bankName}`;
          break;
        }
        default:
          return;
      }

      try {
        const result = await createPaymentAccountAction({
          paymentMethod: selectedType,
          label,
          paymentDetails
        });

        if (result.success) {
          toast.success('Payment method added successfully!');

          // Invalidate query to refetch accounts
          queryClient.invalidateQueries({ queryKey: ['paymentAccounts'] });

          // Call optional callback
          if (onSave && result.data) {
            onSave(result.data.id);
          }

          // Reset and go back to list
          form.reset();
          setSelectedType(null);
          setStep('list');
        } else {
          toast.error(result.error || 'Failed to add payment method');
        }
      } catch (error) {
        console.error('Error saving payment method:', error);
        toast.error('An error occurred while saving the payment method');
      }
    }
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  // Handle selecting a payment method type
  const handleSelectType = (type: PaymentMethodType) => {
    setSelectedType(type);
    form.reset();
    setStep('form');
  };

  // Handle cancel - go back to list
  const handleCancel = () => {
    form.reset();
    setSelectedType(null);
    setStep('list');
  };

  // Handle delete payment account
  const handleDelete = async (accountId: string) => {
    setIsDeleting(accountId);
    try {
      const result = await deletePaymentAccountAction(accountId);
      if (result.success) {
        toast.success('Payment method deleted');
        queryClient.invalidateQueries({ queryKey: ['paymentAccounts'] });
      } else {
        toast.error(result.error || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('An error occurred while deleting');
    } finally {
      setIsDeleting(null);
    }
  };

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSelectedType(null);
      setStep('list');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-200! bg-card max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'list'
              ? 'Payment Method'
              : `Add ${PAYMENT_METHODS[selectedType || '']?.name || 'Payment Method'}`}
          </DialogTitle>
          <div className="bank-account text-base md:text-lg font-medium bg-[rgba(219,236,253,0.03)] p-5 rounded-[20px] mt-4 relative z-1 overflow-hidden">
            <Image src="ba-shap.png" className="absolute top-0 right-0 h-full w-auto -z-1" alt="" />
            <h3 className="text-[#41FDFE]">Mashreq Bank Account</h3>
            <ul className="bg-[rgba(219,236,253,0.03)] rounded-[12px] p-4 mt-3 space-y-2">
              <li>Satoshi Nakamoto</li>
              <li>012345678910</li>
              <li>Mashreq Bank</li>
              <li>AE940330000012345678910</li>
            </ul>
          </div>
        </DialogHeader>

        {step === 'list' ? (
          <div className="space-y-6 py-4">
            {/* Existing Payment Methods */}
            {isLoadingAccounts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : paymentAccounts.length > 0 ? (
              <div className="space-y-3">
                {paymentAccounts.map((account) => (
                  <PaymentAccountCard
                    key={account.id}
                    account={account}
                    onDelete={() => handleDelete(account.id)}
                    isDeleting={isDeleting === account.id}
                  />
                ))}
              </div>
            ) : null}

            {/* Add Payment Method Section */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Add Payment Method</Label>
              <div className="space-y-2">
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => handleSelectType(option.type)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r hover:bg-[#FFFFFF0A] bg-[#FFFFFF05]"
                  >
                    <span className="text-base">{option.name}</span>
                    <div className="p-2 rounded-full bg-[#DBECFD08]">
                      <Plus size={18} className="text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4 py-4"
          >
            {/* Dynamic form fields based on selected type */}
            {selectedType === 'bank_transfer' && <BankTransferForm form={form} />}
            {selectedType === 'mobile_banking_app' && <MobileBankingAppForm form={form} />}
            {selectedType === 'cash_in_person' && <CashInPersonForm form={form} />}
            {selectedType === 'cash_deposit_atm' && <CashDepositAtmForm form={form} />}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 h-[56px]"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 h-[56px] bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Payment Account Card Component
function PaymentAccountCard({
  account,
  onDelete,
  isDeleting
}: {
  account: { id: string; paymentMethod: string; label: string | null };
  onDelete: () => void;
  isDeleting: boolean;
}) {
  // Fetch payment details using React Query
  const { data: details, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['paymentAccountDetails', account.id],
    queryFn: async () => {
      const result = await getPaymentAccountDetailsAction(account.id);
      if (result.success && result.data?.paymentDetails) {
        try {
          return JSON.parse(result.data.paymentDetails) as Record<string, string>;
        } catch {
          // If not JSON, it's legacy plain text
          return { info: result.data.paymentDetails } as Record<string, string>;
        }
      }
      return null;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const methodInfo = PAYMENT_METHODS[account.paymentMethod];

  return (
    <div className="rounded-xl bg-gradient-to-r from-[#09141D] border border-[#FFFFF] to-primary/60 overflow-hidden p-2">
      <div className="flex items-center justify-between p-4 border-b border-[#FFFFFF10]">
        <span className="text-primary font-medium">{account.label || methodInfo?.name || account.paymentMethod}</span>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="text-white cursor-pointer hover:border-gray-600"
        >
          {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
        </button>
      </div>
      <div className="p-4 space-y-1 text-sm bg-[#DBECFD08] rounded-xl">
        {isLoadingDetails ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : details ? (
          <PaymentDetailsDisplay method={account.paymentMethod} details={details} />
        ) : (
          <span className="text-muted-foreground">No details available</span>
        )}
      </div>
    </div>
  );
}

// Display payment details based on method type
function PaymentDetailsDisplay({ method, details }: { method: string; details: Record<string, string> }) {
  switch (method) {
    case 'bank_transfer':
    case 'cash_deposit_atm':
      return (
        <>
          {details.accountHolderName && <div>{details.accountHolderName}</div>}
          {details.bankAccountNumber && <div>{details.bankAccountNumber}</div>}
          {details.bankName && <div>{details.bankName}</div>}
          {details.iban && <div>{details.iban}</div>}
        </>
      );
    case 'mobile_banking_app':
      return (
        <>
          {details.paymentApp && <div className="capitalize">{details.paymentApp}</div>}
          {details.paymentHandle && <div>{details.paymentHandle}</div>}
          {details.displayName && <div>{details.displayName}</div>}
        </>
      );
    case 'cash_in_person':
      return (
        <>
          {details.meetupLocation && <div>{details.meetupLocation}</div>}
          {details.contactHandle && <div>{details.contactHandle}</div>}
        </>
      );
    default:
      // Legacy or unknown format
      return (
        <>
          {Object.entries(details).map(([key, value]) => (
            <div key={key}>{value}</div>
          ))}
        </>
      );
  }
}

// Form Components for each payment method type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BankTransferForm({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <form.Field name="accountHolderName">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
            <Input
              id="accountHolderName"
              placeholder="e.g. John Doe"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="bankAccountNumber">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="bankAccountNumber">Bank Account Number *</Label>
            <Input
              id="bankAccountNumber"
              placeholder="e.g. 012345678910"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="bankName">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input
              id="bankName"
              placeholder="e.g. Mashreq Bank"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="iban">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="iban">IBAN (Optional)</Label>
            <Input
              id="iban"
              placeholder="e.g. AE940330000012345678910"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
          </div>
        )}
      </form.Field>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MobileBankingAppForm({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <form.Field name="paymentApp">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label>Payment App *</Label>
            <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
              <SelectTrigger className="min-h-[64px] w-full bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2">
                <SelectValue placeholder="Select app" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revolut">Revolut</SelectItem>
                <SelectItem value="wise">Wise</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field name="paymentHandle">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="paymentHandle">Payment Handle *</Label>
            <Input
              id="paymentHandle"
              placeholder="Username, email, or phone number"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
            <p className="text-xs text-muted-foreground">The username, email, or phone number linked to your account</p>
          </div>
        )}
      </form.Field>

      <form.Field name="displayName">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name (Optional)</Label>
            <Input
              id="displayName"
              placeholder="e.g. My Revolut EUR"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
          </div>
        )}
      </form.Field>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CashInPersonForm({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <form.Field name="meetupLocation">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="meetupLocation">Meetup Location *</Label>
            <Input
              id="meetupLocation"
              placeholder="e.g. Dubai Mall, Main Entrance"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="contactHandle">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="contactHandle">Contact Handle *</Label>
            <Input
              id="contactHandle"
              placeholder="Telegram username or phone number"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
            <p className="text-xs text-muted-foreground">Your Telegram username (e.g. @username) or phone number</p>
          </div>
        )}
      </form.Field>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CashDepositAtmForm({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <form.Field name="accountHolderName">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
            <Input
              id="accountHolderName"
              placeholder="e.g. John Doe"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="bankAccountNumber">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="bankAccountNumber">Bank Account Number *</Label>
            <Input
              id="bankAccountNumber"
              placeholder="e.g. 012345678910"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="bankName">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input
              id="bankName"
              placeholder="e.g. Mashreq Bank"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="iban">
        {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
          <div className="space-y-2">
            <Label htmlFor="iban">IBAN (Optional)</Label>
            <Input
              id="iban"
              placeholder="e.g. AE940330000012345678910"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-[64px] bg-[#FFFFFF08] border-0 focus-visible:ring-[#41FDFE] focus-visible:ring-2"
            />
          </div>
        )}
      </form.Field>
    </div>
  );
}
