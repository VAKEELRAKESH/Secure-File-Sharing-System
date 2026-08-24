import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  
  // State for the Multi-Factor Authentication UI toggle
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);

  const handleMfaToggle = () => {
    // In the future, this will trigger an API call to enable/disable MFA
    setIsMfaEnabled(!isMfaEnabled);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">User Profile</h2>
          <p className="mt-1 text-sm text-zinc-500">
            View your personal information and manage your security settings.
          </p>
        </div>

        {/* Profile Identity Card */}
        <div className="bg-white shadow-sm rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-6 sm:px-8 flex items-center gap-6 bg-gradient-to-r from-zinc-50 to-white border-b border-zinc-100">
            <div className="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-md ring-4 ring-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-zinc-900">
                {user?.name || 'Authorized User'}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active Member
                </span>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-zinc-100">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8">
                <dt className="text-sm font-medium text-zinc-500">Full name</dt>
                <dd className="mt-1 text-sm text-zinc-900 font-medium sm:mt-0 sm:col-span-2">
                  {user?.name || 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8">
                <dt className="text-sm font-medium text-zinc-500">Email address</dt>
                <dd className="mt-1 text-sm text-zinc-900 font-medium sm:mt-0 sm:col-span-2">
                  {user?.email || 'user@company.com'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Advanced Security Section */}
        <div className="bg-white shadow-sm rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50">
            <h3 className="text-lg leading-6 font-medium text-zinc-900">Security Preferences</h3>
            <p className="mt-1 text-sm text-zinc-500">Manage how you protect your TrustShare account.</p>
          </div>
          
          <div className="px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-zinc-900">Multi-Factor Authentication (MFA)</h4>
                <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
                  Require an extra security step when logging in. This adds an additional layer of protection to your encrypted files.
                </p>
              </div>
              
              {/* Custom Toggle Switch */}
              <button
                type="button"
                onClick={handleMfaToggle}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isMfaEnabled ? 'bg-blue-600' : 'bg-zinc-200'
                }`}
                role="switch"
                aria-checked={isMfaEnabled}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isMfaEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}