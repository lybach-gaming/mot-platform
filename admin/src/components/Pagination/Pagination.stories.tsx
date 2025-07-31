import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'UI/Pagination',
  component: Pagination,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const FewPages: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        page={page}
        total={3}
        onPageChange={(p) => setPage(p)}
      />
    );
  },
};

export const MiddlePage: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return (
      <Pagination
        page={page}
        total={10}
        onPageChange={(p) => setPage(p)}
      />
    );
  },
};

export const FirstPage: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        page={page}
        total={10}
        onPageChange={(p) => setPage(p)}
      />
    );
  },
};

export const LastPage: Story = {
  render: () => {
    const [page, setPage] = useState(10);
    return (
      <Pagination
        page={page}
        total={10}
        onPageChange={(p) => setPage(p)}
      />
    );
  },
};

export const SinglePage: Story = {
  render: () => {
    return <Pagination page={0} total={1} />;
  },
};

export const PageChangeCallback: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <>
        <p className="mb-2">Current page: {page + 1}</p>
        <Pagination
          page={page}
          total={6}
          onPageChange={(p) => {
            console.log('Page changed to:', p);
            setPage(p);
          }}
        />
      </>
    );
  },
};
