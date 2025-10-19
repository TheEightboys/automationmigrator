import React, { useState, useEffect } from 'react';
import { Download, Eye, Play, Trash2, FileJson, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
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
      
      // Update selected migration if it exists
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
      // Update status to processing
      await supabase
        .from('migrations')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString() 
        })
        .eq('id', migration.id);

      const convertedWorkflows: Record<string, any> = {};
      const validationReport: Record<string, any> = {};

      // Convert to each target platform
      for (const targetPlatform of migration.target_platforms) {
        const result = convertWorkflow(
          migration.source_json,
          migration.source_platform as any,
          targetPlatform as any
        );
        convertedWorkflows[targetPlatform] = result.workflow;
        validationReport[targetPlatform] = result.validation;
      }

      // Update with results
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
      
      // Mark as failed
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
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
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
    
    Object.entries(migration.converted_workflows).forEach(([platform, workflow]) => {
      setTimeout(() => {
        downloadWorkflow(workflow, platform, migration.name);
      }, 100);
    });
  };

  const deleteMigration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this migration? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('migrations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await loadMigrations();
      
      if (selectedMigration?.id === id) {
        setSelectedMigration(null);
      }
    } catch (error) {
      console.error('Error deleting migration:', error);
      alert('Failed to delete migration');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'processing':
        return <RefreshCw className="text-blue-500 animate-spin" size={20} />;
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <AlertCircle className="text-yellow-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="mx-auto text-blue-500 animate-spin mb-4" size={48} />
          <p className="text-slate-600">Loading migrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Migrations</h1>
        <p className="text-slate-600 mt-1">
          Manage and track your workflow conversions across platforms
        </p>
      </div>

      {migrations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FileJson className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No migrations yet
          </h3>
          <p className="text-slate-600">
            Create your first migration to convert workflows between platforms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Migrations List */}
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {migrations.map((migration) => (
              <div
                key={migration.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all ${
                  selectedMigration?.id === migration.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedMigration(migration)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-lg truncate">
                      {migration.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      <span className="font-medium capitalize">
                        {migration.source_platform}
                      </span>
                      {' → '}
                      <span className="font-medium capitalize">
                        {migration.target_platforms.join(', ')}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(migration.created_at).toLocaleDateString()} at{' '}
                      {new Date(migration.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(migration.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
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

                <div className="flex items-center gap-2 flex-wrap">
                  {migration.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        processMigration(migration);
                      }}
                      disabled={processing === migration.id}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {processing === migration.id ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          Process
                        </>
                      )}
                    </button>
                  )}
                  
                  {migration.status === 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadAllWorkflows(migration);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Download size={16} />
                      Download All
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMigration(migration.id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Migration Details Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8 max-h-[calc(100vh-200px)] overflow-y-auto">
            {selectedMigration ? (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  {getStatusIcon(selectedMigration.status)}
                  Migration Details
                </h2>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <label className="text-sm font-medium text-slate-700">Name</label>
                    <p className="text-slate-900 mt-1 font-medium">{selectedMigration.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Source Platform</label>
                      <p className="text-slate-900 mt-1 capitalize font-medium">
                        {selectedMigration.source_platform}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Status</label>
                      <p className="text-slate-900 mt-1 capitalize font-medium">
                        {selectedMigration.status}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Target Platforms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedMigration.target_platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm capitalize font-medium"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Validation Report */}
                  {selectedMigration.status === 'completed' && selectedMigration.validation_report && (
                    <>
                      <div className="border-t border-slate-200 pt-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <CheckCircle size={20} className="text-green-500" />
                          Validation Report
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(selectedMigration.validation_report).map(
                            ([platform, report]: [string, any]) => (
                              <div key={platform} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-medium capitalize text-slate-900">
                                    {platform}
                                  </span>
                                  {report.success ? (
                                    <CheckCircle className="text-green-500" size={20} />
                                  ) : (
                                    <AlertCircle className="text-yellow-500" size={20} />
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                  <div className="bg-white p-2 rounded">
                                    <p className="text-slate-600 text-xs">Mapped Steps</p>
                                    <p className="text-green-700 font-bold text-lg">{report.mappedSteps}</p>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <p className="text-slate-600 text-xs">Unmapped Steps</p>
                                    <p className="text-red-700 font-bold text-lg">{report.unmappedSteps}</p>
                                  </div>
                                </div>

                                {report.warnings && report.warnings.length > 0 && (
                                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="font-medium text-yellow-800 text-xs mb-2 flex items-center gap-1">
                                      <AlertCircle size={14} />
                                      Warnings ({report.warnings.length})
                                    </p>
                                    <ul className="text-xs text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                                      {report.warnings.map((warning: string, i: number) => (
                                        <li key={i} className="flex items-start gap-1">
                                          <span className="text-yellow-500 mt-0.5">•</span>
                                          <span>{warning}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Download Section */}
                      <div className="border-t border-slate-200 pt-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <Download size={20} className="text-blue-500" />
                          Download Workflows
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(selectedMigration.converted_workflows || {}).map(
                            ([platform, workflow]) => (
                              <button
                                key={platform}
                                onClick={() =>
                                  downloadWorkflow(
                                    workflow,
                                    platform,
                                    selectedMigration.name
                                  )
                                }
                                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                              >
                                <div className="flex items-center gap-3">
                                  <FileJson className="text-blue-600" size={20} />
                                  <div className="text-left">
                                    <p className="font-medium capitalize text-blue-900">
                                      {platform}
                                    </p>
                                    <p className="text-xs text-blue-600">
                                      Ready to import
                                    </p>
                                  </div>
                                </div>
                                <Download className="text-blue-600 group-hover:scale-110 transition-transform" size={20} />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Failed Status Info */}
                  {selectedMigration.status === 'failed' && (
                    <div className="border-t border-slate-200 pt-6">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <p className="font-medium text-red-900">Conversion Failed</p>
                            <p className="text-sm text-red-700 mt-1">
                              The workflow conversion encountered an error. Please try again or contact support.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="border-t border-slate-200 pt-6 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-600">Created</label>
                        <p className="text-slate-900 mt-1">
                          {new Date(selectedMigration.created_at).toLocaleString()}
                        </p>
                      </div>
                      {selectedMigration.updated_at && (
                        <div>
                          <label className="text-xs font-medium text-slate-600">Last Updated</label>
                          <p className="text-slate-900 mt-1">
                            {new Date(selectedMigration.updated_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] text-slate-400">
                <div className="text-center">
                  <Eye size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a migration</p>
                  <p className="text-sm mt-1">Click on a migration to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
