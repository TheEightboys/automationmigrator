import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Bot, FileJson, TrendingUp,AlertCircle } from 'lucide-react';
import { supabase, Migration } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
interface DashboardProps {
  setActiveView: (view: string) => void;
  setShowWizard: (show: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveView, setShowWizard }) => {
  const { user } = useAuth();
   const { subscription } = useSubscription(); 
  const [stats, setStats] = useState({
    totalMigrations: 0,
    completedMigrations: 0,
    activeMigrations: 0,
    totalAgents: 0,
  });
  const [recentMigrations, setRecentMigrations] = useState<Migration[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);
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
    {
      label: 'Total Migrations',
      value: stats.totalMigrations,
      icon: RefreshCw,
      color: 'bg-blue-500',
    },
    {
      label: 'Completed',
      value: stats.completedMigrations,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Active',
      value: stats.activeMigrations,
      icon: FileJson,
      color: 'bg-yellow-500',
    },
    {
      label: 'Agents',
      value: stats.totalAgents,
      icon: Bot,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back to FlowMigrate</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus size={20} />
          New Migration
        </button>
      </div>
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
      </div>
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
                onClick={() => setShowWizard(true)}
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
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        migration.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : migration.status === 'processing'
                          ? 'bg-blue-100 text-blue-700'
                          : migration.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {migration.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
