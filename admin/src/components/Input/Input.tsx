import * as React from 'react';

import { cn } from '@/utils/ui';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[42px] w-full border border-[#e4e6fc] bg-[#fdfdff] px-3 py-1 text-[14px] transition-all focus-visible:ring-1 focus-visible:ring-[#95a0f4] rounded-[0.25rem] outline-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
