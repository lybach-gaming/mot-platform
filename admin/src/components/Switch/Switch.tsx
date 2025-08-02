'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/utils/ui';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex w-[35px] h-[22px] shrink-0 cursor-pointer items-center rounded-full p-[1px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#1abc9c] data-[state=unchecked]:bg-[#f1556c]',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block w-[20px] h-[20px] rounded-full bg-background shadow transition-transform data-[state=checked]:translate-x-[13px] data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
