import { useMemo } from 'react';
import { Select } from '../Select';

interface PaginationSizeSelectProps {
  page?: number;
  limit?: number;
  totalItem?: number;
  onLimitChange?: (page: number) => void;
}

export function PaginationSizeSelect({
  page = 1,
  limit = 1,
  totalItem = 1,
  onLimitChange,
}: PaginationSizeSelectProps) {
  const form = Math.min((page - 1) * limit + 1, totalItem || 0);
  const to = Math.min((page - 1) * limit + limit, totalItem || 0);

  const limitOptions = useMemo(
    () => [
      {
        label: '5',
        value: '5',
      },
      {
        label: '10',
        value: '10',
      },
      {
        label: '20',
        value: '20',
      },
      {
        label: '50',
        value: '50',
      },
      {
        label: '100',
        value: '100',
      },
      {
        label: '200',
        value: '200',
      },
      {
        label: 'All',
        value: '999999',
      },
    ],
    []
  );

  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      <span>
        Showing {form} to {to} of {totalItem} rows
      </span>
      <Select
        className="inline-flex w-[60px] h-[36px] px-[8px] bg-[#f05387] text-white !border-none"
        value={limit?.toString()}
        options={limitOptions}
        onValueChange={(value) => onLimitChange && onLimitChange(+value)}
      />
      <span>rows per page</span>
    </div>
  );
}
