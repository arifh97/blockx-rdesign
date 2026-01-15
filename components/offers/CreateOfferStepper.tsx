import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  {
    number: 1,
    title: "Set your offer details and payment methods.",
    completed: true,
  },
  {
    number: 2,
    title: "Sign the offer with your wallet.",
    completed: false,
  },
  {
    number: 3,
    title: "Buyer accepts your offer and creates an order.",
    completed: false,
  },
  {
    number: 4,
    title: "Your tokens are locked in the smart contract escrow.",
    completed: false,
  },
  {
    number: 5,
    title: "Buyer sends fiat payment and confirms. You release the crypto.",
    completed: false,
  },
]

export function CreateOfferStepper() {
  return (
    <div className="bg-card/60 rounded-2xl border border-border p-8">
      {/* Horizontal Stepper */}
      <div className="flex items-start gap-2">
        {steps.map((step) => (
          <div key={step.number} className="flex-1">
            <div className="flex flex-col items-start gap-3">
              {/* Step indicator and line */}
              <div className="flex items-center w-full">
                {/* Step Circle */}
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      'w-[30px] h-[30px] rotate-45 rounded-sm flex items-center justify-center transition-colors',
                      step.completed
                        ? 'bg-primary'
                        : 'bg-[#41FDFE1A] border border-[#FFFFFF08]'
                    )}
                  >
                    <div className="-rotate-45">
                      {step.completed ? (
                        <Check className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <span className="text-md font-bold text-white">
                          {step.number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connecting Line (except for last step) */}
                 <div
                    className={cn(
                      'h-0.5 flex-1 mx-1 transition-colors',
                      step.completed ? 'bg-primary' : 'bg-border'
                    )}
                  />
              </div>

              {/* Step Title */}
              <p
                className={cn(
                  'text-sm leading-tight bg-[#FFFFFF05] p-2 rounded-lg min-h-[60px] w-full',
                  step.completed ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
