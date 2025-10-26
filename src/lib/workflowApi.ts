// src/lib/workflowApi.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface WorkflowUploadResponse {
  workflow_id: string;
  name: string;
  platform: string;
  steps_count: number;
  complexity: any;
  can_execute: boolean;
  message: string;
}

export interface ExecutionResponse {
  execution_id: string;
  status: string;
  message: string;
}

export interface ExecutionStatus {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  result: any;
  error: string | null;
  logs: Array<{ timestamp: string; level: string; message: string }>;
  duration: number | null;
}

// Upload workflow
export async function uploadWorkflow(file: File): Promise<WorkflowUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/api/workflows/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail || 'Upload failed');
  }
  
  return response.json();
}

// Execute workflow
export async function executeWorkflow(workflowId: string): Promise<ExecutionResponse> {
  const response = await fetch(`${API_URL}/api/workflows/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflow_id: workflowId,
      input_data: {},
      credentials: {}
    })
  });
  
  if (!response.ok) throw new Error('Execution failed');
  return response.json();
}

// Get execution status
export async function getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
  const response = await fetch(`${API_URL}/api/executions/${executionId}`);
  if (!response.ok) throw new Error('Status check failed');
  return response.json();
}

// Poll execution status
export async function pollExecutionStatus(
  executionId: string,
  onUpdate?: (status: ExecutionStatus) => void
): Promise<ExecutionStatus> {
  let attempts = 0;
  
  while (attempts < 60) {
    const status = await getExecutionStatus(executionId);
    if (onUpdate) onUpdate(status);
    
    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }
  
  throw new Error('Execution timeout');
}

// Download converted workflow as JSON
// src/lib/workflowApi.ts - Replace the downloadConvertedWorkflow function

export async function downloadConvertedWorkflow(
  workflowId: string,
  targetPlatform: string,
  workflowName: string
): Promise<void> {
  try {
    console.log(`📥 Downloading ${targetPlatform} conversion...`);
    
    const response = await fetch(
      `${API_URL}/api/workflows/${workflowId}/download/${targetPlatform}`,
      { 
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Download failed' }));
      throw new Error(error.detail || `Download failed: ${response.statusText}`);
    }
    
    // Get the blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${workflowName}_${targetPlatform}.json`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    console.log(`✅ Download successful: ${a.download}`);
    
  } catch (error: any) {
    console.error('❌ Download error:', error);
    throw new Error(error.message || 'Download failed');
  }
}


// Export to Python (for Agents section)
export async function exportToPython(workflowId: string, workflowName: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_URL}/api/workflows/${workflowId}/export/python`,
      { method: 'POST' }
    );
    
    if (!response.ok) throw new Error('Python export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName}_workflow.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Python export error:', error);
    throw error;
  }
}

// List all workflows
export async function listWorkflows() {
  const response = await fetch(`${API_URL}/api/workflows`);
  if (!response.ok) throw new Error('Failed to list workflows');
  return response.json();
}
