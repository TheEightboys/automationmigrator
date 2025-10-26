// src/components/MigrationWizard.tsx
import React, { useState, useRef } from 'react';
import { X, Upload, ArrowRight, CheckCircle, FileJson, AlertCircle, Download, Play, Loader, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { uploadWorkflow, executeWorkflow, pollExecutionStatus, downloadConvertedWorkflow } from '../lib/workflowApi';
import type { WorkflowUploadResponse, ExecutionStatus } from '../lib/workflowApi';

interface MigrationWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

export const MigrationWizard: React.FC<MigrationWizardProps> = ({ onClose, onComplete }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<WorkflowUploadResponse | null>(null);
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');
  const [migrationName, setMigrationName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setSelectedFile(file);
    setMigrationName(file.name.replace('.json', ''));
    setError('');
  };

  const handleUploadAndExecute = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      console.log('📤 Uploading workflow to FastAPI backend...');
      
      const result = await uploadWorkflow(selectedFile);
      
      console.log('✅ Upload successful:', result);
      setUploadResult(result);
      
      setStep(2);
      
      await handleExecuteWorkflow(result.workflow_id);
      
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      setError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      setIsExecuting(true);
      console.log('🚀 Starting workflow execution...');
      
      const execResult = await executeWorkflow(workflowId);
      console.log('⏳ Execution started:', execResult.execution_id);
      
      const finalStatus = await pollExecutionStatus(
        execResult.execution_id,
        (status) => {
          console.log('📊 Status update:', status.status);
          setExecutionStatus(status);
        }
      );
      
      console.log('✅ Execution completed!');
      
      await saveMigrationToSupabase(finalStatus);
      
      setStep(3);
      
    } catch (error: any) {
      console.error('❌ Execution error:', error);
      setError(error.message || 'Execution failed');
      setStep(3);
    } finally {
      setIsExecuting(false);
    }
  };

  const saveMigrationToSupabase = async (status: ExecutionStatus) => {
    if (!user || !uploadResult) return;

    try {
      const { error } = await supabase.from('migrations').insert({
        user_id: user.id,
        name: migrationName || uploadResult.name,
        source_platform: uploadResult.platform,
        target_platforms: ['zapier', 'make', 'n8n'],
        status: status.status === 'completed' ? 'completed' : 'failed',
        workflow_data: {
          workflow_id: uploadResult.workflow_id,
          execution_id: status.id,
          steps_count: uploadResult.steps_count,
          complexity: uploadResult.complexity
        },
        result: status.result,
        logs: status.logs
      });

      if (error) throw error;
      console.log('✅ Migration saved to database');
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">New Migration</h2>
              <p className="text-sm text-slate-600 mt-1">Upload and execute your workflow</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between max-w-xl mx-auto">
              {[
                { num: 1, label: 'Upload' },
                { num: 2, label: 'Execute' },
                { num: 3, label: 'Complete' }
              ].map((s, i) => (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        step >= s.num
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {step > s.num ? <CheckCircle size={20} /> : s.num}
                    </div>
                    <span className="text-xs mt-2 font-medium">{s.label}</span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > s.num ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Migration Name
                  </label>
                  <input
                    type="text"
                    value={migrationName}
                    onChange={(e) => setMigrationName(e.target.value)}
                    placeholder="My Workflow Migration"
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload Workflow File
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <Upload className="mx-auto mb-4 text-slate-400" size={48} />
                    <p className="text-slate-700 font-semibold mb-2">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-sm text-slate-500">
                      Supports: n8n, Zapier, Make JSON files
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleUploadAndExecute}
                  disabled={!selectedFile || uploading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Upload & Execute
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {uploadResult && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Workflow Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Name:</span>
                        <span className="ml-2 font-semibold">{uploadResult.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Platform:</span>
                        <span className="ml-2 font-semibold">{uploadResult.platform}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Steps:</span>
                        <span className="ml-2 font-semibold">{uploadResult.steps_count}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Complexity:</span>
                        <span className="ml-2 font-semibold">
                          {/* FIX: Handle complexity as string or object */}
                          {typeof uploadResult.complexity === 'string' 
                            ? uploadResult.complexity 
                            : uploadResult.complexity?.level || 'unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {executionStatus && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">Execution Status:</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          executionStatus.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : executionStatus.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {isExecuting ? 'Running...' : executionStatus.status}
                      </span>
                    </div>

                    <div className="bg-slate-900 text-green-400 rounded-xl p-4 font-mono text-xs max-h-64 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal size={16} />
                        <span className="font-semibold">Execution Logs</span>
                      </div>
                      {/* FIX: Safe log access with null checks */}
                      {executionStatus.logs && executionStatus.logs.length > 0 ? (
                        executionStatus.logs.map((log, i) => {
                          if (!log) return null;
                          return (
                            <div key={i} className="mb-1">
                              <span className="text-slate-500">
                                [{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}]
                              </span>{' '}
                              <span className={
                                log.level === 'error' ? 'text-red-400' :
                                log.level === 'success' ? 'text-green-400' :
                                'text-blue-400'
                              }>
                                {log.message || 'No message'}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-500">No logs available</div>
                      )}
                      {isExecuting && (
                        <div className="flex items-center gap-2 text-blue-400 animate-pulse mt-2">
                          <Loader className="animate-spin" size={14} />
                          Executing workflow...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Migration Complete!</h3>
                  <p className="text-slate-600">Your workflow is ready to download</p>
                </div>

                {executionStatus?.duration && (
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600">
                      Processed in <span className="font-bold">{executionStatus.duration.toFixed(2)}s</span>
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-center">Choose Your Platform:</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={async () => {
                        try {
                          if (!uploadResult) return;
                          await downloadConvertedWorkflow(uploadResult.workflow_id, 'zapier', migrationName);
                        } catch (error) {
                          alert('Download failed. Please try again.');
                        }
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <FileJson size={24} />
                      <span>Zapier</span>
                      <span className="text-xs opacity-90">.json</span>
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          if (!uploadResult) return;
                          await downloadConvertedWorkflow(uploadResult.workflow_id, 'make', migrationName);
                        } catch (error) {
                          alert('Download failed. Please try again.');
                        }
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <FileJson size={24} />
                      <span>Make</span>
                      <span className="text-xs opacity-90">.json</span>
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          if (!uploadResult) return;
                          await downloadConvertedWorkflow(uploadResult.workflow_id, 'n8n', migrationName);
                        } catch (error) {
                          alert('Download failed. Please try again.');
                        }
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <FileJson size={24} />
                      <span>n8n</span>
                      <span className="text-xs opacity-90">.json</span>
                    </button>

                    <button
                      onClick={() => {
                        alert('Python export available in Agents section (sidebar)');
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-slate-500 to-slate-600 text-white rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Download size={24} />
                      <span>Python</span>
                      <span className="text-xs opacity-90">See Agents →</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleComplete}
                  className="w-full px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
