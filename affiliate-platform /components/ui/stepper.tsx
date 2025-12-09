import { Check, Circle, Dot } from 'lucide-react';
import { cn } from '@/lib/utils';
export interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepperProps) {
  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-between px-4',
        className
      )}
    >
      {/* Background line */}
      <div
        style={{
          position: 'absolute',
          left: '6rem',
          right: '4rem',
          top: '25%',
          transform: 'translateY(-50%)',
          height: '2px',
          backgroundColor: '#e5e7eb',
          zIndex: 0,
        }}
      />

      {/* Active progress line */}
      <div
        style={{
          position: 'absolute',
          left: '6rem',
          top: '25%',
          transform: 'translateY(-50%)',
          height: '2px',
          backgroundColor: '#000',
          width: `calc((100% - 10rem) * ${
            (currentStep - 1) / (steps.length - 1)
          })`,
          transition: 'width 0.3s ease',
          zIndex: 0,
        }}
      />
      {steps.map((step, idx) => {
        const stepNumber = idx + 1;

        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;
        const isInactive = currentStep < stepNumber;

        const state = isCompleted
          ? 'completed'
          : isActive
          ? 'active'
          : 'inactive';

        return (
          <div
            key={step.id}
            className="relative z-10 flex flex-col items-center text-center"
          >
            {/* Circle */}
            <button
              onClick={() => onStepClick?.(stepNumber)}
              className={cn(
                'flex p-2 items-center justify-center rounded-full border-2 transition-all duration-200',
                state === 'completed' && 'bg-black border-black text-white',
                state === 'active' && 'border-white bg-black text-white',
                state === 'inactive' && 'border-gray-300 text-gray-400 bg-white'
              )}
            >
              {state === 'completed' && <Check className="h-5 w-5" />}
              {state === 'active' && <Circle className="h-5 w-5" />}
              {state === 'inactive' && <Dot className="h-5 w-5" />}
            </button>

            {/* Labels */}
            <h4
              className={cn(
                'mt-3 text-sm font-semibold',
                isActive && 'text-black',
                isCompleted && 'text-black',
                isInactive && 'text-muted-foreground'
              )}
            >
              {step.title}
            </h4>

            {step.description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {step.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
