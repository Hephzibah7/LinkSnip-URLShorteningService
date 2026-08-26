import React, { useState, useEffect, useCallback } from 'react';
import { linksApi } from '../api/links.api.js';
import { tagsApi } from '../api/tags.api.js';
import { analyticsApi } from '../api/analytics.api.js';
import { useToast } from '../context/ToastContext.js';
import { LinkItem, Tag, Folder } from '../types/index.js';
import { LinkCard } from '../components/links/LinkCard.js';
import { LinkTable } from '../components/links/LinkTable.js';
import { CreateLinkModal } from '../components/links/CreateLinkModal.js';
import { EditLinkModal } from '../components/links/EditLinkModal.js';
import { BulkUploadModal } from '../components/links/BulkUploadModal.js';
import { QRCodeModal } from '../components/links/QRCodeModal.js';
import { FolderTagManagerModal } from '../components/links/FolderTagManagerModal.js';
import {
  Link2,
  MousePointerClick,
  Activity,
  Layers,
  Search,
  Plus,
  Upload,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  Trash2,
  RefreshCw,
  Folder as FolderIcon,
  Tag as TagIcon,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  // Data States
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Overview Metrics
  const [metrics, setMetrics] = useState({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    avgClicks: 0,
  });

  // Query / Filter / Sort States
  const [search, setSearch] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'expired' | 'disabled'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'clickCount' | 'title'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Multi-select Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [bulkModalOpen, setBulkModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [activeEditLink, setActiveEditLink] = useState<LinkItem | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [activeQrUrl, setActiveQrUrl] = useState<string>('');
  const [activeQrTitle, setActiveQrTitle] = useState<string | undefined>(undefined);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [linksRes, overviewRes, foldersRes, tagsRes] = await Promise.all([
        linksApi.getUserLinks({
          search: search || undefined,
          folderId: selectedFolder || undefined,
          tagId: selectedTag || undefined,
          status: selectedStatus,
          sortBy,
          sortOrder,
          limit: 100,
        }),
        analyticsApi.getUserOverview().catch(() => ({ success: false, data: null })),
        tagsApi.getFolders().catch(() => ({ success: false, data: [] })),
        tagsApi.getTags().catch(() => ({ success: false, data: [] })),
      ]);

      if (linksRes.success && linksRes.data) {
        setLinks(linksRes.data);
        setTotalCount(linksRes.meta?.total || linksRes.data.length);
      }

      if (overviewRes.success && overviewRes.data) {
        const totalL = overviewRes.data.totalLinks || 0;
        const totalC = overviewRes.data.totalClicks || 0;
        const activeL = overviewRes.data.activeLinks || 0;
        const avg = totalL > 0 ? Math.round((totalC / totalL) * 10) / 10 : 0;
        setMetrics({
          totalLinks: totalL,
          totalClicks: totalC,
          activeLinks: activeL,
          avgClicks: avg,
        });
      }

      if (foldersRes.success && foldersRes.data) setFolders(foldersRes.data);
      if (tagsRes.success && tagsRes.data) setTags(tagsRes.data);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch links');
    } finally {
      setLoading(false);
    }
  }, [search, selectedFolder, selectedTag, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Bulk Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(links.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected links?`)) return;

    setBulkDeleting(true);
    try {
      const res = await linksApi.bulkDelete(selectedIds);
      if (res.success) {
        success(`Successfully deleted ${res.data?.count || selectedIds.length} links!`);
        setSelectedIds([]);
        fetchDashboardData();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to bulk delete');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      const res = await linksApi.deleteLink(id);
      if (res.success) {
        success('Link deleted successfully');
        setLinks((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete link');
    }
  };

  const handleEdit = (link: LinkItem) => {
    setActiveEditLink(link);
    setEditModalOpen(true);
  };

  const handleShowQr = (url: string, title?: string) => {
    setActiveQrUrl(url);
    setActiveQrTitle(title);
    setQrModalOpen(true);
  };

  return (
    <div className="main-content">
      {/* Metrics Overview Bar */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box">
            <Link2 size={22} />
          </div>
          <div>
            <div className="metric-value">{metrics.totalLinks}</div>
            <div className="metric-label">Total Short Links</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <MousePointerClick size={22} />
          </div>
          <div>
            <div className="metric-value">{metrics.totalClicks}</div>
            <div className="metric-label">Total Clicks Tracked</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <Activity size={22} />
          </div>
          <div>
            <div className="metric-value">{metrics.activeLinks}</div>
            <div className="metric-label">Active Links</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <Layers size={22} />
          </div>
          <div>
            <div className="metric-value">{metrics.avgClicks}</div>
            <div className="metric-label">Avg Clicks / Link</div>
          </div>
        </div>
      </div>

      {/* Main Header & Creation Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Link Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Search, filter, organize into folders, and manage short codes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setBulkModalOpen(true)}>
            <Upload size={16} />
            Bulk CSV Upload
          </button>
          <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} />
            Create Short Link
          </button>
        </div>
      </div>

      {/* Filter, Search & View Bar */}
      <div className="filter-bar">
        {/* Search */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, alias, or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            style={{ width: 'auto', padding: '8px 12px' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired Only</option>
            <option value="disabled">Disabled Only</option>
          </select>

          {/* Folder Filter */}
          {folders.length > 0 && (
            <select
              className="form-select"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px' }}
            >
              <option value="">All Folders</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          )}

          {/* Tag Filter */}
          {tags.length > 0 && (
            <select
              className="form-select"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px' }}
            >
              <option value="">All Tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>#{t.name}</option>
              ))}
            </select>
          )}

          {/* Sort By */}
          <select
            className="form-select"
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('_');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            style={{ width: 'auto', padding: '8px 12px' }}
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="clickCount_desc">Most Clicks</option>
            <option value="title_asc">Title (A-Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('grid')}
              style={{ borderRadius: 0, padding: '8px 10px' }}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('table')}
              style={{ borderRadius: 0, padding: '8px 10px' }}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selectedIds.length > 0 && (
        <div
          style={{
            background: 'var(--accent-black)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            padding: '10px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {selectedIds.length} link{selectedIds.length > 1 ? 's' : ''} selected
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              style={{ background: '#dc2626', color: '#ffffff', border: 'none' }}
            >
              <Trash2 size={14} />
              {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedIds([])}
              style={{ color: '#ffffff' }}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Links List / Table */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading your links...</div>
        </div>
      ) : links.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Link2 size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No short links found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
            {search || selectedFolder || selectedTag || selectedStatus !== 'all'
              ? 'No links matched your current filters. Try resetting your search.'
              : 'Create your first short link or bulk import from CSV to start tracking analytics!'}
          </p>
          <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} /> Create Short Link
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="links-grid">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onEdit={handleEdit}
              onDelete={handleDeleteOne}
              onShowQr={handleShowQr}
            />
          ))}
        </div>
      ) : (
        <LinkTable
          links={links}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onEdit={handleEdit}
          onDelete={handleDeleteOne}
          onShowQr={handleShowQr}
          onCopy={async (url) => {
            await navigator.clipboard.writeText(url);
            success('Copied short URL!');
          }}
        />
      )}

      {/* Modals */}
      <CreateLinkModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => fetchDashboardData()}
      />


      <EditLinkModal
        isOpen={editModalOpen}
        link={activeEditLink}
        onClose={() => {
          setEditModalOpen(false);
          setActiveEditLink(null);
        }}
        onSuccess={() => fetchDashboardData()}
      />

      <BulkUploadModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSuccess={() => fetchDashboardData()}
      />

      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        url={activeQrUrl}
        title={activeQrTitle}
      />
    </div>
  );
};
