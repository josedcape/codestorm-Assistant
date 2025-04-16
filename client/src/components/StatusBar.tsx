import React from 'react';
import { useEditor } from '@/hooks/useEditor';

interface StatusBarProps {
  showTerminal: boolean;
  toggleTerminal: () => void;
  cursorPosition: { lineNumber: number; column: number } | null;
  language: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  showTerminal,
  toggleTerminal,
  cursorPosition,
  language
}) => {
  const { settings } = useEditor();
  
  return (
    <div className="bg-sidebar text-xs border-t border-border flex justify-between items-center px-3 py-1">
      <div className="flex space-x-4">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
          <span>Ready</span>
        </div>
        <button 
          onClick={toggleTerminal}
          className={`hover:bg-muted px-2 py-0.5 rounded ${showTerminal ? 'bg-muted' : ''}`}
        >
          Terminal
        </button>
      </div>
      <div className="flex space-x-4">
        {cursorPosition && (
          <button className="hover:bg-muted px-2 py-0.5 rounded">
            Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}
          </button>
        )}
        <button className="hover:bg-muted px-2 py-0.5 rounded">
          Spaces: {settings.tabSize}
        </button>
        <button className="hover:bg-muted px-2 py-0.5 rounded">UTF-8</button>
        <button className="hover:bg-muted px-2 py-0.5 rounded capitalize">
          {language}
        </button>
      </div>
    </div>
  );
};

export default StatusBar;
