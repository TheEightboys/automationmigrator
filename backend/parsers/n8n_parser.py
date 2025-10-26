from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class N8nParser:
    """Parse n8n workflow JSON"""
    
    def parse(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Convert n8n JSON to standard format"""
        nodes = workflow.get('nodes', [])
        connections = workflow.get('connections', {})
        
        logger.info(f"Parsing n8n workflow with {len(nodes)} nodes")
        
        steps = []
        for node in nodes:
            step = {
                'id': node.get('id', ''),
                'name': node.get('name', 'Unnamed Step'),
                'type': node.get('type', 'unknown'),
                'parameters': node.get('parameters', {}),
                'credentials': node.get('credentials', {}),
                'position': node.get('position', {})
            }
            steps.append(step)
        
        # Sort by execution order (simplified - use topological sort in production)
        steps = self.sort_by_execution_order(steps, connections)
        
        complexity = self.calculate_complexity(steps)
        
        return {
            'name': workflow.get('name', 'Untitled Workflow'),
            'platform': 'n8n',
            'steps': steps,
            'complexity': complexity,
            'connections': connections,
            'metadata': {
                'created_at': workflow.get('createdAt'),
                'updated_at': workflow.get('updatedAt'),
                'tags': workflow.get('tags', [])
            }
        }
    
    def sort_by_execution_order(self, steps: List[Dict], connections: Dict) -> List[Dict]:
        """Sort steps by execution order"""
        # TODO: Implement proper topological sort using connections
        # For now, return as-is
        return steps
    
    def calculate_complexity(self, steps: List[Dict]) -> Dict[str, Any]:
        """Calculate workflow complexity"""
        score = len(steps) * 10
        
        # Check for loops, branches, AI, etc.
        has_loops = any('loop' in step['type'].lower() for step in steps)
        has_ai = any('openai' in step['type'].lower() or 'ai' in step['type'].lower() for step in steps)
        has_code = any('code' in step['type'].lower() or 'function' in step['type'].lower() for step in steps)
        
        if has_loops:
            score += 20
        if has_ai:
            score += 15
        if has_code:
            score += 25
        
        level = 'simple' if score < 30 else 'moderate' if score < 60 else 'complex'
        
        return {
            'score': min(score, 100),
            'level': level,
            'steps_count': len(steps),
            'has_loops': has_loops,
            'has_ai': has_ai,
            'has_custom_code': has_code
        }
