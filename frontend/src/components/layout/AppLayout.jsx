'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import MfaModal from '../MfaModal';
import api from '../../lib/api';

export default function AppLayout({
  children,
  activeTab,
  setActiveTab,
  filesCount = 0,
  sharesCount = 0,
  totalBytesUsed = 0,
  notifications = [],
  securityAlerts = [],
  onRefreshUser
}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMfaModal, setShowMfaModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('trustshare_user');
    const token = localStorage.getItem('trustshare_access_token');

    if (!token) {
      router.push('/login');
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('trustshare_user', JSON.stringify(res.data));
      if (onRefreshUser) onRefreshUser(res.data);
    } catch (err) {
      console.error('Profile check failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('trustshare_access_token');
    localStorage.removeItem('trustshare_user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xs text-slate-500 font-mono animate-pulse">
          Authenticating secure session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        user={user}
        notifications={notifications}
        securityAlerts={securityAlerts}
        onOpenMfa={() => setShowMfaModal(true)}
        onLogout={handleLogout}
        onNavigateTab={(tab) => {
          if (setActiveTab) setActiveTab(tab);
          else router.push(`/dashboard?tab=${tab}`);
        }}
      />

      <div className="flex-1 flex w-full">
        {activeTab && setActiveTab && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            filesCount={filesCount}
            sharesCount={sharesCount}
            totalBytesUsed={totalBytesUsed}
          />
        )}

        <motion.main
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-1 max-w-7xl px-6 py-8 overflow-y-auto mx-auto w-full"
        >
          {children}
        </motion.main>
      </div>

      {showMfaModal && (
        <MfaModal
          onClose={() => setShowMfaModal(false)}
          onMfaEnabled={() => fetchProfile()}
        />
      )}
    </div>
  );
}
