import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { tagsApi } from '../../api/tags.api.js';
import { useToast } from '../../context/ToastContext.js';
import { Tag, Folder } from '../../types/index.js';
import { Folder as FolderIcon, Tag as TagIcon, Plus, Trash2, Edit2, Layers } from 'lucide-react';

interface FolderTagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const FolderTagManagerModal: React.FC<FolderTagManagerModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { success, error: toastError } = useToast();
  const [tab, setTab] = useState<'folders' | 'tags'>('folders');

  // Folders State
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Tags State
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [foldersRes, tagsRes] = await Promise.all([
        tagsApi.getFolders().catch(() => ({ success: false, data: [] })),
        tagsApi.getTags().catch(() => ({ success: false, data: [] })),
      ]);
      if (foldersRes.success && foldersRes.data) setFolders(foldersRes.data);
      if (tagsRes.success && tagsRes.data) setTags(tagsRes.data);
    } catch {
      // Ignored
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toastError('Folder name is required');
      return;
    }

    setCreatingFolder(true);
    try {
      const res = await tagsApi.createFolder(newFolderName.trim(), newFolderDesc.trim() || undefined);
      if (res.success && res.data) {
        success(`Folder "${newFolderName}" created!`);
        setNewFolderName('');
        setNewFolderDesc('');
        loadData();
        onUpdate();
      }
    } catch (err: any) {
      toastError(err.response?.data?.message || err.message || 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (id: string, name: string) => {
    if (!window.confirm(`Delete folder "${name}"? Links inside will remain unorganized.`)) return;
    try {
      await tagsApi.deleteFolder(id);
      success(`Folder "${name}" deleted`);
      loadData();
      onUpdate();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete folder');
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      toastError('Tag name is required');
      return;
    }

    setCreatingTag(true);
    try {
      const res = await tagsApi.createTag(newTagName.trim().replace(/^#/, ''));
      if (res.success && res.data) {
        success(`Tag "#${res.data.name}" created!`);
        setNewTagName('');
        loadData();
        onUpdate();
      }
    } catch (err: any) {
      toastError(err.response?.data?.message || err.message || 'Failed to create tag');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (!window.confirm(`Delete tag "#${name}"?`)) return;
    try {
      await tagsApi.deleteTag(id);
      success(`Tag "#${name}" deleted`);
      loadData();
      onUpdate();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete tag');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Organize Folders & Tags" maxWidth="600px">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          className={`btn btn-sm ${tab === 'folders' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('folders')}
        >
          <FolderIcon size={14} />
          Folders ({folders.length})
        </button>
        <button
          className={`btn btn-sm ${tab === 'tags' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('tags')}
        >
          <TagIcon size={14} />
          Tags ({tags.length})
        </button>
      </div>

      {tab === 'folders' ? (
        <div>
          {/* Create Folder Form */}
          <form onSubmit={handleCreateFolder} style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Create New Folder
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Folder Name (e.g. Q3 Campaigns)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-input"
                placeholder="Description (optional)"
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={creatingFolder || !newFolderName.trim()}>
                {creatingFolder ? 'Creating...' : 'Add Folder'}
              </button>
            </div>
          </form>

          {/* Folders List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto' }}>
            {folders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                No folders created yet. Create one above to organize your links!
              </div>
            ) : (
              folders.map((f) => (
                <div
                  key={f.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FolderIcon size={15} />
                      <span>{f.name}</span>
                    </div>
                    {f.description && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {f.description}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteFolder(f.id, f.name)}
                    title="Delete Folder"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Tags View */
        <div>
          {/* Create Tag Form */}
          <form onSubmit={handleCreateTag} style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Create New Tag
            </h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="input-with-prefix" style={{ flex: 1 }}>
                <span className="input-prefix">#</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="tag-name (e.g. marketing, youtube)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={creatingTag || !newTagName.trim()}>
                {creatingTag ? 'Creating...' : 'Add Tag'}
              </button>
            </div>
          </form>

          {/* Tags Cloud / List */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
            {tags.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', width: '100%', color: 'var(--text-muted)' }}>
                No tags created yet.
              </div>
            ) : (
              tags.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                  }}
                >
                  <span>#{t.name}</span>
                  <button
                    onClick={() => handleDeleteTag(t.id, t.name)}
                    style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                    title="Delete Tag"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
        <button className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
};
