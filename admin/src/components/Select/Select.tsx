import * as React from 'react';

import {
  Select as BaseSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectProps<
  T = { label?: string; value?: string; [key: string]: any }
> {
  value: string;
  options: T[];
  onValueChange?: (value: string) => void;
  renderSelectItem?: (option: T) => React.ReactNode;
  getItemValue?: (option: T) => string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  options = [],
  onValueChange,
  renderSelectItem = (option) => option?.label,
  getItemValue = (option) => option?.value,
  placeholder,
}) => {
  return (
    <BaseSelect value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px] h-[calc(2.25rem+6px)] text-[14px] bg-[#fdfdfd] border-[#e4e6fc] shadow-none rounded-[0.25rem]">
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
