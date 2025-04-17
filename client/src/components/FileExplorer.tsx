import React, { useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  RefreshCw,
  Search,
  X,
  FolderPlus,
  FilePlus,
  Edit,
  Download,
  Trash2,
  Upload,
  GitBranch,
  FileArchive
} from 'lucide-react';
import axios from 'axios';
import { Code } from 'lucide-react'; // Import the Code icon

interface FileExplorerProps {
  files?: { path: string; name: string; id?: string }[];
  folders?: { path: string; name: string; expanded: boolean }[];
  currentPath?: string;
  onOpenFile?: (path: string, name: string, id?: string) => void;
  onCreateFile?: (name: string, content: string) => Promise<boolean>;
  onCreateFolder?: (name: string) => Promise<boolean>;
  onRefresh?: () => Promise<void>;
}

export default function FileExplorer({
  files = [],
  folders = [],
  currentPath = '/',
  onOpenFile,
  onCreateFile,
  onCreateFolder,
  onRefresh
}: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{path: string; name: string; id?: string} | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [importRepoUrl, setImportRepoUrl] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentProject, updateFile, deleteFile, openCodeCorrectionModal } = useAppContext();

  // Usar solo los archivos actuales del proyecto
  const projectFiles = currentProject?.files || [];

  // Extraer carpetas únicas de las rutas de archivos
  const extractFoldersFromFiles = (files: any[]) => {
    const folderPaths = new Set<string>();

    files.forEach(file => {
      if (file.path) {
        const pathParts = file.path.split('/');
        let currentPath = '';

        // Construir las rutas de carpetas
        for (let i = 1; i < pathParts.length - 1; i++) {
          currentPath += '/' + pathParts[i];
          if (currentPath) folderPaths.add(currentPath);
        }
      }
    });

    return Array.from(folderPaths).map(path => ({
      path,
      name: path.split('/').pop() || '',
      expanded: true
    }));
  };

  const projectFolders = extractFoldersFromFiles(projectFiles);

  // Iniciar con un espacio de trabajo vacío si no hay archivos
  const effectiveFiles = files.length > 0 ? files : 
    (projectFiles.length > 0 ? projectFiles.map(file => ({
      path: file.path || '',
      name: file.name,
      id: file.id
    })) : []);

  const effectiveFolders = folders.length > 0 ? folders : 
    (projectFolders.length > 0 ? projectFolders : []);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleFileClick = (path: string, name: string, id?: string) => {
    if (onOpenFile) {
      onOpenFile(path, name, id);
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsLoading(true);
      try {
        await onRefresh();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateNewFile = async () => {
    if (!newFileName.trim() || !onCreateFile) return;

    setIsLoading(true);
    try {
      const success = await onCreateFile(newFileName, '');
      if (success) {
        setNewFileName('');
        setShowNewFileInput(false);
        handleRefresh();
      }
    } catch (error) {
      console.error('Error creating file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewFolder = async () => {
    if (!newFolderName.trim() || !onCreateFolder) return;

    setIsLoading(true);
    try {
      const success = await onCreateFolder(newFolderName);
      if (success) {
        setNewFolderName('');
        setShowNewFolderInput(false);
        handleRefresh();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFile = async (file: {path: string; name: string; id?: string}) => {
    setSelectedFile(file);
    try {
      if (file.id) {
        const response = await axios.get(`/api/files/${file.id}`);
        setEditedContent(response.data.content || '');
        setShowEditDialog(true);
      }
    } catch (error) {
      console.error('Error loading file content:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedFile || !selectedFile.id) return;

    setIsLoading(true);
    try {
      await updateFile(selectedFile.id, { content: editedContent });
      setShowEditDialog(false);
      toast('Archivo actualizado correctamente');
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleDownloadFile = async (file: {path: string; name: string; id?: string}) => {
    if (!file.id) return;

    try {
      const response = await axios.get(`/api/files/${file.id}`);
      const content = response.data.content || '';

      // Crear un blob y descargarlo
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleUploadFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = async (e) => {
          const content = e.target?.result as string;
          if (onCreateFile) {
            await onCreateFile(file.name, content);
          }
        };

        reader.readAsText(file);
      }
      handleRefresh();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportRepository = async () => {
    if (!importRepoUrl.trim()) return;

    setIsLoading(true);
    try {
      // Enviar petición al servidor para importar el repositorio
      await axios.post('/api/terminal/execute', {
        command: `mkdir -p /tmp/repo && cd /tmp/repo && git clone ${importRepoUrl} . && cp -r . /home/runner/workspace && rm -rf /tmp/repo`
      });

      setImportRepoUrl('');
      setShowImportDialog(false);
      toast('Repositorio importado correctamente');
      handleRefresh();
    } catch (error) {
      console.error('Error importing repository:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportZip = async () => {
    fileInputRef.current?.click();
  };

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    try {
      // Usar FormData para subir el archivo zip
      const formData = new FormData();
      formData.append('zipFile', files[0]);

      // Enviar el archivo al servidor
      await axios.post('/api/upload-zip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast('Archivo ZIP importado correctamente');
      handleRefresh();
    } catch (error) {
      console.error('Error uploading zip:', error);
    } finally {
      setIsLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Función para mostrar notificaciones toast (simplificada)
  const toast = (message: string) => {
    console.log(message);
    // Aquí implementaríamos una notificación real
  };

  // Filtrar archivos basado en búsqueda
  const filteredFiles = searchQuery 
    ? effectiveFiles.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : effectiveFiles;

  const filteredFolders = searchQuery
    ? effectiveFolders.filter(folder => 
        folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // También incluir carpetas que contengan archivos que coincidan
        effectiveFiles.some(file => 
          file.path.startsWith(folder.path) && 
          file.name.toLowerCase().includes(searchQuery.toLowerCase())))
    : effectiveFolders;

  const handleCorrectFile = (path: string) => {
    const file = getFileByPath(path);
    if (file) {
      const fileContent = getFileContent(file.path); // Replace with actual content retrieval
      if (fileContent) {
        openCodeCorrectionModal({
          name: file.name,
          content: fileContent,
          path: file.path,
          language: getLanguageFromFileName(file.name)
        });
      }
    }
  };

  const getFileByPath = (path: string) => {
    // Implementar según la estructura de datos de tu aplicación
    // Ejemplo simple:  This needs to be replaced with your actual file retrieval logic.
    return effectiveFiles.find(file => file.path === path) || { name: path.split('/').pop() || '', path: path };
  };

  const getFileContent = (path: string) => {
    // Implementar según tu estructura
    // Este es un ejemplo, ajústalo según tu implementación actual
    const file = getFileByPath(path);
    return file.path; // Replace with actual content retrieval logic.  This is a placeholder.
  };

  const getLanguageFromFileName = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    const extToLanguage: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'py': 'python',
      'rb': 'ruby',
      'php': 'php',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'md': 'markdown'
    };

    return extToLanguage[extension] || 'text';
  };


  return (
    <div className="w-60 bg-slate-900 border-r border-slate-800 h-full overflow-hidden flex flex-col">
      {/* Cabecera */}
      <motion.div 
        className="p-2 border-b border-slate-800 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="font-medium text-sm">Explorador</h3>
        <motion.div className="flex space-x-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={isLoading}
                  onClick={handleRefresh}
                >
                  <RefreshCw 
                    size={14} 
                    className={isLoading ? 'animate-spin' : ''} 
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Actualizar</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowNewFileInput(!showNewFileInput)}>
                <FilePlus className="mr-2 h-4 w-4" />
                <span>Nuevo archivo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowNewFolderInput(!showNewFolderInput)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                <span>Nueva carpeta</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleUploadFile}>
                <Upload className="mr-2 h-4 w-4" />
                <span>Subir archivo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                <GitBranch className="mr-2 h-4 w-4" />
                <span>Importar repositorio</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportZip}>
                <FileArchive className="mr-2 h-4 w-4" />
                <span>Importar ZIP</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </motion.div>

      {/* Barra de búsqueda */}
      <div className="p-2 border-b border-slate-800">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-2.5 text-slate-400" />
          <Input
            placeholder="Buscar archivos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 bg-slate-800 border-slate-700 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Área para crear nuevo archivo/carpeta */}
      <AnimatePresence>
        {showNewFileInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-slate-800"
          >
            <div className="p-2 bg-slate-800">
              <div className="text-xs font-medium mb-1">Nuevo archivo</div>
              <div className="flex mb-2">
                <Input
                  placeholder="nombre-archivo.js"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="h-7 text-sm bg-slate-900 border-slate-700 mr-1"
                  disabled={isLoading}
                />
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 px-2"
                  onClick={handleCreateNewFile}
                  disabled={!newFileName.trim() || isLoading}
                >
                  {isLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {showNewFolderInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-slate-800"
          >
            <div className="p-2 bg-slate-800">
              <div className="text-xs font-medium mb-1">Nueva carpeta</div>
              <div className="flex mb-2">
                <Input
                  placeholder="nombre-carpeta"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="h-7 text-sm bg-slate-900 border-slate-700 mr-1"
                  disabled={isLoading}
                />
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 px-2"
                  onClick={handleCreateNewFolder}
                  disabled={!newFolderName.trim() || isLoading}
                >
                  {isLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estructura de archivos */}
      <ScrollArea className="flex-grow overflow-y-auto p-1">
        {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm flex flex-col items-center justify-center">
            {searchQuery ? (
              <p>No se encontraron archivos</p>
            ) : (
              <>
                <FolderPlus className="h-10 w-10 mb-2 text-slate-400" />
                <p className="mb-1">Espacio de trabajo vacío</p>
                <p className="text-xs max-w-[200px]">Comienza creando archivos o usando el planificador de proyectos para generar una estructura inicial</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    // Si el contexto tiene setShowProjectPlanner, usarlo aquí
                    const appContext = document.getElementById('project-planner-button');
                    if (appContext) (appContext as HTMLButtonElement).click();
                  }}
                >
                  <PlusCircle size={14} className="mr-1" />
                  Nuevo Proyecto
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Carpetas */}
            {filteredFolders.map((folder) => {
              const isExpanded = expandedFolders[folder.path] ?? folder.expanded;

              // Obtener los archivos que están en esta carpeta
              const filesInFolder = filteredFiles.filter(file => 
                file.path.startsWith(folder.path + '/')
              );

              return (
                <motion.div key={folder.path} className="mb-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="flex items-center py-1 px-2 rounded-md hover:bg-slate-800 cursor-pointer text-sm"
                    onClick={() => toggleFolder(folder.path)}
                  >
                    <div className="mr-1">
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={14} className="text-slate-400" />
                      )}
                    </div>
                    <Folder size={14} className="mr-1.5 text-blue-400" />
                    <span>{folder.name}</span>
                  </div>

                  {/* Archivos dentro de la carpeta */}
                  {isExpanded && filesInFolder.length > 0 && (
                    <div className="ml-6">
                      {filesInFolder.map((file) => (
                        <motion.div
                          key={file.path}
                          className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-slate-800 text-sm group"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div 
                            className="flex items-center cursor-pointer flex-1"
                            onClick={() => handleFileClick(file.path, file.name, file.id)}
                          >
                            <File size={14} className="mr-1.5 text-slate-400" />
                            <span>{file.name}</span>
                          </div>
                          <div className="hidden group-hover:flex items-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 text-slate-400 hover:text-white">
                                  <span className="sr-only">More</span>
                                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditFile(file)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCorrectFile(file.path)}>
                                  <Code className="mr-2 h-4 w-4" />
                                  <span>Corregir código</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Descargar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteFile(file)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Eliminar</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Archivos en la raíz */}
            {filteredFiles.filter(file => {
              // Solo mostrar archivos que no están en ninguna carpeta conocida
              return !filteredFolders.some(folder => file.path.startsWith(folder.path + '/'));
            }).map((file) => (
              <motion.div
                key={file.path}
                className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-slate-800 text-sm group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="flex items-center cursor-pointer flex-1"
                  onClick={() => handleFileClick(file.path, file.name, file.id)}
                >
                  <File size={14} className="mr-1.5 text-slate-400" />
                  <span>{file.name}</span>
                </div>
                <div className="hidden group-hover:flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 text-slate-400 hover:text-white">
                        <span className="sr-only">More</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEditFile(file)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCorrectFile(file.path)}>
                        <Code className="mr-2 h-4 w-4" />
                        <span>Corregir código</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Descargar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteFile(file)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </ScrollArea>

      {/* File Upload Input (hidden) */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden"
        onChange={handleFileUpload}
        multiple
      />

      {/* Dialog para editar archivo */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle>Editar {selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="my-2">
            <textarea
              className="w-full h-64 p-2 bg-slate-800 text-white border border-slate-700 rounded-md"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isLoading}>
              {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para importar repositorio */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle>Importar Repositorio Git</DialogTitle>
          </DialogHeader>
          <div className="my-2">
            <label className="text-sm mb-2 block">URL del repositorio</label>
            <Input
              placeholder="https://github.com/usuario/repositorio.git"
              value={importRepoUrl}
              onChange={(e) => setImportRepoUrl(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowImportDialog(false)}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleImportRepository} 
              disabled={isLoading || !importRepoUrl.trim()}
            >
              {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}