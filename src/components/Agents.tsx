// src/components/Agents.tsx - TERMINAL EDITION
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Upload, Download, Copy, CheckCircle, AlertCircle, FileJson, Play, Loader, Terminal, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { uploadWorkflow } from '../lib/workflowApi';
import { InteractiveTerminal } from './InteractiveTerminal';
export const Agents: React.FC = () => {
  const [workflowFile, setWorkflowFile] = useState<File | null>(null);
  const [pythonCode, setPythonCode] = useState<string>('');
  const [executionOutput, setExecutionOutput] = useState<string>('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [workflowId, setWorkflowId] = useState('');
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const terminalRef = useRef<HTMLDivElement>(null);
const [showTerminal, setShowTerminal] = useState(false);
const [terminalSessionId] = useState(() => Math.random().toString(36).substring(7));

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [executionOutput]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setWorkflowFile(file);
    setPythonCode('');
    setExecutionOutput('');
    setExecutionStatus('idle');
    setLoading(true);

    try {
      console.log('📤 Uploading workflow...');
      
      const uploadResult = await uploadWorkflow(file);
      console.log('✅ Upload successful:', uploadResult);
      
      setWorkflowId(uploadResult.workflow_id);
      
      console.log('🐍 Fetching Python code...');
      const response = await fetch(`http://localhost:8000/api/workflows/${uploadResult.workflow_id}/export/python`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to generate Python code');
      
      const pythonScript = await response.text();
      console.log('✅ Python code received:', pythonScript.length, 'bytes');
      
      setPythonCode(pythonScript);
      
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to generate Python code');
      setWorkflowFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!workflowId) return;
    
    setExecuting(true);
    setExecutionStatus('running');
    setExecutionOutput('╔═══════════════════════════════════════════════════════════╗\n');
    setExecutionOutput(prev => prev + '║          🚀 PYTHON WORKFLOW EXECUTOR v2.0                 ║\n');
    setExecutionOutput(prev => prev + '╚═══════════════════════════════════════════════════════════╝\n\n');
    setExecutionOutput(prev => prev + '⏳ Initializing execution environment...\n');
    setExecutionOutput(prev => prev + '📦 Loading dependencies...\n');
    setExecutionOutput(prev => prev + '🔧 Preparing workflow engine...\n\n');
    
    try {
      const response = await fetch(`http://localhost:8000/api/workflows/${workflowId}/execute/python`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Execution failed');
      
      const result = await response.json();
      
      setExecutionOutput(prev => prev + result.output || 'No output');
      setExecutionStatus(result.success ? 'success' : 'failed');
      
    } catch (err: any) {
      const errorMsg = `\n╔═══════════════════════════════════════════════════════════╗\n`;
      const errorMsg2 = `║                    ❌ EXECUTION ERROR                      ║\n`;
      const errorMsg3 = `╚═══════════════════════════════════════════════════════════╝\n\n`;
      setExecutionOutput(prev => prev + errorMsg + errorMsg2 + errorMsg3 + `Error: ${err.message}\n`);
      setExecutionStatus('failed');
    } finally {
      setExecuting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pythonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow_${workflowFile?.name.replace('.json', '')}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearTerminal = () => {
    setExecutionOutput('');
    setExecutionStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Terminal size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Python Terminal Executor</h1>
              <p className="text-white/90 mt-1">
                Generate & execute workflow automation in real-time
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Upload & Code */}
          <div className="space-y-6">
            {/* Upload */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                <Upload size={24} className="text-blue-600" />
                Upload Workflow
              </h2>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-all hover:bg-blue-50">
                <FileJson className="mx-auto text-slate-400 mb-4" size={48} />
                <label className="inline-block cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    disabled={loading}
                    className="hidden"
                  />
                  <span className={`px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-all ${
                    loading ? 'bg-slate-300 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}>
                    {loading ? <><Loader className="animate-spin" size={18} />Processing...</> : 'Select JSON File'}
                  </span>
                </label>
                <p className="text-sm text-slate-500 mt-3">Supports n8n, Zapier & Make workflows</p>
              </div>

              {workflowFile && !loading && pythonCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl"
                >
                  <CheckCircle className="text-green-500 inline mr-2" size={20} />
                  <span className="font-semibold text-green-900">{workflowFile.name}</span>
                  <p className="text-sm text-green-700 mt-2">✓ Code generated successfully</p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                >
                  <AlertCircle className="text-red-500 inline mr-2" size={20} />
                  <span className="text-red-700 font-medium">{error}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Code Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                  <Code size={24} className="text-green-600" />
                  Generated Code
                </h2>
                {pythonCode && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-semibold flex items-center gap-2 transition-all"
                    >
                      {copied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
  onClick={() => setShowTerminal(true)}
  className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 transition-all"
>
  <Terminal size={20} />
  <span className="font-semibold">Open Terminal</span>
</button>
                    <button
                      onClick={handleDownload}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold flex items-center gap-2 transition-all shadow-md"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                )}
              </div>

              {pythonCode ? (
                <div className="relative">
                  <pre className="bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto shadow-inner">
                    <code>{pythonCode}</code>
                  </pre>
                  <div className="absolute top-2 right-2 bg-slate-800 px-2 py-1 rounded text-xs text-slate-400">
                    Python
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <div className="text-center text-slate-400">
                    <Code size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Upload JSON to generate code</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Panel - Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 rounded-2xl p-6 shadow-2xl border-4 border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Terminal size={20} className="text-green-400" />
                  Terminal
                </h2>
              </div>
              <div className="flex gap-2">
                {pythonCode && (
                  <button
                    onClick={handleExecute}
                    disabled={executing}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                      executing
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                    }`}
                  >
                    {executing ? (
                      <><Loader className="animate-spin" size={16} />Running...</>
                    ) : (
                      <><Play size={16} />Execute</>
                    )}
                  </button>
                )}
                {executionOutput && (
                  <button
                    onClick={clearTerminal}
                    className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Status Bar */}
            {executionStatus !== 'idle' && (
              <div className={`mb-3 p-2 rounded-lg border-2 flex items-center gap-2 text-sm ${
                executionStatus === 'running' ? 'bg-blue-900/30 border-blue-500 text-blue-300' :
                executionStatus === 'success' ? 'bg-green-900/30 border-green-500 text-green-300' :
                'bg-red-900/30 border-red-500 text-red-300'
              }`}>
                {executionStatus === 'running' && <Loader className="animate-spin" size={16} />}
                {executionStatus === 'success' && <CheckCircle2 size={16} />}
                {executionStatus === 'failed' && <XCircle size={16} />}
                <span className="font-semibold">
                  {executionStatus === 'running' && 'Executing workflow...'}
                  {executionStatus === 'success' && 'Execution completed successfully'}
                  {executionStatus === 'failed' && 'Execution failed'}
                </span>
              </div>
            )}

            {/* Terminal Output */}
            <div 
              ref={terminalRef}
              className="bg-black/50 rounded-xl p-4 font-mono text-sm h-[600px] overflow-y-auto border-2 border-slate-700 shadow-inner"
            >
              {executionOutput ? (
                <pre className="text-green-400 whitespace-pre-wrap">{executionOutput}</pre>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600">
                  <div className="text-center">
                    <Terminal size={64} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Ready to execute</p>
                    <p className="text-sm mt-2">Upload a workflow and click Execute</p>
                  </div>
                </div>
              )}
              {executing && (
                <div className="flex items-center gap-2 text-yellow-400 animate-pulse mt-2">
                  <Loader className="animate-spin" size={16} />
                  <span>Processing...</span>
                </div>
              )}
            </div>

            {/* Terminal Info */}
            <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">
                <strong className="text-slate-300">💡 Tip:</strong> Execution runs in backend Python environment. Install dependencies with: <code className="bg-slate-900 px-2 py-1 rounded text-green-400">pip install httpx python-dotenv</code>
              </p>
            </div>
          </motion.div>
        </div>
        {showTerminal && (
  <InteractiveTerminal
    sessionId={terminalSessionId}
    onClose={() => setShowTerminal(false)}
  />
)}
      </div>
    </div>
    
  );
};
