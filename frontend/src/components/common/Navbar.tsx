import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  Link2,
  LayoutDashboard,
  BarChart3,
  BookOpen,
  LogOut,
  User,
  Plus,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onCreateLinkClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCreateLinkClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/" className="nav-brand">
          <div className="brand-icon-box">
            <Link2 size={20} strokeWidth={2.5} />
          </div>
          <span>LinkSnip</span>
        </Link>

        <nav className="nav-links" style={{ display: window.innerWidth < 768 ? 'none' : 'flex' }}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link to="/analytics" className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}>
                <BarChart3 size={16} />
                Analytics
              </Link>
            </>
          )}
          <Link to="/api-docs" className={`nav-link ${isActive('/api-docs') ? 'active' : ''}`}>
            <BookOpen size={16} />
            API & Docs
          </Link>
        </nav>
      </div>

      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            {onCreateLinkClick && (
              <button className="btn btn-primary btn-sm" onClick={onCreateLinkClick}>
                <Plus size={16} />
                Create Link
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <User size={14} />
                <span>{user?.name}</span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              <Sparkles size={14} />
              Get Started
            </Link>
          </div>
        )}

        <button
          className="btn btn-ghost btn-sm"
          style={{ display: window.innerWidth < 768 ? 'flex' : 'none', padding: '6px' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
};
