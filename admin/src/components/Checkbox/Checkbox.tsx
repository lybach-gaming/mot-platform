'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';

import { cn } from '@/utils/ui';

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, indeterminate = false, checked, ...props }, ref) => {
  console.log('indeterminate', indeterminate);
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={indeterminate ? true : checked}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow ' +
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ' +
          'disabled:cursor-not-allowed disabled:opacity-50 ' +
          'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ' +
          'data-[indeterminate=true]:bg-primary data-[indeterminate=true]:text-primary-foreground',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        {indeterminate ? (
          <Minus className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
