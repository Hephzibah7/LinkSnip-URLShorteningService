import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { linksApi } from '../api/links.api.js';
import { analyticsApi } from '../api/analytics.api.js';
import { useToast } from '../context/ToastContext.js';
import { LinkItem, AnalyticsData, ClickEventItem } from '../types/index.js';
import { ClicksChart } from '../components/analytics/ClicksChart.js';
import { ReferrersList } from '../components/analytics/ReferrersList.js';
import { GeoBreakdown } from '../components/analytics/GeoBreakdown.js';
import { DeviceDonut } from '../components/analytics/DeviceDonut.js';
import { ClickLogsTable } from '../components/analytics/ClickLogsTable.js';
import { EditLinkModal } from '../components/links/EditLinkModal.js';
import { QRCodeModal } from '../components/links/QRCodeModal.js';
import {
  ArrowLeft,
  Copy,
  Check,
  QrCode,
  Download,
  Edit2,
  Trash2,
  ExternalLink,
  Lock,
  Calendar,
  MousePointerClick,
  RefreshCw,
  Folder as FolderIcon,
  Tag as TagIcon,
} from 'lucide-react';

export const LinkDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [link, setLink] = useState<LinkItem | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [clickLogs, setClickLogs] = useState<ClickEventItem[]>([]);
  const [logsPage, setLogsPage] = useState<number>(1);
  const [logsTotalPages, setLogsTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const fetchLinkData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [linkRes, analyticsRes, logsRes] = await Promise.all([
        linksApi.getLinkDetails(id),
        analyticsApi.getLinkAnalytics(id),
        analyticsApi.getClickLogs(id, logsPage, 20),
      ]);

      if (linkRes.success && linkRes.data) {
        setLink(linkRes.data);
      }
      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
      if (logsRes.success && logsRes.data) {
        setClickLogs(logsRes.data);
        setLogsTotalPages(logsRes.meta?.totalPages || 1);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load link data');
    } finally {
      setLoading(false);
    }
  }, [id, logsPage]);

  useEffect(() => {
    fetchLinkData();
  }, [fetchLinkData]);

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopied(true);
      success('Copied short URL to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError('Failed to copy');
    }
  };

  const handleExportCsv = async () => {
    if (!id) return;
    try {
      const blob = await analyticsApi.exportCsv(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `linksnip_analytics_${link?.customAlias || link?.shortCode || id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      success('Analytics CSV exported successfully!');
    } catch {
      toastError('Failed to export CSV');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to permanently delete this short link?')) return;
    try {
      const res = await linksApi.deleteLink(id);
      if (res.success) {
        success('Link deleted successfully');
        navigate('/dashboard');
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete link');
    }
  };

  if (loading && !link) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px' }} />
        <div>Loading link analytics...</div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="main-content">
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>Link Not Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>The requested link could not be found or has been deleted.</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Top Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Links
        </Link>
      </div>

      {/* Link Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{link.title || link.shortCode}</h1>
              {!link.isActive ? (
                <span className="badge badge-disabled">Disabled</span>
              ) : link.isExpired ? (
                <span className="badge badge-expired">Expired</span>
              ) : (
                <span className="badge badge-active">Active</span>
              )}
              {link.isPasswordProtected && (
                <span className="badge badge-protected">
                  <Lock size={10} /> Protected
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700 }}>
                <span>{link.shortUrl}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleCopy} style={{ padding: '4px 6px' }}>
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                </button>
              </div>

              <span style={{ color: 'var(--border-light)' }}>•</span>

              <a
                href={link.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}
              >
                <span>{link.originalUrl}</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} />
                <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
              </div>

              {link.folder && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FolderIcon size={13} />
                  <span>{link.folder.name}</span>
                </div>
              )}

              {link.tags && link.tags.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TagIcon size={13} />
                  {link.tags.map((t) => (
                    <span key={t.tag.id} className="badge badge-tag">
                      #{t.tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setQrModalOpen(true)}>
              <QrCode size={14} /> QR Code
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
              <Download size={14} /> Export CSV
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditModalOpen(true)}>
              <Edit2 size={14} /> Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-icon-box">
            <MousePointerClick size={22} />
          </div>
          <div>
            <div className="metric-value">{link.clickCount}</div>
            <div className="metric-label">Total Clicks Recorded</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <QrCode size={22} />
          </div>
          <div>
            <div className="metric-value">{analytics?.topCountries?.length || 0}</div>
            <div className="metric-label">Countries Reached</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <Calendar size={22} />
          </div>
          <div>
            <div className="metric-value" style={{ fontSize: '1.2rem' }}>
              {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : 'Never'}
            </div>
            <div className="metric-label">Expiration Date</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <Lock size={22} />
          </div>
          <div>
            <div className="metric-value" style={{ fontSize: '1.2rem' }}>
              {link.isPasswordProtected ? 'Enabled' : 'Disabled'}
            </div>
            <div className="metric-label">Password Protection</div>
          </div>
        </div>
      </div>

      {/* Clicks Over Time Chart */}
      <ClicksChart data={analytics?.clicksOverTime || []} totalClicks={link.clickCount} />

      {/* Analytics Breakdown 3-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <ReferrersList referrers={analytics?.topReferrers || []} />
        <GeoBreakdown countries={analytics?.topCountries || []} cities={analytics?.topCities || []} />
        <DeviceDonut
          devices={analytics?.deviceBreakdown || []}
          osList={analytics?.osBreakdown || []}
          browsers={analytics?.browserBreakdown || []}
        />
      </div>

      {/* Click Stream Logs Table */}
      <ClickLogsTable
        logs={clickLogs}
        page={logsPage}
        totalPages={logsTotalPages}
        onPageChange={(p) => setLogsPage(p)}
      />

      {/* Modals */}
      <EditLinkModal
        isOpen={editModalOpen}
        link={link}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => fetchLinkData()}
      />

      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        url={link.shortUrl}
        title={link.title || link.shortCode}
      />
    </div>
  );
};
