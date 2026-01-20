import type { Meta, StoryObj } from "@storybook/react";
import Header from "./Header";

/**
 * Header component provides global navigation and branding
 * across the application.
 *
 * Note: This component uses Next.js routing and cookies,
 * so some interactive features may be limited in Storybook.
 */
const meta = {
  title: "Layout/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default header (unauthenticated state)
export const Default: Story = {};

// Header in application context
export const InApplication: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50">
        <Story />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
          <p className="text-gray-600">
            This shows how the header appears with page content below it.
          </p>
        </div>
      </div>
    ),
  ],
};

// Header with long content to demonstrate sticky behavior
export const StickyBehavior: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50">
        <Story />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
          <h1 className="text-2xl font-bold">Scroll to Test Sticky Header</h1>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-4 bg-white rounded shadow">
              <h3 className="font-semibold">Section {i + 1}</h3>
              <p className="text-gray-600">
                Scroll down to see the header stick to the top of the viewport. The header remains
                accessible while scrolling through content.
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  ],
};

// Responsive view (mobile)
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

// Responsive view (tablet)
export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};
