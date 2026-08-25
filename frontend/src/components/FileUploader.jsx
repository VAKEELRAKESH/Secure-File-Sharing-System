'use client';
import React, { useState } from 'react';
import { UploadCloud, Shield, FileText, CheckCircle, AlertCircle, Tag, Folder } from 'lucide-react';
import api from '../lib/api';

export default function FileUploader({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('Document');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', category);
    formData.append('tags', tags);

    try {
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(`File '${selectedFile.name}' encrypted with AES-256 and uploaded successfully!`);
      setSelectedFile(null);
      setTags('');
      if (onUploadSuccess) onUploadSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-primary" />
          Secure File Upload
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 font-mono">
          <Shield className="w-3.5 h-3.5 text-primary" />
          Server-Side AES-256-GCM Encrypted
        </div>
      </div>

      <form onSubmit={handleUpload}>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-primary bg-primary/10'
              : selectedFile
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-slate-700 hover:border-slate-500 bg-surface/40'
          }`}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <FileText className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
              <p className="text-sm font-medium text-slate-200">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-medium text-slate-300">
                Drag and drop your file here, or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, Images, Archives, Code files (Max 100MB)</p>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-sm text-slate-200"
              >
                <option value="Document">Document</option>
                <option value="Image">Image</option>
                <option value="Video">Video</option>
                <option value="Archive">Archive</option>
                <option value="Code">Code</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tags (Comma-separated)</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. confidential, finance, 2026"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {selectedFile && (
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-medium text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isUploading ? 'Encrypting & Uploading...' : 'Encrypt & Upload File'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
