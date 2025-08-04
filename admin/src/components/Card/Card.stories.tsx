import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
};

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: <p>This is a basic card with no title.</p>,
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: <p>This is a card with a title.</p>,
  },
};

export default meta;
