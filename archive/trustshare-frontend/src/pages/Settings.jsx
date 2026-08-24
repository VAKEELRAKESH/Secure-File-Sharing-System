import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    console.log("Updating password...");
    // Future: API call to the backend goes here
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Account Settings</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your security preferences and account details.
          </p>
        </div>

        {/* Security Section */}
        <div className="bg-white shadow-sm rounded-lg border border-zinc-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-zinc-900">Change Password</h3>
            <div className="mt-2 max-w-xl text-sm text-zinc-500">
              <p>Ensure your account is using a long, random password to stay secure.</p>
            </div>
            
            <form className="mt-5 space-y-4 max-w-md" onSubmit={handlePasswordUpdate}>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full border border-zinc-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full border border-zinc-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full border border-zinc-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 sm:text-sm transition-colors"
                >
                  Save Password
                </button>
              </div>
            </form>
            
          </div>
        </div>

        {/* Danger Zone Section (Optional but highly professional) */}
        <div className="bg-white shadow-sm rounded-lg border border-red-200 mt-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-red-600">Danger Zone</h3>
            <div className="mt-2 max-w-xl text-sm text-zinc-500">
              <p>Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2 border border-red-300 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}