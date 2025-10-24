import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Upload, Download, Copy, CheckCircle, AlertCircle, FileJson, Play, X } from 'lucide-react';

export const Agents: React.FC = () => {
  const [workflowFile, setWorkflowFile] = useState<File | null>(null);
  const [pythonCode, setPythonCode] = useState<string>('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [sourcePlatform, setSourcePlatform] = useState<'zapier' | 'n8n' | 'make'>('n8n');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setWorkflowFile(file);
    setPythonCode('');

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      const generatedCode = generatePythonCode(json, sourcePlatform);
      setPythonCode(generatedCode);
    } catch (err) {
      setError('Invalid JSON file. Please upload a valid workflow export.');
      setWorkflowFile(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation_${Date.now()}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const platforms = [
    { id: 'zapier', name: 'Zapier', color: 'bg-orange-500' },
    { id: 'n8n', name: 'n8n', color: 'bg-pink-500' },
    { id: 'make', name: 'Make', color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Code className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Python Code Generator</h1>
              <p className="text-slate-600 mt-1">Convert workflow JSON to executable Python automation</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Source Platform</label>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <button key={platform.id} onClick={() => setSourcePlatform(platform.id as any)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    sourcePlatform === platform.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}>
                  <div className={`w-10 h-10 ${platform.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                    <span className="text-white font-bold">{platform.name[0]}</span>
                  </div>
                  <p className="font-semibold text-sm">{platform.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Upload size={24} className="text-blue-600" />
            Upload Workflow JSON
          </h2>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
            <FileJson className="mx-auto text-slate-400 mb-4" size={48} />
            <label className="inline-block">
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              <span className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer inline-block">
                Select JSON File
              </span>
            </label>
          </div>

          {workflowFile && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="text-green-500" size={20} />
              <div className="flex-1">
                <p className="font-medium text-green-900">{workflowFile.name}</p>
                <p className="text-sm text-green-700">Python code generated ✓</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Code size={24} className="text-green-600" />
              Python Code
            </h2>
            {pythonCode && (
              <div className="flex gap-2">
                <button onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Download size={18} />
                  Download
                </button>
              </div>
            )}
          </div>

          {pythonCode ? (
            <pre className="bg-slate-900 text-slate-100 p-6 rounded-xl overflow-x-auto text-sm font-mono max-h-[600px] overflow-y-auto">
              <code>{pythonCode}</code>
            </pre>
          ) : (
            <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-slate-200 rounded-xl">
              <div className="text-center">
                <Play size={64} className="mx-auto text-slate-300 mb-4" />
                <p className="text-lg font-semibold text-slate-400">Upload JSON to generate code</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function generatePythonCode(workflow: any, platform: string): string {
  const nodes = workflow.nodes || workflow.steps || workflow.flow || [];
  
  return `#!/usr/bin/env python3
"""
🤖 Automated Workflow Script
Platform: ${platform}
Workflow: ${workflow.name || 'Automation'}
Generated: ${new Date().toLocaleString()}

Install: pip install requests python-dotenv
"""

import requests
import json
import os
from datetime import datetime
from typing import Dict, Any

class WorkflowAutomation:
    def __init__(self):
        self.results = {}
        self.session = requests.Session()
        
    def log(self, msg: str, level: str = "INFO"):
        colors = {"INFO": "\\033[94m", "SUCCESS": "\\033[92m", "ERROR": "\\033[91m"}
        print(f"{colors.get(level, '')}[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [{level}] {msg}\\033[0m")
    
${nodes.map((node: any, i: number) => generateNodeCode(node, i)).join('\n')}
    
    def execute_workflow(self):
        self.log("🚀 Starting workflow execution...")
        try:
${nodes.map((node: any, i: number) => `            self.log("Executing: ${node.name || `Step ${i+1}`}")
            self.step_${i+1}()`).join('\n')}
            
            self.log("✅ Workflow completed!", "SUCCESS")
            return self.results
        except Exception as e:
            self.log(f"❌ Error: {e}", "ERROR")
            raise

if __name__ == "__main__":
    automation = WorkflowAutomation()
    results = automation.execute_workflow()
    print("\\n" + "="*50)
    print("📊 RESULTS")
    print("="*50)
    print(json.dumps(results, indent=2))
    print("="*50)
`;
}

function generateNodeCode(node: any, index: number): string {
  const nodeType = (node.type || '').toLowerCase();
  const nodeName = node.name || `Step ${index + 1}`;
  const params = node.parameters || {};
  
  let code = `    def step_${index + 1}(self):
        """${nodeName}"""
        try:
`;

  if (nodeType.includes('gmail')) {
    code += `            # 📧 GMAIL - Send Email
            import smtplib
            from email.mime.text import MIMEText
            
            sender = os.getenv('GMAIL_USER', 'your-email@gmail.com')
            password = os.getenv('GMAIL_APP_PASSWORD', 'your-app-password')
            recipient = '${params.to || 'recipient@example.com'}'
            subject = '${params.subject || 'Automated Email'}'
            body = '''${params.body || params.message || 'This is an automated email.'}'''
            
            msg = MIMEText(body)
            msg['Subject'] = subject
            msg['From'] = sender
            msg['To'] = recipient
            
            # Uncomment to send:
            # with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            #     server.login(sender, password)
            #     server.send_message(msg)
            
            self.log(f"📧 Email prepared for {recipient}")
            self.results['step_${index + 1}'] = {"service": "gmail", "to": recipient, "status": "ready"}
`;
  } else if (nodeType.includes('slack')) {
    code += `            # 💬 SLACK - Send Message
            webhook = os.getenv('SLACK_WEBHOOK_URL', '')
            channel = '${params.channel || '#general'}'
            message = '''${params.message || params.text || 'Automated notification'}'''
            
            if webhook:
                payload = {"channel": channel, "text": message, "username": "Bot"}
                response = self.session.post(webhook, json=payload)
                response.raise_for_status()
                status = "sent"
            else:
                status = "webhook_needed"
            
            self.log(f"💬 Slack: {message[:50]}...")
            self.results['step_${index + 1}'] = {"service": "slack", "channel": channel, "status": status}
`;
  } else if (nodeType.includes('trello')) {
    code += `            # 📋 TRELLO - Create Card
            api_key = os.getenv('TRELLO_API_KEY', '')
            api_token = os.getenv('TRELLO_API_TOKEN', '')
            list_id = os.getenv('TRELLO_LIST_ID', '')
            
            card_name = '${params.title || params.name || 'New Task'}'
            card_desc = '${params.description || ''}'
            
            if all([api_key, api_token, list_id]):
                url = "https://api.trello.com/1/cards"
                data = {'key': api_key, 'token': api_token, 'idList': list_id, 
                       'name': card_name, 'desc': card_desc}
                response = self.session.post(url, params=data)
                response.raise_for_status()
                card_url = response.json().get('url')
                status = "created"
            else:
                card_url = None
                status = "credentials_needed"
            
            self.log(f"📋 Trello card: {card_name}")
            self.results['step_${index + 1}'] = {"service": "trello", "card": card_name, "url": card_url, "status": status}
`;
  } else if (nodeType.includes('http')) {
    code += `            # 🌐 HTTP REQUEST
            url = '${params.url || 'https://api.example.com'}'
            method = '${params.method || 'GET'}'
            
            response = self.session.request(method, url, timeout=10)
            response.raise_for_status()
            
            try:
                data = response.json()
            except:
                data = response.text[:100]
            
            self.log(f"🌐 HTTP {method} → {response.status_code}")
            self.results['step_${index + 1}'] = {"url": url, "status": response.status_code, "data": data}
`;
  } else {
    code += `            # ⚙️ ${nodeName.toUpperCase()}
            self.log("⚙️ Executing: ${nodeName}")
            
            # Add your automation logic here
            # Parameters: ${JSON.stringify(params)}
            
            self.results['step_${index + 1}'] = {"node": "${nodeName}", "status": "completed", "params": ${JSON.stringify(params)}}
`;
  }

  code += `        except Exception as e:
            self.log(f"Error in ${nodeName}: {e}", "ERROR")
            raise
    
`;
  return code;
}
