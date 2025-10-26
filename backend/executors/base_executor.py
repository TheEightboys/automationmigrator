from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseExecutor(ABC):
    """Base class for step executors"""
    
    @abstractmethod
    async def execute(self, step: Dict[str, Any], data: Dict[str, Any], credentials: Dict[str, str]) -> Dict[str, Any]:
        """Execute a workflow step"""
        pass
