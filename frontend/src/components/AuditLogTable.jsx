'use client';
import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, AlertTriangle, Search, Filter, Download, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import EmptyState from './ui/EmptyState';

export default function AuditLogTable() {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Grouped alert expansion state
  const [expandedAlertGroup, setExpandedAlertGroup] = useState(null);

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
      setLogs(logsRes.data || []);
      setAlerts(alertsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch audit data', err);
    } finally {
      setLoading(false);
    }
  };

  // Group alerts by title / pattern
  const activeAlerts = alerts.filter((a) => !a.is_resolved);
  const groupedAlertsMap = activeAlerts.reduce((acc, alert) => {
    const key = alert.title || 'Security Warning';
    if (!acc[key]) {
      acc[key] = {
        title: alert.title,
        description: alert.description,
        items: []
      };
    }
    acc[key].items.push(alert);
    return acc;
  }, {});

  const groupedAlertsList = Object.values(groupedAlertsMap);

  // Date filtering logic
  const now = new Date();
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
      (log.ip_address && log.ip_address.includes(search));

    if (!matchesSearch) return false;

    if (dateFilter === 'today') {
      const logDate = new Date(log.timestamp);
      return logDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'week') {
      const logDate = new Date(log.timestamp);
      const diffDays = (now - logDate) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Action', 'Target Type', 'IP Address', 'Status', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.action}"`,
      `"${l.target_type || ''}"`,
      `"${l.ip_address || ''}"`,
      `"${l.status}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trustshare_audit_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

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
      {/* Security Threat Alerts (Grouped by Type, Synchronized Badge Count) */}
      {groupedAlertsList.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 bg-rose-500/5 shadow-md">
          <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4" />
            Active Security Warnings ({groupedAlertsList.length})
          </h3>
          <div className="space-y-2">
            {groupedAlertsList.map((group, idx) => {
              const count = group.items.length;
              const latestTimestamp = group.items[0]?.timestamp;
              const isExpanded = expandedAlertGroup === idx;

              return (
                <div
                  key={idx}
                  className="rounded-xl bg-surface border border-rose-500/20 overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedAlertGroup(isExpanded ? null : idx)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-surface/80 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {count > 1 ? (
                        isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-rose-400" /> : <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-rose-300">{group.title}</span>
                          {count > 1 && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold">
                              {count} events grouped
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{group.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {latestTimestamp ? new Date(latestTimestamp).toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  {/* Expanded group breakdown */}
                  {isExpanded && count > 1 && (
                    <div className="bg-slate-900/40 p-3 border-t border-rose-500/20 space-y-1.5 text-[11px]">
                      {group.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-slate-400 font-mono">
                          <span>Event ID #{item.id} • {item.ip_address || '127.0.0.1'}</span>
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audit Log Toolbar & Main Table */}
      <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Audit Logging & Activity History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable security event trail recording uploads, downloads, and authentication events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search action or IP..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full glass-input rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            {/* Action Filter */}
            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
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

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
            </select>

            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Export filtered logs as CSV"
            >
              <Download className="w-3.5 h-3.5 text-primary" /> Export CSV
            </button>
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
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-4">
                    <EmptyState
                      icon={Activity}
                      title="No audit logs found"
                      description="No security activity logs match your current search or filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono">
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

        {/* Pagination Footer */}
        {filteredLogs.length > pageSize && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-surfaceBorder/60 text-xs text-slate-400">
            <span>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-surface border border-surfaceBorder hover:text-white disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-mono text-slate-300 px-2">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-surface border border-surfaceBorder hover:text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
