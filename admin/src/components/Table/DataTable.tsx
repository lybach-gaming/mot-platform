/* eslint-disable @typescript-eslint/no-empty-function */
import React, { ReactNode, useState } from 'react';
import { Checkbox } from '../Checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './TableBase';
import { cn } from '@/utils/ui';
import { ChevronsUpDownIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

interface DataTableColumn<T> {
  header: string | ReactNode;
  key: string;
  render?: (row: T) => ReactNode;
  sorting?: boolean;
}

interface DataTableProps<T = any, V = number> {
  columns: DataTableColumn<T>[];
  rows: T[];
  selectionEnable?: boolean;
  selectionValue?: V[];
  selectionMatchValue?: (option: T, value: V) => boolean;
  onSelectionChange?: (selection: V[]) => void;
  onSortingChange?: (
    key: string | null,
    direction: 'asc' | 'desc' | null
  ) => void;
  loading?: boolean;
  className?: string;
}

export const DataTable = <T, V>({
  columns,
  rows = [],
  selectionEnable = false,
  selectionValue = [],
  selectionMatchValue = (option, value) => option?.id === value,
  onSelectionChange = () => {},
  onSortingChange = () => {},
  loading = false,
  className,
}: DataTableProps<T, V>) => {
  const [sorting, setSorting] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null,
  });

  const toggleSelect = (item: T) => {
    const id = selectionValue.find((v) => selectionMatchValue(item, v));
    if (id) {
      onSelectionChange(
        selectionValue.filter((v) => !selectionMatchValue(item, v))
      );
    } else {
      const itemId: V = item?.id;
      onSelectionChange([...selectionValue, itemId]);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sorting?.key === key) {
      if (sorting.direction === 'asc') direction = 'desc';
      else if (sorting.direction === 'desc') direction = null;
      else direction = 'asc';
    }

    const newSorting = direction
      ? { key, direction }
      : { key: null, direction: null };
    setSorting(newSorting);
    onSortingChange(key, direction);
  };

  console.log(sorting)

  const renderSortIcon = (option: DataTableColumn<T>) => {
    if (!option.sorting) {
      return <></>;
    }

    if (!sorting?.direction || sorting?.key !== option.key) {
      return <ChevronsUpDownIcon className='opacity-50' />;
    }

    if (sorting.direction === 'asc') {
      return <ChevronUpIcon />;
    }

    if (sorting.direction === 'desc') {
      return <ChevronDownIcon />;
    }
  };

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {selectionEnable && (
              <TableHead className="w-[50px] px-2">
                <Checkbox
                  checked={
                    rows.length > 0 &&
                    rows.every((r) =>
                      selectionValue.some((v) => selectionMatchValue(r, v))
                    )
                  }
                  indeterminate={
                    rows.some((r) =>
                      selectionValue.some((v) => selectionMatchValue(r, v))
                    ) &&
                    !rows.every((r) =>
                      selectionValue.some((v) => selectionMatchValue(r, v))
                    )
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const allIds = rows
                        .map((r) => {
                          return r?.id;
                        })
                        .filter((id) => !selectionValue.includes(id));
                      onSelectionChange([...selectionValue, ...allIds]);
                    } else {
                      const filtered = selectionValue.filter(
                        (v) => !rows.some((r) => selectionMatchValue(r, v))
                      );
                      onSelectionChange(filtered);
                    }
                  }}
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={col.key}
                onClick={() => col.sorting && handleSort(col.key)}
                className={col.sorting ? 'cursor-pointer select-none' : ''}
              >
                <div className="flex items-center justify-between gap-1">
                  {col.header}
                  {renderSortIcon(col)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectionEnable ? 1 : 0)}
                className="text-center"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectionEnable ? 1 : 0)}
                className="text-center"
              >
                No data
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {selectionEnable && (
                  <TableCell className="px-2">
                    <Checkbox
                      checked={selectionValue.some((v) =>
                        selectionMatchValue(row, v)
                      )}
                      onCheckedChange={() => toggleSelect(row)}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
