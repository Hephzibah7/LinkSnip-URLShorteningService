import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal.js';
import { linksApi } from '../../api/links.api.js';
import { useToast } from '../../context/ToastContext.js';
import { UploadCloud, FileText, Download, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>('');
  const [useTextInput, setUseTextInput] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.type === 'text/csv') {
        setFile(droppedFile);
      } else {
        toastError('Please drop a valid .csv file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await linksApi.downloadBulkTemplate(); //binary data
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'linksnip_bulk_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toastError('Failed to download CSV template');
    }
  };

  const handleUpload = async () => {
    if (!file && !csvText.trim()) {
      toastError('Please select a CSV file or paste CSV text');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let res;
      if (file) {
        res = await linksApi.bulkUploadCsv(file);
      } else {
        res = await linksApi.bulkUploadCsvText(csvText);
      }

      if (res.success && res.data) {
        setResult(res.data);
        success(`Successfully created ${res.data.successful} short links!`, 'Bulk Process Complete');
        onSuccess();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Bulk upload failed';
      toastError(msg, 'Upload Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setCsvText('');
    setResult(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Shorten Links (CSV Upload)" maxWidth="640px">
      {!result ? (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Need the format template?</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Download sample CSV with url, title, customAlias, tags headers
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleDownloadTemplate}>
              <Download size={14} /> Template
            </button>
          </div>

          {!useTextInput ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: file ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                transition: 'var(--transition-fast)',
                marginBottom: '16px',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <UploadCloud size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              {file ? (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-black)' }}>{file.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {(file.size / 1024).toFixed(1)} KB • Ready for upload
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Drop your .CSV file here or click to browse
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Supports UTF-8 CSV files up to 5MB
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Paste CSV Content (with headers: url, title, customAlias, tags)</label>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder={`url,title,customAlias,tags\nhttps://example.com/promo1,Summer Promo,summer-deal,Marketing\nhttps://example.com/doc1,Docs Page,,Docs`}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setUseTextInput(!useTextInput)}
            >
              <FileText size={14} />
              {useTextInput ? 'Upload File instead' : 'Or paste CSV text directly'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading || (!file && !csvText.trim())}
              onClick={handleUpload}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Processing CSV...
                </>
              ) : (
                'Upload & Shorten'
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Results Report */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>{result.successful}</div>
                <div style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 600 }}>Links Created</div>
              </div>
            </div>

            <div
              style={{
                background: result.failed > 0 ? '#fef2f2' : '#f8fafc',
                border: `1px solid ${result.failed > 0 ? '#fecaca' : '#e2e8f0'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <AlertTriangle size={24} style={{ color: result.failed > 0 ? '#dc2626' : '#71717a' }} />
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: result.failed > 0 ? '#dc2626' : '#71717a' }}>
                  {result.failed}
                </div>
                <div style={{ fontSize: '0.82rem', color: result.failed > 0 ? '#991b1b' : '#71717a', fontWeight: 600 }}>
                  Failed / Skipped Rows
                </div>
              </div>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '8px' }}>Row Errors</div>
              <div
                style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                }}
              >
                {result.errors.map((err: any, idx: number) => (
                  <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid #e2e8f0', color: '#991b1b' }}>
                    Row {err.row}: {err.reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Upload Another File
            </button>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
