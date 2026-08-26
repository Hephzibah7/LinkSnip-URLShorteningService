import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Link2, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Welcome back to LinkSnip!');
      navigate('/dashboard');
    } catch (err: any) {
      toastError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@linksnip.io');
    setPassword('password123');
    setLoading(true);
    try {
      await login('demo@linksnip.io', 'password123');
      success('Logged in with Demo Account!');
      navigate('/dashboard');
    } catch (err: any) {
      toastError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-icon-box" style={{ width: '44px', height: '44px', margin: '0 auto 12px' }}>
            <Link2 size={24} />
          </div>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sign in to manage your shortened links & analytics
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Want to test immediately?</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Alex Johnson (Preloaded demo data)</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleDemoLogin} type="button">
            <Sparkles size={13} /> Demo Login
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-prefix">
              <span className="input-prefix" style={{ borderRight: 'none', background: 'transparent' }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
            <div className="input-with-prefix">
              <span className="input-prefix" style={{ borderRight: 'none', background: 'transparent' }}>
                <Lock size={16} />
              </span>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            Sign up free
          </Link>
        </div>
      </div>
    </div>
  );
};
