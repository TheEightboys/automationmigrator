// src/lib/workflowApi.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🔗 API URL:', API_URL); // Debug log

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
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('📤 Uploading workflow to:', `${API_URL}/api/workflows/upload`);
    
    const response = await fetch(`${API_URL}/api/workflows/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || `Upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Upload successful:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    throw new Error(error.message || 'Upload failed. Please check your connection.');
  }
}

// Execute workflow
export async function executeWorkflow(workflowId: string): Promise<ExecutionResponse> {
  try {
    console.log('🚀 Executing workflow:', workflowId);
    
    const response = await fetch(`${API_URL}/api/workflows/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflow_id: workflowId,
        input_data: {},
        credentials: {}
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Execution failed' }));
      throw new Error(error.detail || 'Execution failed');
    }
    
    return response.json();
  } catch (error: any) {
    console.error('❌ Execution error:', error);
    throw new Error(error.message || 'Execution failed');
  }
}

// Get execution status
export async function getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
  try {
    const response = await fetch(`${API_URL}/api/executions/${executionId}`);
    
    if (!response.ok) {
      throw new Error('Status check failed');
    }
    
    return response.json();
  } catch (error: any) {
    console.error('❌ Status check error:', error);
    throw new Error(error.message || 'Status check failed');
  }
}

// Poll execution status
export async function pollExecutionStatus(
  executionId: string,
  onUpdate?: (status: ExecutionStatus) => void
): Promise<ExecutionStatus> {
  let attempts = 0;
  const maxAttempts = 60; // 2 minutes (2s intervals)
  
  while (attempts < maxAttempts) {
    try {
      const status = await getExecutionStatus(executionId);
      
      if (onUpdate) {
        onUpdate(status);
      }
      
      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    } catch (error) {
      console.error('Polling error:', error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Execution timeout after 2 minutes');
}

// Download converted workflow as JSON
export async function downloadConvertedWorkflow(
  workflowId: string,
  targetPlatform: string,
  workflowName: string
): Promise<void> {
  try {
    console.log(`📥 Downloading ${targetPlatform} conversion for workflow:`, workflowId);
    
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
    
    // Verify blob is not empty
    if (blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }
    
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
    throw new Error(error.message || 'Download failed. Please try again.');
  }
}

// Export to Python (for Agents section)
export async function exportToPython(workflowId: string, workflowName: string): Promise<void> {
  try {
    console.log('🐍 Exporting to Python:', workflowId);
    
    const response = await fetch(
      `${API_URL}/api/workflows/${workflowId}/export/python`,
      { method: 'POST' }
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Python export failed' }));
      throw new Error(error.detail || 'Python export failed');
    }
    
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Exported file is empty');
    }
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${workflowName}_workflow.py`;
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    console.log('✅ Python export successful');
  } catch (error: any) {
    console.error('❌ Python export error:', error);
    throw new Error(error.message || 'Python export failed');
  }
}

// List all workflows
export async function listWorkflows() {
  try {
    const response = await fetch(`${API_URL}/api/workflows`);
    
    if (!response.ok) {
      throw new Error('Failed to list workflows');
    }
    
    return response.json();
  } catch (error: any) {
    console.error('❌ List workflows error:', error);
    throw new Error(error.message || 'Failed to list workflows');
  }
}

// Execute Python code (for Interactive Terminal)
export async function executeCode(code: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/api/execute/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Execution failed' }));
      throw new Error(error.error || 'Code execution failed');
    }
    
    return response.json();
  } catch (error: any) {
    console.error('❌ Code execution error:', error);
    throw new Error(error.message || 'Code execution failed');
  }
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}
// Add this new export function at the bottom of the file
export const exportWorkflowToPython = async (workflowId: string): Promise<string> => {
  console.log('🐍 Exporting to Python from:', API_URL);
  
  const response = await fetch(`${API_URL}/api/workflows/${workflowId}/export/python`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to export Python code: ${error}`);
  }

  return await response.text();
};

