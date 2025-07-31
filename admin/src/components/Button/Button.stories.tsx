import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { RefreshCw, List, Download } from 'lucide-react';
import { ButtonGroup } from './ButtonGroup';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outline', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm'],
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Filled Button',
    variant: 'filled',
    size: 'default',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Button variant="filled">Filled</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <RefreshCw />
      </Button>
      <Button size="icon-sm">
        <RefreshCw />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
    variant: 'filled',
  },
};

export const AsChildLink: Story = {
  args: {
    asChild: true,
    children: (
      <a href="https://example.com" target="_blank" rel="noopener noreferrer">
        Button as link
      </a>
    ),
  },
};

export const GroupedButtons: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="ghost" size="icon" className="text-white">
        <RefreshCw />
      </Button>
      <Button variant="ghost" size="icon" className="text-white">
        <List />
      </Button>
      <Button variant="ghost" size="icon" className="text-white">
        <Download />
      </Button>
    </ButtonGroup>
  ),
};
