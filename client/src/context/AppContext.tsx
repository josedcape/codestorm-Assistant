import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AIModel, AgentType, DevelopmentMode, Conversation, Message } from '@/lib/aiService';
import { v4 as uuidv4 } from 'uuid';

export interface FileInfo {
  id: string;
  name: string;
  path?: string;
  content: string;
  language: string;
  isDirectory?: boolean;
  children?: FileInfo[];
}

export interface EditorTab {
  id: string;
  filename: string;
  filepath: string;
  language: string;
  content: string;
  isDirty?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tech_stack: string[];
  files: FileInfo[];
}

export interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'success' | 'error' | 'code';
  language?: string;
  code?: string;
  fromVoice?: boolean;
}

interface AppContextType {
  // AI Model settings
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  
  // Agent settings
  currentAgent: AgentType;
  setCurrentAgent: (agent: AgentType) => void;
  
  // Development mode
  developmentMode: DevelopmentMode;
  setDevelopmentMode: (mode: DevelopmentMode) => void;
  
  // Project management
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  startNewProject: () => void;
  
  // Editor state
  activeTab: EditorTab | null;
  tabs: EditorTab[];
  openFile: (fileId: string, content: string, language: string, filepath: string, filename: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  
  // Terminal management
  terminalLines: TerminalLine[];
  addTerminalLine: (line: TerminalLine) => void;
  clearTerminal: () => void;
  
  // Conversations management
  conversations: Conversation[];
  currentConversation: Conversation | null;
  startNewConversation: () => void;
  addMessage: (content: string, role: 'user' | 'assistant' | 'system', code?: string, language?: string) => void;
  
  // UI State
  showFileExplorer: boolean;
  setShowFileExplorer: (show: boolean) => void;
  showAIAssistant: boolean;
  setShowAIAssistant: (show: boolean) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // AI Model settings
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o');
  const [currentAgent, setCurrentAgent] = useState<AgentType>('dev');
  const [developmentMode, setDevelopmentMode] = useState<DevelopmentMode>('interactive');

  // Project state
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  
  // Editor state
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTabState] = useState<EditorTab | null>(null);
  
  // Terminal state
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      text: 'Terminal CODESTORM iniciada. Ingresa "help" para ver comandos disponibles.',
      type: 'output'
    }
  ]);
  
  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  
  // UI State
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Terminal functions
  const addTerminalLine = (line: TerminalLine) => {
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
  
  // Editor functions
  const openFile = (fileId: string, content: string, language: string, filepath: string, filename: string) => {
    // Check if tab already exists
    const existingTab = tabs.find(tab => tab.filepath === filepath);
    if (existingTab) {
      setActiveTabState(existingTab);
      return;
    }
    
    // Create new tab
    const newTab: EditorTab = {
      id: fileId,
      content,
      language,
      filepath,
      filename,
      isDirty: false
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabState(newTab);
  };
  
  const closeTab = (tabId: string) => {
    // Remove tab
    const updatedTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(updatedTabs);
    
    // If closed tab was active, set a new active tab
    if (activeTab?.id === tabId) {
      setActiveTabState(updatedTabs.length > 0 ? updatedTabs[updatedTabs.length - 1] : null);
    }
  };
  
  const setActiveTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabState(tab);
    }
  };
  
  // Project functions
  const startNewProject = () => {
    const newProject: Project = {
      id: uuidv4(),
      name: 'Nuevo Proyecto',
      description: 'Proyecto creado con CODESTORM',
      tech_stack: ['javascript', 'react'],
      files: [
        {
          id: uuidv4(),
          name: 'app.js',
          path: '/src/app.js',
          content: `// Main application file
import { fetchData, processResults } from './utils.js';
import { apiClient } from './api.js';

class App {
  constructor() {
    this.data = [];
    this.isLoading = false;
    this.error = null;
  }

  async initialize() {
    try {
      this.isLoading = true;
      const response = await fetchData('/api/resources');
      this.data = processResults(response);
    } catch (err) {
      this.error = err.message;
      console.error('Failed to initialize:', err);
    } finally {
      this.isLoading = false;
    }
  }
}`,
          language: 'javascript'
        }
      ]
    };
    
    setCurrentProject(newProject);
    
    // Open the first file
    const firstFile = newProject.files[0];
    openFile(
      firstFile.id,
      firstFile.content,
      firstFile.language,
      firstFile.path || '',
      firstFile.name
    );
  };
  
  // Conversation functions
  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'Nueva conversación',
      messages: [],
      date: new Date(),
      model: selectedModel
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  };
  
  const addMessage = (content: string, role: 'user' | 'assistant' | 'system', code?: string, language?: string) => {
    if (!currentConversation) {
      startNewConversation();
    }
    
    const newMessage: Message = {
      id: uuidv4(),
      content,
      role,
      timestamp: new Date(),
      code,
      language
    };
    
    setCurrentConversation(prev => {
      if (!prev) return null;
      
      const updatedMessages = [...prev.messages, newMessage];
      const updatedConversation = {
        ...prev,
        messages: updatedMessages,
        // Update title if it's the first user message
        title: prev.messages.length === 0 && role === 'user' 
          ? content.substring(0, 30) + (content.length > 30 ? '...' : '') 
          : prev.title
      };
      
      // Update in conversations list
      setConversations(prevConvs => 
        prevConvs.map(conv => 
          conv.id === updatedConversation.id ? updatedConversation : conv
        )
      );
      
      return updatedConversation;
    });
  };

  return (
    <AppContext.Provider
      value={{
        selectedModel,
        setSelectedModel,
        currentAgent,
        setCurrentAgent,
        developmentMode,
        setDevelopmentMode,
        currentProject,
        setCurrentProject,
        startNewProject,
        activeTab,
        tabs,
        openFile,
        closeTab,
        setActiveTab,
        terminalLines,
        addTerminalLine,
        clearTerminal,
        conversations,
        currentConversation,
        startNewConversation,
        addMessage,
        showFileExplorer,
        setShowFileExplorer,
        showAIAssistant,
        setShowAIAssistant,
        showPreview,
        setShowPreview
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