import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AIModel } from '@/lib/aiService';

interface Project {
  id: string;
  name: string;
  description: string;
  tech_stack: string[];
  files: {
    path: string;
    content: string;
  }[];
}

interface AppContextType {
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  terminalLines: Array<{
    text: string;
    type: 'command' | 'output' | 'success' | 'error' | 'code';
    language?: string;
    code?: string;
  }>;
  addTerminalLine: (line: {
    text: string;
    type: 'command' | 'output' | 'success' | 'error' | 'code';
    language?: string;
    code?: string;
  }) => void;
  clearTerminal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [terminalLines, setTerminalLines] = useState<Array<{
    text: string;
    type: 'command' | 'output' | 'success' | 'error' | 'code';
    language?: string;
    code?: string;
  }>>([
    {
      text: 'Terminal CODESTORM iniciada. Ingresa "help" para ver comandos disponibles.',
      type: 'output'
    }
  ]);

  const addTerminalLine = (line: {
    text: string;
    type: 'command' | 'output' | 'success' | 'error' | 'code';
    language?: string;
    code?: string;
  }) => {
    setTerminalLines(prev => [...prev, line]);
  };

  const clearTerminal = () => {
    setTerminalLines([
      {
        text: 'Terminal limpiada. Ingresa "help" para ver comandos disponibles.',
        type: 'output'
      }
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        selectedModel,
        setSelectedModel,
        currentProject,
        setCurrentProject,
        terminalLines,
        addTerminalLine,
        clearTerminal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};