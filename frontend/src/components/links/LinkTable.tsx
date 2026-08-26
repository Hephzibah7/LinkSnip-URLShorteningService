import React from 'react';
import { Link } from 'react-router-dom';
import { LinkItem } from '../../types/index.js';
import { Copy, QrCode, BarChart2, Edit2, Trash2, ExternalLink, Lock } from 'lucide-react';

interface LinkTableProps {
  links: LinkItem[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (link: LinkItem) => void;
  onDelete: (id: string) => void;
  onShowQr: (url: string, title?: string) => void;
  onCopy: (url: string) => void;
}

export const LinkTable: React.FC<LinkTableProps> = ({
  links,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete,
  onShowQr,
  onCopy,
}) => {
  const isAllSelected = links.length > 0 && selectedIds.length === links.length;

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
      <table className="custom-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
            </th>
            <th>Title & Short URL</th>
            <th>Original Destination</th>
            <th>Clicks</th>
            <th>Status</th>
            <th>Created</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => {
            const isSelected = selectedIds.includes(link.id);
            return (
              <tr key={link.id} style={{ background: isSelected ? 'var(--bg-subtle)' : 'transparent' }}>
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectOne(link.id, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    <Link to={`/links/${link.id}`}>{link.title || link.shortCode}</Link>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                    <span>{link.shortUrl}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onCopy(link.shortUrl)}
                      style={{ padding: '2px 4px' }}
                    >
                      <Copy size={11} />
                    </button>
                    {link.isPasswordProtected && (
                      <span title="Password Protected">
                        <Lock size={11} />
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                    <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span>{link.originalUrl}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </td>
                <td>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{link.clickCount}</strong>
                </td>
                <td>
                  {!link.isActive ? (
                    <span className="badge badge-disabled">Disabled</span>
                  ) : link.isExpired ? (
                    <span className="badge badge-expired">Expired</span>
                  ) : (
                    <span className="badge badge-active">Active</span>
                  )}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  {new Date(link.createdAt).toLocaleDateString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onShowQr(link.shortUrl, link.title || undefined)} title="QR Code">
                      <QrCode size={13} />
                    </button>
                    <Link to={`/links/${link.id}`} className="btn btn-ghost btn-sm" title="Analytics">
                      <BarChart2 size={13} />
                    </Link>
                    <button className="btn btn-ghost btn-sm" onClick={() => onEdit(link)} title="Edit">
                      <Edit2 size={13} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onDelete(link.id)} title="Delete" style={{ color: 'var(--danger)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
