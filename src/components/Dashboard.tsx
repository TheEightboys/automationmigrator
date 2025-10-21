import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Bot, FileJson, TrendingUp, AlertCircle } from 'lucide-react';
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
        alert(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated successfully!`);
      } else {
        alert('Failed to activate subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error activating subscription:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setActivating(false);
    }
  };

  const handleNewMigration = () => {
    if (!subscription.canMigrate) {
      alert(`You've reached your limit (${subscription.migrationsUsed}/${subscription.migrationsLimit}). Please upgrade!`);
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

  const statCards = [
    { label: 'Total Migrations', value: stats.totalMigrations, icon: RefreshCw, color: 'bg-blue-500' },
    { label: 'Completed', value: stats.completedMigrations, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Active', value: stats.activeMigrations, icon: FileJson, color: 'bg-yellow-500' },
    { label: 'Agents', value: stats.totalAgents, icon: Bot, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      {/* Subscription Usage Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-100">Current Plan</p>
            <p className="text-3xl font-black capitalize">{subscription.plan}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Migrations Used</p>
            <p className="text-3xl font-black">
              {subscription.migrationsLimit === -1 
                ? `${subscription.migrationsUsed} / ∞`
                : `${subscription.migrationsUsed} / ${subscription.migrationsLimit}`
              }
            </p>
          </div>
        </div>
        {subscription.periodEnd && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-blue-100">
              Renews: {subscription.periodEnd.toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </p>
          </div>
        )}
      </div>

      {/* Manual Activation Buttons */}
      {subscription.plan === 'free' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Activate Subscription
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            After completing payment on Dodo, click the button below to activate your subscription.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => activateSubscription('basic')}
              disabled={activating}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {activating ? 'Activating...' : '✓ Activate Basic Plan'}
            </button>
            
            <button
              onClick={() => activateSubscription('pro')}
              disabled={activating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {activating ? 'Activating...' : '✓ Activate Pro Plan'}
            </button>
          </div>
        </div>
      )}

      {/* Warning Banner */}
      {!subscription.canMigrate && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div className="flex-1">
            <p className="font-bold text-red-900">Migration Limit Reached</p>
            <p className="text-red-800 text-sm">Upgrade to continue migrating workflows.</p>
          </div>
          <button
            onClick={() => setActiveView('billing')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700"
          >
            Upgrade
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back to migromat</p>
        </div>
        <button
          onClick={handleNewMigration}
          disabled={!subscription.canMigrate}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold ${
            subscription.canMigrate
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus size={20} />
          New Migration
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="text-slate-600 text-sm mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Migrations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Recent Migrations</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {recentMigrations.length === 0 ? (
            <div className="p-8 text-center">
              <FileJson className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-600 mb-4">No migrations yet</p>
              <button
                onClick={handleNewMigration}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first migration
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
                    <h3 className="font-semibold text-slate-900">{migration.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {migration.source_platform} → {migration.target_platforms.join(', ')}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      migration.status === 'completed' ? 'bg-green-100 text-green-700' :
                      migration.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      migration.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {migration.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
