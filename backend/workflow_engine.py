import asyncio
from typing import Dict, Any, List, Callable
from datetime import datetime
from dataclasses import dataclass, field
import httpx

import logging

logger = logging.getLogger(__name__)

@dataclass
class WorkflowExecution:
    id: str
    workflow_id: str
    status: str  # 'running', 'completed', 'failed'
    started_at: datetime
    completed_at: datetime = None
    result: Dict[str, Any] = None
    error: str = None
    logs: List[Dict[str, Any]] = field(default_factory=list)
    
    def add_log(self, level: str, message: str):
        self.logs.append({
            'timestamp': datetime.now().isoformat(),
            'level': level,
            'message': message
        })
        logger.info(f"[{level}] {message}")
    
    def to_dict(self):
        return {
            'id': self.id,
            'workflow_id': self.workflow_id,
            'status': self.status,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'result': self.result,
            'error': self.error,
            'logs': self.logs,
            'duration': (self.completed_at - self.started_at).total_seconds() if self.completed_at else None
        }

class WorkflowEngine:
    """Execute workflows from any platform"""
    
    def __init__(self):
        self.session = None
    
    async def execute(
        self,
        workflow: Dict[str, Any],
        input_data: Dict[str, Any],
        credentials: Dict[str, str],
        log_callback: Callable = None
    ) -> Dict[str, Any]:
        """Execute workflow steps"""
        
        self.log = log_callback or (lambda log: logger.info(log))
        data = input_data
        
        total_steps = len(workflow['steps'])
        self.log({'level': 'info', 'message': f"Starting workflow with {total_steps} steps"})
        
        async with httpx.AsyncClient() as self.session:

            for i, step in enumerate(workflow['steps'], 1):
                self.log({'level': 'info', 'message': f"[{i}/{total_steps}] Executing: {step['name']}"})
                
                try:
                    data = await self.execute_step(step, data, credentials)
                    self.log({'level': 'success', 'message': f"✓ {step['name']} completed"})
                    await asyncio.sleep(0.1)  # Small delay between steps
                except Exception as e:
                    self.log({'level': 'error', 'message': f"✗ {step['name']} failed: {str(e)}"})
                    raise
        
        self.log({'level': 'success', 'message': 'All steps completed successfully'})
        return data
    
    async def execute_step(
        self,
        step: Dict[str, Any],
        data: Dict[str, Any],
        credentials: Dict[str, str]
    ) -> Dict[str, Any]:
        """Execute single step"""
        
        step_type = step['type'].lower()
        
        # Route to appropriate executor
        if 'http' in step_type or 'webhook' in step_type:
            return await self.execute_http(step, data)
        elif 'openai' in step_type or 'ai' in step_type:
            return await self.execute_ai(step, data, credentials)
        elif 'email' in step_type or 'gmail' in step_type:
            return await self.execute_email(step, data, credentials)
        elif 'database' in step_type or 'airtable' in step_type:
            return await self.execute_database(step, data, credentials)
        else:
            # Generic execution (placeholder)
            return await self.execute_generic(step, data)
    
    async def execute_http(self, step: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute HTTP request"""
        method = step.get('method', 'GET')
        url = step.get('url', '')
        headers = step.get('headers', {})
        body = step.get('body', {})
        
        logger.info(f"HTTP {method} {url}")
        
        # Placeholder - implement actual HTTP request
        return {**data, 'http_result': 'success'}
    
    async def execute_ai(self, step: Dict[str, Any], data: Dict[str, Any], credentials: Dict[str, str]) -> Dict[str, Any]:
        """Execute AI operation"""
        # Placeholder - implement OpenAI/Anthropic calls
        return {**data, 'ai_result': 'success'}
    
    async def execute_email(self, step: Dict[str, Any], data: Dict[str, Any], credentials: Dict[str, str]) -> Dict[str, Any]:
        """Execute email operation"""
        # Placeholder - implement email sending
        return {**data, 'email_result': 'success'}
    
    async def execute_database(self, step: Dict[str, Any], data: Dict[str, Any], credentials: Dict[str, str]) -> Dict[str, Any]:
        """Execute database operation"""
        # Placeholder - implement database queries
        return {**data, 'db_result': 'success'}
    
    async def execute_generic(self, step: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """Generic step execution (placeholder)"""
        await asyncio.sleep(0.2)  # Simulate work
        return {**data, f"{step['name']}_result": 'success'}
