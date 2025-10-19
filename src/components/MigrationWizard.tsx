import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, FileJson } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MigrationWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

type Platform = 'zapier' | 'n8n' | 'make';

export const MigrationWizard: React.FC<MigrationWizardProps> = ({ onClose, onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState<Platform>('n8n');
  const [targetPlatforms, setTargetPlatforms] = useState<Platform[]>([]);
  const [workflowFile, setWorkflowFile] = useState<File | null>(null);
  const [workflowJson, setWorkflowJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platforms = [
    { 
      id: 'zapier' as Platform, 
      name: 'Zapier', 
      description: 'Popular no-code automation',
      color: 'orange'
    },
    { 
      id: 'n8n' as Platform, 
      name: 'n8n', 
      description: 'Open-source workflow automation',
      color: 'pink'
    },
    { 
      id: 'make' as Platform, 
      name: 'Make', 
      description: 'Visual automation platform',
      color: 'purple'
    },
  ];

  const validateJson = (json: any, platform: Platform): boolean => {
    setError(null);
    
    try {
      // Validate n8n workflow structure
      if (platform === 'n8n') {
        if (!json.nodes || !Array.isArray(json.nodes)) {
          setError('Invalid n8n workflow: Missing or invalid "nodes" array');
          return false;
        }
        if (!json.name || typeof json.name !== 'string') {
          setError('Invalid n8n workflow: Missing workflow "name"');
          return false;
        }
        return true;
      }
      
      // Validate Zapier workflow structure
      if (platform === 'zapier') {
        if (!json.steps || !Array.isArray(json.steps)) {
          setError('Invalid Zapier workflow: Missing or invalid "steps" array');
          return false;
        }
        if (!json.title && !json.name) {
          setError('Invalid Zapier workflow: Missing workflow "title" or "name"');
          return false;
        }
        return true;
      }
      
      // Validate Make workflow structure
      if (platform === 'make') {
        if (!json.flow || !Array.isArray(json.flow)) {
          setError('Invalid Make workflow: Missing or invalid "flow" array');
          return false;
        }
        return true;
      }
      
      return true;
    } catch (err) {
      setError('Failed to validate workflow structure');
      return false;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('Please upload a valid JSON file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setWorkflowFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (validateJson(json, sourcePlatform)) {
          setWorkflowJson(json);
          // Auto-populate name from workflow if empty
          if (!name) {
            const workflowName = json.name || json.title || file.name.replace('.json', '');
            setName(workflowName);
          }
        } else {
          setWorkflowFile(null);
          setWorkflowJson(null);
        }
      } catch (err) {
        setError('Invalid JSON file format');
        setWorkflowFile(null);
        setWorkflowJson(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setWorkflowFile(null);
      setWorkflowJson(null);
    };
    reader.readAsText(file);
  };

  const toggleTargetPlatform = (platform: Platform) => {
    if (platform === sourcePlatform) return;
    
    setTargetPlatforms((prev) =>
      prev.includes(platform) 
        ? prev.filter((p) => p !== platform) 
        : [...prev, platform]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a migration name');
      return;
    }

    if (!workflowJson) {
      setError('Please upload a workflow file');
      return;
    }

    if (targetPlatforms.length === 0) {
      setError('Please select at least one target platform');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('migrations')
        .insert({
          user_id: user!.id,
          name: name.trim(),
          source_platform: sourcePlatform,
          target_platforms: targetPlatforms,
          status: 'pending',
          source_json: workflowJson,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Success - close wizard and refresh migrations list
      onComplete();
      onClose();
    } catch (err: any) {
      console.error('Error creating migration:', err);
      setError(err.message || 'Failed to create migration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToNextStep = () => {
    setError(null);
    if (step === 1 && !name.trim()) {
      setError('Please enter a migration name');
      return;
    }
    if (step === 2 && !workflowJson) {
      setError('Please upload a valid workflow file');
      return;
    }
    setStep(step + 1);
  };

  const goToPreviousStep = () => {
    setError(null);
    setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">New Migration</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 w-12 rounded-full transition-colors ${
                      s <= step ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600 ml-2">
                Step {step} of 3
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Migration Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Customer Onboarding Flow"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  maxLength={100}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Choose a descriptive name for your workflow migration
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Source Platform *
                </label>
                <p className="text-sm text-slate-600 mb-4">
                  Select which platform your workflow is currently in
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => {
                        setSourcePlatform(platform.id);
                        // Reset file if platform changes
                        if (sourcePlatform !== platform.id) {
                          setWorkflowFile(null);
                          setWorkflowJson(null);
                          setError(null);
                        }
                        // Clear target platforms that include new source
                        setTargetPlatforms(prev => prev.filter(p => p !== platform.id));
                      }}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        sourcePlatform === platform.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow'
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{platform.name}</p>
                      <p className="text-xs text-slate-600 mt-1">{platform.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={goToNextStep}
                disabled={!name.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                Continue to Upload
              </button>
            </div>
          )}

          {/* Step 2: Upload File */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Upload {platforms.find(p => p.id === sourcePlatform)?.name} Workflow JSON *
                </label>
                <p className="text-sm text-slate-600 mb-4">
                  Export your workflow as JSON and upload it here
                </p>
                
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  workflowFile 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                }`}>
                  {workflowFile ? (
                    <div className="space-y-4">
                      <CheckCircle className="mx-auto text-green-500" size={48} />
                      <div>
                        <p className="font-medium text-slate-900 flex items-center justify-center gap-2">
                          <FileJson size={20} className="text-green-600" />
                          {workflowFile.name}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {(workflowFile.size / 1024).toFixed(2)} KB
                        </p>
                        {workflowJson && (
                          <div className="mt-3 text-xs text-slate-500">
                            {sourcePlatform === 'n8n' && workflowJson.nodes && (
                              <p>✓ {workflowJson.nodes.length} nodes detected</p>
                            )}
                            {sourcePlatform === 'zapier' && workflowJson.steps && (
                              <p>✓ {workflowJson.steps.length} steps detected</p>
                            )}
                            {sourcePlatform === 'make' && workflowJson.flow && (
                              <p>✓ {workflowJson.flow.length} modules detected</p>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setWorkflowFile(null);
                          setWorkflowJson(null);
                          setError(null);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Upload different file
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-slate-400 mb-4" size={48} />
                      <p className="text-slate-600 mb-2">
                        Drag and drop your JSON file here
                      </p>
                      <p className="text-xs text-slate-500 mb-4">
                        or click to browse (max 10MB)
                      </p>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="workflow-upload"
                      />
                      <label
                        htmlFor="workflow-upload"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                      >
                        Select JSON File
                      </label>
                    </>
                  )}
                </div>

                {/* Help text */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    How to export from {platforms.find(p => p.id === sourcePlatform)?.name}:
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    {sourcePlatform === 'n8n' && (
                      <>
                        <li>Open your workflow in n8n</li>
                        <li>Click the menu (⋮) → Download</li>
                        <li>Save the .json file to your computer</li>
                      </>
                    )}
                    {sourcePlatform === 'zapier' && (
                      <>
                        <li>Open your Zap in Zapier</li>
                        <li>Click Settings → Export as JSON</li>
                        <li>Save the exported file</li>
                      </>
                    )}
                    {sourcePlatform === 'make' && (
                      <>
                        <li>Open your scenario in Make</li>
                        <li>Click the menu (⋮) → Export Blueprint</li>
                        <li>Download the JSON file</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goToPreviousStep}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={goToNextStep}
                  disabled={!workflowJson}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                >
                  Continue to Selection
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Target Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Target Platforms *
                </label>
                <p className="text-sm text-slate-600 mb-4">
                  Select which platform(s) to convert your workflow to
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {platforms.map((platform) => {
                    const isSource = platform.id === sourcePlatform;
                    const isSelected = targetPlatforms.includes(platform.id);
                    
                    return (
                      <button
                        key={platform.id}
                        onClick={() => toggleTargetPlatform(platform.id)}
                        disabled={isSource}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          isSource
                            ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-slate-900">{platform.name}</p>
                          {isSelected && <CheckCircle className="text-green-500" size={20} />}
                          {isSource && <span className="text-xs text-slate-500">Source</span>}
                        </div>
                        <p className="text-xs text-slate-600">{platform.description}</p>
                      </button>
                    );
                  })}
                </div>

                {targetPlatforms.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Converting to {targetPlatforms.length} platform{targetPlatforms.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> The conversion process uses AI-powered mapping to match 
                  nodes and actions between platforms. Review the validation report after conversion 
                  to check for any unmapped steps.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goToPreviousStep}
                  disabled={loading}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || targetPlatforms.length === 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Creating...
                    </>
                  ) : (
                    'Create Migration'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
