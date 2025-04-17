import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface FileExplorerProps {
  files: { path: string; name: string }[];
  folders: { path: string; name: string; expanded: boolean }[];
  currentPath: string;
  onOpenFile: (path: string, name: string) => void;
  onCreateFile: (name: string, content: string) => Promise<boolean>;
  onCreateFolder: (name: string) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  folders, 
  currentPath, 
  onOpenFile, 
  onCreateFile, 
  onCreateFolder, 
  onRefresh 
}) => {
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleCreateFile = async () => {
    if (!newFileName) return;
    
    const success = await onCreateFile(newFileName, newFileContent);
    if (success) {
      setNewFileName('');
      setNewFileContent('');
      setNewFileDialogOpen(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    
    const success = await onCreateFolder(newFolderName);
    if (success) {
      setNewFolderName('');
      setNewFolderDialogOpen(false);
    }
  };

  const handleCommitChanges = async () => {
    if (!commitMessage) return;
    
    // This would be integrated with a git service
    console.log('Committing changes with message:', commitMessage);
    console.log('Selected files:', selectedFiles);
    
    // Reset after committing
    setCommitMessage('');
    setSelectedFiles([]);
  };

  const toggleFileSelection = (path: string) => {
    setSelectedFiles(prev => 
      prev.includes(path) 
        ? prev.filter(f => f !== path) 
        : [...prev, path]
    );
  };

  return (
    <aside className="bg-editor-sidebar border-r border-editor-border w-56 flex-shrink-0 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b border-editor-border">
        <h2 className="font-medium">EXPLORER</h2>
        <div className="flex">
          <button 
            className="p-1 hover:text-white" 
            title="New File"
            onClick={() => setNewFileDialogOpen(true)}
          >
            <i className="fas fa-file-plus fa-sm"></i>
          </button>
          <button 
            className="p-1 hover:text-white" 
            title="New Folder"
            onClick={() => setNewFolderDialogOpen(true)}
          >
            <i className="fas fa-folder-plus fa-sm"></i>
          </button>
          <button 
            className="p-1 hover:text-white" 
            title="Refresh"
            onClick={onRefresh}
          >
            <i className="fas fa-sync-alt fa-sm"></i>
          </button>
        </div>
      </div>
      
      <div className="p-1 text-sm font-medium border-b border-editor-border">
        CODESTORM
      </div>

      <ScrollArea className="flex-1">
        {folders.map((folder, index) => (
          <div key={`folder-${index}`} className="file-item">
            <div className="flex items-center p-1 hover:bg-opacity-30 hover:bg-white cursor-pointer group">
              <i className={`fas fa-chevron-${folder.expanded ? 'down' : 'right'} fa-xs mr-1 text-editor-text`}></i>
              <i className="fas fa-folder text-editor-warning mr-1"></i>
              <span>{folder.name}</span>
            </div>
            {folder.expanded && (
              <div className="pl-5">
                {files
                  .filter(file => file.path.startsWith(folder.path))
                  .map((file, fileIndex) => (
                    <div 
                      key={`file-${fileIndex}`}
                      className="flex items-center p-1 hover:bg-opacity-30 hover:bg-white cursor-pointer"
                      onClick={() => onOpenFile(file.path, file.name)}
                    >
                      <i className="fas fa-file-code text-editor-variable mr-1"></i>
                      <span>{file.name}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}

        {files
          .filter(file => !folders.some(folder => file.path.startsWith(folder.path)))
          .map((file, index) => (
            <div 
              key={`root-file-${index}`}
              className="flex items-center p-1 hover:bg-opacity-30 hover:bg-white cursor-pointer"
              onClick={() => onOpenFile(file.path, file.name)}
            >
              <i className="fas fa-file text-white mr-1"></i>
              <span>{file.name}</span>
            </div>
          ))}
      </ScrollArea>

      {/* SCM Section */}
      <div className="p-2 border-t border-editor-border">
        <h3 className="font-medium mb-1">SOURCE CONTROL</h3>
        <div className="text-sm">
          {files.slice(0, 3).map((file, index) => (
            <div 
              key={`scm-file-${index}`}
              className="flex items-center p-1 hover:bg-opacity-30 hover:bg-white cursor-pointer"
              onClick={() => toggleFileSelection(file.path)}
            >
              <i className={`fas fa-${selectedFiles.includes(file.path) ? 'check-square' : 'plus'} text-editor-success mr-1`}></i>
              <span>{file.name}</span>
            </div>
          ))}
          <div className="flex items-center justify-between mt-2">
            <Input
              type="text"
              placeholder="Commit message"
              className="bg-editor-widget w-full p-1 rounded text-sm"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
            />
          </div>
          <Button
            className="mt-2 bg-editor-accent hover:bg-opacity-90 rounded px-2 py-1 w-full text-white"
            onClick={handleCommitChanges}
            disabled={!commitMessage || selectedFiles.length === 0}
          >
            Commit Changes
          </Button>
        </div>
      </div>

      {/* New File Dialog */}
      <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
        <DialogContent className="bg-editor-sidebar text-editor-text border-editor-border">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium" htmlFor="file-name">
                File Name
              </label>
              <Input
                id="file-name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="example.js"
                className="bg-editor-widget border-editor-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="file-content">
                Initial Content (optional)
              </label>
              <textarea
                id="file-content"
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                placeholder="// Your code here"
                rows={5}
                className="w-full bg-editor-widget border border-editor-border rounded p-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-editor-accent" onClick={handleCreateFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent className="bg-editor-sidebar text-editor-text border-editor-border">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium" htmlFor="folder-name">
              Folder Name
            </label>
            <Input
              id="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New Folder"
              className="bg-editor-widget border-editor-border"
            />
          </div>
          <DialogFooter>
            <Button className="bg-editor-accent" onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default FileExplorer;
