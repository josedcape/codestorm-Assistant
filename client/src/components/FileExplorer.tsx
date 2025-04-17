import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { File, Folder, ChevronRight, ChevronDown, FolderPlus, FilePlus, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { FileInfo } from '@/context/AppContext';

interface FileExplorerProps {
  isOpen?: boolean;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ isOpen = true }) => {
  const { currentProject, openFile, refreshFiles, updateFile, deleteFile, createFile } = useAppContext();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemParent, setNewItemParent] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  useEffect(() => {
    // Cargar archivos al montar el componente
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      await refreshFiles();
    } catch (error) {
      console.error('Error cargando archivos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleOpenFile = (file: FileInfo) => {
    if (file.isDirectory) {
      toggleFolder(file.id);
    } else {
      openFile(file.id, file.content, file.language, file.path || '', file.name);
    }
  };

  const handleUpdateFileName = async (fileId: string) => {
    if (!newFileName.trim()) return;
    try {
      await updateFile(fileId, { name: newFileName });
      setEditingFile(null);
      setNewFileName('');
    } catch (error) {
      console.error('Error al renombrar:', error);
    }
  };

  const handleCreateItem = async (isFolder: boolean) => {
    if (!newItemName.trim()) return;

    try {
      const parentPath = newItemParent ? 
        currentProject?.files.find(f => f.id === newItemParent)?.path || '' : 
        '';

      const fullPath = parentPath ? 
        `${parentPath}/${newItemName}` : 
        newItemName;

      await createFile({
        name: newItemName,
        path: fullPath,
        content: isFolder ? '' : newFileContent || '// Nuevo archivo',
        language: isFolder ? '' : getLanguageFromFileName(newItemName),
        isDirectory: isFolder
      });

      setNewItemName('');
      setNewFileContent('');
      setIsCreatingFile(false);
      setIsCreatingFolder(false);
      setNewItemParent(null);
    } catch (error) {
      console.error('Error al crear:', error);
    }
  };

  const handleDeleteFile = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      try {
        await deleteFile(fileId);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setFileToUpload(file);

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const content = event.target.result.toString();
        try {
          await createFile({
            name: file.name,
            path: file.name,
            content,
            language: getLanguageFromFileName(file.name),
            isDirectory: false
          });
          setUploadModalOpen(false);
          setFileToUpload(null);
        } catch (error) {
          console.error('Error al subir archivo:', error);
        }
      }
    };
    reader.readAsText(file);
  };

  const getLanguageFromFileName = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'php': 'php',
      'sql': 'sql'
    };

    return languageMap[ext] || 'text';
  };

  const renderFileTree = (files: FileInfo[] | undefined, parentId: string | null = null) => {
    if (!files || files.length === 0) {
      return (
        <div className="px-4 py-2 text-sm text-slate-400 italic">
          No hay archivos
        </div>
      );
    }

    const parentFiles = files.filter(file => 
      (parentId === null && !file.path?.includes('/')) || 
      (parentId !== null && file.path?.startsWith(parentId + '/') && file.path.split('/').length === (parentId.split('/').length + 1))
    );

    return parentFiles.map(file => (
      <div key={file.id} className="file-item">
        <div 
          className={`flex items-center py-1 px-2 text-sm rounded hover:bg-slate-800 cursor-pointer ${file.isDirectory ? 'font-medium' : ''}`}
          onClick={() => handleOpenFile(file)}
        >
          {file.isDirectory ? (
            <span className="mr-1">
              {expandedFolders[file.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          ) : null}
          <span className="mr-2">
            {file.isDirectory ? <Folder size={14} className="text-yellow-500" /> : <File size={14} className="text-blue-400" />}
          </span>

          {editingFile === file.id ? (
            <div className="flex items-center flex-1">
              <Input 
                value={newFileName} 
                onChange={(e) => setNewFileName(e.target.value)} 
                className="h-6 py-0 text-xs" 
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateFileName(file.id);
                  if (e.key === 'Escape') {
                    setEditingFile(null);
                    setNewFileName('');
                  }
                }}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 ml-1" 
                onClick={() => handleUpdateFileName(file.id)}
              >
                <Save size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => {
                  setEditingFile(null);
                  setNewFileName('');
                }}
              >
                <X size={14} />
              </Button>
            </div>
          ) : (
            <>
              <span className="flex-1 truncate">{file.name}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFile(file.id);
                    setNewFileName(file.name);
                  }}
                >
                  <Edit size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-red-400" 
                  onClick={(e) => handleDeleteFile(file.id, e)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </>
          )}
        </div>

        {file.isDirectory && expandedFolders[file.id] && (
          <div className="ml-4 pl-2 border-l border-slate-700">
            {renderFileTree(files, file.id)}

            {isCreatingFile && newItemParent === file.id && (
              <div className="py-1 px-2">
                <Input 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Nombre del archivo"
                  className="h-6 py-0 text-xs mb-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateItem(false);
                    if (e.key === 'Escape') {
                      setIsCreatingFile(false);
                      setNewItemName('');
                      setNewItemParent(null);
                    }
                  }}
                />
                <Input 
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  placeholder="Contenido (opcional)"
                  className="h-6 py-0 text-xs mb-1"
                />
                <div className="flex space-x-1 mt-1">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="h-6 py-0 text-xs"
                    onClick={() => handleCreateItem(false)}
                  >
                    Guardar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 py-0 text-xs"
                    onClick={() => {
                      setIsCreatingFile(false);
                      setNewItemName('');
                      setNewItemParent(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {isCreatingFolder && newItemParent === file.id && (
              <div className="py-1 px-2">
                <Input 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Nombre de la carpeta"
                  className="h-6 py-0 text-xs mb-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateItem(true);
                    if (e.key === 'Escape') {
                      setIsCreatingFolder(false);
                      setNewItemName('');
                      setNewItemParent(null);
                    }
                  }}
                />
                <div className="flex space-x-1 mt-1">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="h-6 py-0 text-xs"
                    onClick={() => handleCreateItem(true)}
                  >
                    Crear
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 py-0 text-xs"
                    onClick={() => {
                      setIsCreatingFolder(false);
                      setNewItemName('');
                      setNewItemParent(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    ));
  };

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ 
        width: isOpen ? 280 : 0,
        opacity: isOpen ? 1 : 0
      }}
      className={`border-r border-slate-800 bg-slate-900 h-full overflow-hidden ${isOpen ? 'block' : 'hidden'}`}
    >
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h2 className="font-semibold text-sm">Explorador de Archivos</h2>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setIsCreatingFolder(true);
              setNewItemParent(null);
            }}
            title="Nueva carpeta"
          >
            <FolderPlus size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setIsCreatingFile(true);
              setNewItemParent(null);
            }}
            title="Nuevo archivo"
          >
            <FilePlus size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setUploadModalOpen(true)}
            title="Subir archivo"
          >
            <input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Loader2 size={14} className="animate-spin" />
            </label>
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100%-56px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            {isCreatingFile && newItemParent === null && (
              <div className="p-2 border-b border-slate-800">
                <Input 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Nombre del archivo"
                  className="h-6 py-0 text-xs mb-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateItem(false);
                    if (e.key === 'Escape') {
                      setIsCreatingFile(false);
                      setNewItemName('');
                    }
                  }}
                />
                <Input 
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  placeholder="Contenido (opcional)"
                  className="h-6 py-0 text-xs mb-1"
                />
                <div className="flex space-x-1 mt-1">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="h-6 py-0 text-xs"
                    onClick={() => handleCreateItem(false)}
                  >
                    Guardar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 py-0 text-xs"
                    onClick={() => {
                      setIsCreatingFile(false);
                      setNewItemName('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {isCreatingFolder && newItemParent === null && (
              <div className="p-2 border-b border-slate-800">
                <Input 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Nombre de la carpeta"
                  className="h-6 py-0 text-xs mb-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateItem(true);
                    if (e.key === 'Escape') {
                      setIsCreatingFolder(false);
                      setNewItemName('');
                    }
                  }}
                />
                <div className="flex space-x-1 mt-1">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="h-6 py-0 text-xs"
                    onClick={() => handleCreateItem(true)}
                  >
                    Crear
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 py-0 text-xs"
                    onClick={() => {
                      setIsCreatingFolder(false);
                      setNewItemName('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="group">
              {renderFileTree(currentProject?.files)}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default FileExplorer;