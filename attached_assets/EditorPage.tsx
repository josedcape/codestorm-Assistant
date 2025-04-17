import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import FileExplorer from "@/components/FileExplorer";
import CodeEditor from "@/components/CodeEditor";
import AIAssistant from "@/components/AIAssistant";
import StatusBar from "@/components/StatusBar";
import ConversationManager from "@/components/ConversationManager";
import PreviewPane from "@/components/PreviewPane";
import ApiKeyConfig from "@/components/ApiKeyConfig";
import AgentSelector, { AgentType } from "@/components/AgentSelector";
import { Button } from "@/components/ui/button";
import useFileSystem from "@/hooks/useFileSystem";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  FolderOpen,
  MessageSquare,
  Bot,
  EyeIcon,
  Settings,
  MenuIcon,
  X,
  Code
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface EditorTab {
  id: string;
  filename: string;
  filepath: string;
  language: string;
  content: string;
}

const EditorPage: React.FC = () => {
  // Componentes de UI
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(true);
  const [showConversations, setShowConversations] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // Added settings state

  // Estado del editor
  const [activeLine, setActiveLine] = useState(5);
  const [activeColumn, setActiveColumn] = useState(12);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [tabs, setTabs] = useState<EditorTab[]>([]);

  // Configuración
  const [currentAgent, setCurrentAgent] = useState<AgentType>('dev');
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);

  // Responsividad
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");

  // Sistema de archivos
  const { files, folders, currentPath, loadFileContent, saveFile, createFile, createFolder, refreshFiles } = useFileSystem();

  // Initialize with default tabs for demonstration
  useEffect(() => {
    // Hide panels on mobile by default
    if (isMobile) {
      setShowFileExplorer(false);
      setShowAIAssistant(false);
      setShowConversations(false);
      setShowPreview(false);
    } else if (isTablet) {
      // En tablet, mostrar solo el explorador de archivos y el editor
      setShowFileExplorer(true);
      setShowAIAssistant(false);
      setShowConversations(false);
      setShowPreview(false);
    }

    // This should eventually come from the file system API
    // Using hardcoded examples for demonstration until connected to backend
    const initialTabs = [
      {
        id: "1",
        filename: "app.js",
        filepath: "/src/app.js",
        language: "javascript",
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
      const response = await fetchData('/api/resources'); // API call - potential issue point
      this.data = processResults(response);
    } catch (err) {
      this.error = err.message;
      console.error('Failed to initialize:', err);
    } finally {
      this.isLoading = false;
    }
  }
}`
      },
      {
        id: "2",
        filename: "utils.js",
        filepath: "/src/utils.js",
        language: "javascript",
        content: `// Utility functions

export function fetchData(url, options = {}) {
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      return response.json();
    });
}

export function processResults(data) {
  // Transform the data as needed
  return Array.isArray(data) ? data.map(item => ({
    ...item,
    processedAt: new Date().toISOString()
  })) : [];
}
`
      }
    ];

    setTabs(initialTabs);
    setActiveTab("1");
  }, [isMobile, isTablet]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleTabClose = (tabId: string) => {
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    } else if (newTabs.length === 0) {
      setActiveTab(null);
    }
  };

  const handleOpenFile = async (filepath: string, filename: string) => {
    // Check if file is already open in a tab
    const existingTab = tabs.find(tab => tab.filepath === filepath);
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    try {
      // In a real application, this would load the file content from the server
      const content = await loadFileContent(filepath);
      const fileExtension = filename.split('.').pop() || '';
      const language = getLanguageFromExtension(fileExtension);

      const newTab: EditorTab = {
        id: Date.now().toString(),
        filename,
        filepath,
        language,
        content
      };

      setTabs([...tabs, newTab]);
      setActiveTab(newTab.id);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const getLanguageFromExtension = (extension: string): string => {
    const extensionMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'sh': 'shell',
    };

    return extensionMap[extension.toLowerCase()] || 'plaintext';
  };

  const togglePanel = (panel: 'files' | 'assistant' | 'conversations' | 'preview' | 'settings') => {
    if (isMobile) {
      // En móvil, solo mostrar un panel a la vez
      setShowFileExplorer(panel === 'files' ? !showFileExplorer : false);
      setShowAIAssistant(panel === 'assistant' ? !showAIAssistant : false);
      setShowConversations(panel === 'conversations' ? !showConversations : false);
      setShowPreview(panel === 'preview' ? !showPreview : false);
      setShowMobileDrawer(false);
    } else {
      // En escritorio, alternar el panel seleccionado
      switch (panel) {
        case 'files':
          setShowFileExplorer(!showFileExplorer);
          break;
        case 'assistant':
          setShowAIAssistant(!showAIAssistant);
          break;
        case 'conversations':
          setShowConversations(!showConversations);
          break;
        case 'preview':
          setShowPreview(!showPreview);
          break;
        case 'settings':
          setShowSettings(!showSettings);
          break;
      }
    }
  };

  const handleCodeChange = (tabId: string, newContent: string) => {
    const updatedTabs = tabs.map(tab => {
      if (tab.id === tabId) {
        return { ...tab, content: newContent };
      }
      return tab;
    });

    setTabs(updatedTabs);
  };

  const handleCursorPositionChange = (line: number, column: number) => {
    setActiveLine(line);
    setActiveColumn(column);
  };

  const handleSaveApiKeys = (keys: {
    openaiKey?: string;
    anthropicKey?: string;
    geminiKey?: string;
  }) => {
    console.log('Claves API guardadas:', keys);
    // Aquí se guardarían las claves en localStorage o en el servidor
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab) || null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-white font-sans">
      {/* Header principal */}
      <Header
        toggleFileExplorer={() => togglePanel('files')}
        toggleAIAssistant={() => togglePanel('assistant')}
        togglePreview={() => togglePanel('preview')}
        toggleSettings={() => togglePanel('settings')} // Use togglePanel for settings
      />

      {/* Contenido principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel lateral izquierdo - Conversaciones (solo visible si está activado) */}
        {showConversations && (
          <ConversationManager
            onSelectConversation={(id) => console.log('Conversación seleccionada:', id)}
            onNewConversation={() => console.log('Nueva conversación')}
            onDeleteConversation={(id) => console.log('Eliminar conversación:', id)}
            currentConversationId={undefined}
          />
        )}

        {/* Panel lateral izquierdo - Explorador de archivos (solo visible si está activado) */}
        {showFileExplorer && (
          <FileExplorer
            files={files}
            folders={folders}
            currentPath={currentPath}
            onOpenFile={handleOpenFile}
            onCreateFile={createFile}
            onCreateFolder={createFolder}
            onRefresh={refreshFiles}
          />
        )}

        {/* Editor de código (siempre visible) */}
        <CodeEditor
          activeTab={activeTabData}
          tabs={tabs}
          onTabChange={handleTabChange}
          onTabClose={handleTabClose}
          onCodeChange={handleCodeChange}
          onCursorPositionChange={handleCursorPositionChange}
        />

        {/* Panel de vista previa (solo visible si está activado) */}
        {showPreview && (
          <PreviewPane
            onClose={() => setShowPreview(false)}
            currentCode={activeTabData?.content || ""}
            isExpanded={isPreviewExpanded}
            onToggleExpand={() => setIsPreviewExpanded(!isPreviewExpanded)}
          />
        )}

        {/* Panel lateral derecho - Asistente de IA (solo visible si está activado) */}
        {showAIAssistant && (
          <AIAssistant
            onClose={() => setShowAIAssistant(false)}
            currentCode={activeTabData?.content || ""}
            currentLanguage={activeTabData?.language || ""}
          />
        )}
      </div>

      {/* Barra de estado */}
      <StatusBar
        line={activeLine}
        column={activeColumn}
        language={activeTabData?.language || ""}
      />

      {/* Controles móviles - Botones flotantes */}
      <div className="md:hidden flex fixed bottom-4 right-4 space-x-2 z-10">
        <Sheet open={showMobileDrawer} onOpenChange={setShowMobileDrawer}>
          <SheetTrigger asChild>
            <button
              className="bg-blue-800 hover:bg-blue-700 rounded-full w-14 h-14 flex items-center justify-center shadow-lg futuristic-button"
              onClick={() => setShowMobileDrawer(true)}
            >
              <MenuIcon size={22} className="text-white" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-slate-900 text-white border-t silver-border rounded-t-xl pb-8 h-auto max-h-[70vh]">
            <SheetHeader className="pb-4 border-b silver-border">
              <SheetTitle className="futuristic-title text-center">CODESTORM</SheetTitle>
            </SheetHeader>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <button
                className="flex flex-col items-center p-3 rounded-md bg-slate-800 hover:bg-slate-700"
                onClick={() => togglePanel('files')}
              >
                <FolderOpen size={24} className="mb-2 text-amber-400" />
                <span className="text-xs">Archivos</span>
              </button>

              <button
                className="flex flex-col items-center p-3 rounded-md bg-slate-800 hover:bg-slate-700"
                onClick={() => togglePanel('assistant')}
              >
                <Bot size={24} className="mb-2 text-amber-400" />
                <span className="text-xs">Asistente</span>
              </button>

              <button
                className="flex flex-col items-center p-3 rounded-md bg-slate-800 hover:bg-slate-700"
                onClick={() => togglePanel('conversations')}
              >
                <MessageSquare size={24} className="mb-2 text-amber-400" />
                <span className="text-xs">Conversaciones</span>
              </button>

              <button
                className="flex flex-col items-center p-3 rounded-md bg-slate-800 hover:bg-slate-700"
                onClick={() => togglePanel('preview')}
              >
                <EyeIcon size={24} className="mb-2 text-amber-400" />
                <span className="text-xs">Vista Previa</span>
              </button>

              <a href="#mobile-settings" className="flex flex-col items-center p-3 rounded-md bg-slate-800 hover:bg-slate-700">
                <Settings size={24} className="mb-2 text-amber-400" />
                <span className="text-xs">Configuración</span>
              </a>

              <SheetClose asChild>
                <button className="flex flex-col items-center p-3 rounded-md bg-slate-800 hover:bg-slate-700">
                  <X size={24} className="mb-2 text-amber-400" />
                  <span className="text-xs">Cerrar</span>
                </button>
              </SheetClose>
            </div>

            <div className="mt-6 px-2">
              <Tabs defaultValue="agent">
                <TabsList className="grid grid-cols-2 bg-slate-800 mb-4">
                  <TabsTrigger value="agent">Agente</TabsTrigger>
                  <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>

                <TabsContent value="agent" className="space-y-4">
                  <AgentSelector
                    currentAgent={currentAgent}
                    onAgentChange={setCurrentAgent}
                  />
                </TabsContent>

                <TabsContent value="settings" id="mobile-settings">
                  <ApiKeyConfig
                    onSaveKeys={handleSaveApiKeys}
                    onToggleAutoMode={setAutoModeEnabled}
                    autoModeEnabled={autoModeEnabled}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Barra de herramientas lateral (solo en escritorio) */}
      <div className="hidden md:flex fixed left-0 top-1/2 transform -translate-y-1/2 flex-col space-y-3 p-2 bg-slate-900 rounded-r-md shadow-md border-r border-t border-b silver-border z-10">
        <button
          onClick={() => togglePanel('files')}
          className={`p-2.5 rounded-md hover:bg-slate-800 transition-colors ${showFileExplorer ? 'bg-blue-900 text-white' : 'text-slate-400'}`}
          title="Explorador de archivos"
        >
          <FolderOpen size={18} />
        </button>

        <button
          onClick={() => togglePanel('conversations')}
          className={`p-2.5 rounded-md hover:bg-slate-800 transition-colors ${showConversations ? 'bg-blue-900 text-white' : 'text-slate-400'}`}
          title="Conversaciones"
        >
          <MessageSquare size={18} />
        </button>

        <button
          onClick={() => togglePanel('assistant')}
          className={`p-2.5 rounded-md hover:bg-slate-800 transition-colors ${showAIAssistant ? 'bg-blue-900 text-white' : 'text-slate-400'}`}
          title="Asistente IA"
        >
          <Bot size={18} />
        </button>

        <button
          onClick={() => togglePanel('preview')}
          className={`p-2.5 rounded-md hover:bg-slate-800 transition-colors ${showPreview ? 'bg-blue-900 text-white' : 'text-slate-400'}`}
          title="Vista previa"
        >
          <EyeIcon size={18} />
        </button>

        <div className="w-full h-px bg-slate-700 my-1"></div>

        <button
          onClick={() => togglePanel('settings')} // Use togglePanel for settings
          className={`p-2.5 rounded-md hover:bg-slate-800 transition-colors ${showSettings ? 'bg-blue-900 text-white' : 'text-slate-400'}`} // updated styling
          title="Configuración"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Panel flotante de configuración de agente (solo en escritorio) */}
      <div className={`hidden md:block fixed right-4 top-16 z-10 w-80 transition-opacity ${showAgentPanel ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="futuristic-container p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg gold-accent flex items-center">
              <Code size={18} className="mr-2" />
              Agente Activo
            </h3>
            <button
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              onClick={() => setShowAgentPanel(false)}
            >
              <X size={16} />
            </button>
          </div>

          <AgentSelector
            currentAgent={currentAgent}
            onAgentChange={(agent) => {
              setCurrentAgent(agent);
              console.log(`Agente cambiado a: ${agent}`);

              // Mostrar mensaje de éxito
              const agentNames = {
                'dev': 'Desarrollo',
                'arch': 'Arquitectura',
                'adv': 'Avanzado de Software'
              };

              // Aquí podríamos mostrar un toast de confirmación
              console.log(`Agente de ${agentNames[agent]} activado correctamente`);
            }}
          />

          {/* Botón de acción según el agente seleccionado */}
          <div className="mt-4">
            <button
              className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
                currentAgent === 'dev' ? 'bg-blue-900 hover:bg-blue-800' :
                  currentAgent === 'arch' ? 'bg-amber-900 hover:bg-amber-800' :
                    'bg-purple-900 hover:bg-purple-800'
              } futuristic-button`}
              onClick={() => {
                const actions = {
                  'dev': 'Revisar y optimizar el código actual',
                  'arch': 'Generar estructura del proyecto',
                  'adv': 'Configurar integraciones avanzadas'
                };
                console.log(`Acción del agente: ${actions[currentAgent]}`);
              }}
            >
              {currentAgent === 'dev' && 'Optimizar código'}
              {currentAgent === 'arch' && 'Planificar estructura'}
              {currentAgent === 'adv' && 'Gestionar integraciones'}
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end p-2 bg-slate-800"> {/* Added settings button */}
        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <Settings size={16} />
          <span>Ajustes</span>
        </Button>
      </div>
      {showSettings && (
        <div className="p-4 bg-slate-900 border border-slate-700 rounded-md m-2">
          <h2 className="text-white font-semibold mb-4">Configuración</h2>
          <ApiKeyConfig />
        </div>
      )}
    </div>
  );
};

export default EditorPage;