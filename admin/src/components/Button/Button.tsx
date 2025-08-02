import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/ui';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.25rem] text-[14px] transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        filled:
          'bg-[#f05387] text-white hover:bg-[#f05387]/90',
        outline:
          'border border-input bg-transparent',
        ghost: 'hover:bg-white/10',
        link: 'text-[#f05387] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-[36px] px-4 py-2',
        sm: 'h-[26px] px-3 text-xs',
        lg: 'h-[42px] px-8',
        icon: 'h-[36px] w-[36px]',
        'icon-sm': 'h-[26px] w-[26px]',
      },
    },
    defaultVariants: {
      variant: 'filled',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
