import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api.js';
import { useToast } from '../context/ToastContext.js';
import { Link2, Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toastError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      success('Reset token generated!');
      if (res.data?.resetToken) {
        setToken(res.data.resetToken);
      }
      setStep('reset');
    } catch (err: any) {
      toastError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) {
      toastError('Please enter the token and your new password');
      return;
    }

    if (newPassword.length < 6) {
      toastError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toastError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-icon-box" style={{ width: '44px', height: '44px', margin: '0 auto 12px' }}>
            <KeyRound size={22} />
          </div>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>
            {step === 'request' ? 'Reset Password' : 'Enter New Password'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {step === 'request'
              ? 'Enter your account email to receive a password reset token'
              : 'Choose a new secure password for your account'}
          </p>
        </div>

        {step === 'request' ? (
          <form onSubmit={handleRequestToken}>
            <div className="form-group">
              <label className="form-label">Account Email</label>
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
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">Reset Token</label>
              <input
                type="text"
                className="form-input"
                placeholder="Paste token or code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (min 6 chars)</label>
              <div className="input-with-prefix">
                <span className="input-prefix" style={{ borderRight: 'none', background: 'transparent' }}>
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/login" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
