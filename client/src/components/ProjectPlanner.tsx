import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Code, Database, FileText, FolderPlus, PlusCircle, Server, Smartphone, Terminal, ChevronRight, Check, AlertTriangle, Loader, Archive, FolderTree, FileCode, Bot, Cpu, Brain } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Hook para detectar si es dispositivo móvil
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface FileTemplate {
  id: string;
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
  isDirectory: boolean;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: 'web' | 'mobile' | 'desktop';
  framework: string;
  checklist: ChecklistItem[];
  files: FileTemplate[];
  dependencies: string[];
  setupCommands: string[];
  architecture?: string;
  features?: string[];
}

interface CommandExecution {
  command: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  output: string;
  error?: string;
}

interface ProjectStructure {
  rootFolder: string;
  files: FileTemplate[];
  mainFiles: string[];
  configFiles: string[];
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  icon: React.ReactNode;
  isPro?: boolean;
}

const ProjectPlanner: React.FC = () => {
  const { setShowProjectPlanner, currentAgent, developmentMode, executeCommand, createFile } = useAppContext();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<number>(1);
  const [projectType, setProjectType] = useState<'web' | 'mobile' | 'desktop'>('web');
  const [projectName, setProjectName] = useState<string>('mi-proyecto');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [selectedDatabase, setSelectedDatabase] = useState<string>('none');
  const [additionalLibraries, setAdditionalLibraries] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [files, setFiles] = useState<FileTemplate[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [isExecutingCommand, setIsExecutingCommand] = useState<boolean>(false);
  const [commandOutput, setCommandOutput] = useState<string>('');
  const [setupCommands, setSetupCommands] = useState<string[]>([]);
  const [executionMode, setExecutionMode] = useState<'auto' | 'confirm'>('confirm');
  const [projectStructure, setProjectStructure] = useState<ProjectStructure | null>(null);
  const [commandHistory, setCommandHistory] = useState<CommandExecution[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [showAIModelSelector, setShowAIModelSelector] = useState<boolean>(false);
  const [selectedAIModel, setSelectedAIModel] = useState<string>('gpt-4o');

  // Modelos de IA disponibles
  const aiModels: AIModel[] = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: <Bot className="text-blue-400" /> },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', icon: <Bot className="text-blue-400" /> },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', icon: <Bot className="text-blue-400" /> },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', icon: <Cpu className="text-green-400" />, isPro: true },
    { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', icon: <Brain className="text-purple-400" /> },
    { id: 'claude-2.1', name: 'Claude 2.1', provider: 'Anthropic', icon: <Brain className="text-purple-400" /> }
  ];

  // Frameworks disponibles según el tipo de proyecto
  const frameworks = {
    web: [
    { id: 'react', name: 'React', description: 'Biblioteca para construir interfaces de usuario', setupCommand: 'npm create vite@latest [name] -- --template react-ts' },
    { id: 'vue', name: 'Vue.js', description: 'Framework progresivo para construir UI', setupCommand: 'npm create vite@latest [name] -- --template vue-ts' },
    { id: 'angular', name: 'Angular', description: 'Framework completo para aplicaciones web', setupCommand: 'npx @angular/cli new [name]' },
    { id: 'nextjs', name: 'Next.js', description: 'Framework React con renderizado del lado del servidor', setupCommand: 'npx create-next-app@latest [name]' },
    { id: 'svelte', name: 'Svelte', description: 'Compilador para crear aplicaciones web interactivas', setupCommand: 'npm create vite@latest [name] -- --template svelte-ts' }
    ],
    mobile: [
    { id: 'react-native', name: 'React Native', description: 'Framework para desarrollar aplicaciones móviles nativas', setupCommand: 'npx react-native init [name] --template react-native-template-typescript' },
    { id: 'flutter', name: 'Flutter', description: 'Framework de Google para crear aplicaciones móviles nativas', setupCommand: 'flutter create [name]' },
    { id: 'ionic', name: 'Ionic', description: 'Framework para crear aplicaciones híbridas', setupCommand: 'npm install -g @ionic/cli && ionic start [name] blank --type=angular' }
    ],
    desktop: [
    { id: 'electron', name: 'Electron', description: 'Framework para crear aplicaciones de escritorio con tecnologías web', setupCommand: 'npx create-electron-app [name]' },
    { id: 'tauri', name: 'Tauri', description: 'Framework para construir aplicaciones de escritorio más ligeras que Electron', setupCommand: 'npm create tauri-app@latest [name]' }
    ]
  };

  // Opciones de bases de datos
  const databases = [
    { id: 'mongodb', name: 'MongoDB', description: 'Base de datos NoSQL orientada a documentos' },
    { id: 'postgresql', name: 'PostgreSQL', description: 'Sistema de base de datos relacional de código abierto' },
    { id: 'mysql', name: 'MySQL', description: 'Sistema de gestión de bases de datos relacional' },
    { id: 'sqlite', name: 'SQLite', description: 'Biblioteca de bases de datos ligera basada en SQL' },
    { id: 'firebase', name: 'Firebase', description: 'Plataforma de desarrollo de aplicaciones de Google' }
  ];

  // Funciones auxiliares
  const getFrameworkById = (id: string) => {
    return [...frameworks.web, ...frameworks.mobile, ...frameworks.desktop].find(f => f.id === id);
  };

  const getAIModelById = (id: string) => {
    return aiModels.find(model => model.id === id);
  };

  // Generar checklist en base a las selecciones del usuario
  useEffect(() => {
    if (selectedFramework) {
    const framework = getFrameworkById(selectedFramework);
    if (!framework) return;

    const newChecklist: ChecklistItem[] = [
    {
    id: '1',
    title: `Crear proyecto ${framework.name}`,
    description: `Inicializar un proyecto ${framework.name} con la estructura básica`,
    completed: false
    },
    {
    id: '2',
    title: 'Instalar dependencias',
    description: 'Instalar las dependencias básicas del proyecto',
    completed: false
    }
    ];

    if (selectedDatabase && selectedDatabase !== 'none') {
    newChecklist.push({
    id: '3',
    title: `Configurar ${selectedDatabase}`,
    description: `Integrar la base de datos ${selectedDatabase} con el proyecto`,
    completed: false
    });
    }

    // Añadir elementos según el tipo de proyecto
    if (projectType === 'web') {
    newChecklist.push({
    id: '4',
    title: 'Configurar rutas',
    description: 'Configurar la estructura de rutas y navegación',
    completed: false
    });
    } else if (projectType === 'mobile') {
    newChecklist.push({
    id: '4',
    title: 'Configurar navegación',
    description: 'Establecer la navegación entre pantallas',
    completed: false
    });
    } else if (projectType === 'desktop') {
    newChecklist.push({
    id: '4',
    title: 'Configurar ventana principal',
    description: 'Configurar la ventana principal de la aplicación',
    completed: false
    });
    }

    // Añadir pasos comunes
    newChecklist.push({
    id: '5',
    title: 'Crear componentes básicos',
    description: 'Implementar los componentes básicos de la interfaz',
    completed: false
    });

    setChecklist(newChecklist);

    // Generar comandos de instalación
    const commands = [];
    let setupCommand = framework.setupCommand.replace('[name]', projectName);
    commands.push(setupCommand);

    if (selectedDatabase === 'mongodb') {
    commands.push(`cd ${projectName} && npm install mongoose dotenv`);
    } else if (selectedDatabase === 'postgresql' || selectedDatabase === 'mysql') {
    commands.push(`cd ${projectName} && npm install sequelize`);
    commands.push(`cd ${projectName} && npm install ${selectedDatabase === 'postgresql' ? 'pg pg-hstore' : 'mysql2'}`);
    } else if (selectedDatabase === 'firebase') {
    commands.push(`cd ${projectName} && npm install firebase`);
    }

    setSetupCommands(commands);
    }
  }, [selectedFramework, selectedDatabase, projectName, projectType]);

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  // Función para retroceder al paso anterior
  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  // Función para ejecutar un comando según el modo seleccionado (autónomo o con confirmación)
  const executeSetupCommand = async (command: string, index: number) => {
    setIsExecutingCommand(true);
    setCurrentTaskIndex(index);

    // Actualizar el historial de comandos con el nuevo comando a ejecutar
    setCommandHistory(prev => [...prev, {
    command,
    status: 'running',
    output: 'Ejecutando comando...'
    }]);

    try {
    // En modo automático ejecutamos directamente
    if (executionMode === 'auto') {
    setCommandOutput(`Ejecutando: ${command}`);

    const output = await executeCommand(command);
    setCommandOutput(output);

    // Actualizar el historial de comandos
    setCommandHistory(prev => {
    const updated = [...prev];
    const lastIndex = updated.length - 1;
    updated[lastIndex] = {
    ...updated[lastIndex],
    status: 'completed',
    output
    };
    return updated;
    });

    // Actualizar checklist
    const updatedChecklist = [...checklist];
    if (updatedChecklist[index]) {
    updatedChecklist[index].completed = true;
    }
    setChecklist(updatedChecklist);

    // Verificar si se están creando archivos o carpetas y actualizarlos en el explorador
    if (command.includes('mkdir') || command.includes('touch') || command.includes('create-react-app')) {
    // Simular actualización del explorador de archivos
    updateProjectStructure(command);
    }

    // Desplazar al final del scroll automáticamente
    if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Avanzar al siguiente comando si existe
    if (index < setupCommands.length - 1) {
    setTimeout(() => {
    executeSetupCommand(setupCommands[index + 1], index + 1);
    }, 1500);
    } else {
    finalizeProjectCreation();
    }
    } else {
    // En modo con confirmación solo mostramos el comando y esperamos confirmación
    setCommandOutput(`Listo para ejecutar: ${command}`);
    }
    } catch (error) {
    console.error('Error al ejecutar comando:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido';

    setCommandOutput(`Error: ${errorMessage}`);

    // Actualizar el historial de comandos con el error
    setCommandHistory(prev => {
    const updated = [...prev];
    const lastIndex = updated.length - 1;
    updated[lastIndex] = {
    ...updated[lastIndex],
    status: 'error',
    output: `Error: ${errorMessage}`,
    error: errorMessage
    };
    return updated;
    });

    setIsExecutingCommand(false);
    } finally {
    if (executionMode !== 'auto') {
    setIsExecutingCommand(false);
    }
    }
  };

  // Función para actualizar la visualización de la estructura del proyecto
  const updateProjectStructure = (command: string) => {
    // Analizar el comando para determinar qué archivos o carpetas se están creando
    const newStructure: ProjectStructure = projectStructure ? {...projectStructure} : {
    rootFolder: projectName,
    files: [],
    mainFiles: [],
    configFiles: []
    };

    // Detectar creación de carpetas
    if (command.includes('mkdir')) {
    const folderMatch = command.match(/mkdir\s+([^\s]+)/);
    if (folderMatch && folderMatch[1]) {
    const folderName = folderMatch[1];
    newStructure.files.push({
    id: `folder-${Date.now()}`,
    name: folderName,
    path: `/${folderName}`,
    language: '',
    description: 'Carpeta del proyecto',
    content: '',
    isDirectory: true
    });
    }
    }

    // Detectar creación de archivos
    if (command.includes('touch')) {
    const fileMatch = command.match(/touch\s+([^\s]+)/);
    if (fileMatch && fileMatch[1]) {
    const fileName = fileMatch[1];
    const isConfig = fileName.includes('config') || fileName.includes('json');

    newStructure.files.push({
    id: `file-${Date.now()}`,
    name: fileName,
    path: `/${fileName}`,
    language: fileName.endsWith('.js') ? 'javascript' : 
    fileName.endsWith('.html') ? 'html' : 
    fileName.endsWith('.css') ? 'css' : 
    fileName.endsWith('.json') ? 'json' : '',
    description: `Archivo ${isConfig ? 'de configuración' : ''} del proyecto`,
    content: '',
    isDirectory: false
    });

    if (isConfig) {
    newStructure.configFiles.push(fileName);
    } else if (fileName.includes('index')) {
    newStructure.mainFiles.push(fileName);
    }
    }
    }

    // Detectar creación de proyectos con create-react-app u otros creadores
    if (command.includes('create-react-app')) {
    // Simular la estructura básica de un proyecto React
    newStructure.files.push(
    {
    id: `folder-src-${Date.now()}`,
    name: 'src',
    path: `/src`,
    language: '',
    description: 'Carpeta de código fuente',
    content: '',
    isDirectory: true
    },
    {
    id: `folder-public-${Date.now()}`,
    name: 'public',
    path: `/public`,
    language: '',
    description: 'Carpeta de archivos públicos',
    content: '',
    isDirectory: true
    },
    {
    id: `file-package-${Date.now()}`,
    name: 'package.json',
    path: `/package.json`,
    language: 'json',
    description: 'Configuración del proyecto',
    content: '',
    isDirectory: false
    },
    {
    id: `file-index-${Date.now()}`,
    name: 'index.js',
    path: `/src/index.js`,
    language: 'javascript',
    description: 'Punto de entrada del proyecto',
    content: '',
    isDirectory: false
    }
    );

    newStructure.mainFiles.push('index.js');
    newStructure.configFiles.push('package.json');
    }

    setProjectStructure(newStructure);
  };

  // Finalizar la creación del proyecto
  const finalizeProjectCreation = () => {
    setIsCreatingProject(false);
    setShowSuccessMessage(true);
    setTimeout(() => {
    setShowSuccessMessage(false);
    }, 5000);
  };

  // Iniciar la creación del proyecto
  const startProjectCreation = () => {
    setIsCreatingProject(true);

    if (setupCommands.length > 0) {
    executeSetupCommand(setupCommands[0], 0);
    } else {
    setIsCreatingProject(false);
    }
  };

  // Confirmar ejecución de un comando (para modo interactivo)
  const confirmCommandExecution = async () => {
    if (currentTaskIndex < setupCommands.length) {
    try {
    setIsExecutingCommand(true);
    const output = await executeCommand(setupCommands[currentTaskIndex]);
    setCommandOutput(output);

    // Actualizar checklist
    const updatedChecklist = [...checklist];
    if (updatedChecklist[currentTaskIndex]) {
    updatedChecklist[currentTaskIndex].completed = true;
    }
    setChecklist(updatedChecklist);

    // Avanzar al siguiente comando
    if (currentTaskIndex < setupCommands.length - 1) {
    setCurrentTaskIndex(prev => prev + 1);
    setCommandOutput(`Listo para ejecutar: ${setupCommands[currentTaskIndex + 1]}`);
    } else {
    setIsCreatingProject(false);
    }
    } catch (error) {
    console.error('Error al ejecutar comando:', error);
    setCommandOutput(`Error: ${error instanceof Error ? error.message : 'Ocurrió un error desconocido'}`);
    } finally {
    setIsExecutingCommand(false);
    }
    }
  };

  // Usar el hook para detectar si es móvil
  const isMobile = useIsMobile();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`bg-slate-900 rounded-lg shadow-xl ${isMobile ? 'w-full h-full max-h-[100vh]' : 'max-w-5xl w-full max-h-[90vh]'} overflow-hidden flex flex-col`}
    >
    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
    <h2 className="text-xl font-bold">Planificador de Proyectos</h2>
    <Button variant="ghost" size="icon" onClick={() => setShowProjectPlanner(false)}>
    <span className="sr-only">Cerrar</span>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
    </Button>
    </div>

    <ScrollArea className="flex-1 p-6">
    {!isCreatingProject ? (
    <>
    {step === 1 && (
    <div className="space-y-6">
    <h3 className="text-lg font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-600">
    <span className="codestorm-logo mr-2">CODESTORM</span>
    Plan de Desarrollo de Proyectos
    </h3>

    {/* Selector de Modelo de IA */}
    <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-md mb-6">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium flex items-center">
          <Bot size={18} className="mr-2 text-blue-400" />
          Modelo de IA
        </h4>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-xs"
          onClick={() => setShowAIModelSelector(!showAIModelSelector)}
        >
          {showAIModelSelector ? 'Cerrar' : 'Cambiar modelo'}
        </Button>
      </div>

      <div className="flex items-center space-x-2 p-2 bg-slate-900 rounded-md">
        {getAIModelById(selectedAIModel)?.icon}
        <div>
          <div className="font-medium">{getAIModelById(selectedAIModel)?.name}</div>
          <div className="text-xs text-slate-400">{getAIModelById(selectedAIModel)?.provider}</div>
        </div>
        {getAIModelById(selectedAIModel)?.isPro && (
          <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-amber-900/60 text-amber-300 rounded-full border border-amber-700">PRO</span>
        )}
      </div>

      {showAIModelSelector && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 border-t border-slate-700 pt-3"
        >
          <div className="text-xs text-slate-400 mb-2">Selecciona un modelo de IA para asistirte:</div>

          {/* Sección OpenAI */}
          <div className="mb-3">
            <div className="text-xs font-medium text-slate-500 mb-1.5">OpenAI</div>
            <div className="space-y-1.5">
              {aiModels.filter(m => m.provider === 'OpenAI').map(model => (
                <div 
                  key={model.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${selectedAIModel === model.id ? 'bg-blue-900/30 border border-blue-800' : 'hover:bg-slate-800'}`}
                  onClick={() => setSelectedAIModel(model.id)}
                >
                  <div className="mr-2">{model.icon}</div>
                  <div className="text-sm">{model.name}</div>
                  {selectedAIModel === model.id && (
                    <Check size={16} className="ml-auto text-blue-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sección Google */}
          <div className="mb-3">
            <div className="text-xs font-medium text-slate-500 mb-1.5">Google</div>
            <div className="space-y-1.5">
              {aiModels.filter(m => m.provider === 'Google').map(model => (
                <div 
                  key={model.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${selectedAIModel === model.id ? 'bg-green-900/30 border border-green-800' : 'hover:bg-slate-800'}`}
                  onClick={() => setSelectedAIModel(model.id)}
                >
                  <div className="mr-2">{model.icon}</div>
                  <div className="text-sm">{model.name}</div>
                  {model.isPro && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-amber-900/60 text-amber-300 rounded-full border border-amber-700 mr-2">PRO</span>
                  )}
                  {selectedAIModel === model.id && (
                    <Check size={16} className="ml-auto text-green-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sección Anthropic */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1.5">Anthropic</div>
            <div className="space-y-1.5">
              {aiModels.filter(m => m.provider === 'Anthropic').map(model => (
                <div 
                  key={model.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${selectedAIModel === model.id ? 'bg-purple-900/30 border border-purple-800' : 'hover:bg-slate-800'}`}
                  onClick={() => setSelectedAIModel(model.id)}
                >
                  <div className="mr-2">{model.icon}</div>
                  <div className="text-sm">{model.name}</div>
                  {selectedAIModel === model.id && (
                    <Check size={16} className="ml-auto text-purple-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>

    <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-md mb-6">
    <h4 className="text-sm font-medium flex items-center">
    <AlertTriangle size={18} className="mr-2 text-amber-400" />
    Modo de ejecución
    </h4>
    <div className="flex items-center justify-between mt-2">
    <div className="text-sm text-slate-300">
    <div className="font-medium text-white">Selecciona cómo quieres que se ejecuten los comandos:</div>
    <p className="mt-1 text-sm text-slate-300">
    {executionMode === 'auto' 
    ? 'Se ejecutarán todos los comandos automáticamente sin intervención.' 
    : 'Se te pedirá confirmación antes de ejecutar cada comando.'}
    </p>
    </div>
    <div className="flex items-center space-x-2">
    <span className={`text-xs ${executionMode === 'confirm' ? 'text-amber-400' : 'text-slate-400'}`}>Con confirmación</span>
    <Switch 
    checked={executionMode === 'auto'}
    onCheckedChange={(checked) => setExecutionMode(checked ? 'auto' : 'confirm')}
    />
    <span className={`text-xs ${executionMode === 'auto' ? 'text-amber-400' : 'text-slate-400'}`}>Automático</span>
    </div>
    </div>
    </div>

    <div className="space-y-4">
    <div>
    <Label htmlFor="project-name">Nombre del Proyecto</Label>
    <Input
    id="project-name"
    value={projectName}
    onChange={(e) => setProjectName(e.target.value)}
    placeholder="mi-proyecto"
    className="bg-slate-800 border-slate-700 mt-1"
    />
    </div>

    <div>
    <Label htmlFor="project-description">Descripción (opcional)</Label>
    <Input
    id="project-description"
    value={projectDescription}
    onChange={(e) => setProjectDescription(e.target.value)}
    placeholder="Una breve descripción del proyecto..."
    className="bg-slate-800 border-slate-700 mt-1"
    />
    </div>

    <div>
    <Label>Tipo de Proyecto</Label>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
    <Card 
    className={`cursor-pointer transition-colors ${projectType === 'web' ? 'bg-blue-900 border-blue-700' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`}
    onClick={() => setProjectType('web')}
    >
    <CardContent className="p-4 flex items-center space-x-3">
    <div className="bg-blue-800 p-2 rounded-full">
    <Code size={20} />
    </div>
    <div>
    <CardTitle className="text-base">Aplicación Web</CardTitle>
    <CardDescription className="text-xs">React, Vue, Angular, etc.</CardDescription>
    </div>
    </CardContent>
    </Card>

    <Card 
    className={`cursor-pointer transition-colors ${projectType === 'mobile' ? 'bg-purple-900 border-purple-700' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`}
    onClick={() => setProjectType('mobile')}
    >
    <CardContent className="p-4 flex items-center space-x-3">
    <div className="bg-purple-800 p-2 rounded-full">
    <Smartphone size={20} />
    </div>
    <div>
    <CardTitle className="text-base">Aplicación Móvil</CardTitle>
    <CardDescription className="text-xs">React Native, Flutter, etc.</CardDescription>
    </div>
    </CardContent>
    </Card>

    <Card 
    className={`cursor-pointer transition-colors ${projectType === 'desktop' ? 'bg-green-900 border-green-700' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`}
    onClick={() => setProjectType('desktop')}
    >
    <CardContent className="p-4 flex items-center space-x-3">
    <div className="bg-green-800 p-2 rounded-full">
    <Terminal size={20} />
    </div>
    <div>
    <CardTitle className="text-base">Aplicación de Escritorio</CardTitle>
    <CardDescription className="text-xs">Electron, Tauri, etc.</CardDescription>
    </div>
    </CardContent>
    </Card>
    </div>
    </div>
    </div>

    <div className="pt-4 flex justify-end">
    <Button onClick={nextStep} disabled={!projectName}>
    Siguiente <ChevronRight className="ml-1 h-4 w-4" />
    </Button>
    </div>
    </div>
    )}

    {step === 2 && (
    <div className="space-y-6">
    <h3 className="text-lg font-semibold mb-4">Tecnologías y Framework</h3>

    <div className="space-y-6">
    <div>
    <Label>Selecciona un Framework</Label>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
    {frameworks[projectType].map(framework => (
    <Card 
    key={framework.id}
    className={`cursor-pointer transition-colors ${selectedFramework === framework.id ? 'bg-blue-900 border-blue-700' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`}
    onClick={() => setSelectedFramework(framework.id)}
    >
    <CardContent className="p-4">
    <div className="flex justify-between items-start">
    <div>
    <CardTitle className="text-base">{framework.name}</CardTitle>
    <CardDescription className="text-xs mt-1">{framework.description}</CardDescription>
    </div>
    {selectedFramework === framework.id && (
    <div className="bg-blue-700 rounded-full p-1">
    <Check size={14} />
    </div>
    )}
    </div>
    </CardContent>
    </Card>
    ))}
    </div>
    </div>

    <div>
    <Label>Base de Datos (opcional)</Label>
    <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
    <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
    <SelectValue placeholder="Selecciona una base de datos (opcional)" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="none">Ninguna</SelectItem>
    {databases.map(db => (
    <SelectItem key={db.id} value={db.id}>{db.name}</SelectItem>
    ))}
    </SelectContent>
    </Select>
    </div>
    </div>

    <div className="pt-4 flex justify-between">
    <Button variant="outline" onClick={prevStep}>
    Atrás
    </Button>
    <Button onClick={nextStep} disabled={!selectedFramework}>
    Siguiente <ChevronRight className="ml-1 h-4 w-4" />
    </Button>
    </div>
    </div>
    )}

    {step === 3 && (
    <div className="space-y-6">
    <h3 className="text-lg font-semibold mb-4">Plan de Implementación</h3>

    <div className="space-y-6">
    <Card className="bg-slate-800 border-slate-700">
    <CardHeader>
    <CardTitle className="text-base">Lista de verificación</CardTitle>
    <CardDescription>Pasos para implementar tu proyecto</CardDescription>
    </CardHeader>
    <CardContent>
    <ul className="space-y-2">
    {checklist.map((item, index) => (
    <li key={item.id} className="flex items-start space-x-2">
    <div className={`mt-0.5 flex-shrink-0 rounded-full p-0.5 ${item.completed ? 'bg-green-600' : 'bg-slate-600'}`}>
    <CheckSquare size={16} />
    </div>
    <div>
    <div className="font-medium">{item.title}</div>
    <div className="text-xs text-slate-400">{item.description}</div>
    </div>
    </li>
    ))}
    </ul>
    </CardContent>
    </Card>

    <Card className="bg-slate-800 border-slate-700">
    <CardHeader>
    <CardTitle className="text-base">Comandos a ejecutar</CardTitle>
    <CardDescription>Estos comandos se ejecutarán para configurar tu proyecto</CardDescription>
    </CardHeader>
    <CardContent>
    <div className="bg-slate-900 rounded-md p-3 text-xs font-mono">
    {setupCommands.map((command, index) => (
    <div key={index} className="mb-2">
    <code className="text-green-400">$ {command}</code>
    </div>
    ))}
    </div>
    </CardContent>
    </Card>

    <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-md">
    <h4 className="text-sm font-medium flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
    </svg>
    Modo de ejecución: {developmentMode === 'autonomous' ? 'Autónomo' : 'Con confirmación'}
    </h4>
    <p className="mt-1 text-sm text-slate-300">
    {developmentMode === 'autonomous' 
    ? 'Se ejecutarán todos los comandos automáticamente sin necesidad de confirmación.' 
    : 'Se te pedirá confirmación antes de ejecutar cada comando.'}
    </p>
    </div>
    </div>

    <div className="pt-4 flex justify-between">
    <Button variant="outline" onClick={prevStep}>
    Atrás
    </Button>
    <Button onClick={startProjectCreation}>
    {developmentMode === 'autonomous' ? 'Crear Proyecto Automáticamente' : 'Iniciar Creación Guiada'}
    </Button>
    </div>
    </div>
    )}
    </>
    ) : (
    <div className="space-y-6" ref={scrollRef}>
    <h3 className="text-lg font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-600">
    <span className="codestorm-logo mr-2">CODESTORM</span>
    Creando Proyecto: {projectName}
    </h3>

    <div className="flex items-center space-x-3 mb-4">
    <div className={`h-2 flex-1 rounded-full ${executionMode === 'auto' ? 'bg-blue-900' : 'bg-amber-900'}`}>
    <div 
    className={`h-full rounded-full ${executionMode === 'auto' ? 'bg-blue-500' : 'bg-amber-500'}`} 
    style={{ width: `${(currentTaskIndex / setupCommands.length) * 100}%` }}
    ></div>
    </div>
    <div className="text-sm text-slate-300 whitespace-nowrap">
    Paso {currentTaskIndex + 1} de {setupCommands.length}
    </div>
    </div>

    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-5'} gap-4`}>
    <div className={`${isMobile ? '' : 'md:col-span-3'} space-y-4`}>
    <div className="bg-slate-800 rounded-md p-4">
    <div className="mb-2 flex justify-between items-center">
    <div className="font-medium flex items-center">
    {isExecutingCommand && (
    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
    )}
    {checklist[currentTaskIndex]?.title || 'Ejecutando comando'}
    </div>
    <div className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-100">
    {executionMode === 'auto' ? 'Modo automático' : 'Modo con confirmación'}
    </div>
    </div>
    <div className="text-sm text-slate-400 mb-3">{checklist[currentTaskIndex]?.description || ''}</div>

    <div className="bg-slate-900 rounded-md p-3 font-mono text-xs">
    <div className="mb-2">
    <span className="text-green-400">$ {setupCommands[currentTaskIndex]}</span>
    </div>
    {commandOutput && (
    <div className="text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto p-2 border-t border-slate-700">
    {commandOutput}
    </div>
    )}
    </div>

    <AnimatePresence>
    {showSuccessMessage && (
    <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-md"
    >
    <div className="flex items-center">
    <Check className="h-5 w-5 text-green-400 mr-2" />
    <p className="text-green-200">¡Proyecto creado exitosamente!</p>
    </div>
    </motion.div>
    )}
    </AnimatePresence>
    </div>

    {/* Historial de comandos ejecutados */}
    {commandHistory.length > 0 && (
    <div className="bg-slate-800 rounded-md p-4">
    <h4 className="font-medium mb-2 flex items-center">
    <Terminal size={16} className="mr-2" />
    Historial de comandos
    </h4>
    <div className="space-y-2 max-h-60 overflow-y-auto">
    {commandHistory.map((cmd, idx) => (
    <div key={idx} className="text-xs border-b border-slate-700 pb-2 last:border-0">
    <div className="flex items-center justify-between mb-1">
    <code className="text-amber-400">$ {cmd.command}</code>
    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
    cmd.status === 'completed' ? 'bg-green-900 text-green-300' :
    cmd.status === 'error' ? 'bg-red-900 text-red-300' :
    cmd.status === 'running' ? 'bg-blue-900 text-blue-300' :
    'bg-slate-700 text-slate-300'
    }`}>
    {cmd.status}
    </span>
    </div>
    {cmd.output && (
    <div className="text-slate-300 whitespace-pre-wrap max-h-20 overflow-y-auto pl-2 border-l-2 border-slate-700">
    {cmd.output.length > 100 ? cmd.output.substring(0, 100) + '...' : cmd.output}
    </div>
    )}
    </div>
    ))}
    </div>
    </div>
    )}

    {executionMode === 'confirm' && (
    <div className="flex justify-end space-x-2">
    <Button variant="outline" onClick={() => setIsCreatingProject(false)}>
    Cancelar
    </Button>
    <Button 
    onClick={confirmCommandExecution} 
    disabled={isExecutingCommand}
    className="bg-amber-600 hover:bg-amber-700"
    >
    {currentTaskIndex < setupCommands.length - 1 ? 'Ejecutar y Continuar' : 'Finalizar'}
    </Button>
    </div>
    )}
    </div>

    {/* Visualización de la estructura del proyecto */}
    <div className="md:col-span-2">
    <div className="bg-slate-800 rounded-md h-full p-4">
    <h4 className="font-medium mb-3 flex items-center">
    <FolderTree size={16} className="mr-2" />
    Estructura del Proyecto
    </h4>

    {projectStructure ? (
    <div className="space-y-2">
    <div className="flex items-center p-2 bg-slate-700 rounded-md">
    <FolderPlus size={18} className="text-amber-400 mr-2" />
    <span className="font-medium">{projectStructure.rootFolder}</span>
    </div>

    <div className="ml-4 space-y-1">
    {projectStructure.files.map((file) => (
    <motion.div 
    key={file.id}
    initial={{ opacity: 0, x: -5 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center p-1.5 hover:bg-slate-700 rounded"
    >
    {file.isDirectory ? (
    <FolderPlus size={16} className="text-amber-400 mr-2" />
    ) : (
    <FileCode size={16} className="text-blue-400 mr-2" />
    )}
    <span className="text-sm">{file.name}</span>
    </motion.div>
    ))}

    {/* Mostrar indicador si no hay archivos */}
    {projectStructure.files.length === 0 && (
    <div className="text-center py-8 text-slate-400 text-sm italic">
    No hay archivos creados todavía
    </div>
    )}
    </div>
    </div>
    ) : (
    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
    <Archive size={32} className="mb-2 opacity-50" />
    <p className="text-sm">La estructura del proyecto se mostrará aquí</p>
    </div>
    )}
    </div>
    </div>
    </div>
    </div>
    )}
    </ScrollArea>
    </motion.div>
    </div>
  );
};

export default ProjectPlanner;