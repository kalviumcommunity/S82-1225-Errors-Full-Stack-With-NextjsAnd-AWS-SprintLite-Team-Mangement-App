import type { Meta, StoryObj } from "@storybook/react";
import LayoutWrapper from "./LayoutWrapper";

/**
 * LayoutWrapper combines Header and Sidebar into a complete
 * page layout structure used across the application.
 */
const meta = {
  title: "Layout/LayoutWrapper",
  component: LayoutWrapper,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LayoutWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default layout
export const Default: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-2xl font-bold mb-4">Welcome to MyApp</h1>
        <p className="text-gray-600 mb-4">
          This is the main content area within the LayoutWrapper component.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold mb-2">Feature 1</h3>
            <p className="text-gray-600">Content goes here</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold mb-2">Feature 2</h3>
            <p className="text-gray-600">Content goes here</p>
          </div>
        </div>
      </div>
    ),
  },
};

// Dashboard page example
export const DashboardPage: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-6">Overview of your application</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total Users</div>
            <div className="text-3xl font-bold mt-2">1,234</div>
          </div>
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">Active Tasks</div>
            <div className="text-3xl font-bold mt-2">567</div>
          </div>
          <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Completed</div>
            <div className="text-3xl font-bold mt-2">89%</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">Activity {i + 1}</div>
                  <div className="text-sm text-gray-500">2 hours ago</div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
};

// Users page example
export const UsersPage: Story = {
  args: {
    children: (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Users</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add User
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  U{i + 1}
                </div>
                <div className="ml-3">
                  <div className="font-semibold">User {i + 1}</div>
                  <div className="text-sm text-gray-500">user{i + 1}@example.com</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">
                  View
                </button>
                <button className="flex-1 px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

// Settings page example
export const SettingsPage: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Email notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>SMS notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Newsletter subscription</span>
              </label>
            </div>
          </div>

          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    ),
  },
};

// Long content with scrolling
export const LongContent: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-3xl font-bold mb-6">Long Content Page</h1>
        <p className="text-gray-600 mb-4">
          Scroll down to see how the layout handles long content with sticky header.
        </p>
        <div className="space-y-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Section {i + 1}</h3>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris.
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
};
