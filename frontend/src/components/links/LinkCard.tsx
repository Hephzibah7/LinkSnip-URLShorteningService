import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LinkItem } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Copy,
  Check,
  QrCode,
  BarChart2,
  Edit2,
  Trash2,
  ExternalLink,
  Lock,
  Calendar,
  Folder as FolderIcon,
  Tag as TagIcon,
  MousePointerClick,
} from 'lucide-react';

interface LinkCardProps {
  link: LinkItem;
  onEdit: (link: LinkItem) => void;
  onDelete: (id: string) => void;
  onShowQr: (url: string, title?: string) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  onEdit,
  onDelete,
  onShowQr,
}) => {
  const { success, error: toastError } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopied(true);
      success('Copied short link to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError('Failed to copy');
    }
  };

  const getStatusBadge = () => {
    if (!link.isActive) {
      return <span className="badge badge-disabled">Disabled</span>;
    }
    if (link.isExpired) {
      return <span className="badge badge-expired">Expired</span>;
    }
    return <span className="badge badge-active">Active</span>;
  };

  return (
    <div className="link-card">
      <div className="link-main-info">
        {/* Title & Status Badges */}
        <div className="link-title-row">
          <Link to={`/links/${link.id}`} className="link-title" title={link.title || link.originalUrl}>
            {link.title || link.originalUrl}
          </Link>
          {getStatusBadge()}
          {link.isPasswordProtected && (
            <span className="badge badge-protected" title="Password Protected">
              <Lock size={10} /> Protected
            </span>
          )}
        </div>

        {/* Short URL & Original Destination */}
        <div className="link-urls-row">
          <div className="link-short-url">
            <span>{link.shortUrl}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleCopy}
              title="Copy Short URL"
              style={{ padding: '2px 6px', height: '24px' }}
            >
              {copied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
            </button>
          </div>

          <span style={{ color: 'var(--border-light)' }}>•</span>

          <a
            href={link.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-original-url"
            title={link.originalUrl}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>{link.originalUrl}</span>
            <ExternalLink size={11} />
          </a>
        </div>

        {/* Meta row: Clicks, Date, Folder, Tags */}
        <div className="link-meta-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <MousePointerClick size={13} />
            <span>{link.clickCount} clicks</span>
          </div>

          <span>•</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} />
            <span>{new Date(link.createdAt).toLocaleDateString()}</span>
          </div>

          {link.folder && (
            <>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                <FolderIcon size={13} />
                <span>{link.folder.name}</span>
              </div>
            </>
          )}

          {link.tags && link.tags.length > 0 && (
            <>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <TagIcon size={13} />
                {link.tags.map((t) => (
                  <span key={t.tag.id} className="badge badge-tag">
                    #{t.tag.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="link-actions-group">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onShowQr(link.shortUrl, link.title || undefined)}
          title="View & Download QR Code"
        >
          <QrCode size={14} />
          <span>QR</span>
        </button>

        <Link to={`/links/${link.id}`} className="btn btn-secondary btn-sm" title="View Click Analytics">
          <BarChart2 size={14} />
          <span>Analytics</span>
        </Link>

        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(link)} title="Edit Link">
          <Edit2 size={14} />
        </button>

        <button className="btn btn-danger btn-sm" onClick={() => onDelete(link.id)} title="Delete Link">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
