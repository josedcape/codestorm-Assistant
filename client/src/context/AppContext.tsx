import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AIModel, AgentType, DevelopmentMode, Conversation, Message } from '@/lib/aiService';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'; // Added for API calls

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
  executeCommand: (command: string, workingDirectory?: string) => Promise<string>;
  showProjectPlanner: boolean;
  setShowProjectPlanner: (show: boolean) => void;


  // Conversations management
  conversations: Conversation[];
  currentConversation: Conversation | null;
  startNewConversation: () => void;
  addMessage: (content: string, role: 'user' | 'assistant' | 'system', code?: string, language?: string) => void;
  saveConversation: (title: string) => void;
  loadConversation: (conversation: Conversation) => void;
  clearConversation: () => void;
  deleteConversation: (id: string) => void;
  getSavedConversations: () => Conversation[];

  // UI State
  showFileExplorer: boolean;
  setShowFileExplorer: (show: boolean) => void;
  showAIAssistant: boolean;
  setShowAIAssistant: (show: boolean) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  showWebView: boolean;
  setShowWebView: (show: boolean) => void;
  isWebViewMaximized: boolean;
  setIsWebViewMaximized: (isMaximized: boolean) => void;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  isTerminalMaximized: boolean;
  setIsTerminalMaximized: (isMaximized: boolean) => void;
  updateFile: (id: string, data: Partial<FileInfo>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  createFile: (file: Partial<FileInfo>) => Promise<void>;
  refreshFiles: () => Promise<void>;

  // Code Correction Modal
  isCodeCorrectionModalOpen: boolean;
  selectedFileForCorrection: {
    name: string;
    content: string;
    path: string;
    language: string;
  } | null;
  openCodeCorrectionModal: (file: { name: string; content: string; path: string; language: string }) => void;
  closeCodeCorrectionModal: () => void;
  applyCodeCorrection: (path: string, content: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

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
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [showProjectPlanner, setShowProjectPlanner] = useState(false);

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

  const executeCommand = async (command: string, workingDirectory?: string, silent: boolean = false): Promise<string> => {
    try {
      // Agregar comando al terminal si no es silencioso
      if (!silent) {
        addTerminalLine({
          text: command,
          type: 'command'
        });
      }

      // Enviar solicitud a la API
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          command,
          workingDirectory
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.output || 'Error al ejecutar el comando';
        if (!silent) {
          addTerminalLine({
            text: errorMessage,
            type: 'error'
          });
        }
        throw new Error(errorMessage);
      }

      // Agregar salida al terminal si no es silencioso
      if (!silent) {
        addTerminalLine({
          text: data.output || '(No hay salida)',
          type: data.error ? 'error' : 'output'
        });
      }

      // Actualizar explorador de archivos después de ejecutar el comando
      await refreshFiles();

      return data.output || '';
    } catch (error) {
      console.error('Error al ejecutar comando:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      if (!silent) {
        addTerminalLine({
          text: errorMessage,
          type: 'error'
        });
      }

      throw error;
    }
  };

  // Función para ejecutar una serie de comandos en secuencia
  const executeCommandSequence = async (commands: string[], workingDirectory?: string, confirmEach: boolean = false): Promise<string[]> => {
    const results: string[] = [];
    
    try {
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        
        // Si estamos en modo confirmación, mostramos un mensaje y esperamos confirmación
        if (confirmEach && i > 0) {
          addTerminalLine({
            text: `Listo para ejecutar: ${command}`,
            type: 'code'
          });
          
          // En un escenario real, aquí se esperaría una confirmación del usuario
          // Por ahora, simulamos una espera con una promesa
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const output = await executeCommand(command, workingDirectory);
        results.push(output);
      }
      
      return results;
    } catch (error) {
      console.error('Error al ejecutar secuencia de comandos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      addTerminalLine({
        text: `Error en secuencia de comandos: ${errorMessage}`,
        type: 'error'
      });
      
      throw error;
    }
  };

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [savedConversations, setSavedConversations] = useState<Conversation[]>([]);

  // UI State
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [isWebViewMaximized, setIsWebViewMaximized] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(true);

  // Code Correction Modal State
  const [isCodeCorrectionModalOpen, setIsCodeCorrectionModalOpen] = useState(false);
  const [selectedFileForCorrection, setSelectedFileForCorrection] = useState<{
    name: string;
    content: string;
    path: string;
    language: string;
  } | null>(null);

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
      files: [] // Iniciar sin archivos
    };

    setCurrentProject(newProject);
    setTabs([]); // Limpiar pestañas abiertas
    setActiveTabState(null); // No hay pestaña activa inicialmente
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

  //Load and save conversations to local storage
  useEffect(() => {
    const saved = localStorage.getItem('codestorm_conversations');
    if (saved) {
      try {
        setSavedConversations(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('codestorm_conversations', JSON.stringify(savedConversations));
  }, [savedConversations]);


  const saveConversation = (title: string) => {
    if (!currentConversation || currentConversation.messages.length === 0) return;
    const conversationToSave = { ...currentConversation, title, timestamp: new Date() };
    setSavedConversations([...savedConversations, conversationToSave]);
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversation({ ...conversation, timestamp: new Date() });
  };

  const clearConversation = () => {
    setCurrentConversation({ id: uuidv4(), title: 'Nueva conversación', messages: [], date: new Date() });
  };

  const deleteConversation = (id: string) => {
    setSavedConversations(savedConversations.filter(conv => conv.id !== id));
  };

  const getSavedConversations = () => savedConversations;

  // File Management Functions
  const refreshFiles = async () => {
    try {
      const response = await axios.get('/api/files');
      if (response.data) {
        setCurrentProject({
          id: 'default-project',
          name: 'Mi Proyecto',
          description: '', // Added description
          tech_stack: [], // Added tech stack
          files: response.data
        });
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const updateFile = async (id: string, data: Partial<FileInfo>) => {
    try {
      await axios.put(`/api/files/${id}`, data);
      await refreshFiles();
    } catch (error) {
      console.error('Error updating file:', error);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      await axios.delete(`/api/files/${id}`);
      await refreshFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const createFile = async (file: Partial<FileInfo>) => {
    try {
      await axios.post('/api/files', file);
      await refreshFiles();
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  // Code Correction Modal Functions
  const openCodeCorrectionModal = (file: { name: string; content: string; path: string; language: string }) => {
    setSelectedFileForCorrection(file);
    setIsCodeCorrectionModalOpen(true);
  };

  const closeCodeCorrectionModal = () => {
    setIsCodeCorrectionModalOpen(false);
    setSelectedFileForCorrection(null);
  };

  const applyCodeCorrection = async (path: string, content: string): Promise<void> => {
    // Placeholder: Replace with actual file update logic
    try {
      console.log(`Aplicando correcciones al archivo: ${path}`);
      //  Implement your file update logic here.  Example using the existing updateFile function (assuming it exists and takes a path and content):
      // await updateFile(path, {content}); //this is  a placeholder
      return Promise.resolve();
    } catch (error) {
      console.error('Error al aplicar correcciones:', error);
      return Promise.reject(error);
    }
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
        saveConversation,
        loadConversation,
        clearConversation,
        deleteConversation,
        getSavedConversations,
        showFileExplorer,
        setShowFileExplorer,
        showAIAssistant,
        setShowAIAssistant,
        showPreview,
        setShowPreview,
        showWebView,
        setShowWebView,
        isWebViewMaximized,
        setIsWebViewMaximized,
        showTerminal,
        setShowTerminal,
        isTerminalMaximized,
        setIsTerminalMaximized,
        updateFile,
        deleteFile,
        createFile,
        refreshFiles,
        isCodeCorrectionModalOpen,
        selectedFileForCorrection,
        openCodeCorrectionModal,
        closeCodeCorrectionModal,
        applyCodeCorrection,
        executeCommand,
        showProjectPlanner,
        setShowProjectPlanner
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Removed duplicate useAppContext declaration