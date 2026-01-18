import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  completedSteps: boolean[];
  totalSteps: number;
}

export function WithdrawStepper({ completedSteps, totalSteps }: StepperProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i).map((index) => {
        const isCompleted = completedSteps[index];
        const stepNumber = index + 1;

        return (
          <div key={stepNumber} className="flex flex-col items-center">
            {/* Rhombus Step Indicator */}
            <div
              className={cn(
                'w-[25px] h-[25px] rotate-45 rounded-sm flex items-center justify-center transition-colors',
                isCompleted ? 'bg-primary' : 'bg-[#41FDFE1A] border border-[#FFFFFF08]'
              )}
            >
              <div className="-rotate-45">
                {isCompleted ? (
                  <Check className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">{stepNumber}</span>
                )}
              </div>
            </div>

            {/* Connecting Line */}
            {index < totalSteps - 1 && (
              <div
                className={cn('w-0.5 h-18 transition-colors mt-1 -mb-1', isCompleted ? 'bg-primary' : 'bg-primary/20')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
