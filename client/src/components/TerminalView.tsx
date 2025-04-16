import React, { useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Terminal as TerminalIcon, Mic, FileCode, FolderPlus, File } from 'lucide-react';
import { motion } from 'framer-motion';

interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'success' | 'error' | 'code';
  language?: string;
  code?: string;
  fromVoice?: boolean;
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
    if (language === 'javascript' || language === 'typescript' || language === 'jsx' || language === 'tsx') {
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

  // Obtener icono según el tipo de comando
  const getCommandIcon = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('mkdir') || lowerText.includes('carpeta')) {
      return <FolderPlus size={14} className="mr-2 text-amber-400" />;
    }
    
    if (lowerText.includes('touch') || lowerText.includes('archivo') || lowerText.includes('create')) {
      return <File size={14} className="mr-2 text-blue-400" />;
    }
    
    if (lowerText.includes('npm') || lowerText.includes('install')) {
      return <FileCode size={14} className="mr-2 text-green-400" />;
    }
    
    if (lowerText.includes('voice') || lowerText.includes('voz')) {
      return <Mic size={14} className="mr-2 text-purple-400" />;
    }
    
    return <TerminalIcon size={14} className="mr-2 text-cyan-400" />;
  };
  
  return (
    <div 
      ref={terminalRef}
      className="flex-grow bg-[#121212] rounded-lg font-mono p-4 overflow-y-auto text-sm scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
    >
      <div className="text-cyan-400">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500 italic space-y-2">
            <TerminalIcon size={24} />
            <p>La terminal está lista para recibir comandos</p>
            <p className="text-xs">Puedes usar comandos por voz diciendo "crear archivo", "ejecutar", etc.</p>
          </div>
        ) : (
          lines.map((line, index) => (
            <motion.div 
              key={index} 
              className="mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {line.type === 'command' && (
                <div className="mb-1 flex items-start">
                  {getCommandIcon(line.text)}
                  <span className="text-green-400 mr-2">$</span>
                  <span className="text-cyan-100">{line.text}</span>
                  {line.fromVoice && (
                    <span className="ml-2 text-xs text-purple-400 px-1 rounded bg-purple-900 bg-opacity-30">
                      comando por voz
                    </span>
                  )}
                </div>
              )}
              
              {line.type === 'output' && (
                <div className="text-gray-400 mb-2 pl-6 border-l border-slate-800">{line.text}</div>
              )}
              
              {line.type === 'success' && (
                <div className="text-green-400 mb-2 flex items-start">
                  <span className="mr-2 ml-6">✓</span>
                  <span>{line.text}</span>
                </div>
              )}
              
              {line.type === 'error' && (
                <div className="text-red-400 mb-2 flex items-start">
                  <span className="mr-2 ml-6">✗</span>
                  <span>{line.text}</span>
                </div>
              )}
              
              {line.type === 'code' && (
                <div className="bg-[#1E1E1E] p-3 rounded-md my-2 ml-6 border-l-2 border-blue-500">
                  {line.language && (
                    <div className="text-xs text-slate-500 mb-2 flex items-center">
                      <FileCode size={12} className="mr-1" />
                      {line.language}
                    </div>
                  )}
                  <pre 
                    className="overflow-x-auto"
                    dangerouslySetInnerHTML={{ 
                      __html: formatCode(line.code || line.text, line.language)
                    }}
                  ></pre>
                </div>
              )}
            </motion.div>
          ))
        )}
        
        {/* Blinking cursor */}
        <div className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse"></div>
      </div>
    </div>
  );
}