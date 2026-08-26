import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { linksApi } from '../../api/links.api.js';
import { tagsApi } from '../../api/tags.api.js';
import { useToast } from '../../context/ToastContext.js';
import { Tag, Folder, LinkItem } from '../../types/index.js';
import { Lock, Calendar, Folder as FolderIcon, Tag as TagIcon, ToggleLeft, ToggleRight } from 'lucide-react';

interface EditLinkModalProps {
  isOpen: boolean;
  link: LinkItem | null;
  onClose: () => void;
  onSuccess: (updatedLink: LinkItem) => void;
}

export const EditLinkModal: React.FC<EditLinkModalProps> = ({
  isOpen,
  link,
  onClose,
  onSuccess,
}) => {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  // Form State
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [redirectType, setRedirectType] = useState<number>(302);
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxClicks, setMaxClicks] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [folderId, setFolderId] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Tags and Folders
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (isOpen && link) {
      setOriginalUrl(link.originalUrl);
      setTitle(link.title || '');
      setCustomAlias(link.customAlias || '');
      setRedirectType(link.redirectType || 302);
      setPassword('');
      setExpiresAt(link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : '');
      setMaxClicks(link.maxClicks ? String(link.maxClicks) : '');
      setIsActive(link.isActive);
      setFolderId(link.folderId || '');
      setSelectedTagIds(link.tags?.map((t) => t.tag.id) || []);
      loadFoldersAndTags();
    }
  }, [isOpen, link]);

  const loadFoldersAndTags = async () => {
    try {
      const [foldersRes, tagsRes] = await Promise.all([
        tagsApi.getFolders().catch(() => ({ success: false, data: [] })),
        tagsApi.getTags().catch(() => ({ success: false, data: [] })),
      ]);
      if (foldersRes.success && foldersRes.data) setFolders(foldersRes.data);
      if (tagsRes.success && tagsRes.data) setTags(tagsRes.data);
    } catch {
      // Handled silently
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;

    setLoading(true);
    try {
      const res = await linksApi.updateLink(link.id, {
        originalUrl: originalUrl.trim() || undefined,
        title: title.trim() || null,
        customAlias: customAlias.trim() ? customAlias.trim() : null,
        redirectType,
        password: password.trim() ? password.trim() : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        maxClicks: maxClicks ? parseInt(maxClicks, 10) : null,
        isActive,
        folderId: folderId || null,
        tagIds: selectedTagIds,
      });

      if (res.success && res.data) {
        success('Link updated successfully!', 'Saved');
        onSuccess(res.data);
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update link';
      toastError(msg, 'Update Error');
    } finally {
      setLoading(false);
    }
  };

  if (!link) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Link Settings" maxWidth="620px">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Destination URL</label>
          <input
            type="text"
            className="form-input"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Title / Name</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custom Alias</label>
            <div className="input-with-prefix">
              <span className="input-prefix">/</span>
              <input
                type="text"
                className="form-input"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              />
            </div>
          </div>
        </div>

        {/* Status Toggle & Redirect Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label className="form-label">Link Status</label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                background: isActive ? '#f0fdf4' : '#fef2f2',
                color: isActive ? '#15803d' : '#b91c1c',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{isActive ? 'Active (Live)' : 'Disabled / Paused'}</span>
              {isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
          </div>

          <div>
            <label className="form-label">Redirect Type</label>
            <select
              className="form-select"
              value={redirectType}
              onChange={(e) => setRedirectType(Number(e.target.value))}
            >
              <option value={302}>302 Temporary (Analytics)</option>
              <option value={301}>301 Permanent (SEO)</option>
            </select>
          </div>
        </div>

        {/* Change / Set Password */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} /> Password Protection
          </label>
          <input
            type="password"
            className="form-input"
            placeholder={link.isPasswordProtected ? 'Enter new password to change (leave blank to keep)' : 'Enter password to protect link'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Expiration Rules */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Expiration Date
            </label>
            <input
              type="datetime-local"
              className="form-input"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Max Clicks Limit</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 1000"
              value={maxClicks}
              onChange={(e) => setMaxClicks(e.target.value)}
            />
          </div>
        </div>

        {/* Folders & Tags */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FolderIcon size={14} /> Folder
            </label>
            <select
              className="form-select"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
            >
              <option value="">No Folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TagIcon size={14} /> Tags
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '80px', overflowY: 'auto' }}>
              {tags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTagToggle(t.id)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${selectedTagIds.includes(t.id) ? 'var(--accent-black)' : 'var(--border-light)'}`,
                    background: selectedTagIds.includes(t.id) ? 'var(--accent-black)' : 'var(--bg-surface)',
                    color: selectedTagIds.includes(t.id) ? '#ffffff' : 'var(--text-primary)',
                  }}
                >
                  #{t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
