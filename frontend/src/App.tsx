import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { CreateLinkModal } from './components/links/CreateLinkModal.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LinkDetailsPage } from './pages/LinkDetailsPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { ApiDocsPage } from './pages/ApiDocsPage.js';
import { RedirectHandlerPage } from './pages/RedirectHandlerPage.js';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [globalCreateModalOpen, setGlobalCreateModalOpen] = useState(false);

  return (
    <div className="app-container">
      <Navbar onCreateLinkClick={() => setGlobalCreateModalOpen(true)} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/links/:id"
          element={
            <ProtectedRoute>
              <LinkDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/api-docs" element={<ApiDocsPage />} />
        <Route path="/redirect/:status" element={<RedirectHandlerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />

      {/* Global Quick Create Modal */}
      <CreateLinkModal
        isOpen={globalCreateModalOpen}
        onClose={() => setGlobalCreateModalOpen(false)}
        onSuccess={() => {
          // If on dashboard, will refresh or navigate
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
