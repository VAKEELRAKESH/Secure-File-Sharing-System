'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/layout/AppLayout';
import FilesView from '../../components/views/FilesView';
import ActiveSharesView from '../../components/views/ActiveSharesView';
import SharedFilesAccessView from '../../components/views/SharedFilesAccessView';
import AdminConsoleView from '../../components/views/AdminConsoleView';
import FileUploader from '../../components/FileUploader';
import ShareModal from '../../components/ShareModal';
import AuditLogTable from '../../components/AuditLogTable';
import AnalyticsCharts from '../../components/AnalyticsCharts';
import api from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('files');
  
  // Data States
  const [filesList, setFilesList] = useState([]);
  const [sharesList, setSharesList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [securityAlertsList, setSecurityAlertsList] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Loading States
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // Modal State
  const [selectedShareFile, setSelectedShareFile] = useState(null);

  const totalBytesUsed = filesList.reduce((acc, f) => acc + (f.file_size_bytes || f.file_size || 0), 0);

  useEffect(() => {
    fetchFiles();
    fetchShares();
    fetchNotifications();
    fetchAnalytics();
  }, []);

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await api.get('/files', {
        params: {
          search: search || undefined,
          category: categoryFilter || undefined,
        },
      });
      setFilesList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch files', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const fetchShares = async () => {
    try {
      const res = await api.get('/shares');
      setSharesList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch shares', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const [logsRes, alertsRes] = await Promise.all([
        api.get('/audit/logs'),
        api.get('/audit/alerts'),
      ]);
      setNotificationsList(logsRes.data || []);
      setSecurityAlertsList(alertsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.get('/analytics');
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/files/${file.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download decrypted file');
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file from encrypted storage?')) return;
    try {
      await api.delete(`/files/${fileId}`);
      fetchFiles();
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      filesCount={filesList.length}
      sharesCount={sharesList.length}
      totalBytesUsed={totalBytesUsed}
      notifications={notificationsList}
      securityAlerts={securityAlertsList}
    >
      {/* VIEW 1: FILES & STORAGE */}
      {activeTab === 'files' && (
        <FilesView
          filesList={filesList}
          loadingFiles={loadingFiles}
          search={search}
          setSearch={setSearch}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          fetchFiles={fetchFiles}
          onUploadClick={() => setActiveTab('upload')}
          onDownload={handleDownload}
          onShareClick={(file) => setSelectedShareFile(file)}
          onDelete={handleDelete}
        />
      )}

      {/* VIEW 2: SECURE UPLOAD */}
      {activeTab === 'upload' && (
        <FileUploader
          onUploadSuccess={() => {
            fetchFiles();
            setActiveTab('files');
          }}
        />
      )}

      {/* VIEW 3: SHARED FILES RECEIVER */}
      {activeTab === 'shared_files' && <SharedFilesAccessView />}

      {/* VIEW 4: ACTIVE SHARES */}
      {activeTab === 'shares' && (
        <ActiveSharesView
          sharesList={sharesList}
          fetchShares={fetchShares}
        />
      )}

      {/* VIEW 5: ADMIN CONSOLE */}
      {activeTab === 'admin_console' && (
        <AdminConsoleView
          analyticsData={analyticsData}
          loadingAnalytics={loadingAnalytics}
          fetchAnalytics={fetchAnalytics}
        />
      )}

      {/* VIEW 6: ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && <AnalyticsCharts />}

      {/* VIEW 7: AUDIT LOGS */}
      {activeTab === 'audit' && <AuditLogTable />}

      {/* Share Creation Modal */}
      {selectedShareFile && (
        <ShareModal
          file={selectedShareFile}
          onClose={() => {
            setSelectedShareFile(null);
            fetchShares();
          }}
        />
      )}
    </AppLayout>
  );
}
