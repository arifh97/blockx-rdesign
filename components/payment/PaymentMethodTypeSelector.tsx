'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { PAYMENT_METHODS, type PaymentMethodCode } from '@/lib/constants';

interface PaymentMethodTypeSelectorProps {
  selectedPaymentMethodTypes: string[];
  onPaymentMethodTypesChange: (methods: string[]) => void;
}

/**
 * PaymentMethodTypeSelector for BUY offers
 * Allows users to select payment method TYPES (not full details)
 * that they're willing to accept when buying crypto
 */
export function PaymentMethodTypeSelector({
  selectedPaymentMethodTypes,
  onPaymentMethodTypesChange,
}: PaymentMethodTypeSelectorProps) {
  const [selectedForAdd, setSelectedForAdd] = useState<string>('');

  const handleAddToSelected = (methodType: string) => {
    if (methodType && !selectedPaymentMethodTypes.includes(methodType)) {
      onPaymentMethodTypesChange([...selectedPaymentMethodTypes, methodType]);
      setSelectedForAdd('');
    }
  };

  const handleRemoveSelected = (methodType: string) => {
    onPaymentMethodTypesChange(selectedPaymentMethodTypes.filter((type) => type !== methodType));
  };

  const availableToAdd = Object.keys(PAYMENT_METHODS).filter(
    (code) => !selectedPaymentMethodTypes.includes(code)
  );

  return (
    <div className="space-y-3 bg-[#FFFFFF03] rounded-xl p-4">
      <div>
        <Label className="text-base">Select payment methods you&apos;ll accept</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Choose which payment methods you&apos;re willing to receive when buying crypto
        </p>
      </div>

      {/* Selected Payment Method Types as Cards */}
      <div className="space-y-3 mb-6">
        {selectedPaymentMethodTypes.map((methodType) => {
          const methodInfo = PAYMENT_METHODS[methodType as PaymentMethodCode];
          if (!methodInfo) return null;
          
          return (
            <Card key={methodType} className="bg-gradient-to-br gap-2 from-[#00000021] to-[#2a7d8c] border-0 p-4 relative">
              {/* Header with method name and close button */}
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold uppercase tracking-wide">
                  {methodInfo.name}
                </h3>
                <button 
                  onClick={() => handleRemoveSelected(methodType)} 
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Payment Type and Method */}
              <div className="grid grid-cols-2 p-4 rounded-xl bg-[#DBECFD08]">
                <div>
                  <p className="text-primary text-sm mb-1">Payment type</p>
                  <p className="text-white">
                    {methodInfo.category === 'bank'
                      ? 'Bank transfer'
                      : methodInfo.category === 'digital_wallet'
                        ? 'Digital Wallet'
                        : methodInfo.category === 'regional'
                          ? 'Regional Payment'
                          : 'Cash'}
                  </p>
                </div>
                <div>
                  <p className="text-primary text-sm mb-1">Processing time</p>
                  <p className="text-white">{methodInfo.processingTime || 'Varies'}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Payment Method Type Button */}
      {availableToAdd.length > 0 ? (
        <Select value={selectedForAdd} onValueChange={handleAddToSelected}>
          <SelectTrigger className="h-12 bg-[#FFFFFF08] border-0 w-full">
            <SelectValue placeholder="Add another payment method" />
          </SelectTrigger>
          <SelectContent>
            {availableToAdd.map((code) => {
              const methodInfo = PAYMENT_METHODS[code as PaymentMethodCode];
              return (
                <SelectItem key={code} value={code}>
                  {methodInfo?.name || code}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-2">
          All payment methods selected
        </div>
      )}
    </div>
  );
}
