import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

// --- Case 1: Basic string options (value = label) ---
const simpleOptions = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
  { label: 'Option C', value: 'C' },
];

// --- Case 2: Object with custom display using renderItem ---
const customRenderOptions = [
  { label: '🍎 Apple', value: 'apple', color: 'red' },
  { label: '🍌 Banana', value: 'banana', color: 'yellow' },
  { label: '🥝 Kiwi', value: 'kiwi', color: 'green' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('A');
    return (
      <Select
        value={value}
        options={simpleOptions}
        onValueChange={setValue}
        placeholder="Select option"
        className='w-[180px]'
      />
    );
  },
};

export const CustomLabel: Story = {
  render: () => {
    const [value, setValue] = useState('banana');
    return (
      <Select
        value={value}
        options={customRenderOptions}
        onValueChange={setValue}
        placeholder="Pick a fruit"
        renderSelectItem={(item) => (
          <div className="flex items-center gap-2">
            <span>{item.label}</span>
            <span className="text-xs text-muted-foreground">
              ({item.color})
            </span>
          </div>
        )}
        getItemValue={(item) => item?.value || ''}
        className='w-[180px]'
      />
    );
  },
};

export const WithCustomValueKey: Story = {
  render: () => {
    const options = [
      { name: 'Facebook', slug: 'facebook.com' },
      { name: 'Twitter', slug: 'twitter.com' },
      { name: 'GitHub', slug: 'github.com' },
    ];
    const [value, setValue] = useState('twitter.com');

    return (
      <Select
        value={value}
        options={options}
        onValueChange={setValue}
        getItemValue={(item) => item.slug}
        renderSelectItem={(item) => item.name}
        placeholder="Select platform"
        className='w-[180px]'
      />
    );
  },
};
