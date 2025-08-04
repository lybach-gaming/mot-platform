import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
};

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Placeholder',
  },
};

export const Date: Story = {
  args: {
    type: 'date',
    placeholder: 'Placeholder',
  },
};

export const File: Story = {
  args: {
    type: 'file',
    placeholder: 'Placeholder',
  },
};

export default meta;
