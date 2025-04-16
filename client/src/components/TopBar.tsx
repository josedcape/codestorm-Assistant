import React, { useState } from 'react';
import { Moon, Sun, Menu, Zap, Play, Settings, Share, FileCode, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditor } from '@/hooks/useEditor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CodestormAssistantButton } from './CodestormAssistant';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const { settings, updateSettings, createNewFile, saveCurrentFile, openFile } = useEditor();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleTheme = () => {
    updateSettings({
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  const toggleAssistant = () => {
    setShowAssistant(!showAssistant);
  };

  return (
    <>
      <div className="bg-card px-4 py-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-blue-800/30"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-primary" />
            <span className="ml-2 codestorm-logo">CODESTORM</span>
          </div>
          
          <div className="hidden md:flex space-x-4">
            <FileMenu createNewFile={createNewFile} saveCurrentFile={saveCurrentFile} openFile={openFile} />
            <EditMenu />
            <ViewMenu />
            <RunMenu />
            <HelpMenu />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="flex items-center text-sm gap-1.5" onClick={saveCurrentFile}>
            <Save size={16} />
            <span className="sr-only md:not-sr-only">Guardar</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center text-sm gap-1.5">
            <Share size={16} />
            <span className="sr-only md:not-sr-only">Compartir</span>
          </Button>

          <CodestormAssistantButton onClick={toggleAssistant} />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="p-1 rounded-full hover:bg-blue-800/30"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="bg-sidebar border-b border-border md:hidden">
          <div className="flex flex-col p-2">
            <Button variant="ghost" className="justify-start hover:bg-blue-800/30 px-3 py-2 rounded text-sm text-left">Archivo</Button>
            <Button variant="ghost" className="justify-start hover:bg-blue-800/30 px-3 py-2 rounded text-sm text-left">Editar</Button>
            <Button variant="ghost" className="justify-start hover:bg-blue-800/30 px-3 py-2 rounded text-sm text-left">Ver</Button>
            <Button variant="ghost" className="justify-start hover:bg-blue-800/30 px-3 py-2 rounded text-sm text-left">Ejecutar</Button>
            <Button variant="ghost" className="justify-start hover:bg-blue-800/30 px-3 py-2 rounded text-sm text-left">Ayuda</Button>
          </div>
        </div>
      )}
    </>
  );
};

// File Menu
const FileMenu = ({ createNewFile, saveCurrentFile, openFile }: { 
  createNewFile: () => void, 
  saveCurrentFile: () => void,
  openFile: () => void
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-2 py-1 text-sm">File</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={createNewFile}>New File</DropdownMenuItem>
        <DropdownMenuItem onClick={openFile}>Open...</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={saveCurrentFile}>Save</DropdownMenuItem>
        <DropdownMenuItem>Save As...</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Exit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Edit Menu
const EditMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-2 py-1 text-sm">Edit</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Undo</DropdownMenuItem>
        <DropdownMenuItem>Redo</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Cut</DropdownMenuItem>
        <DropdownMenuItem>Copy</DropdownMenuItem>
        <DropdownMenuItem>Paste</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Find</DropdownMenuItem>
        <DropdownMenuItem>Replace</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// View Menu
const ViewMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-2 py-1 text-sm">View</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Explorer</DropdownMenuItem>
        <DropdownMenuItem>Terminal</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Toggle Word Wrap</DropdownMenuItem>
        <DropdownMenuItem>Toggle Line Numbers</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Run Menu
const RunMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-2 py-1 text-sm">Run</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Run Current File</DropdownMenuItem>
        <DropdownMenuItem>Debug</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Configure Runners</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Help Menu
const HelpMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-2 py-1 text-sm">Help</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Documentation</DropdownMenuItem>
        <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>About</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TopBar;
