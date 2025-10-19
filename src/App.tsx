import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Migrations } from './components/Migrations';
import { Agents } from './components/Agents';
import { Help } from './components/Help';
import { Billing } from './components/Billing';
import { Profile } from './components/Profile';
import { MigrationWizard } from './components/MigrationWizard';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [showWizard, setShowWizard] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleWizardComplete = () => {
    setActiveView('migrations');
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
