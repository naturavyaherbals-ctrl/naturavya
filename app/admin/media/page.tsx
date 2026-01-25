'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Search,
  Grid,
  List,
  Folder,
  Image as ImageIcon,
  File,
  Video,
  Trash2,
  Copy,
  Check,
  X,
  Plus,
  Filter,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

interface MediaItem {
  id: string;
  filename: string;
  original_filename: string | null;
  file_type: string;
  file_size: number | null;
  mime_type: string | null;
  url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  title: string | null;
  folder: string;
  created_at: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, [selectedFolder, search]);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFolder) params.set('folder', selectedFolder);
      if (search) params.set('search', search);

      const response = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setMedia(data.media);
        setFolders(data.folders);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', selectedFolder || 'uploads');

        await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        });

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      fetchMedia();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload files');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      const response = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMedia(media.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm(`Delete ${selectedItems.length} files?`)) return;

    try {
      await Promise.all(
        selectedItems.map(id =>
          fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' })
        )
      );
      fetchMedia();
      setSelectedItems([]);
    } catch (err) {
      console.error('Bulk delete error:', err);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const toggleSelect = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-500" />;
      case 'pdf':
        return <File className="w-8 h-8 text-red-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Upload and manage your images and files</p>
        </div>
        <div className="flex gap-3">
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedItems.length})
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Files'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Folder filter */}
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Folders</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No files found</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 text-green-600 hover:text-green-700 font-medium"
          >
            Upload your first file
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg border-2 overflow-hidden group cursor-pointer transition-all ${
                selectedItems.includes(item.id)
                  ? 'border-green-500 ring-2 ring-green-200'
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => toggleSelect(item.id)}
            >
              <div className="relative aspect-square bg-gray-100">
                {item.file_type === 'image' ? (
                  <Image
                    src={item.thumbnail_url || item.url}
                    alt={item.alt_text || item.filename}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getFileIcon(item.file_type)}
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.url);
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    title="Copy URL"
                  >
                    {copiedUrl === item.url ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Selection indicator */}
                {selectedItems.includes(item.id) && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-900 truncate" title={item.original_filename || item.filename}>
                  {item.original_filename || item.filename}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(item.file_size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === media.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(media.map(m => m.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folder</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {media.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {item.file_type === 'image' ? (
                          <Image
                            src={item.thumbnail_url || item.url}
                            alt={item.alt_text || item.filename}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          getFileIcon(item.file_type)
                        )}
                      </div>
                      <span className="text-sm text-gray-900 truncate max-w-[200px]">
                        {item.original_filename || item.filename}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 capitalize">{item.file_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{formatFileSize(item.file_size)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{item.folder}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{formatDate(item.created_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(item.url)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Copy URL"
                      >
                        {copiedUrl === item.url ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}