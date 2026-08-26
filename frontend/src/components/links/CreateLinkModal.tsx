import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { linksApi } from '../../api/links.api.js';
import { tagsApi } from '../../api/tags.api.js';
import { useToast } from '../../context/ToastContext.js';
import { Tag, Folder, LinkItem } from '../../types/index.js';
import { Link2, Lock, Calendar, Hash, Folder as FolderIcon, Tag as TagIcon, Sparkles } from 'lucide-react';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (link: LinkItem) => void;
}

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
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
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showExpiration, setShowExpiration] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxClicks, setMaxClicks] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Tags and Folders
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadFoldersAndTags();
    }
  }, [isOpen]);

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
    if (!originalUrl.trim()) {
      toastError('Please enter a destination URL');
      return;
    }

    setLoading(true);
    try {
      const res = await linksApi.createLink({
        originalUrl: originalUrl.trim(),
        title: title.trim() || undefined,
        customAlias: customAlias.trim() || undefined,
        redirectType,
        password: showPassword && password.trim() ? password.trim() : undefined,
        expiresAt: showExpiration && expiresAt ? new Date(expiresAt).toISOString() : undefined,
        maxClicks: showExpiration && maxClicks ? parseInt(maxClicks, 10) : undefined,
        folderId: folderId || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });

      if (res.success && res.data) {
        success('Short link created successfully!', 'Created');
        onSuccess(res.data);
        onClose();
        resetForm();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create link';
      toastError(msg, 'Creation Error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOriginalUrl('');
    setTitle('');
    setCustomAlias('');
    setRedirectType(302);
    setShowPassword(false);
    setPassword('');
    setShowExpiration(false);
    setExpiresAt('');
    setMaxClicks('');
    setFolderId('');
    setSelectedTagIds([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Short Link" maxWidth="620px">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Destination URL *</label>
          <input
            type="text"
            className="form-input"
            placeholder="https://example.com/my-long-landing-page"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Title / Description (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Summer Campaign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custom Alias (Optional)</label>
            <div className="input-with-prefix">
              <span className="input-prefix">/</span>
              <input
                type="text"
                className="form-input"
                placeholder="my-sale"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Redirect Type</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label
              style={{
                flex: 1,
                padding: '10px 14px',
                border: `1px solid ${redirectType === 302 ? 'var(--accent-black)' : 'var(--border-light)'}`,
                background: redirectType === 302 ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.88rem',
              }}
            >
              <input
                type="radio"
                name="redirectType"
                checked={redirectType === 302}
                onChange={() => setRedirectType(302)}
                style={{ marginRight: '8px' }}
              />
              <strong>302 Temporary</strong> (Recommended for analytics tracking)
            </label>

            <label
              style={{
                flex: 1,
                padding: '10px 14px',
                border: `1px solid ${redirectType === 301 ? 'var(--accent-black)' : 'var(--border-light)'}`,
                background: redirectType === 301 ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.88rem',
              }}
            >
              <input
                type="radio"
                name="redirectType"
                checked={redirectType === 301}
                onChange={() => setRedirectType(301)}
                style={{ marginRight: '8px' }}
              />
              <strong>301 Permanent</strong> (Best for SEO juice)
            </label>
          </div>
        </div>

        {/* Security & Password Protection Accordion */}
        <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.92rem' }}>
              <Lock size={16} />
              <span>Password Protection (Optional)</span>
            </div>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>
          {showPassword && (
            <div style={{ marginTop: '12px' }}>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password visitors must provide to access link"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Expiration Rules Accordion */}
        <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.92rem' }}>
              <Calendar size={16} />
              <span>Link Expiration Controls</span>
            </div>
            <input
              type="checkbox"
              checked={showExpiration}
              onChange={(e) => setShowExpiration(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>
          {showExpiration && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>Expire by Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>Expire after Clicks</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 500"
                  min="1"
                  value={maxClicks}
                  onChange={(e) => setMaxClicks(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Folders and Tags */}
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
              <option value="">No Folder (Default)</option>
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
              {tags.length === 0 ? (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No tags yet</span>
              ) : (
                tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTagToggle(t.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1px solid ${selectedTagIds.includes(t.id) ? 'var(--accent-black)' : 'var(--border-light)'}`,
                      background: selectedTagIds.includes(t.id) ? 'var(--accent-black)' : 'var(--bg-surface)',
                      color: selectedTagIds.includes(t.id) ? '#ffffff' : 'var(--text-primary)',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    #{t.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Shorten Link'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
