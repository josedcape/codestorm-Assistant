
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { CheckSquare, Code, Database, FileText, FolderPlus, PlusCircle, Server, Smartphone, Terminal, ChevronRight, Check } from 'lucide-react';

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
}

const ProjectPlanner: React.FC = () => {
  const { setShowProjectPlanner, currentAgent, developmentMode, executeCommand, createFile } = useAppContext();
  
  const [step, setStep] = useState<number>(1);
  const [projectType, setProjectType] = useState<'web' | 'mobile' | 'desktop'>('web');
  const [projectName, setProjectName] = useState<string>('mi-proyecto');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [additionalLibraries, setAdditionalLibraries] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [files, setFiles] = useState<FileTemplate[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [isExecutingCommand, setIsExecutingCommand] = useState<boolean>(false);
  const [commandOutput, setCommandOutput] = useState<string>('');
  const [setupCommands, setSetupCommands] = useState<string[]>([]);
  
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

      if (selectedDatabase) {
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
    
    try {
      // En modo autónomo ejecutamos directamente
      if (developmentMode === 'autonomous') {
        const output = await executeCommand(command);
        setCommandOutput(output);
        
        // Actualizar checklist
        const updatedChecklist = [...checklist];
        if (updatedChecklist[index]) {
          updatedChecklist[index].completed = true;
        }
        setChecklist(updatedChecklist);
        
        // Avanzar al siguiente comando si existe
        if (index < setupCommands.length - 1) {
          setTimeout(() => {
            executeSetupCommand(setupCommands[index + 1], index + 1);
          }, 1000);
        } else {
          setIsCreatingProject(false);
        }
      } else {
        // En modo interactivo solo mostramos el comando y esperamos confirmación
        setCommandOutput(`Listo para ejecutar: ${command}`);
      }
    } catch (error) {
      console.error('Error al ejecutar comando:', error);
      setCommandOutput(`Error: ${error instanceof Error ? error.message : 'Ocurrió un error desconocido'}`);
      setIsExecutingCommand(false);
    } finally {
      if (developmentMode !== 'autonomous') {
        setIsExecutingCommand(false);
      }
    }
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
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
                  <h3 className="text-lg font-semibold mb-4">Información Básica del Proyecto</h3>
                  
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
                          <SelectItem value="">Ninguna</SelectItem>
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
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Creando Proyecto: {projectName}</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Progreso</h4>
                  <div className="text-sm text-slate-400">
                    Paso {currentTaskIndex + 1} de {setupCommands.length}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-md p-4 mb-4">
                  <div className="mb-2 flex justify-between">
                    <div className="font-medium">{checklist[currentTaskIndex]?.title || 'Ejecutando comando'}</div>
                    {isExecutingCommand && (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-slate-300">Ejecutando...</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-400 mb-3">{checklist[currentTaskIndex]?.description || ''}</div>
                  
                  <div className="bg-slate-900 rounded-md p-3 font-mono text-xs">
                    <div className="mb-2">
                      <span className="text-green-400">$ {setupCommands[currentTaskIndex]}</span>
                    </div>
                    {commandOutput && (
                      <div className="text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {commandOutput}
                      </div>
                    )}
                  </div>
                </div>

                {developmentMode === 'interactive' && (
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreatingProject(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={confirmCommandExecution} 
                      disabled={isExecutingCommand}
                    >
                      {currentTaskIndex < setupCommands.length - 1 ? 'Ejecutar y Continuar' : 'Finalizar'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </motion.div>
    </div>
  );
};

export default ProjectPlanner;
