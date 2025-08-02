import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
};

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {},
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);

    return (
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};

export default meta;
