// src/components/BackendCode.tsx
import React, { useState, useRef } from 'react';
import { Upload, Download, Play, Code, Copy, Check, Loader, FileJson, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadWorkflow, exportToPython } from '../lib/workflowApi';
import { useAuth } from '../contexts/AuthContext';

export const BackendCode: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedPlatform, setSelectedPlatform] = useState<'zapier' | 'n8n' | 'make'>('n8n');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [workflowId, setWorkflowId] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const platforms = [
    { id: 'zapier', name: 'Zapier', color: 'bg-orange-500', icon: 'Z' },
    { id: 'n8n', name: 'n8n', color: 'bg-pink-500', icon: 'n' },
    { id: 'make', name: 'Make', color: 'bg-purple-500', icon: 'M' }
  ];

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setUploadedFile(file);
    setError('');
    handleUpload(file);
  };

  // Upload workflow
  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError('');
      
      console.log('📤 Uploading workflow...');
      const result = await uploadWorkflow(file);
      
      console.log('✅ Upload successful:', result);
      setWorkflowId(result.workflow_id);
      
      // Auto-generate Python code
      await handleGeneratePython(result.workflow_id, file.name);
      
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      setError(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Generate Python code
  const handleGeneratePython = async (id: string, filename: string) => {
    try {
      setIsGenerating(true);
      
      // Fetch Python code from backend
      const response = await fetch(`http://localhost:8000/api/workflows/${id}/export/python`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to generate Python code');
      
      const pythonCode = await response.text();
      setGeneratedCode(pythonCode);
      
      console.log('✅ Python code generated');
      
    } catch (error: any) {
      console.error('❌ Generation error:', error);
      setError(error.message || 'Failed to generate Python code');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Python file
  const handleDownloadPython = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/x-python' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow_${uploadedFile?.name.replace('.json', '')}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedCode) return;
    
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Code size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Python Code Generator</h1>
            <p className="text-white/80 mt-1">Convert workflow JSON to executable Python automation</p>
          </div>
        </div>
      </motion.div>

      {/* Platform Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Source Platform</h3>
        <div className="grid grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id as any)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPlatform === platform.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-2`}>
                {platform.icon}
              </div>
              <p className="text-sm font-semibold text-center">{platform.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Upload size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Upload Workflow JSON</h3>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all"
          >
            <FileJson className="mx-auto mb-4 text-slate-400" size={48} />
            <p className="text-slate-700 font-semibold mb-2">
              {uploadedFile ? uploadedFile.name : 'Click to upload or drag & drop'}
            </p>
            <p className="text-sm text-slate-500">
              Supports: {selectedPlatform} workflow JSON
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {isUploading && (
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <Loader className="animate-spin" size={20} />
              <span>Uploading...</span>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal size={20} className="text-green-600" />
              <h3 className="text-lg font-bold text-slate-900">Python Code</h3>
            </div>
            
            {generatedCode && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownloadPython}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            )}
          </div>

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-slate-600">Generating Python code...</p>
            </div>
          ) : generatedCode ? (
            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto max-h-96 overflow-y-auto">
              <pre className="text-sm text-green-400 font-mono">
                <code>{generatedCode}</code>
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Play size={48} className="mb-4" />
              <p>Upload JSON to generate code</p>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      {generatedCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6"
        >
          <h3 className="font-bold text-slate-900 mb-4">✨ Generated Features:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4">
              <p className="text-2xl mb-1">🔄</p>
              <p className="text-sm font-semibold text-slate-700">Async Execution</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-2xl mb-1">🌐</p>
              <p className="text-sm font-semibold text-slate-700">API Integration</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-2xl mb-1">📊</p>
              <p className="text-sm font-semibold text-slate-700">Error Handling</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-2xl mb-1">⚡</p>
              <p className="text-sm font-semibold text-slate-700">Production Ready</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
