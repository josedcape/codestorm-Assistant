import React, { useState } from 'react';
import { Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditor } from '@/hooks/useEditor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const { settings, updateSettings, createNewFile, saveCurrentFile, openFile } = useEditor();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleTheme = () => {
    updateSettings({
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  return (
    <>
      <div className="bg-sidebar px-4 py-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM10 12.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
            <span className="ml-2 font-semibold">CodeEdit</span>
          </div>
          
          <div className="hidden md:flex space-x-4">
            <FileMenu createNewFile={createNewFile} saveCurrentFile={saveCurrentFile} openFile={openFile} />
            <EditMenu />
            <ViewMenu />
            <RunMenu />
            <HelpMenu />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="p-1 rounded hover:bg-muted"
          >
            {settings.theme === 'dark' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="p-1 rounded hover:bg-muted md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="bg-sidebar border-b border-border md:hidden">
          <div className="flex flex-col p-2">
            <Button variant="ghost" className="justify-start hover:bg-muted px-3 py-2 rounded text-sm text-left">File</Button>
            <Button variant="ghost" className="justify-start hover:bg-muted px-3 py-2 rounded text-sm text-left">Edit</Button>
            <Button variant="ghost" className="justify-start hover:bg-muted px-3 py-2 rounded text-sm text-left">View</Button>
            <Button variant="ghost" className="justify-start hover:bg-muted px-3 py-2 rounded text-sm text-left">Run</Button>
            <Button variant="ghost" className="justify-start hover:bg-muted px-3 py-2 rounded text-sm text-left">Help</Button>
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
