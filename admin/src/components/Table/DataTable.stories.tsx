import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { DataTable } from './DataTable';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const sampleUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 28 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 34 },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 45 },
];

const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DataTable>;

const Wrapper = ({
  rows = sampleUsers,
  selectionEnable = false,
  loading = false,
  columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email', sorting: true },
    { key: 'age', header: 'Age', sorting: true },
  ],
}: {
  rows?: User[];
  selectionEnable?: boolean;
  loading?: boolean;
  columns?: any;
}) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedRows = React.useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[sortKey as keyof User];
      const bVal = b[sortKey as keyof User];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir]);

  return (
    <div className="bg-white">
      <DataTable<User, number>
        columns={columns}
        rows={sortedRows}
        loading={loading}
        selectionEnable={selectionEnable}
        selectionValue={selected}
        selectionMatchValue={(option, value) => option.id === value}
        onSelectionChange={setSelected}
        onSortingChange={(key, dir) => {
          setSortKey(key);
          setSortDir(dir);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <Wrapper />,
};

export const Loading: Story = {
  render: () => <Wrapper loading={true} />,
};

export const Empty: Story = {
  render: () => <Wrapper rows={[]} />,
};

export const WithSelection: Story = {
  render: () => <Wrapper selectionEnable={true} />,
};

export const CustomRender: Story = {
  render: () => (
    <Wrapper
      columns={[
        {
          key: 'name',
          header: '👤 Full Name',
          render: (row) => <strong>{row.name}</strong>,
        },
        {
          key: 'email',
          header: '📧 Email',
          render: (row) => (
            <a href={`mailto:${row.email}`} className="text-blue-500 underline">
              {row.email}
            </a>
          ),
        },
        { key: 'age', header: '🎂 Age', sorting: true },
      ]}
    />
  ),
};

export const WithSorting: Story = {
  render: () => <Wrapper />,
};

export const FullFeatured: Story = {
  render: () => (
    <Wrapper
      selectionEnable={true}
      columns={[
        {
          key: 'name',
          header: '👤 Name',
          render: (row) => <strong>{row.name}</strong>,
        },
        {
          key: 'email',
          header: '📧 Email',
          render: (row) => (
            <a href={`mailto:${row.email}`} className="text-blue-500 underline">
              {row.email}
            </a>
          ),
        },
        { key: 'age', header: '🎂 Age', sorting: true },
      ]}
    />
  ),
};
