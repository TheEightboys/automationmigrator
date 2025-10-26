import React, { useState } from 'react';
import { Zap, FileJson, User, LogOut, LayoutDashboard, Bot, HelpCircle, CreditCard, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UpgradeButton } from './upgradeButton';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleMenuItemClick = (viewId: string) => {
    setActiveView(viewId);
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'migrations', icon: FileJson, label: 'Migrations' },
    { id: 'agents', icon: Bot, label: 'Backend Code' },
    { id: 'billing', icon: CreditCard, label: 'Payments' },
    { id: 'help', icon: HelpCircle, label: 'Help & Feedback' },
  ];

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email
      .split('@')[0]
      .split('.')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="text-blue-600" size={24} />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              migromat
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-slate-700" />
            ) : (
              <Menu size={24} className="text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen
          w-72 bg-white border-r border-slate-200 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Desktop Logo */}
        <div className="hidden lg:block p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Zap className="text-blue-600" size={28} />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              migromat
            </span>
          </div>
        </div>

        {/* Mobile User Info at Top */}
        <div className="lg:hidden p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{getInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-slate-600 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeView === item.id
                      ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                  {activeView === item.id && (
                    <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Upgrade Button - FIXED POSITION */}
        <div className="p-4 border-t border-slate-200">
          <UpgradeButton variant="sidebar" showCredits={true} />
        </div>

        {/* Desktop User Info & Sign Out */}
        <div className="hidden lg:block p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{getInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-slate-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Mobile Sign Out */}
        <div className="lg:hidden p-4 border-t border-slate-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Spacer for mobile to prevent content from being hidden under fixed header */}
      <div className="lg:hidden h-[60px]" />
    </>
  );
};
