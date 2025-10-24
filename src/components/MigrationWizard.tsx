import React, { useState } from 'react';
import { X, Upload, ArrowRight, CheckCircle, FileJson, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MigrationWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

export const MigrationWizard: React.FC<MigrationWizardProps> = ({ onClose, onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [migrationName, setMigrationName] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState<'zapier' | 'n8n' | 'make'>('zapier');
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([]);
  const [workflowFile, setWorkflowFile] = useState<File | null>(null);
  const [workflowJson, setWorkflowJson] = useState<any>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const platforms = [
    { id: 'zapier', name: 'Zapier', color: 'bg-orange-500' },
    { id: 'n8n', name: 'n8n', color: 'bg-pink-500' },
    { id: 'make', name: 'Make', color: 'bg-purple-500' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setWorkflowFile(file);

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      // Validate based on source platform
      const isValid = validateWorkflow(json, sourcePlatform);
      
      if (!isValid) {
        setError(`Invalid ${sourcePlatform} workflow format. Please check your export file.`);
        setWorkflowFile(null);
        setWorkflowJson(null);
        return;
      }

      setWorkflowJson(json);
    } catch (err) {
      setError('Invalid JSON file. Please upload a valid workflow export.');
      setWorkflowFile(null);
      setWorkflowJson(null);
    }
  };

  const validateWorkflow = (json: any, platform: string): boolean => {
    try {
      switch (platform) {
        case 'zapier':
          // Zapier can have different export formats
          // Check for common Zapier structures
          if (json.steps && Array.isArray(json.steps)) {
            return json.steps.length > 0;
          }
          // Alternative Zapier export format
          if (json.trigger || json.actions) {
            return true;
          }
          // Another format with nodes
          if (json.nodes && Array.isArray(json.nodes)) {
            return json.nodes.length > 0;
          }
          // Raw zap export
          if (json.zap || json.workflow) {
            return true;
          }
          return false;

        case 'n8n':
          return json.nodes && Array.isArray(json.nodes) && json.nodes.length > 0;

        case 'make':
          return (json.flow && Array.isArray(json.flow)) || 
                 (json.modules && Array.isArray(json.modules));

        default:
          return false;
      }
    } catch {
      return false;
    }
  };

  const handleTargetToggle = (platform: string) => {
    if (platform === sourcePlatform) return;

    setTargetPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async () => {
    if (!user || !workflowJson) return;

    setUploading(true);
    setError('');

    try {
      const { error: dbError } = await supabase.from('migrations').insert({
        user_id: user.id,
        name: migrationName,
        source_platform: sourcePlatform,
        target_platforms: targetPlatforms,
        source_json: workflowJson,
        status: 'pending',
      });

      if (dbError) throw dbError;

      onComplete();
    } catch (err: any) {
      console.error('Migration creation error:', err);
      setError(err.message || 'Failed to create migration');
    } finally {
      setUploading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return migrationName.trim().length > 0 && sourcePlatform;
      case 2:
        return workflowFile && workflowJson;
      case 3:
        return targetPlatforms.length > 0;
      default:
        return false;
    }
  };

  // Get accepted file extensions based on source platform
  const getAcceptedFiles = () => {
    switch (sourcePlatform) {
      case 'zapier':
        return '.json,.zap';
      case 'n8n':
        return '.json';
      case 'make':
        return '.json';
      default:
        return '.json';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">New Migration</h2>
            <p className="text-sm text-gray-600 mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Step 1: Name and Source */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Migration Name *
                </label>
                <input
                  type="text"
                  value={migrationName}
                  onChange={(e) => setMigrationName(e.target.value)}
                  placeholder="e.g., CRM to Marketing Automation"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Source Platform *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSourcePlatform(platform.id as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        sourcePlatform === platform.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 ${platform.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">
                          {platform.name[0]}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900">{platform.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload File */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload {platforms.find(p => p.id === sourcePlatform)?.name} Workflow JSON *
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Export your workflow as JSON and upload it here
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                  <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-700 font-medium mb-2">
                    Drag and drop your JSON file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse (max 10MB)
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept={getAcceptedFiles()}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer inline-block">
                      Select JSON File
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-3">
                    Accepted: {getAcceptedFiles().split(',').join(', ')} files
                  </p>
                </div>

                {workflowFile && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <div className="flex-1">
                      <p className="font-medium text-green-900">{workflowFile.name}</p>
                      <p className="text-sm text-green-700">
                        {(workflowFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setWorkflowFile(null);
                        setWorkflowJson(null);
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-2">
                  How to export from {platforms.find(p => p.id === sourcePlatform)?.name}:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  {sourcePlatform === 'zapier' && (
                    <>
                      <li>Open your Zap in Zapier</li>
                      <li>Click Settings → Export as JSON</li>
                      <li>Save the exported file</li>
                    </>
                  )}
                  {sourcePlatform === 'n8n' && (
                    <>
                      <li>Open your workflow in n8n</li>
                      <li>Click the menu (three dots)</li>
                      <li>Select "Download" to get the JSON file</li>
                    </>
                  )}
                  {sourcePlatform === 'make' && (
                    <>
                      <li>Open your scenario in Make</li>
                      <li>Click the three dots menu</li>
                      <li>Select "Export Blueprint" as JSON</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Select Target Platforms */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Target Platform(s) *
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Choose one or more platforms to convert your workflow to
                </p>

                <div className="grid grid-cols-3 gap-4">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => handleTargetToggle(platform.id)}
                      disabled={platform.id === sourcePlatform}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        platform.id === sourcePlatform
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : targetPlatforms.includes(platform.id)
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 ${platform.color} rounded-lg mx-auto mb-3 flex items-center justify-center relative`}>
                        <span className="text-white font-bold text-lg">
                          {platform.name[0]}
                        </span>
                        {targetPlatforms.includes(platform.id) && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-white" size={14} />
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">{platform.name}</p>
                      {platform.id === sourcePlatform && (
                        <p className="text-xs text-gray-500 mt-1">Source</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {targetPlatforms.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <CheckCircle className="inline mr-2" size={16} />
                    Your workflow will be converted to{' '}
                    <strong>{targetPlatforms.length}</strong> platform
                    {targetPlatforms.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-3 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Selection
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || uploading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Create Migration
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
