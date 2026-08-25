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
  const usagePercentage = Math.min(Math.round((totalBytesUsed / quotaBytes) * 100), 100);

  const getNavBtnClass = (tabKey) => {
    return `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      activeTab === tabKey
        ? 'bg-primary/10 text-primary border border-primary/30 shadow-sm'
        : 'text-slate-400 hover:text-slate-200 hover:bg-surface/60 border border-transparent'
    }`;
  };

  const getIconClass = (tabKey) => {
    return `w-4 h-4 ${activeTab === tabKey ? 'text-primary' : 'text-slate-400'}`;
  };

  return (
    <aside className="w-64 flex-shrink-0 glass-panel border-r border-surfaceBorder min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        
        {/* WORKSPACE SECTION */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('files')}
              className={getNavBtnClass('files')}
            >
              <div className="flex items-center space-x-2.5">
                <Files className={getIconClass('files')} />
                <span>Files</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                activeTab === 'files'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-surfaceBorder/60 text-slate-400'
              }`}>
                {filesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={getNavBtnClass('upload')}
            >
              <div className="flex items-center space-x-2.5">
                <UploadCloud className={getIconClass('upload')} />
                <span>Uploads</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('shared_files')}
              className={getNavBtnClass('shared_files')}
            >
              <div className="flex items-center space-x-2.5">
                <Share2 className={getIconClass('shared_files')} />
                <span>Shared Files</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('shares')}
              className={getNavBtnClass('shares')}
            >
              <div className="flex items-center space-x-2.5">
                <Share2 className={getIconClass('shares')} />
                <span>Active Shares</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                activeTab === 'shares'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-surfaceBorder/60 text-slate-400'
              }`}>
                {sharesCount}
              </span>
            </button>
          </nav>
        </div>

        {/* ACTIVITY SECTION */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Activity
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('audit')}
              className={getNavBtnClass('audit')}
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Administration
              </span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('admin_console')}
                className={getNavBtnClass('admin_console')}
              >
                <div className="flex items-center space-x-2.5">
                  <Shield className={getIconClass('admin_console')} />
                  <span>Admin Console</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={getNavBtnClass('analytics')}
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
      <div className="p-3.5 rounded-xl bg-surface/40 border border-surfaceBorder/60 text-xs space-y-2.5">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <div className="flex items-center gap-1.5 text-xs">
            <HardDrive className="w-3.5 h-3.5 text-primary" />
            <span>Vault Storage</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{usedMB} MB / {quotaMB} MB</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.max(usagePercentage, 4)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>{usagePercentage}% used</span>
          <span className="text-primary hover:underline cursor-pointer" onClick={() => setActiveTab('files')}>Manage</span>
        </div>
      </div>
    </aside>
  );
}
