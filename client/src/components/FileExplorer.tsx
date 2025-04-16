import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  FilePlus
} from 'lucide-react';

interface FileExplorerProps {
  files?: { path: string; name: string }[];
  folders?: { path: string; name: string; expanded: boolean }[];
  currentPath?: string;
  onOpenFile?: (path: string, name: string) => void;
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
  
  const { currentProject } = useAppContext();
  
  // Simular datos si no hay archivos proporcionados
  const projectFiles = currentProject?.files || [
    {
      id: '1',
      name: 'app.js',
      path: '/src/app.js',
      language: 'javascript',
      content: '',
    },
    {
      id: '2',
      name: 'styles.css',
      path: '/src/styles.css',
      language: 'css',
      content: '',
    },
    {
      id: '3',
      name: 'index.html',
      path: '/public/index.html',
      language: 'html',
      content: '',
    }
  ];
  
  const mockFolders = [
    { path: '/src', name: 'src', expanded: true },
    { path: '/public', name: 'public', expanded: false },
    { path: '/assets', name: 'assets', expanded: false },
  ];
  
  const effectiveFiles = files.length > 0 ? files : projectFiles.map(file => ({
    path: file.path || '',
    name: file.name
  }));
  
  const effectiveFolders = folders.length > 0 ? folders : mockFolders;
  
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  const handleFileClick = (path: string, name: string) => {
    if (onOpenFile) {
      onOpenFile(path, name);
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

  return (
    <div className="w-60 bg-slate-900 border-r border-slate-800 h-full overflow-hidden flex flex-col">
      {/* Cabecera */}
      <div className="p-2 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-medium text-sm">Explorador</h3>
        <div className="flex space-x-1">
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowNewFileInput(!showNewFileInput)}
                >
                  <FilePlus size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Nuevo archivo</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                >
                  <FolderPlus size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Nueva carpeta</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
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
      <div className="flex-grow overflow-y-auto p-1">
        {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            {searchQuery ? (
              <p>No se encontraron archivos</p>
            ) : (
              <p>No hay archivos en el proyecto</p>
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
                <div key={folder.path} className="mb-1">
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
                        <div
                          key={file.path}
                          className="flex items-center py-1 px-2 rounded-md hover:bg-slate-800 cursor-pointer text-sm"
                          onClick={() => handleFileClick(file.path, file.name)}
                        >
                          <File size={14} className="mr-1.5 text-slate-400" />
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Archivos en la raíz */}
            {filteredFiles.filter(file => {
              // Solo mostrar archivos que no están en ninguna carpeta conocida
              return !filteredFolders.some(folder => file.path.startsWith(folder.path + '/'));
            }).map((file) => (
              <div
                key={file.path}
                className="flex items-center py-1 px-2 rounded-md hover:bg-slate-800 cursor-pointer text-sm"
                onClick={() => handleFileClick(file.path, file.name)}
              >
                <File size={14} className="mr-1.5 text-slate-400" />
                <span>{file.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}