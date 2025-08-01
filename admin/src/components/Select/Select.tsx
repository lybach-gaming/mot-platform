import * as React from 'react';

import {
  Select as BaseSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './SelectBase';

interface SelectProps<
  T = { label?: string; value?: string; [key: string]: any }
> {
  value: string;
  options: T[];
  onValueChange?: (value: string) => void;
  renderSelectItem?: (option: T) => React.ReactNode;
  getItemValue?: (option: T) => string;
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  options = [],
  onValueChange,
  renderSelectItem = (option) => option?.label,
  getItemValue = (option) => option?.value,
  placeholder,
  className,
}) => {
  return (
    <BaseSelect value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} className="" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options?.map((item) => (
            <SelectItem value={getItemValue(item) || ''} key={item?.value}>
              {renderSelectItem(item)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </BaseSelect>
  );
};
