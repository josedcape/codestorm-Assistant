import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileInfo, TabInfo, EditorSettings } from '@/types';
import { generateUntitledFilename, getLanguageForFilename } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

// Define the EditorContext interface
interface EditorContextType {
  files: FileInfo[];
  tabs: TabInfo[];
  activeFile: FileInfo | null;
  settings: EditorSettings;
  cursorPosition: { lineNumber: number; column: number } | null;
  createNewFile: () => void;
  openFile: (fileId?: string) => void;
  closeFile: (fileId: string) => void;
  saveCurrentFile: () => Promise<void>;
  activateTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  updateSettings: (newSettings: EditorSettings) => void;
  updateCursorPosition: (position: { lineNumber: number; column: number }) => void;
}

// Default JavaScript content for new files
const DEFAULT_JAVASCRIPT_CONTENT = `/**
 * Main application file
 * This file contains the core functionality of the application
 */

// Initialize your code here
console.log('Hello, world!');

// Define your functions and classes
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Example class
class App {
  constructor() {
    this.name = 'CodeEdit App';
  }
  
  run() {
    console.log(\`Running \${this.name}\`);
  }
}

// Export as needed
export { greet, App };
`;

// Create the context with default values
const defaultEditorContext: EditorContextType = {
  files: [],
  tabs: [],
  activeFile: null,
  settings: {
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: false,
    autoSave: false,
  },
  cursorPosition: null,
  createNewFile: () => {},
  openFile: () => {},
  closeFile: () => {},
  saveCurrentFile: async () => {},
  activateTab: () => {},
  closeTab: () => {},
  updateFileContent: () => {},
  updateSettings: () => {},
  updateCursorPosition: () => {},
};

// Create the context
const EditorContext = createContext<EditorContextType>(defaultEditorContext);

// EditorProvider component props interface
interface EditorProviderProps {
  children: ReactNode;
}

// EditorProvider component
export const EditorProvider = ({ children }: EditorProviderProps) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [activeFile, setActiveFile] = useState<FileInfo | null>(null);
  const [settings, setSettings] = useState<EditorSettings>(defaultEditorContext.settings);
  const [cursorPosition, setCursorPosition] = useState<{ lineNumber: number; column: number } | null>(null);

  // Create a default file (for initial state or when no files exist)
  const createDefaultFile = (): FileInfo => {
    return {
      id: uuidv4(),
      name: 'main.js',
      content: DEFAULT_JAVASCRIPT_CONTENT,
      language: 'javascript',
    };
  };

  // Create a new tab
  const createTab = (file: FileInfo): TabInfo => {
    const newTab: TabInfo = {
      id: uuidv4(),
      fileId: file.id,
      name: file.name,
      isActive: true,
      isDirty: false,
    };

    // Deactivate all other tabs
    const updatedTabs = tabs.map(tab => ({
      ...tab,
      isActive: false,
    }));

    setTabs([...updatedTabs, newTab]);
    return newTab;
  };

  // Load files from backend on mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await apiRequest('GET', '/api/files', undefined);
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error('Failed to load files:', error);
        // Create a default file if none exist
        const defaultFile = createDefaultFile();
        setFiles([defaultFile]);
        createTab(defaultFile);
        setActiveFile(defaultFile);
      }
    };

    loadFiles();
  }, []);

  // Create a new file
  const createNewFile = async () => {
    try {
      const newFileName = generateUntitledFilename('javascript', files.map(f => f.name));
      const newFile: FileInfo = {
        id: uuidv4(),
        name: newFileName,
        content: DEFAULT_JAVASCRIPT_CONTENT,
        language: 'javascript',
      };

      // Save to backend
      await apiRequest('POST', '/api/files', newFile);

      // Update local state
      setFiles([...files, newFile]);
      createTab(newFile);
      setActiveFile(newFile);
    } catch (error) {
      console.error('Failed to create new file:', error);
      // Fallback: still create the file in memory
      const newFile: FileInfo = {
        id: uuidv4(),
        name: generateUntitledFilename('javascript', files.map(f => f.name)),
        content: DEFAULT_JAVASCRIPT_CONTENT,
        language: 'javascript',
      };
      
      setFiles([...files, newFile]);
      createTab(newFile);
      setActiveFile(newFile);
    }
  };

  // Open a file
  const openFile = async (fileId?: string) => {
    // If a fileId is provided, open that specific file
    if (fileId) {
      const fileToOpen = files.find(f => f.id === fileId);
      if (fileToOpen) {
        // Check if tab already exists
        const existingTab = tabs.find(t => t.fileId === fileId);
        if (existingTab) {
          activateTab(existingTab.id);
        } else {
          createTab(fileToOpen);
        }
        setActiveFile(fileToOpen);
      }
      return;
    }

    // Simulate a file open dialog
    const newFileName = prompt('Enter file name to open:');
    if (!newFileName) return;

    try {
      const fileLanguage = getLanguageForFilename(newFileName);
      const newFile: FileInfo = {
        id: uuidv4(),
        name: newFileName,
        content: '// New file content\n',
        language: fileLanguage,
      };

      // Save to backend
      await apiRequest('POST', '/api/files', newFile);

      // Update local state
      setFiles([...files, newFile]);
      createTab(newFile);
      setActiveFile(newFile);
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  // Close a file
  const closeFile = async (fileId: string) => {
    try {
      // Remove from backend
      await apiRequest('DELETE', `/api/files/${fileId}`, undefined);

      // Update local state
      const updatedFiles = files.filter(f => f.id !== fileId);
      setFiles(updatedFiles);

      // Close any tabs associated with this file
      const updatedTabs = tabs.filter(t => t.fileId !== fileId);
      setTabs(updatedTabs);

      // If the active file was closed, set a new active file
      if (activeFile && activeFile.id === fileId) {
        const lastTab = updatedTabs[updatedTabs.length - 1];
        if (lastTab) {
          const newActiveFile = updatedFiles.find(f => f.id === lastTab.fileId) || null;
          setActiveFile(newActiveFile);
          
          // Activate the last tab
          setTabs(updatedTabs.map(t => ({
            ...t,
            isActive: t.id === lastTab.id,
          })));
        } else {
          setActiveFile(null);
        }
      }
    } catch (error) {
      console.error('Failed to close file:', error);
    }
  };

  // Save the current file
  const saveCurrentFile = async () => {
    if (!activeFile) return;

    try {
      // Save to backend
      await apiRequest('PUT', `/api/files/${activeFile.id}`, activeFile);

      // Update tab to not be dirty
      const updatedTabs = tabs.map(tab => 
        tab.fileId === activeFile.id 
          ? { ...tab, isDirty: false } 
          : tab
      );
      setTabs(updatedTabs);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  // Activate a tab
  const activateTab = (tabId: string) => {
    const updatedTabs = tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId,
    }));

    setTabs(updatedTabs);

    // Set the active file
    const activeTab = updatedTabs.find(t => t.isActive);
    if (activeTab) {
      const fileToActivate = files.find(f => f.id === activeTab.fileId) || null;
      setActiveFile(fileToActivate);
    }
  };

  // Close a tab
  const closeTab = (tabId: string) => {
    const tabToClose = tabs.find(t => t.id === tabId);
    if (!tabToClose) return;

    // Remove the tab
    const updatedTabs = tabs.filter(t => t.id !== tabId);
    
    // If we closed the active tab, activate another tab
    if (tabToClose.isActive && updatedTabs.length > 0) {
      // Activate the next tab or the last tab
      const tabIndex = tabs.findIndex(t => t.id === tabId);
      const nextTab = updatedTabs[tabIndex] || updatedTabs[updatedTabs.length - 1];
      
      if (nextTab) {
        updatedTabs.forEach(t => {
          t.isActive = t.id === nextTab.id;
        });
        
        const fileToActivate = files.find(f => f.id === nextTab.fileId) || null;
        setActiveFile(fileToActivate);
      }
    }
    
    // If we closed the last tab, set activeFile to null
    if (updatedTabs.length === 0) {
      setActiveFile(null);
    }
    
    setTabs(updatedTabs);
  };

  // Update file content
  const updateFileContent = (fileId: string, content: string) => {
    // Update the file content
    const updatedFiles = files.map(file => 
      file.id === fileId 
        ? { ...file, content } 
        : file
    );
    setFiles(updatedFiles);

    // Set the corresponding tab as dirty
    const updatedTabs = tabs.map(tab => 
      tab.fileId === fileId 
        ? { ...tab, isDirty: true } 
        : tab
    );
    setTabs(updatedTabs);

    // Update active file if needed
    if (activeFile && activeFile.id === fileId) {
      setActiveFile({ ...activeFile, content });
    }

    // Auto-save if enabled
    if (settings.autoSave) {
      const fileToSave = updatedFiles.find(f => f.id === fileId);
      if (fileToSave) {
        apiRequest('PUT', `/api/files/${fileId}`, fileToSave).catch(err => {
          console.error('Auto-save failed:', err);
        });
      }
    }
  };

  // Update editor settings
  const updateSettings = (newSettings: EditorSettings) => {
    setSettings(newSettings);
    // In a real app, you might save settings to localStorage or backend
  };

  // Update cursor position
  const updateCursorPosition = (position: { lineNumber: number; column: number }) => {
    setCursorPosition(position);
  };

  // Create the context value
  const value: EditorContextType = {
    files,
    tabs,
    activeFile,
    settings,
    cursorPosition,
    createNewFile,
    openFile,
    closeFile,
    saveCurrentFile,
    activateTab,
    closeTab,
    updateFileContent,
    updateSettings,
    updateCursorPosition,
  };

  return React.createElement(
    EditorContext.Provider,
    { value },
    children
  );
};

// Custom hook to use the editor context
export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};