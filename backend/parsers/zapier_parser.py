from typing import Dict, Any, List

class ZapierParser:
    """Parse Zapier workflow JSON"""
    
    def parse(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Zapier JSON to standard format"""
        trigger = workflow.get('trigger', {})
        steps = workflow.get('steps', [])
        
        all_steps = [trigger] + steps
        
        parsed_steps = []
        for i, step in enumerate(all_steps):
            parsed_steps.append({
                'id': str(i),
                'name': step.get('app', 'Unknown') + ' - ' + step.get('action', 'Action'),
                'type': step.get('app', 'unknown'),
                'action': step.get('action', ''),
                'parameters': step.get('params', {})
            })
        
        return {
            'name': workflow.get('name', 'Untitled Zap'),
            'platform': 'zapier',
            'steps': parsed_steps,
            'complexity': {'score': len(parsed_steps) * 10, 'level': 'moderate', 'steps_count': len(parsed_steps)}
        }
