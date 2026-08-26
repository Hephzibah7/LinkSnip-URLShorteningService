import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { authApi } from '../api/auth.api.js';
import { Link2, Sparkles, ArrowRight, User, Mail, Lock, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredToken, setRegisteredToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toastError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toastError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const result = await register(name, email, password);
      success('Account created successfully!');
      if (result.verificationToken) {
        setRegisteredToken(result.verificationToken);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toastError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!registeredToken) return;
    setLoading(true);
    try {
      await authApi.verifyEmail(registeredToken);
      success('Email successfully verified!');
      navigate('/dashboard');
    } catch (err: any) {
      toastError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-icon-box" style={{ width: '44px', height: '44px', margin: '0 auto 12px' }}>
            <Link2 size={24} />
          </div>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Create your Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Start shortening links, creating custom aliases, and analyzing clicks
          </p>
        </div>

        {registeredToken ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Verify Your Email</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
              We sent a verification link to <strong>{email}</strong>. In this development sandbox, you can verify your account instantly below.
            </p>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleVerifyEmail} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email & Go to Dashboard'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-prefix">
                <span className="input-prefix" style={{ borderRight: 'none', background: 'transparent' }}>
                  <User size={16} />
                </span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Work or Personal Email</label>
              <div className="input-with-prefix">
                <span className="input-prefix" style={{ borderRight: 'none', background: 'transparent' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password (min 6 characters)</label>
              <div className="input-with-prefix">
                <span className="input-prefix" style={{ borderRight: 'none', background: 'transparent' }}>
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Create a strong password"
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
              {loading ? 'Creating Account...' : 'Get Started Free'}
              <Sparkles size={16} />
            </button>
          </form>
        )}

        {!registeredToken && (
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
