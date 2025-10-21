import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { AuthCallback } from './components/AuthCallback';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Migrations } from './components/Migrations';
import { Agents } from './components/Agents';
import { Help } from './components/Help';
import { Billing } from './components/Billing';
import { Profile } from './components/Profile';
import { MigrationWizard } from './components/MigrationWizard';
import { Landing } from './components/Landing';
import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto text-blue-400 animate-spin mb-4" size={48} />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

// Dashboard Layout Component
function DashboardLayout() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showWizard, setShowWizard] = useState(false);

  const handleWizardComplete = () => {
    setActiveView('migrations');
    setShowWizard(false);
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-y-auto">
        {activeView === 'dashboard' && (
          <Dashboard setActiveView={setActiveView} setShowWizard={setShowWizard} />
        )}
        {activeView === 'migrations' && <Migrations />}
        {activeView === 'agents' && <Agents />}
        {activeView === 'help' && <Help />}
        {activeView === 'billing' && <Billing />}
        {activeView === 'profile' && <Profile />}
      </main>
      {showWizard && (
        <MigrationWizard onClose={() => setShowWizard(false)} onComplete={handleWizardComplete} />
      )}
    </div>
  );
}

// Public Route - Redirects logged-in users
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <RefreshCw className="text-blue-400 animate-spin" size={48} />
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />

          {/* Auth Callback */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
