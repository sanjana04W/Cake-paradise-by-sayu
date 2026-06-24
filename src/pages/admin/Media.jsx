import React, { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, getMetadata, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase/storage';
import { Upload, Trash2, Search, Copy, CheckCircle, FolderOpen, Grid, List, FileImage, AlertCircle } from 'lucide-react';

const demoMedia = [
  { id: 'd1', name: 'classic-chocolate-cake.jpg', url: '/images/birthday.png', folder: 'products', size: 245000, type: 'image/jpeg', timeCreated: '2026-05-15T08:30:00Z' },
  { id: 'd2', name: 'vanilla-dream-cake.jpg', url: '/images/cupcakes.png', folder: 'products', size: 198000, type: 'image/jpeg', timeCreated: '2026-05-16T10:00:00Z' },
  { id: 'd3', name: 'red-velvet-supreme.jpg', url: '/images/brownies.png', folder: 'products', size: 312000, type: 'image/jpeg', timeCreated: '2026-05-17T14:20:00Z' },
  { id: 'd4', name: 'hero-banner-main.jpg', url: '/images/wedding.png', folder: 'banners', size: 520000, type: 'image/jpeg', timeCreated: '2026-06-01T09:15:00Z' },
  { id: 'd5', name: 'about-us-team.jpg', url: '/images/about_baker.png', folder: 'pages', size: 410000, type: 'image/jpeg', timeCreated: '2026-06-02T11:45:00Z' },
  { id: 'd6', name: 'birthday-cupcakes.jpg', url: '/images/cupcakes.png', folder: 'products', size: 175000, type: 'image/jpeg', timeCreated: '2026-05-20T16:30:00Z' },
  { id: 'd7', name: 'wedding-tier-showcase.jpg', url: '/images/wedding.png', folder: 'products', size: 489000, type: 'image/jpeg', timeCreated: '2026-05-22T13:00:00Z' },
  { id: 'd8', name: 'seasonal-promo-june.jpg', url: '/images/birthday.png', folder: 'banners', size: 380000, type: 'image/jpeg', timeCreated: '2026-06-05T07:00:00Z' },
];

const FOLDERS = ['all', 'products', 'banners', 'pages', 'custom-orders', 'testimonials'];

const formatFileSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MediaCard = ({ item, isGrid, onDelete, onCopyUrl }) => {
  const [copied, setCopied] = useState(false);
  const gradient = `linear-gradient(135deg, hsl(${Math.abs((item.name.charCodeAt(0) || 0) * 3) % 360}, 40%, 85%) 0%, hsl(${Math.abs((item.name.charCodeAt(2) || 0) * 5) % 360}, 50%, 75%) 100%)`;

  const handleCopy = () => {
    onCopyUrl(item);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isGrid) {
    return (
      <div className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-[#B76E79]/30 transition-all">
        <div className="aspect-square relative overflow-hidden" style={{ background: gradient }}>
          {item.url ? (
            <img src={item.url} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FileImage size={32} className="text-white/70" />
            </div>
          )}
          {/* Upload spinner */}
          {item.uploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-xs font-medium">Uploading…</span>
            </div>
          )}
          {/* Hover overlay (only when not uploading) */}
          {!item.uploading && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={handleCopy}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/40 transition-colors" title="Copy URL">
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
              <button onClick={() => onDelete(item)}
                className="p-2 bg-red-500/20 backdrop-blur-sm rounded-lg text-white hover:bg-red-500/40 transition-colors" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          )}
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[10px] text-white font-medium">
            {item.folder}
          </span>
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900 truncate" title={item.name}>{item.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(item.size)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#B76E79]/30 transition-colors group">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative" style={{ background: gradient }}>
        {item.url ? (
          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <FileImage size={20} className="text-white/80" />
        )}
        {item.uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-gray-400">{formatFileSize(item.size)} · {item.folder} · {new Date(item.timeCreated).toLocaleDateString()}</p>
      </div>
      {!item.uploading && (
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleCopy}
            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Copy URL">
            {copied ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
          <button onClick={() => onDelete(item)}
            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const Media = () => {
  const [media, setMedia] = useState(() => {
    try {
      const saved = localStorage.getItem('cake_media_library');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load media from localStorage');
    }
    return demoMedia;
  });
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [uploadFolder, setUploadFolder] = useState('products');
  const [dragOver, setDragOver] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  // Persist media state to localStorage
  React.useEffect(() => {
    try {
      // Don't save items that are currently uploading or using blob: URLs (they expire)
      const toSave = media.filter(m => !m.uploading && m.url && !m.url.startsWith('blob:'));
      localStorage.setItem('cake_media_library', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save media to localStorage', e);
    }
  }, [media]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files);

    for (const file of fileArr) {
      if (file.size > 10 * 1024 * 1024) {
        showNotification(`${file.name} exceeds 10MB limit`, 'error');
        continue;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        showNotification(`${file.name} is not an image or video`, 'error');
        continue;
      }

      const tempId = 'tmp-' + Date.now() + Math.random();
      const localUrl = URL.createObjectURL(file);

      // STEP 1: Show immediately
      setMedia(prev => [{
        id: tempId, name: file.name, url: localUrl,
        folder: uploadFolder, size: file.size, type: file.type,
        timeCreated: new Date().toISOString(), uploading: true,
      }, ...prev]);

      // STEP 2: Try Firebase with a quick 3-second timeout so it doesn't hang
      try {
        const storageRef = ref(storage, `${uploadFolder}/${Date.now()}_${file.name}`);
        
        // Race the upload against a 3s timeout
        const snapshot = await Promise.race([
          uploadBytesResumable(storageRef, file),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]);

        const fbUrl = await getDownloadURL(snapshot.ref);
        
        setMedia(prev => prev.map(m =>
          m.id === tempId ? {
            ...m, url: fbUrl, uploading: false, fullPath: snapshot.ref.fullPath
          } : m
        ));
        URL.revokeObjectURL(localUrl);
        showNotification(`${file.name} uploaded to cloud`);

      } catch (err) {
        // Fallback: convert file to Base64 so it can be saved in localStorage persistently
        const reader = new FileReader();
        reader.onloadend = () => {
          setMedia(prev => prev.map(m =>
            m.id === tempId ? { ...m, url: reader.result, uploading: false } : m
          ));
        };
        reader.onerror = () => {
          setMedia(prev => prev.map(m =>
            m.id === tempId ? { ...m, uploading: false } : m
          ));
        };
        reader.readAsDataURL(file);
        
        showNotification(`${file.name} saved locally`, 'info');
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    if (item.fullPath) {
      try { await deleteObject(ref(storage, item.fullPath)); } catch { /* ignore */ }
    }
    setMedia(prev => prev.filter(m => m.id !== item.id));
    showNotification(`${item.name} deleted`);
  };

  const handleCopyUrl = (item) => {
    navigator.clipboard.writeText(item.url || '').catch(() => {});
    showNotification('URL copied');
  };

  const filtered = media.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFolder = activeFolder === 'all' || m.folder === activeFolder;
    return matchSearch && matchFolder;
  });

  const folderCounts = {};
  FOLDERS.forEach(f => {
    folderCounts[f] = f === 'all' ? media.length : media.filter(m => m.folder === f).length;
  });
  const totalSize = media.reduce((s, m) => s + (m.size || 0), 0);
  const uploadingCount = media.filter(m => m.uploading).length;

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${notification.type === 'error' ? 'bg-red-500 text-white' : notification.type === 'info' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
          {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Manager</h1>
          <p className="text-sm text-gray-500 mt-1">
            {media.length} files · {formatFileSize(totalSize)} total
            {uploadingCount > 0 && <span className="ml-2 text-[#B76E79] animate-pulse">· {uploadingCount} uploading…</span>}
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B76E79] text-white rounded-xl font-semibold text-sm hover:bg-[#a15d67] transition-colors shadow-sm"
        >
          <Upload size={16} /> Upload Files
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden"
          onChange={e => handleUpload(e.target.files)} />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragOver ? 'border-[#B76E79] bg-[#B76E79]/5' : 'border-gray-200 bg-white hover:border-[#B76E79]/40'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload size={28} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-700">Drag & drop files here or click to browse</p>
          <p className="text-xs text-gray-400">PNG, JPG, WEBP, MP4 · Max 10MB per file</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Upload to:</span>
            <select
              value={uploadFolder}
              onChange={e => setUploadFolder(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#B76E79]"
            >
              {FOLDERS.filter(f => f !== 'all').map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FOLDERS.map(f => (
            <button key={f} onClick={() => setActiveFolder(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeFolder === f ? 'bg-[#B76E79] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#B76E79]'
              }`}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')} ({folderCounts[f]})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-40 focus:outline-none focus:ring-2 focus:ring-[#B76E79]" />
          </div>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-[#B76E79] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              <Grid size={14} />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-[#B76E79] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid / List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <FolderOpen size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">No media files found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} isGrid={true} onDelete={handleDelete} onCopyUrl={handleCopyUrl} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} isGrid={false} onDelete={handleDelete} onCopyUrl={handleCopyUrl} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Media;
