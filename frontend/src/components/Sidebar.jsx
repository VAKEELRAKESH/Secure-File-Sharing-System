'use client';
import React from 'react';
import {
  Files, UploadCloud, Share2, Activity, Shield, PieChart, HardDrive
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  filesCount = 0,
  sharesCount = 0,
  totalBytesUsed = 0,
  quotaBytes = 1073741824 // 1 GB default quota
}) {
  const isAdmin = user?.role === 'admin';
  const usedMB = (totalBytesUsed / (1024 * 1024)).toFixed(2);
  const quotaMB = (quotaBytes / (1024 * 1024)).toFixed(0);
  const quotaGB = (quotaBytes / (1024 * 1024 * 1024)).toFixed(0);
  const usagePercentage = Math.min(Math.round((totalBytesUsed / quotaBytes) * 100), 100);

  const getNavBtnClass = (tabKey) => {
    return `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
      activeTab === tabKey
        ? 'bg-primary/10 text-primary border border-primary/30 shadow-sm font-bold'
        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-surface/80 border border-transparent font-medium'
    }`;
  };

  const getIconClass = (tabKey) => {
    return `w-4 h-4 ${activeTab === tabKey ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`;
  };

  return (
    <aside className="w-64 flex-shrink-0 glass-panel border-r border-surfaceBorder min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        
        {/* WORKSPACE SECTION */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('files')}
              className={getNavBtnClass('files')}
              aria-label="View Files"
            >
              <div className="flex items-center space-x-2.5">
                <Files className={getIconClass('files')} />
                <span>Files</span>
              </div>
              {filesCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'files'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-surfaceBorder text-slate-600 dark:text-slate-300'
                }`}>
                  {filesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={getNavBtnClass('upload')}
              aria-label="Upload Files"
            >
              <div className="flex items-center space-x-2.5">
                <UploadCloud className={getIconClass('upload')} />
                <span>Uploads</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('shared_files')}
              className={getNavBtnClass('shared_files')}
              aria-label="View Shared Files"
            >
              <div className="flex items-center space-x-2.5">
                <Share2 className={getIconClass('shared_files')} />
                <span>Shared Files</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('shares')}
              className={getNavBtnClass('shares')}
              aria-label="View Active Shares"
            >
              <div className="flex items-center space-x-2.5">
                <Share2 className={getIconClass('shares')} />
                <span>Active Shares</span>
              </div>
              {sharesCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'shares'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-surfaceBorder text-slate-600 dark:text-slate-300'
                }`}>
                  {sharesCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* ACTIVITY SECTION */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
            Activity
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('audit')}
              className={getNavBtnClass('audit')}
              aria-label="View Audit Logs"
            >
              <div className="flex items-center space-x-2.5">
                <Activity className={getIconClass('audit')} />
                <span>Audit Logs</span>
              </div>
            </button>
          </nav>
        </div>

        {/* ADMINISTRATION SECTION (Admin only) */}
        {isAdmin && (
          <div>
            <div className="px-3 mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Administration
              </span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('admin_console')}
                className={getNavBtnClass('admin_console')}
                aria-label="Admin Console"
              >
                <div className="flex items-center space-x-2.5">
                  <Shield className={getIconClass('admin_console')} />
                  <span>Admin Console</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={getNavBtnClass('analytics')}
                aria-label="Analytics Dashboard"
              >
                <div className="flex items-center space-x-2.5">
                  <PieChart className={getIconClass('analytics')} />
                  <span>Analytics Dashboard</span>
                </div>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Sidebar Footer: Visual Storage Usage Meter */}
      <div className="p-3.5 rounded-xl bg-surface border border-surfaceBorder shadow-sm text-xs space-y-2.5">
        <div className="flex items-center justify-between font-bold text-foreground">
          <div className="flex items-center gap-1.5 text-xs">
            <HardDrive className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">Vault Storage</span>
          </div>
          <span className="text-xs font-mono text-secondaryText">{usedMB} MB / {quotaGB} GB</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-surfaceBorder rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.max(usagePercentage, 4)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-secondaryText font-medium">
          <span>{usagePercentage}% used</span>
          <a href="/settings#storage" className="text-primary hover:underline font-semibold flex items-center gap-0.5">
            Manage storage →
          </a>
        </div>
      </div>
    </aside>
  );
}
