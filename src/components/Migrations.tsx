// src/components/Migrations.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Play, Trash2, FileJson, AlertCircle, CheckCircle, 
  XCircle, RefreshCw, Calendar, Search, Plus, ArrowRight, 
  MoreVertical, Copy, Clock
} from 'lucide-react';
import { supabase, Migration } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { convertWorkflow } from '../lib/conversionEngine';

interface MigrationsProps {
  setShowWizard: (show: boolean) => void;
}

export const Migrations: React.FC<MigrationsProps> = ({ setShowWizard }) => {
  const { user } = useAuth();
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadMigrations();
  }, [user]);

  const loadMigrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('migrations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMigrations(data || []);
      
      if (selectedMigration) {
        const updated = data?.find(m => m.id === selectedMigration.id);
        if (updated) setSelectedMigration(updated);
      }
    } catch (error) {
      console.error('Error loading migrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMigration = async (migration: Migration) => {
    setProcessing(migration.id);
    
    try {
      await supabase
        .from('migrations')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', migration.id);

      const convertedWorkflows: Record<string, any> = {};
      const validationReport: Record<string, any> = {};

      for (const targetPlatform of migration.target_platforms) {
        const result = convertWorkflow(
          migration.source_json,
          migration.source_platform as any,
          targetPlatform as any
        );
        convertedWorkflows[targetPlatform] = result.workflow;
        validationReport[targetPlatform] = result.validation;
      }

      const { error } = await supabase
        .from('migrations')
        .update({
          status: 'completed',
          converted_workflows: convertedWorkflows,
          validation_report: validationReport,
          updated_at: new Date().toISOString(),
        })
        .eq('id', migration.id);

      if (error) throw error;
      await loadMigrations();
    } catch (error) {
      console.error('Error processing migration:', error);
      await supabase
        .from('migrations')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', migration.id);
      await loadMigrations();
    } finally {
      setProcessing(null);
    }
  };

  const downloadWorkflow = (workflow: any, platform: string, name: string) => {
    const preparedWorkflow = platform.toLowerCase() === 'zapier' 
      ? { title: name, steps: workflow.steps || [], trigger: workflow.trigger || {} }
      : platform.toLowerCase() === 'n8n'
      ? { name, nodes: workflow.nodes || [], connections: workflow.connections || {}, settings: { executionOrder: 'v1' } }
      : { name, flow: workflow.flow || [], metadata: { version: 1 } };
    
    const blob = new Blob([JSON.stringify(preparedWorkflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${platform}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteMigration = async (id: string) => {
    if (!confirm('Delete this migration?')) return;
    try {
      const { error } = await supabase.from('migrations').delete().eq('id', id);
      if (error) throw error;
      await loadMigrations();
      if (selectedMigration?.id === id) setSelectedMigration(null);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const filteredMigrations = migrations.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const platformColors: Record<string, string> = {
    'zapier': 'bg-orange-500',
    'n8n': 'bg-pink-500',
    'make': 'bg-purple-500'
  };

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
      processing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: RefreshCw },
      failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock }
    }[status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: AlertCircle };

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
        <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto text-blue-600 animate-spin mb-4" size={48} />
          <p className="text-slate-600 font-medium">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Migration History</h1>
              <p className="text-slate-600 text-sm mt-1">{migrations.length} total migrations</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                New Migration
              </motion.button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search migrations..."
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredMigrations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <FileJson className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No migrations found</h3>
            <p className="text-slate-600 mb-6">{searchQuery ? 'Try a different search term' : 'Create your first migration'}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWizard(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Migration
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMigrations.map((migration) => (
              <motion.div
                key={migration.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{migration.name}</h3>
                      {getStatusBadge(migration.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`${platformColors[migration.source_platform]} text-white px-2 py-0.5 rounded text-xs font-semibold uppercase`}>
                        {migration.source_platform}
                      </span>
                      <ArrowRight size={14} className="text-slate-400" />
                      {migration.target_platforms.map((p) => (
                        <span key={p} className={`${platformColors[p]} text-white px-2 py-0.5 rounded text-xs font-semibold uppercase`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {migration.status === 'pending' && (
                      <button
                        onClick={() => processMigration(migration)}
                        disabled={processing === migration.id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {processing === migration.id ? 'Processing...' : 'Process'}
                      </button>
                    )}
                    {migration.status === 'completed' && migration.converted_workflows && (
                      <button
                        onClick={() => Object.entries(migration.converted_workflows!).forEach(([p, w]) => downloadWorkflow(w, p, migration.name))}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Download
                      </button>
                    )}
                    <button
                      onClick={() => deleteMigration(migration.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
