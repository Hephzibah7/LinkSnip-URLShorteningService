import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { redirectApi } from '../api/redirect.api.js';
import { useToast } from '../context/ToastContext.js';
import { Lock, Clock, Ban, HelpCircle, ArrowRight, Link2, ShieldAlert } from 'lucide-react';

export const RedirectHandlerPage: React.FC = () => {
  const { status } = useParams<{ status: string }>();
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('slug') || '';
  const { error: toastError, success } = useToast();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkTitle, setLinkTitle] = useState<string>('');

  useEffect(() => {
    if (slug && status === 'password_required') {
      redirectApi.checkStatus(slug).then((res) => {
        if (res.success && res.data?.title) {
          setLinkTitle(res.data.title);
        }
      }).catch(() => {});
    }
  }, [slug, status]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toastError('Please enter password to unlock');
      return;
    }

    setLoading(true);
    try {
      const res = await redirectApi.unlockProtectedLink(slug, password);
      if (res.success && res.data?.targetUrl) {
        success('Password verified! Redirecting...');
        window.location.href = res.data.targetUrl;
      }
    } catch (err: any) {
      toastError(err.response?.data?.message || err.message || 'Incorrect password entered');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (status?.toLowerCase()) {
      case 'password_required':
      case 'password_invalid':
        return (
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px', textAlign: 'center' }}>
            <div className="brand-icon-box" style={{ width: '48px', height: '48px', margin: '0 auto 16px' }}>
              <Lock size={22} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Password Protected Link</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              {linkTitle ? (
                <>Access to <strong>"{linkTitle}"</strong> requires an authorization password.</>
              ) : (
                'The creator of this link has restricted access with a password.'
              )}
            </p>

            <form onSubmit={handleUnlock}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter link password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Unlock & Proceed'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ marginTop: '24px' }}>
              <Link to="/" style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Powered by LinkSnip
              </Link>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px', textAlign: 'center' }}>
            <div className="brand-icon-box" style={{ width: '48px', height: '48px', margin: '0 auto 16px', background: '#fef2f2', color: '#dc2626' }}>
              <Clock size={22} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Link Has Expired</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
              This short link has reached its scheduled expiration date or maximum allowed click limit and is no longer resolving.
            </p>
            <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
              Go to LinkSnip Home
            </Link>
          </div>
        );

      case 'disabled':
        return (
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px', textAlign: 'center' }}>
            <div className="brand-icon-box" style={{ width: '48px', height: '48px', margin: '0 auto 16px', background: '#f4f4f5', color: '#71717a' }}>
              <Ban size={22} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Link Deactivated</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
              This short link has been paused or archived by its owner and is currently inactive.
            </p>
            <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
              Go to LinkSnip Home
            </Link>
          </div>
        );

      default:
        return (
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px', textAlign: 'center' }}>
            <div className="brand-icon-box" style={{ width: '48px', height: '48px', margin: '0 auto 16px' }}>
              <HelpCircle size={22} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>404 - Link Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
              The short code <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>/{slug}</code> does not match any existing link.
            </p>
            <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
              Create a Short Link
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)' }}>
      {renderContent()}
    </div>
  );
};
