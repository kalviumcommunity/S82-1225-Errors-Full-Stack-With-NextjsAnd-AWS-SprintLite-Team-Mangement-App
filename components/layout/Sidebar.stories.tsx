import type { Meta, StoryObj } from "@storybook/react";
import Sidebar from "./Sidebar";

/**
 * Sidebar component provides secondary navigation
 * with active route highlighting.
 *
 * Note: This component uses Next.js routing,
 * so navigation won't work in Storybook.
 */
const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  argTypes: {
    links: {
      description: "Array of navigation links",
    },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default sidebar
export const Default: Story = {};

// Sidebar with custom links
export const CustomLinks: Story = {
  args: {
    links: [
      { href: "/dashboard", label: "Dashboard", icon: "🏠" },
      { href: "/analytics", label: "Analytics", icon: "📈" },
      { href: "/reports", label: "Reports", icon: "📋" },
      { href: "/team", label: "Team", icon: "👥" },
      { href: "/settings", label: "Settings", icon: "⚙️" },
    ],
  },
};

// Sidebar in layout context
export const InLayout: Story = {
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <main className="flex-1 bg-gray-50 p-8 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Main Content Area</h1>
          <p className="text-gray-600 mb-4">
            The sidebar provides navigation while the main content area displays the current page
            content.
          </p>
          <div className="space-y-4">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="p-4 bg-white rounded shadow">
                <h3 className="font-semibold">Content Block {i + 1}</h3>
                <p className="text-gray-600">Sample content goes here.</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    ),
  ],
};

// Minimal links
export const MinimalLinks: Story = {
  args: {
    links: [
      { href: "/dashboard", label: "Home" },
      { href: "/profile", label: "Profile" },
      { href: "/settings", label: "Settings" },
    ],
  },
};

// Extended navigation
export const ExtendedNavigation: Story = {
  args: {
    links: [
      { href: "/dashboard", label: "Dashboard", icon: "🏠" },
      { href: "/projects", label: "Projects", icon: "📁" },
      { href: "/tasks", label: "Tasks", icon: "✅" },
      { href: "/calendar", label: "Calendar", icon: "📅" },
      { href: "/documents", label: "Documents", icon: "📄" },
      { href: "/users", label: "Users", icon: "👥" },
      { href: "/analytics", label: "Analytics", icon: "📊" },
      { href: "/reports", label: "Reports", icon: "📋" },
      { href: "/integrations", label: "Integrations", icon: "🔌" },
      { href: "/settings", label: "Settings", icon: "⚙️" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <main className="flex-1 bg-gray-50 p-8">
          <h1 className="text-2xl font-bold">Extended Navigation Example</h1>
          <p className="text-gray-600">
            Sidebar with many navigation items demonstrates scrolling behavior.
          </p>
        </main>
      </div>
    ),
  ],
};

// Mobile view
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <main className="flex-1 bg-gray-50 p-4">
          <h2 className="text-xl font-bold">Mobile View</h2>
          <p className="text-sm text-gray-600">Sidebar adapts to mobile screen size.</p>
        </main>
      </div>
    ),
  ],
};
