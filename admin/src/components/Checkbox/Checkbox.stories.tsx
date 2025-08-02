import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    checked: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="checkbox-demo" />
      <label htmlFor="checkbox-demo">Check me</label>
    </div>
  ),
};

export const Checked: Story = {
  args: {
    checked: true,
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: Default.render,
};

export const CheckedAndDisabled: Story = {
  args: {
    checked: true,
    disabled: true,
  },
  render: Default.render,
};
