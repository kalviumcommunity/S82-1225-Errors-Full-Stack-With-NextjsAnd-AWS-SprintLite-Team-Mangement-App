import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

/**
 * Button component demonstrates various states and variants
 * for consistent UI interactions across the application.
 */
const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger", "success"],
      description: "Visual style of the button",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Button size",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary button - default state
export const Primary: Story = {
  args: {
    label: "Primary Button",
    variant: "primary",
  },
};

// Secondary button
export const Secondary: Story = {
  args: {
    label: "Secondary Button",
    variant: "secondary",
  },
};

// Danger button for destructive actions
export const Danger: Story = {
  args: {
    label: "Delete Account",
    variant: "danger",
  },
};

// Success button
export const Success: Story = {
  args: {
    label: "Save Changes",
    variant: "success",
  },
};

// Small size
export const Small: Story = {
  args: {
    label: "Small Button",
    size: "sm",
  },
};

// Medium size (default)
export const Medium: Story = {
  args: {
    label: "Medium Button",
    size: "md",
  },
};

// Large size
export const Large: Story = {
  args: {
    label: "Large Button",
    size: "lg",
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    label: "Disabled Button",
    disabled: true,
  },
};

// With click handler (check console for output)
export const WithClickHandler: Story = {
  args: {
    label: "Click Me",
    onClick: () => console.log("Button clicked!"),
  },
};

// All variants together
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button label="Primary" variant="primary" />
        <Button label="Secondary" variant="secondary" />
        <Button label="Danger" variant="danger" />
        <Button label="Success" variant="success" />
      </div>
      <div className="flex gap-4">
        <Button label="Small" size="sm" />
        <Button label="Medium" size="md" />
        <Button label="Large" size="lg" />
      </div>
      <div className="flex gap-4">
        <Button label="Disabled Primary" variant="primary" disabled />
        <Button label="Disabled Secondary" variant="secondary" disabled />
      </div>
    </div>
  ),
};
