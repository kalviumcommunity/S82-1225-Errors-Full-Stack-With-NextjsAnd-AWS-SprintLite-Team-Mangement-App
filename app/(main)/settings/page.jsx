export default function SettingsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back Button */}
      <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <span>←</span>
        <span>Settings</span>
      </button>

      {/* Tabs */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 mb-6">
        <div className="flex border-b border-gray-800">
          <button className="px-6 py-4 text-white bg-gray-800 border-b-2 border-blue-500 transition-colors">
            Account
          </button>
          <button className="px-6 py-4 text-gray-400 hover:text-white hover:bg-gray-850 transition-colors">
            Workspace
          </button>
          <button className="px-6 py-4 text-gray-400 hover:text-white hover:bg-gray-850 transition-colors">
            Team
          </button>
          <button className="px-6 py-4 text-gray-400 hover:text-white hover:bg-gray-850 transition-colors">
            Notifications
          </button>
          <button className="px-6 py-4 text-gray-400 hover:text-white hover:bg-gray-850 transition-colors">
            Integrations
          </button>
        </div>

        {/* Second Row Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-850">
          <button className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm">
            API
          </button>
          <button className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm">
            Shortcuts
          </button>
          <button className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm">
            Data
          </button>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
        <h2 className="text-white text-xl font-semibold mb-6">Account Information</h2>

        {/* Avatar */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              JD
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Upload Photo
            </button>
            <p className="text-gray-400 text-sm">JPG, PNG or GIF (max. 5MB)</p>
          </div>
        </div>

        {/* Full Name */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">Full Name</label>
          <input
            type="text"
            defaultValue="John Developer"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">Email Address</label>
          <input
            type="email"
            defaultValue="john@example.com"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">Password</label>
          <div className="flex gap-4">
            <input
              type="password"
              defaultValue="••••••••"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-750 text-white rounded-lg border border-gray-700 transition-colors">
              Change
            </button>
          </div>
        </div>

        {/* 2FA */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Two-Factor Authentication</h3>
              <p className="text-gray-400 text-sm">Add an extra layer of security</p>
            </div>
            <button className="px-6 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg border border-gray-700 transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
