'use client';
import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react';
import api from '../lib/api';

export default function AuditLogTable() {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [logsRes, alertsRes] = await Promise.all([
        api.get('/audit/logs', { params: { action: filterAction || undefined } }),
        api.get('/audit/alerts'),
      ]);
      setLogs(logsRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Failed to fetch audit data', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
      log.ip_address.includes(search)
  );

  const getStatusBadge = (status) => {
    if (status === 'SUCCESS') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          SUCCESS
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
        DENIED
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Security Threat Alerts */}
      {alerts.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 bg-rose-500/5">
          <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4" />
            Active Security Warnings ({alerts.filter((a) => !a.is_resolved).length})
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-surface border border-rose-500/20 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-rose-300">{alert.title}</span>
                  <p className="text-slate-400 mt-0.5">{alert.description}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log Toolbar */}
      <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Audit Logging & Activity History
          </h2>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="UPLOAD">UPLOAD</option>
              <option value="DOWNLOAD">DOWNLOAD</option>
              <option value="CREATE_SHARE">CREATE_SHARE</option>
              <option value="SHARED_FILE_DOWNLOAD">SHARED_DOWNLOAD</option>
              <option value="AUTH_FAILURE">AUTH_FAILURE</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-surface/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-surfaceBorder">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    Loading audit records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{log.target_type || '-'}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{log.ip_address}</td>
                    <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
