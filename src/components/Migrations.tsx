import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, Play, Trash2, FileJson, AlertCircle, CheckCircle, XCircle, RefreshCw, Calendar, Activity } from 'lucide-react';
import { supabase, Migration } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { convertWorkflow } from '../lib/conversionEngine';

export const Migrations: React.FC = () => {
  const { user } = useAuth();
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMigrations();
    }
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
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString() 
        })
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
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString() 
        })
        .eq('id', migration.id);
      await loadMigrations();
    } finally {
      setProcessing(null);
    }
  };

  const downloadWorkflow = (workflow: any, platform: string, name: string) => {
    const preparedWorkflow = platform.toLowerCase() === 'zapier' 
      ? {
          title: name,
          steps: workflow.steps || [],
          trigger: workflow.trigger || {},
        }
      : platform.toLowerCase() === 'n8n'
      ? {
          name: name,
          nodes: workflow.nodes || [],
          connections: workflow.connections || {},
          settings: { executionOrder: 'v1' }
        }
      : {
          name: name,
          flow: workflow.flow || [],
          metadata: { version: 1 }
        };
    
    const blob = new Blob([JSON.stringify(preparedWorkflow, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${platform}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllWorkflows = (migration: Migration) => {
    if (!migration.converted_workflows) return;
    Object.entries(migration.converted_workflows).forEach(([platform, workflow], index) => {
      setTimeout(() => {
        downloadWorkflow(workflow, platform, migration.name);
      }, index * 200);
    });
  };

  const deleteMigration = async (id: string) => {
    if (!confirm('Delete this migration?')) return;

    try {
      const { error } = await supabase.from('migrations').delete().eq('id', id);
      if (error) throw error;
      await loadMigrations();
      if (selectedMigration?.id === id) setSelectedMigration(null);
    } catch (error) {
      console.error('Error deleting migration:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'processing':
        return <RefreshCw className="text-blue-500 animate-spin" size={18} />;
      case 'failed':
        return <XCircle className="text-red-500" size={18} />;
      default:
        return <AlertCircle className="text-amber-500" size={18} />;
    }
  };

  const platformColors: Record<string, string> = {
    'zapier': 'bg-orange-500',
    'n8n': 'bg-pink-500',
    'make': 'bg-purple-500'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <RefreshCw className="mx-auto text-blue-600 animate-spin mb-4" size={48} />
          <p className="text-slate-600 text-lg font-medium">Loading migrations...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <Activity className="text-blue-600" size={32} />
                Migrations
              </h1>
              <p className="text-slate-600">
                Manage and track your workflow conversions
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileJson className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{migrations.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {migrations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center"
        >
          <FileJson className="mx-auto text-slate-300 mb-6" size={80} />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            No migrations yet
          </h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Create your first migration to convert workflows between platforms
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Migrations List */}
          <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            <AnimatePresence>
              {migrations.map((migration, index) => (
                <motion.div
                  key={migration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                  className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all ${
                    selectedMigration?.id === migration.id
                      ? 'border-blue-500 shadow-lg'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedMigration(migration)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg mb-2 truncate">
                        {migration.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`${platformColors[migration.source_platform]} text-white px-3 py-1 rounded-md text-xs font-semibold uppercase`}>
                          {migration.source_platform}
                        </span>
                        <span className="text-slate-400">→</span>
                        {migration.target_platforms.map((platform) => (
                          <span key={platform} className={`${platformColors[platform]} text-white px-3 py-1 rounded-md text-xs font-semibold uppercase`}>
                            {platform}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} />
                        {new Date(migration.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    {getStatusIcon(migration.status)}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    {migration.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          processMigration(migration);
                        }}
                        disabled={processing === migration.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {processing === migration.id ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Play size={14} />
                            Process
                          </>
                        )}
                      </motion.button>
                    )}
                    
                    {migration.status === 'completed' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAllWorkflows(migration);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        <Download size={14} />
                        Download
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMigration(migration.id);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg font-medium hover:bg-red-100 transition-colors ml-auto"
                    >
                      <Trash2 size={14} />
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Details Panel */}
          <motion.div
            key={selectedMigration?.id || 'empty'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-8 max-h-[calc(100vh-250px)] overflow-y-auto"
          >
            {selectedMigration ? (
              <div>
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                  {getStatusIcon(selectedMigration.status)}
                  <h2 className="text-xl font-bold text-slate-900">
                    Details
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">{selectedMigration.name}</p>
                  </div>

                  {/* Source & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Source</label>
                      <div className={`${platformColors[selectedMigration.source_platform]} text-white px-3 py-2 rounded-lg text-center font-semibold mt-2 uppercase text-sm`}>
                        {selectedMigration.source_platform}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                      <p className={`font-semibold mt-2 capitalize ${
                        selectedMigration.status === 'completed' ? 'text-green-600' :
                        selectedMigration.status === 'processing' ? 'text-blue-600' :
                        selectedMigration.status === 'failed' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                        {selectedMigration.status}
                      </p>
                    </div>
                  </div>

                  {/* Targets */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                      Target Platforms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedMigration.target_platforms.map((platform) => (
                        <span key={platform} className={`${platformColors[platform]} text-white px-3 py-1.5 rounded-lg font-semibold text-sm uppercase`}>
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Validation Report */}
                  {selectedMigration.status === 'completed' && selectedMigration.validation_report && (
                    <div className="pt-6 border-t border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-500" />
                        Validation Report
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(selectedMigration.validation_report).map(
                          ([platform, report]: [string, any]) => (
                            <div key={platform} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className={`${platformColors[platform]} text-white px-3 py-1 rounded-lg font-semibold text-xs uppercase`}>
                                  {platform}
                                </span>
                                {report.success ? (
                                  <CheckCircle className="text-green-500" size={18} />
                                ) : (
                                  <AlertCircle className="text-amber-500" size={18} />
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                  <p className="text-xs text-slate-600 font-medium">Mapped</p>
                                  <p className="text-xl font-bold text-green-600">{report.mappedSteps}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                  <p className="text-xs text-slate-600 font-medium">Unmapped</p>
                                  <p className="text-xl font-bold text-red-600">{report.unmappedSteps}</p>
                                </div>
                              </div>

                              {report.warnings && report.warnings.length > 0 && (
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                  <p className="text-xs font-semibold text-amber-900 mb-2">
                                    ⚠ {report.warnings.length} Warning{report.warnings.length > 1 ? 's' : ''}
                                  </p>
                                  <ul className="text-xs text-amber-800 space-y-1 max-h-32 overflow-y-auto">
                                    {report.warnings.map((warning: string, i: number) => (
                                      <li key={i}>• {warning}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Downloads */}
                  {selectedMigration.status === 'completed' && selectedMigration.converted_workflows && (
                    <div className="pt-6 border-t border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Download size={20} className="text-blue-500" />
                        Download Files
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(selectedMigration.converted_workflows).map(([platform, workflow]) => (
                          <motion.button
                            key={platform}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => downloadWorkflow(workflow, platform, selectedMigration.name)}
                            className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 group"
                          >
                            <div className="flex items-center gap-3">
                              <FileJson className="text-blue-600" size={20} />
                              <div className="text-left">
                                <p className="font-semibold text-slate-900 uppercase text-sm">{platform}</p>
                                <p className="text-xs text-slate-600">JSON format</p>
                              </div>
                            </div>
                            <Download className="text-blue-600 group-hover:translate-y-0.5 transition-transform" size={18} />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Failed */}
                  {selectedMigration.status === 'failed' && (
                    <div className="pt-6 border-t border-slate-200">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <p className="font-semibold text-red-900 mb-1">Conversion Failed</p>
                            <p className="text-sm text-red-700">
                              Please try again or contact support.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="pt-6 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-xs font-semibold text-slate-500">Created</label>
                        <p className="text-slate-900 mt-1">
                          {new Date(selectedMigration.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedMigration.updated_at && (
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Updated</label>
                          <p className="text-slate-900 mt-1">
                            {new Date(selectedMigration.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <Eye size={64} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-semibold text-slate-400">Select a migration</p>
                  <p className="text-sm text-slate-500 mt-1">View details and download files</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
