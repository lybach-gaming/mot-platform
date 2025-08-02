import React from 'react';
import { cn } from '@/utils/ui';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup = ({ children, className }: ButtonGroupProps) => {
  return (
    <div
      className={cn(
        'inline-flex overflow-hidden rounded-[0.25rem] bg-[#f05387]',
        className
      )}
    >
      {children}
    </div>
  );
};
