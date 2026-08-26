import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { authApi } from '../api/auth.api.js';
import { useToast } from '../context/ToastContext.js';
import {
  BookOpen,
  Key,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  ExternalLink,
  Code2,
} from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [copiedKey, setCopiedKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopyApiKey = async () => {
    if (!user?.apiKey) return;
    try {
      await navigator.clipboard.writeText(user.apiKey);
      setCopiedKey(true);
      success('API Key copied to clipboard!');
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      toastError('Failed to copy API key');
    }
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Regenerating will invalidate your current API key. Proceed?')) return;
    setRegenerating(true);
    try {
      const res = await authApi.regenerateApiKey();
      if (res.success) {
        success('New API key generated!');
        await refreshUser();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to regenerate key');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code2 size={28} /> Developer API & Documentation
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Programmatically create short links, query analytics, and integrate LinkSnip with OpenAPI 3.0
        </p>
      </div>

      {/* API Key Management Card */}
      {isAuthenticated && (
        <div className="card" style={{ marginBottom: '28px', borderLeft: '4px solid var(--accent-black)' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} /> Your Developer API Key
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Pass this key via the <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>x-api-key</code> header
              </p>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleRegenerateKey}
              disabled={regenerating}
            >
              <RefreshCw size={13} className={regenerating ? 'animate-spin' : ''} />
              {regenerating ? 'Regenerating...' : 'Regenerate Key'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.92rem',
                background: 'var(--bg-subtle)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                wordBreak: 'break-all',
              }}
            >
              {user?.apiKey || 'No API key generated yet'}
            </div>
            <button className="btn btn-primary" onClick={handleCopyApiKey} style={{ height: '45px' }}>
              {copiedKey ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Swagger Link Banner */}
      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '2px' }}>Interactive Swagger UI Playground</div>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Explore request/response schemas, try out API endpoints live in Swagger UI
          </div>
        </div>

        <a
          href="http://localhost:4000/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Open Swagger UI <ExternalLink size={14} />
        </a>
      </div>

      {/* Code Examples & Endpoints Reference */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Endpoint 1: Create Link */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ background: '#18181b', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              POST
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.95rem' }}>
              /api/v1/links
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '14px' }}>
            Creates a new shortened URL with optional custom alias, expiration, and password.
          </p>

          <div style={{ background: '#09090b', color: '#f4f4f5', borderRadius: 'var(--radius-md)', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', overflowX: 'auto' }}>
            <div style={{ color: '#71717a', marginBottom: '8px' }}># cURL Example</div>
            <pre>{`curl -X POST http://localhost:4000/api/v1/links \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${user?.apiKey || 'YOUR_API_KEY'}" \\
  -d '{
    "originalUrl": "https://example.com/blog/article",
    "customAlias": "my-post",
    "redirectType": 302
  }'`}</pre>
          </div>
        </div>

        {/* Endpoint 2: Get Analytics */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ background: '#3f3f46', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              GET
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.95rem' }}>
              /api/v1/analytics/:linkId
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '14px' }}>
            Retrieves time-series click aggregations, top referrers, geographic countries/cities, and device breakdown.
          </p>

          <div style={{ background: '#09090b', color: '#f4f4f5', borderRadius: 'var(--radius-md)', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', overflowX: 'auto' }}>
            <div style={{ color: '#71717a', marginBottom: '8px' }}># cURL Example</div>
            <pre>{`curl -X GET http://localhost:4000/api/v1/analytics/LINK_ID \\
  -H "x-api-key: ${user?.apiKey || 'YOUR_API_KEY'}"`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
