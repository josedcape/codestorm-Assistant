import React from 'react';
import { Folder, File, Plus, X, FileCode, FileJson, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileInfo } from '@/types';
import { useEditor } from '@/hooks/useEditor';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { files, openFile, activeFile, createNewFile } = useEditor();
  
  // Map of file extensions to icons
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return <FileCode className="w-4 h-4 mr-1 text-primary" />;
      case 'json':
        return <FileJson className="w-4 h-4 mr-1 text-yellow-400" />;
      case 'md':
        return <FileText className="w-4 h-4 mr-1 text-blue-400" />;
      case 'css':
      case 'scss':
        return <File className="w-4 h-4 mr-1 text-blue-400" />;
      default:
        return <File className="w-4 h-4 mr-1 text-muted-foreground" />;
    }
  };
  
  const handleCreateNewFile = () => {
    createNewFile();
  };
  
  const handleFileClick = (file: FileInfo) => {
    if (!file.isDirectory) {
      openFile(file.id);
    }
  };

  return (
    <div className={cn(
      "w-64 bg-sidebar border-r border-border flex flex-col",
      isOpen ? "block" : "hidden md:flex"
    )}>
      <div className="flex justify-between items-center p-3 border-b border-border">
        <h2 className="font-medium text-sm">EXPLORER</h2>
        <div className="flex space-x-1">
          <button 
            className="p-1 hover:bg-muted rounded"
            onClick={handleCreateNewFile}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            className="p-1 hover:bg-muted rounded md:hidden" 
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* File Tree */}
      <div className="overflow-y-auto flex-1 text-sm">
        <div className="p-1">
          <div className="p-1 hover:bg-muted rounded cursor-pointer">
            <div className="flex items-center">
              <Folder className="w-4 h-4 mr-1 text-muted-foreground" />
              <span>project</span>
            </div>
          </div>
          
          <div className="ml-4">
            {files.map((file) => (
              <div 
                key={file.id}
                className={cn(
                  "p-1 hover:bg-muted rounded cursor-pointer",
                  activeFile?.id === file.id && "bg-muted"
                )}
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center">
                  {getFileIcon(file.name)}
                  <span>{file.name}</span>
                </div>
              </div>
            ))}
            {files.length === 0 && (
              <div className="p-2 text-xs text-muted-foreground">
                No files yet. Create a new file to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
