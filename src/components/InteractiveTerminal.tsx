// src/components/InteractiveTerminal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Minimize2, Maximize2, Trash2, Play } from 'lucide-react';

interface TerminalProps {
  workflowId?: string;
  onClose?: () => void;
}

export const InteractiveTerminal: React.FC<TerminalProps> = ({ workflowId, onClose }) => {
  const [output, setOutput] = useState<string[]>([
    '╔══════════════════════════════════════════════╗\n',
    '║  MigroMat Interactive Python Terminal v2.0  ║\n',
    '╚══════════════════════════════════════════════╝\n\n',
    '💡 Examples:\n',
    '  • print("Hello World")\n',
    '  • import sys; print(sys.version)\n',
    '  • pip install requests\n',
    '  • help - Show help\n',
    '  • clear - Clear screen\n\n'
  ]);
  const [input, setInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (inputRef.current && !minimized) {
      inputRef.current.focus();
    }
  }, [minimized]);

  const addOutput = (text: string, type: 'command' | 'output' | 'error' | 'success' = 'output') => {
    const timestamp = new Date().toLocaleTimeString();
    let formatted = '';
    
    if (type === 'command') {
      formatted = `\n[${timestamp}] >>> ${text}\n`;
    } else if (type === 'error') {
      formatted = `❌ ${text}\n`;
    } else if (type === 'success') {
      formatted = `✓ ${text}\n`;
    } else {
      formatted = `${text}\n`;
    }
    
    setOutput(prev => [...prev, formatted]);
  };

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    addOutput(cmd, 'command');
    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Built-in commands
    if (cmd === 'clear') {
      setOutput(['Terminal cleared\n\n']);
      return;
    }

    if (cmd === 'help') {
      addOutput(
        '═══════════════════════════════════\n' +
        'Available Commands:\n' +
        '═══════════════════════════════════\n' +
        '• clear - Clear terminal\n' +
        '• help - Show this help\n' +
        '• pip install <package> - Install Python package\n' +
        '• Any Python code - Execute directly\n\n' +
        'Examples:\n' +
        '  print("Hello")\n' +
        '  import requests; print(requests.__version__)\n' +
        '  for i in range(5): print(i)\n'
      );
      return;
    }

    // Execute via backend
    try {
      setExecuting(true);
      
      const response = await fetch('http://localhost:8000/api/execute/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cmd })
      });

      const result = await response.json();

      if (result.success) {
        addOutput(result.output || '✓ Success', 'output');
      } else {
        addOutput(result.error || 'Execution failed', 'error');
      }
    } catch (error: any) {
      addOutput(`Connection Error: ${error.message}\nMake sure backend is running on http://localhost:8000`, 'error');
    } finally {
      setExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !executing) {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  const clearTerminal = () => {
    setOutput(['Terminal cleared\n\n']);
  };

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-slate-900 rounded-lg shadow-2xl p-3 flex items-center gap-3 z-50">
        <Terminal size={20} className="text-green-400" />
        <span className="text-white font-semibold">Terminal</span>
        <button
          onClick={() => setMinimized(false)}
          className="p-1 hover:bg-slate-700 rounded"
        >
          <Maximize2 size={16} className="text-slate-400" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <X size={16} className="text-slate-400" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full lg:w-2/3 h-[500px] bg-slate-900 rounded-t-2xl shadow-2xl border-t-4 border-green-500 z-50 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full cursor-pointer hover:bg-red-400" onClick={onClose}></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer hover:bg-yellow-400" onClick={() => setMinimized(true)}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <Terminal size={18} className="text-green-400" />
          <span className="text-white font-bold">Python Terminal</span>
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Ready
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearTerminal}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Clear"
          >
            <Trash2 size={16} className="text-slate-400 hover:text-white" />
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Minimize"
          >
            <Minimize2 size={16} className="text-slate-400 hover:text-white" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded transition-colors"
              title="Close"
            >
              <X size={16} className="text-slate-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>

      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-black/50"
      >
        <pre className="text-green-400 whitespace-pre-wrap">
          {output.join('')}
        </pre>
        {executing && (
          <div className="flex items-center gap-2 text-yellow-400 animate-pulse mt-2">
            <Play size={14} className="animate-spin" />
            Executing...
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-700 bg-slate-800 flex items-center gap-2">
        <span className="text-green-400 font-mono font-bold">{'>>>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={executing}
          placeholder={executing ? "Executing..." : "Type Python code or pip command..."}
          className="flex-1 bg-transparent text-green-400 font-mono outline-none placeholder-slate-600"
          autoComplete="off"
        />
      </div>

      <div className="px-3 pb-3 flex gap-2 bg-slate-800 overflow-x-auto">
        {[
          { label: 'Help', cmd: 'help' },
          { label: 'Hello World', cmd: 'print("Hello, World!")' },
          { label: 'Version', cmd: 'import sys; print(f"Python {sys.version}")' },
          { label: 'Install Requests', cmd: 'pip install requests' },
          { label: 'Clear', cmd: 'clear' }
        ].map(({ label, cmd }) => (
          <button
            key={cmd}
            onClick={() => {
              setInput(cmd);
              inputRef.current?.focus();
            }}
            disabled={executing}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 rounded transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
