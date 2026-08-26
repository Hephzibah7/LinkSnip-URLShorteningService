import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { linksApi } from '../api/links.api.js';
import { useToast } from '../context/ToastContext.js';
import { QRCodeModal } from '../components/links/QRCodeModal.js';
import {
  Link2,
  Sparkles,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shortenedResult, setShortenedResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toastError('Please enter a valid destination URL');
      return;
    }

    setLoading(true);
    setShortenedResult(null);

    try {
      const res = await linksApi.createLink({
        originalUrl: url.trim(),
        customAlias: customAlias.trim() || undefined,
      });

      if (res.success && res.data) {
        setShortenedResult(res.data);
        success('Short link generated instantly!');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to shorten link';
      toastError(msg, 'Shortening Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortenedResult) return;
    try {
      await navigator.clipboard.writeText(shortenedResult.shortUrl);
      setCopied(true);
      success('Copied short URL to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError('Failed to copy');
    }
  };

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <Sparkles size={14} />
          <span>Next-Gen URL Shortening & Real-Time Intelligence</span>
        </div>

        <h1 className="hero-title">
          Shorten. Share.<br />Measure Everything.
        </h1>

        <p className="hero-subtitle">
          Transform long, cumbersome URLs into fast, branded short links. Gain instant visibility into clicks, referrers, geography, and devices.
        </p>

        {/* Instant Shortener Box (Visitor Mode - No Login Required) */}
        <div className="instant-shortener-card">
          <form onSubmit={handleShorten}>
            <div className="shortener-input-row">
              <input
                type="text"
                className="shortener-url-input"
                placeholder="Paste your long URL here (e.g. https://example.com/very-long-link)..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || !url.trim()}
              >
                {loading ? 'Shortening...' : 'Shorten URL'}
              </button>
            </div>

            <div className="shortener-options-toggle">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowOptions(!showOptions)}
                style={{ padding: '4px 0' }}
              >
                <Sliders size={14} />
                <span>{showOptions ? 'Hide Custom Alias' : 'Customize Short Link Alias'}</span>
              </button>
            </div>

            {showOptions && (
              <div className="shortener-options-panel">
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Custom Alias (Optional)</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">linksnip.io/</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="my-custom-slug"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    />
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Instant Shortened Result Banner */}
          {shortenedResult && (
            <div className="result-box">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 600 }}>
                  YOUR SHORT LINK:
                </div>
                <div className="result-short-url">{shortenedResult.shortUrl}</div>
              </div>

              <div className="result-actions">
                <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setQrModalOpen(true)}
                  title="Generate QR Code"
                >
                  <QrCode size={14} />
                  <span>QR Code</span>
                </button>

                <a
                  href={shortenedResult.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  Visit <ArrowRight size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ marginTop: '40px', marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Engineered for Precision & Speed</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Every feature you need to distribute and monitor links effortlessly.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="card">
            <div className="metric-icon-box" style={{ marginBottom: '16px' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Sub-100ms Redirects</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Optimized non-blocking asynchronous click event pipeline ensures visitors are redirected in milliseconds.
            </p>
          </div>

          <div className="card">
            <div className="metric-icon-box" style={{ marginBottom: '16px' }}>
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Threat & Phishing Filter</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Integrated Safe Browsing threat intelligence shields your audience from malicious software and phishing URLs.
            </p>
          </div>

          <div className="card">
            <div className="metric-icon-box" style={{ marginBottom: '16px' }}>
              <BarChart3 size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Deep Click Analytics</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Inspect interactive time-series trends, top referrers, geographic distributions, and device breakdowns.
            </p>
          </div>

          <div className="card">
            <div className="metric-icon-box" style={{ marginBottom: '16px' }}>
              <QrCode size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Branded QR Codes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Instantly generate high-resolution, print-ready QR codes for any link in vector SVG or PNG format.
            </p>
          </div>
        </div>
      </section>

      {/* Free Account CTA Banner */}
      <section
        style={{
          background: 'var(--bg-dark)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '44px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div>
          <h3 style={{ color: '#ffffff', fontSize: '1.65rem', marginBottom: '8px' }}>
            Ready to unlock password protection, tags & bulk creation?
          </h3>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>
            Create an account to organize links into folders, set expiration rules, and export click reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/register" className="btn btn-secondary btn-lg" style={{ background: '#ffffff', color: '#09090b' }}>
            Sign Up Free
          </Link>
          <Link to="/api-docs" className="btn btn-dark btn-lg" style={{ border: '1px solid #3f3f46' }}>
            Explore API
          </Link>
        </div>
      </section>

      {/* QR Modal */}
      {shortenedResult && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          url={shortenedResult.shortUrl}
          title={shortenedResult.title || 'link'}
        />
      )}
    </div>
  );
};
