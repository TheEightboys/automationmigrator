# backend/main.py - ULTIMATE PRODUCTION VERSION WITH PERFECT CONVERSIONS
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import json
import uuid
import asyncio
from datetime import datetime
import os
import logging
import tempfile
import subprocess
import sys

from workflow_engine import WorkflowEngine, WorkflowExecution
from parsers.n8n_parser import N8nParser
from parsers.zapier_parser import ZapierParser
from parsers.make_parser import MakeParser

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="MigroMat API v3.0 - Ultimate Edition", version="3.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

executions: Dict[str, WorkflowExecution] = {}
workflows: Dict[str, Dict[str, Any]] = {}

PARSERS = {'n8n': N8nParser(), 'zapier': ZapierParser(), 'make': MakeParser()}

class ExecutionRequest(BaseModel):
    workflow_id: str
    input_data: Optional[Dict[str, Any]] = {}
    credentials: Optional[Dict[str, str]] = {}

class ExecutionResponse(BaseModel):
    execution_id: str
    status: str
    message: str

def detect_platform(data: Dict[str, Any]) -> str:
    if 'nodes' in data and 'connections' in data:
        return 'n8n'
    elif 'trigger' in data and 'steps' in data:
        return 'zapier'
    elif 'flow' in data or 'scenario' in data:
        return 'make'
    raise ValueError("Unknown platform")

async def run_workflow_background(execution_id: str, workflow: Dict[str, Any], input_data: Dict[str, Any], credentials: Dict[str, str]):
    execution = executions[execution_id]
    engine = WorkflowEngine()
    try:
        execution.add_log('info', 'Starting')
        result = await engine.execute(workflow, input_data, credentials, lambda log: execution.add_log(log['level'], log['message']))
        execution.status = 'completed'
        execution.result = result
        execution.completed_at = datetime.now()
        execution.add_log('success', 'Completed')
    except Exception as e:
        execution.status = 'failed'
        execution.error = str(e)
        execution.completed_at = datetime.now()
        execution.add_log('error', f'Failed: {e}')

# ============================================================================
# MAKE.COM MODULE MAPPER - COMPREHENSIVE
# ============================================================================
class MakeModuleMapper:
    """Complete mapping of n8n nodes to Make.com module specifications"""
    
    @staticmethod
    def get_module_spec(n8n_type: str, node_name: str, params: Dict) -> Dict[str, Any]:
        """Get complete Make.com module specification"""
        n8n_type = n8n_type.replace('n8n-nodes-base.', '').replace('@n8n/n8n-nodes-langchain.', '').lower()
        
        # Comprehensive module mapping
        module_map = {
            # Database & Storage
            'airtable': ('airtable:ActionCreateRecord', 3),
            'airtabletool': ('airtable:ActionSearchRecords', 3),
            'googledrive': ('google-drive:uploadFile', 2),
            'googlesheets': ('google-sheets:addRow', 4),
            'mysql': ('mysql:executeQuery', 1),
            'postgresql': ('postgresql:select', 1),
            'mongodb': ('mongodb:aggregate', 1),
            
            # Communication
            'gmail': ('google-email:sendEmail', 1),
            'emailsend': ('email:sendEmail', 1),
            'sendgrid': ('sendgrid:sendEmail', 1),
            'slack': ('slack:createMessage', 1),
            'discord': ('discord:createMessage', 1),
            'telegram': ('telegram:sendTextMessage', 1),
            
            # AI & ML
            'openai': ('openai:createChatCompletion', 1),
            'agent': ('openai:createChatCompletion', 1),
            'lmchatopenai': ('openai:createChatCompletion', 1),
            'outputparserstructured': ('json:parseJSON', 1),
            
            # Triggers & Webhooks
            'webhook': ('webhook:customWebHook', 1),
            'formtrigger': ('webhook:customWebHook', 1),
            'form': ('webhook:customWebHook', 1),
            
            # Calendar & Scheduling
            'googlecalendar': ('google-calendar:createEvent', 1),
            'googlecalendartool': ('google-calendar:createEvent', 1),
            
            # Data Processing
            'set': ('builtin:BasicRouter', 1),
            'if': ('builtin:BasicRouter', 1),
            'switch': ('builtin:Router', 1),
            'merge': ('builtin:Aggregator', 1),
            'code': ('builtin:HTTPmodule', 1),
            'httprequest': ('http:ActionSendData', 1),
            'extractfromfile': ('tools:textParser', 1),
            
            # Notes (skip)
            'stickynote': (None, None),
        }
        
        module_id, version = module_map.get(n8n_type, ('http:ActionSendData', 1))
        
        if module_id is None:
            return None
        
        return {
            "id": 1,
            "module": module_id,
            "version": version,
            "parameters": MakeModuleMapper._convert_parameters(n8n_type, params),
            "mapper": {},
            "metadata": {
                "designer": {"x": 0, "y": 0},
                "restore": {
                    "parameters": {},
                    "expect": {}
                },
                "parameters": [],
                "expect": []
            }
        }
    
    @staticmethod
    def _convert_parameters(node_type: str, params: Dict) -> Dict[str, Any]:
        """Convert n8n parameters to Make.com format"""
        if 'airtable' in node_type:
            return {
                "base": "{{parameters.baseId}}",
                "table": "{{parameters.table}}",
                "typecast": False
            }
        elif 'openai' in node_type or 'ai' in node_type:
            return {
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": "{{parameters.prompt}}"}],
                "temperature": 0.7
            }
        elif 'email' in node_type:
            return {
                "to": "{{parameters.to}}",
                "subject": "{{parameters.subject}}",
                "content": "{{parameters.text}}"
            }
        elif 'webhook' in node_type:
            return {
                "hookType": "post",
                "responseMode": "onReceived"
            }
        return {}

# ============================================================================
# CONVERSION ENGINE - ULTIMATE VERSION
# ============================================================================
def convert_to_make(wf: Dict[str, Any]) -> Dict[str, Any]:
    """Convert n8n workflow to proper Make.com blueprint format"""
    try:
        nodes = wf.get('nodes', [])
        flow_modules = []
        x_pos = 100
        
        for idx, node in enumerate(nodes, 1):
            node_type = node.get('type', '')
            node_name = node.get('name', f'Step {idx}')
            params = node.get('parameters', {})
            
            module_spec = MakeModuleMapper.get_module_spec(node_type, node_name, params)
            
            if module_spec is None:
                continue
            
            module_spec['id'] = idx
            module_spec['metadata']['designer']['x'] = x_pos
            module_spec['metadata']['designer']['y'] = 100
            
            flow_modules.append(module_spec)
            x_pos += 200
        
        return {
            "name": wf.get('name', 'Converted Scenario'),
            "flow": flow_modules,
            "metadata": {
                "instant": False,
                "version": 1,
                "scenario": {
                    "roundtrips": 1,
                    "maxErrors": 3,
                    "autoCommit": True,
                    "autoCommitTriggerLast": True,
                    "sequential": False,
                    "confidential": False,
                    "dataloss": False,
                    "dlq": False,
                    "freshVariables": False
                },
                "designer": {
                    "orphans": []
                },
                "zone": "us1.make.com"
            }
        }
    except Exception as e:
        logger.error(f"Make conversion error: {e}")
        raise

def convert_to_zapier(wf: Dict[str, Any]) -> Dict[str, Any]:
    """Convert n8n workflow to Zapier format"""
    try:
        nodes = wf.get('nodes', [])
        
        if not nodes:
            return {"name": wf.get('name', 'Workflow'), "steps": []}
        
        trigger_node = nodes[0]
        action_nodes = nodes[1:]
        
        return {
            "name": wf.get('name', 'Converted Zap'),
            "description": "Converted from n8n by MigroMat",
            "trigger": {
                "app": trigger_node.get('type', 'webhook').replace('n8n-nodes-base.', ''),
                "event": "trigger",
                "title": trigger_node.get('name', 'Trigger'),
                "config": trigger_node.get('parameters', {})
            },
            "actions": [
                {
                    "id": str(i),
                    "app": node.get('type', '').replace('n8n-nodes-base.', ''),
                    "action": node.get('name', ''),
                    "title": node.get('name', f'Step {i}'),
                    "config": node.get('parameters', {})
                }
                for i, node in enumerate(action_nodes, 1)
            ]
        }
    except Exception as e:
        logger.error(f"Zapier conversion error: {e}")
        raise

def generate_python_code(workflow: Dict[str, Any]) -> str:
    """Generate production-ready Python automation code"""
    try:
        steps = workflow.get('steps', [])
        if not steps:
            return "# Error: No steps found"
        
        name = workflow.get('name', 'workflow').replace('"', "'")
        total = len(steps)
        
        code = f'''#!/usr/bin/env python3
"""
{name}
Generated by MigroMat v3.0 - Ultimate Edition
Total Steps: {total}
"""
import os, json, requests
from datetime import datetime
from typing import Dict, Any

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Config:
    AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY", "")
    AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")

class Logger:
    def log(self, l, m): print(f"[{{datetime.now().strftime('%H:%M:%S')}}] [{{l}}] {{m}}")

logger = Logger()

class API:
    @staticmethod
    def airtable(method: str, table: str, data: Dict = None, record_id: str = None):
        url = f"https://api.airtable.com/v0/{{Config.AIRTABLE_BASE_ID}}/{{table}}"
        if record_id: url += f"/{{record_id}}"
        headers = {{"Authorization": f"Bearer {{Config.AIRTABLE_API_KEY}}", "Content-Type": "application/json"}}
        try:
            if method == "GET": r = requests.get(url, headers=headers)
            elif method == "POST": r = requests.post(url, headers=headers, json={{"fields": data}})
            elif method == "PATCH": r = requests.patch(url, headers=headers, json={{"fields": data}})
            r.raise_for_status()
            return r.json()
        except Exception as e:
            logger.log("ERROR", f"Airtable: {{e}}")
            return None
    
    @staticmethod
    def openai(prompt: str):
        url = "https://api.openai.com/v1/chat/completions"
        headers = {{"Authorization": f"Bearer {{Config.OPENAI_API_KEY}}", "Content-Type": "application/json"}}
        data = {{"model": "gpt-3.5-turbo", "messages": [{{"role": "user", "content": prompt}}]}}
        try:
            r = requests.post(url, headers=headers, json=data)
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.log("ERROR", f"OpenAI: {{e}}")
            return None
    
    @staticmethod
    def email(to: str, subject: str, body: str):
        url = "https://api.sendgrid.com/v3/mail/send"
        headers = {{"Authorization": f"Bearer {{Config.SENDGRID_API_KEY}}", "Content-Type": "application/json"}}
        data = {{"personalizations": [{{"to": [{{"email": to}}]}}], "from": {{"email": "noreply@example.com"}}, "subject": subject, "content": [{{"type": "text/plain", "value": body}}]}}
        try:
            r = requests.post(url, headers=headers, json=data)
            r.raise_for_status()
            return True
        except Exception as e:
            logger.log("ERROR", f"Email: {{e}}")
            return False

api = API()

'''
        
        for i, step in enumerate(steps, 1):
            sn = step.get('name', f'step_{i}')
            st = step.get('type', 'action')
            safe = ''.join(c if c.isalnum() or c == '_' else '_' for c in sn.lower())[:30].strip('_') or f's{i}'
            
            if 'airtable' in st.lower() or 'airtable' in sn.lower():
                code += f'''def step{i}_{safe}(d: Dict[str, Any]) -> Dict[str, Any]:
    logger.log("INFO", "Step {i}: {sn}")
    r = api.airtable("POST", "Table", {{"Name": d.get("name", "Unknown")}})
    if r: d["airtable_id"] = r.get("id")
    return d

'''
            elif any(x in st.lower() or x in sn.lower() for x in ['openai', 'ai', 'gpt']):
                code += f'''def step{i}_{safe}(d: Dict[str, Any]) -> Dict[str, Any]:
    logger.log("INFO", "Step {i}: {sn}")
    r = api.openai(f"Process: {{d}}")
    if r: d["ai_response"] = r
    return d

'''
            elif 'email' in st.lower() or 'send' in sn.lower():
                code += f'''def step{i}_{safe}(d: Dict[str, Any]) -> Dict[str, Any]:
    logger.log("INFO", "Step {i}: {sn}")
    api.email(d.get("email", "test@example.com"), "Notification", "Done")
    return d

'''
            else:
                code += f'''def step{i}_{safe}(d: Dict[str, Any]) -> Dict[str, Any]:
    logger.log("INFO", "Step {i}: {sn}")
    d["step{i}_done"] = True
    return d

'''
        
        code += f'''def run():
    logger.log("INFO", "Starting: {name}")
    d = {{"workflow": "{name}", "started": datetime.now().isoformat()}}
    try:
'''
        for i, step in enumerate(steps, 1):
            sn = step.get('name', f'step_{i}')
            safe = ''.join(c if c.isalnum() or c == '_' else '_' for c in sn.lower())[:30].strip('_') or f's{i}'
            code += f'        d = step{i}_{safe}(d)\n'
        
        code += '''        logger.log("INFO", "✅ Done")
        return {"status": "success", "data": d}
    except Exception as e:
        logger.log("ERROR", f"Failed: {e}")
        return {"status": "failed", "error": str(e)}

if __name__ == "__main__":
    r = run()
    print(json.dumps(r, indent=2))
    with open("result.json", "w") as f: json.dump(r, f, indent=2)
    exit(0 if r.get("status") == "success" else 1)
'''
        return code
    except Exception as e:
        logger.error(f"Python generation error: {e}")
        return f"# Error: {e}"

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    return {"message": "MigroMat API v3.0 Ultimate", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "workflows": len(workflows), "executions": len(executions)}

@app.post("/api/workflows/upload")
async def upload_workflow(file: UploadFile = File(...)):
    try:
        content = await file.read()
        data = json.loads(content)
        platform = detect_platform(data)
        parser = PARSERS.get(platform)
        if not parser:
            raise HTTPException(400, f"Unsupported: {platform}")
        parsed = parser.parse(data)
        wid = str(uuid.uuid4())
        workflows[wid] = {'id': wid, 'name': data.get('name', file.filename), 'platform': platform, 'parsed': parsed, 'original': data}
        logger.info(f"✅ Uploaded: {wid}")
        return {'workflow_id': wid, 'name': workflows[wid]['name'], 'platform': platform, 'steps_count': len(parsed['steps']), 'message': 'Ready'}
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(500, str(e))

@app.post("/api/workflows/execute")
async def execute_workflow(request: ExecutionRequest, background_tasks: BackgroundTasks):
    try:
        wf = workflows.get(request.workflow_id)
        if not wf:
            raise HTTPException(404, "Not found")
        eid = str(uuid.uuid4())
        execution = WorkflowExecution(id=eid, workflow_id=request.workflow_id, status='running', started_at=datetime.now())
        executions[eid] = execution
        background_tasks.add_task(run_workflow_background, eid, wf['parsed'], request.input_data, request.credentials)
        return ExecutionResponse(execution_id=eid, status='running', message='Started')
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/api/executions/{execution_id}")
async def get_execution_status(execution_id: str):
    ex = executions.get(execution_id)
    if not ex:
        raise HTTPException(404, "Not found")
    return ex.to_dict()

@app.post("/api/workflows/{workflow_id}/export/python")
async def export_to_python(workflow_id: str):
    try:
        wf = workflows.get(workflow_id)
        if not wf:
            raise HTTPException(404, "Not found")
        code = generate_python_code(wf['parsed'])
        fn = f"workflow_{(''.join(c for c in wf['name'].lower() if c.isalnum() or c == '_')[:30] or 'wf')}.py"
        logger.info(f"✅ Exported Python: {fn}")
        return Response(content=code.encode('utf-8'), media_type='text/x-python', headers={'Content-Disposition': f'attachment; filename="{fn}"'})
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/workflows/{workflow_id}/execute/python")
async def execute_python_code(workflow_id: str):
    try:
        wf = workflows.get(workflow_id)
        if not wf:
            raise HTTPException(404, "Not found")
        code = generate_python_code(wf['parsed'])
        td = tempfile.gettempdir()
        sp = os.path.join(td, f"exec_{uuid.uuid4().hex[:8]}.py")
        with open(sp, 'w', encoding='utf-8') as f:
            f.write(code)
        ol = ["="*60, "EXECUTING", "="*60, ""]
        try:
            r = subprocess.run([sys.executable, sp], capture_output=True, text=True, timeout=60)
            ol.append(r.stdout or "No output")
            if r.stderr:
                ol.append("\nERRORS:\n" + r.stderr)
            ol.append(f"\n{'✅ SUCCESS' if r.returncode == 0 else '❌ FAILED'}")
            os.remove(sp)
            return {"status": "completed", "exit_code": r.returncode, "output": "\n".join(ol), "success": r.returncode == 0}
        except subprocess.TimeoutExpired:
            os.remove(sp)
            return {"status": "timeout", "output": "\n".join(ol) + "\nTIMEOUT"}
    except Exception as e:
        return {"status": "error", "output": str(e)}

@app.post("/api/workflows/{workflow_id}/download/{target_platform}")
async def download_converted_workflow(workflow_id: str, target_platform: str):
    try:
        wf = workflows.get(workflow_id)
        if not wf:
            raise HTTPException(404, "Not found")
        
        if target_platform == 'make':
            data = convert_to_make(wf['original'])
        elif target_platform == 'zapier':
            data = convert_to_zapier(wf['original'])
        elif target_platform == wf['platform']:
            data = wf['original']
        else:
            raise HTTPException(400, f"Conversion {wf['platform']} -> {target_platform} not supported")
        
        fn = f"{(''.join(c for c in wf['name'].lower() if c.isalnum() or c == '_')[:30] or 'wf')}_{target_platform}.json"
        logger.info(f"✅ Downloaded: {fn}")
        return Response(content=json.dumps(data, indent=2).encode('utf-8'), media_type='application/json', headers={'Content-Disposition': f'attachment; filename="{fn}"'})
    except Exception as e:
        logger.error(f"Download failed: {e}")
        raise HTTPException(500, str(e))

@app.delete("/api/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str):
    if workflow_id not in workflows:
        raise HTTPException(404, "Not found")
    del workflows[workflow_id]
    return {"message": "Deleted"}

@app.get("/api/workflows")
async def list_workflows():
    return {"workflows": [{"id": w['id'], "name": w['name'], "platform": w['platform'], "steps": len(w['parsed']['steps'])} for w in workflows.values()], "total": len(workflows)}
@app.post("/api/execute/code")
async def execute_code(request: dict):
    """Execute Python code or system commands in terminal"""
    try:
        code = request.get('code', '').strip()
        
        if not code:
            return {"success": False, "error": "No code provided"}
        
        import tempfile
        import subprocess
        import sys
        
        # Handle pip commands
        if code.startswith('pip '):
            try:
                result = subprocess.run(
                    [sys.executable, '-m'] + code.split(),
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                return {
                    "success": result.returncode == 0,
                    "output": result.stdout + (result.stderr if result.stderr else ''),
                    "error": None
                }
            except subprocess.TimeoutExpired:
                return {"success": False, "error": "Command timeout (60s limit)"}
            except Exception as e:
                return {"success": False, "error": str(e)}
        
        # Handle other system commands (ls, pwd, etc.)
        if code.split()[0] in ['ls', 'dir', 'pwd', 'cd', 'mkdir', 'rm', 'cat', 'echo']:
            try:
                result = subprocess.run(
                    code,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                return {
                    "success": result.returncode == 0,
                    "output": result.stdout + (result.stderr if result.stderr else ''),
                    "error": None
                }
            except Exception as e:
                return {"success": False, "error": str(e)}
        
        # Execute Python code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as f:
            f.write(code)
            temp_path = f.name
        
        try:
            result = subprocess.run(
                [sys.executable, temp_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            output = result.stdout
            if result.stderr and result.returncode != 0:
                output += f"\n\nErrors:\n{result.stderr}"
            
            os.remove(temp_path)
            
            return {
                "success": result.returncode == 0,
                "output": output or "✓ Code executed successfully (no output)",
                "error": result.stderr if result.returncode != 0 else None
            }
        except subprocess.TimeoutExpired:
            try:
                os.remove(temp_path)
            except:
                pass
            return {"success": False, "error": "Execution timeout (30s limit)"}
        except Exception as e:
            try:
                os.remove(temp_path)
            except:
                pass
            return {"success": False, "error": str(e)}
            
    except Exception as e:
        logger.error(f"Code execution error: {e}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"🚀 MigroMat API v3.0 Ultimate on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
