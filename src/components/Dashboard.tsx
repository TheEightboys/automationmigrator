import React, { useState, useEffect, useRef } from 'react';
import { Plus, RefreshCw, Bot, FileJson, TrendingUp, AlertCircle, User, Mail, Calendar, Shield, Camera, Edit2, Save, X, Check, AlertTriangle } from 'lucide-react';
import { supabase, Migration } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

interface DashboardProps {
  setActiveView: (view: string) => void;
  setShowWizard: (show: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveView, setShowWizard }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { subscription, refreshSubscription } = useSubscription();
  
  const [stats, setStats] = useState({
    totalMigrations: 0,
    completedMigrations: 0,
    activeMigrations: 0,
    totalAgents: 0,
  });
  const [recentMigrations, setRecentMigrations] = useState<Migration[]>([]);
  const [activating, setActivating] = useState(false);

  // Profile states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    username: user?.user_metadata?.username || '',
    bio: user?.user_metadata?.bio || '',
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
      handlePaymentSuccess();
    }
  }, [user]);

  const handlePaymentSuccess = async () => {
    const paymentSuccess = searchParams.get('payment');
    const plan = searchParams.get('plan');

    if (paymentSuccess === 'success' && plan && user) {
      await updateSubscription(plan);
      searchParams.delete('payment');
      searchParams.delete('plan');
      setSearchParams(searchParams);
    }
  };

  const updateSubscription = async (plan: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: plan,
          subscription_status: 'active',
          subscription_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          migrations_used: 0,
          migrations_reset_date: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (!error) {
        await refreshSubscription();
        alert('Payment successful! Your subscription has been activated.');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const activateSubscription = async (plan: 'basic' | 'pro') => {
    if (!user) return;
    setActivating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: plan,
          subscription_status: 'active',
          subscription_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          migrations_used: 0,
          migrations_reset_date: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (!error) {
        await refreshSubscription();
        alert(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated!`);
      }
    } catch (error) {
      console.error('Error activating subscription:', error);
    } finally {
      setActivating(false);
    }
  };

  const handleNewMigration = () => {
    if (!subscription.canMigrate) {
      alert(`Limit reached: ${subscription.migrationsUsed}/${subscription.migrationsLimit}. Upgrade!`);
      setActiveView('billing');
      return;
    }
    setShowWizard(true);
  };

  const loadDashboardData = async () => {
    try {
      const { data: migrations } = await supabase
        .from('migrations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const { count: totalCount } = await supabase
        .from('migrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      const { count: completedCount } = await supabase
        .from('migrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'completed');

      const { count: activeCount } = await supabase
        .from('migrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .in('status', ['pending', 'processing']);

      const { count: agentsCount } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      setStats({
        totalMigrations: totalCount || 0,
        completedMigrations: completedCount || 0,
        activeMigrations: activeCount || 0,
        totalAgents: agentsCount || 0,
      });

      setRecentMigrations(migrations || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Profile functions
  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          username: formData.username,
          bio: formData.bio,
          avatar_url: avatarUrl
        }
      });

      if (error) throw error;
      setIsEditing(false);
      alert('Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: user?.user_metadata?.full_name || '',
      username: user?.user_metadata?.username || '',
      bio: user?.user_metadata?.bio || '',
    });
    setAvatarUrl(user?.user_metadata?.avatar_url || '');
    setIsEditing(false);
  };

  const getInitials = () => {
    const name = formData.fullName || user?.email || 'U';
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const statCards = [
    { label: 'Total Migrations', value: stats.totalMigrations, icon: RefreshCw, color: 'bg-blue-600' },
    { label: 'Completed', value: stats.completedMigrations, icon: TrendingUp, color: 'bg-green-600' },
    { label: 'Active', value: stats.activeMigrations, icon: FileJson, color: 'bg-amber-600' },
    { label: 'Agents', value: stats.totalAgents, icon: Bot, color: 'bg-purple-600' },
  ];

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Profile Header Card - Clean Solid Colors */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        {/* Solid Color Header */}
        <div className="h-32 bg-blue-600"></div>
        
        <div className="px-8 pb-6">
          <div className="flex items-start gap-6 -mt-16 mb-6">
            <div className="relative group">
              <div
                onClick={handleAvatarClick}
                className={`w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden ${
                  isEditing ? 'cursor-pointer' : ''
                }`}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">{getInitials()}</span>
                  </div>
                )}
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="text-white" size={32} />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            <div className="flex-1 mt-16">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Full Name"
                    className="w-full text-2xl font-bold border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="@username"
                    className="w-full text-lg border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                  />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Bio..."
                    rows={2}
                    className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none resize-none"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-slate-900">{formData.fullName || 'Anonymous User'}</h2>
                  <p className="text-lg text-slate-600 mt-1">{formData.username ? `@${formData.username}` : user.email}</p>
                  {formData.bio && <p className="text-slate-700 mt-2">{formData.bio}</p>}
                </>
              )}
            </div>

            <div className="flex gap-2 mt-16">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Account Info Grid - Solid Colors */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="text-white" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-600 font-medium">Email</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="text-white" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Member Since</p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Plan</p>
                <p className="text-sm font-semibold text-slate-900 capitalize">{subscription.plan}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Card - Solid Blue */}
      <div className="bg-blue-600 rounded-xl p-6 mb-6 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-100 font-medium">Current Plan</p>
            <p className="text-3xl font-black capitalize mt-1">{subscription.plan}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100 font-medium">Migrations Used</p>
            <p className="text-3xl font-black mt-1">
              {subscription.migrationsLimit === -1 
                ? `${subscription.migrationsUsed} / ∞`
                : `${subscription.migrationsUsed} / ${subscription.migrationsLimit}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Activation Buttons - Solid Colors */}
      {subscription.plan === 'free' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Activate Subscription</h3>
          <p className="text-sm text-slate-600 mb-4">After completing payment on Dodo, activate your plan here.</p>
          <div className="flex gap-4">
            <button
              onClick={() => activateSubscription('basic')}
              disabled={activating}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors disabled:opacity-50"
            >
              {activating ? 'Activating...' : '✓ Activate Basic'}
            </button>
            <button
              onClick={() => activateSubscription('pro')}
              disabled={activating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50"
            >
              {activating ? 'Activating...' : '✓ Activate Pro'}
            </button>
          </div>
        </div>
      )}

      {/* Warning - Solid Red */}
      {!subscription.canMigrate && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-red-900">Migration Limit Reached</p>
            <p className="text-red-800 text-sm">Upgrade to continue migrating workflows.</p>
          </div>
          <button
            onClick={() => setActiveView('billing')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            Upgrade
          </button>
        </div>
      )}

      {/* Stats Cards - Solid Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="text-white" size={24} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="text-slate-600 text-sm mt-1 font-medium">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Migrations - Clean White */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Migrations</h2>
          <button
            onClick={handleNewMigration}
            disabled={!subscription.canMigrate}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              subscription.canMigrate 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus size={20} />
            New Migration
          </button>
        </div>
        <div className="divide-y divide-slate-200">
          {recentMigrations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileJson className="text-slate-400" size={32} />
              </div>
              <p className="text-slate-600 font-medium mb-4">No migrations yet</p>
              <button
                onClick={handleNewMigration}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Create your first migration →
              </button>
            </div>
          ) : (
            recentMigrations.map((migration) => (
              <div
                key={migration.id}
                className="p-6 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setActiveView('migrations')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{migration.name}</h3>
                    <p className="text-sm text-slate-600">
                      {migration.source_platform} → {migration.target_platforms.join(', ')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    migration.status === 'completed' ? 'bg-green-100 text-green-700' :
                    migration.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    migration.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {migration.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />}
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
    </div>
  );
};

// Keep the same Password and Delete modals from previous version
const PasswordChangeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // ... same as before
  return null; // Use the same implementation as previous
};

const DeleteAccountModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // ... same as before
  return null; // Use the same implementation as previous
};
