import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Terminal, XCircle, Copy, Check, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface StatusBarProps {
  showTerminal?: boolean;
  toggleTerminal?: () => void;
  cursorPosition?: { lineNumber: number; column: number } | null;
  language?: string;
  line?: number;
  column?: number;
}

export default function StatusBar({ 
  toggleTerminal, 
  showTerminal,
  cursorPosition,
  language,
  line,
  column,
}: StatusBarProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  
  // Usar la posición del cursor pasada como prop o los valores individuales
  const currentLine = cursorPosition?.lineNumber || line || 1;
  const currentColumn = cursorPosition?.column || column || 1;
  const currentLanguage = language || 'javascript';
  
  const copyPosition = () => {
    navigator.clipboard.writeText(`Línea ${currentLine}, Columna ${currentColumn}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <footer className="h-6 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 px-4 flex items-center justify-between">
      {/* Información del cursor y lenguaje */}
      <div className="flex items-center space-x-4">
        {/* Lenguaje */}
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
          <span className="uppercase">{currentLanguage}</span>
        </div>
        
        {/* Posición del cursor */}
        <button
          onClick={copyPosition}
          className="flex items-center hover:text-white transition-colors"
          title="Copiar posición"
        >
          {isCopied ? (
            <Check size={10} className="mr-1 text-green-500" />
          ) : (
            <Copy size={10} className="mr-1" />
          )}
          <span>
            Ln {currentLine}, Col {currentColumn}
          </span>
        </button>
      </div>
      
      {/* Información de diagnóstico */}
      <div className="flex items-center space-x-4">
        {/* Errores y advertencias */}
        {(errors.length > 0 || warnings.length > 0) && (
          <div className="flex items-center space-x-2">
            {errors.length > 0 && (
              <div className="flex items-center" title={errors.join('\n')}>
                <XCircle size={10} className="mr-1 text-red-500" />
                <span>{errors.length} {errors.length === 1 ? 'error' : 'errores'}</span>
              </div>
            )}
            
            {warnings.length > 0 && (
              <div className="flex items-center" title={warnings.join('\n')}>
                <AlertCircle size={10} className="mr-1 text-yellow-500" />
                <span>{warnings.length} {warnings.length === 1 ? 'advertencia' : 'advertencias'}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Botón de terminal */}
        {toggleTerminal && (
          <button
            onClick={toggleTerminal}
            className={`flex items-center hover:text-white transition-colors ${showTerminal ? 'text-white' : ''}`}
            title={showTerminal ? 'Ocultar terminal' : 'Mostrar terminal'}
          >
            <Terminal size={10} className="mr-1" />
            <span>Terminal</span>
          </button>
        )}
      </div>
    </footer>
  );
}