import React from 'react';
import { Link } from 'react-router-dom';
import { Link2, Github, Shield, Terminal, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-surface)',
        padding: '40px 24px 28px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginBottom: '36px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div className="brand-icon-box" style={{ width: '28px', height: '28px' }}>
              <Link2 size={16} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem' }}>LinkSnip</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', maxWidth: '280px' }}>
            Next-generation URL shortening, custom branding, and real-time click intelligence engine.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Product
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <li><Link to="/" style={{ transition: 'var(--transition-fast)' }}>Instant Shortener</Link></li>
            <li><Link to="/dashboard">Link Management</Link></li>
            <li><Link to="/analytics">Click Intelligence</Link></li>
            <li><Link to="/api-docs">Developer Hub</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Security & Tech
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> Safe Browsing Threat Filter</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} /> Sub-100ms 301/302 Redirects</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Terminal size={14} /> REST API & OpenAPI 3.0</div>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>© 2026 LinkSnip Technologies. All rights reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>PostgreSQL 18</span>
          <span>•</span>
          <span>Prisma ORM</span>
          <span>•</span>
          <span>Express.js & React</span>
        </div>
      </div>
    </footer>
  );
};
