'use client';
import React, { useState } from 'react';
import { Bell, ShieldAlert, Activity, Check, ExternalLink, Info, AlertTriangle } from 'lucide-react';

export default function NotificationPanel({
  notifications = [],
  securityAlerts = [],
  onClose,
  onViewAll,
  onMarkAllRead
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'alerts' | 'activity'
  const [markedRead, setMarkedRead] = useState(false);

  const combinedItems = [
    ...securityAlerts.map(item => ({
      id: item.id || `alert-${Math.random()}`,
      type: 'alert',
      title: item.event_type || 'Security Alert',
      detail: item.details || item.ip_address ? `IP: ${item.ip_address}` : 'Suspicious activity detected',
      time: item.created_at || 'Just now',
      severity: item.severity || 'HIGH',
    })),
    ...notifications.map(item => ({
      id: item.id || `log-${Math.random()}`,
      type: 'log',
      title: item.action || 'System Event',
      detail: item.details || `User: ${item.username || 'System'}`,
      time: item.timestamp || item.created_at || 'Recently',
      severity: item.status === 'SUCCESS' ? 'LOW' : 'MEDIUM',
    })),
  ];

  const filteredItems = combinedItems.filter(item => {
    if (filter === 'alerts') return item.type === 'alert';
    if (filter === 'activity') return item.type === 'log';
    return true;
  });

  const handleMarkAllRead = () => {
    setMarkedRead(true);
    if (onMarkAllRead) onMarkAllRead();
  };

  return (
    <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl glass-panel border border-surfaceBorder shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-surfaceBorder/80 bg-surface/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Notifications</h3>
            <p className="text-[10px] text-slate-400">Security & Activity Feed</p>
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={markedRead}
          className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-default"
        >
          <Check className="w-3 h-3" />
          {markedRead ? 'All Read' : 'Mark all read'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-surfaceBorder/50 bg-slate-950/40 text-[11px] px-2 pt-1 gap-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 font-medium rounded-t-lg transition-all ${
            filter === 'all'
              ? 'bg-surface border-t border-x border-surfaceBorder text-blue-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({combinedItems.length})
        </button>
        <button
          onClick={() => setFilter('alerts')}
          className={`px-3 py-1.5 font-medium rounded-t-lg transition-all flex items-center gap-1 ${
            filter === 'alerts'
              ? 'bg-surface border-t border-x border-surfaceBorder text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3 h-3" />
          Alerts ({securityAlerts.length})
        </button>
        <button
          onClick={() => setFilter('activity')}
          className={`px-3 py-1.5 font-medium rounded-t-lg transition-all flex items-center gap-1 ${
            filter === 'activity'
              ? 'bg-surface border-t border-x border-surfaceBorder text-slate-200 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3 h-3" />
          Activity
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-surfaceBorder/40">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <Info className="w-6 h-6 mx-auto mb-2 opacity-50" />
            No notifications to display
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 text-xs hover:bg-surface/50 transition-colors flex items-start gap-3 ${
                !markedRead && item.type === 'alert' ? 'bg-amber-500/5' : ''
              }`}
            >
              <div
                className={`p-2 rounded-xl flex-shrink-0 border ${
                  item.type === 'alert'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : item.severity === 'HIGH'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}
              >
                {item.type === 'alert' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-200 truncate">{item.title}</span>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">{item.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Panel Footer */}
      <div className="p-3 border-t border-surfaceBorder/80 bg-surface/40 text-center">
        <button
          onClick={() => {
            if (onViewAll) onViewAll();
            if (onClose) onClose();
          }}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <span>View all audit & threat logs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
