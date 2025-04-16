import React, { useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';

interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'success' | 'error' | 'code';
  language?: string;
  code?: string;
}

interface TerminalViewProps {
  lines?: TerminalLine[];
}

export default function TerminalView({ lines: propLines }: TerminalViewProps) {
  const { terminalLines } = useAppContext();
  const lines = propLines || terminalLines;
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);
  
  // Format code blocks with basic syntax highlighting
  const formatCode = (code: string, language: string = 'javascript') => {
    // Basic syntax highlighting for JS/TS
    if (language === 'javascript' || language === 'typescript') {
      // Replace keywords
      return code
        .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await)\b/g, '<span class="text-pink-400">$1</span>')
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-purple-400">$1</span>')
        .replace(/(['"])(?:\\\1|.)*?\1/g, '<span class="text-yellow-300">$&</span>')
        .replace(/\/\/.*/g, '<span class="text-gray-500">$&</span>')
        .replace(/\b(\d+)\b/g, '<span class="text-purple-300">$1</span>');
    }
    
    return code;
  };
  
  return (
    <div 
      ref={terminalRef}
      className="flex-grow bg-[#121212] rounded-lg font-mono p-4 overflow-y-auto text-sm"
    >
      <div className="text-cyan-400">
        {lines.map((line, index) => (
          <div key={index} className="mb-1">
            {line.type === 'command' && (
              <div className="mb-1">$ {line.text}</div>
            )}
            
            {line.type === 'output' && (
              <div className="text-gray-400 mb-3">{line.text}</div>
            )}
            
            {line.type === 'success' && (
              <div className="text-green-400 mb-3">✓ {line.text}</div>
            )}
            
            {line.type === 'error' && (
              <div className="text-red-400 mb-3">✗ {line.text}</div>
            )}
            
            {line.type === 'code' && line.code && (
              <div className="bg-[#1E1E1E] p-2 rounded my-2 text-gray-300">
                <pre dangerouslySetInnerHTML={{ __html: formatCode(line.code, line.language) }}></pre>
              </div>
            )}
          </div>
        ))}
        
        {/* Blinking cursor */}
        <div className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse"></div>
      </div>
    </div>
  );
}