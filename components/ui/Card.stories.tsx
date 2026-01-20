import type { Meta, StoryObj } from "@storybook/react";
import Card from "./Card";
import Button from "./Button";

/**
 * Card component provides a container for grouped content
 * with consistent styling and structure.
 */
const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "bordered", "elevated"],
      description: "Visual style of the card",
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
      description: "Internal padding",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default card
export const Default: Story = {
  args: {
    title: "Card Title",
    children: <p className="text-gray-600">This is the card content with some text inside.</p>,
  },
};

// Card with no title
export const WithoutTitle: Story = {
  args: {
    children: (
      <div>
        <h3 className="font-semibold mb-2">Custom Content</h3>
        <p className="text-gray-600">Card without using the title prop.</p>
      </div>
    ),
  },
};

// Card with footer
export const WithFooter: Story = {
  args: {
    title: "User Profile",
    children: (
      <div>
        <p className="text-gray-600 mb-2">Name: John Doe</p>
        <p className="text-gray-600">Email: john@example.com</p>
      </div>
    ),
    footer: (
      <div className="flex gap-2">
        <Button label="Edit" variant="primary" size="sm" />
        <Button label="Delete" variant="danger" size="sm" />
      </div>
    ),
  },
};

// Bordered variant
export const Bordered: Story = {
  args: {
    title: "Bordered Card",
    variant: "bordered",
    children: <p className="text-gray-600">This card has a visible border.</p>,
  },
};

// Elevated variant with shadow
export const Elevated: Story = {
  args: {
    title: "Elevated Card",
    variant: "elevated",
    children: <p className="text-gray-600">This card has a shadow for depth.</p>,
  },
};

// Small padding
export const SmallPadding: Story = {
  args: {
    title: "Compact Card",
    padding: "sm",
    children: <p className="text-gray-600">Card with small padding.</p>,
  },
};

// Large padding
export const LargePadding: Story = {
  args: {
    title: "Spacious Card",
    padding: "lg",
    children: <p className="text-gray-600">Card with large padding.</p>,
  },
};

// Clickable card
export const Clickable: Story = {
  args: {
    title: "Clickable Card",
    children: <p className="text-gray-600">Click anywhere on this card (check console).</p>,
    onClick: () => console.log("Card clicked!"),
  },
};

// Complex content example
export const ComplexContent: Story = {
  args: {
    title: "Task Details",
    variant: "elevated",
    children: (
      <div className="space-y-3">
        <div>
          <span className="text-sm text-gray-500">Status:</span>
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
            Completed
          </span>
        </div>
        <div>
          <span className="text-sm text-gray-500">Priority:</span>
          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-sm">High</span>
        </div>
        <p className="text-gray-600">
          This task has been completed successfully and is ready for review.
        </p>
      </div>
    ),
    footer: (
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Due: Jan 25, 2026</span>
        <Button label="View Details" variant="primary" size="sm" />
      </div>
    ),
  },
};

// Multiple cards showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      <Card title="Default Card" variant="default">
        <p className="text-gray-600">Standard card styling</p>
      </Card>
      <Card title="Bordered Card" variant="bordered">
        <p className="text-gray-600">With visible border</p>
      </Card>
      <Card title="Elevated Card" variant="elevated">
        <p className="text-gray-600">With shadow effect</p>
      </Card>
      <Card title="With Footer" footer={<Button label="Action" size="sm" />}>
        <p className="text-gray-600">Card with footer content</p>
      </Card>
      <Card title="Small Padding" padding="sm">
        <p className="text-gray-600">Compact spacing</p>
      </Card>
      <Card title="Large Padding" padding="lg">
        <p className="text-gray-600">Generous spacing</p>
      </Card>
    </div>
  ),
};
