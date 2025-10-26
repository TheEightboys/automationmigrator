from typing import Dict, Any, List

class MakeParser:
    """Parse Make.com workflow JSON"""
    
    def parse(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Make JSON to standard format"""
        modules = workflow.get('flow', []) or workflow.get('modules', [])
        
        parsed_steps = []
        for i, module in enumerate(modules):
            parsed_steps.append({
                'id': str(i),
                'name': module.get('module', 'Unknown'),
                'type': module.get('type', 'unknown'),
                'parameters': module.get('parameters', {})
            })
        
        return {
            'name': workflow.get('name', 'Untitled Scenario'),
            'platform': 'make',
            'steps': parsed_steps,
            'complexity': {'score': len(parsed_steps) * 10, 'level': 'moderate', 'steps_count': len(parsed_steps)}
        }
