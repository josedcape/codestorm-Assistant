import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Code, FolderTree } from "lucide-react";
import TerminalView from './TerminalView';
import ProjectStructure from './ProjectStructure';
import { useAppContext } from '@/context/AppContext';

// Code editor component with syntax highlighting
const CodeEditor = () => {
  const { currentProject } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const files = currentProject?.files || [];
  
  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">No hay archivos generados todavía</p>
      </div>
    );
  }
  
  const currentFile = files.find(file => file.path === selectedFile) || files[0];
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex bg-navy-800 border-b border-navy-700 overflow-x-auto">
        {files.map((file) => (
          <button 
            key={file.path}
            className={`px-4 py-2 text-xs whitespace-nowrap ${selectedFile === file.path ? 'bg-navy-700 text-cyan-400 border-b-2 border-cyan-400' : 'hover:bg-navy-700/50'}`}
            onClick={() => setSelectedFile(file.path)}
          >
            {file.path.split('/').pop()}
          </button>
        ))}
      </div>
      
      <div className="flex-grow bg-terminal-900 p-4 overflow-y-auto font-mono text-sm">
        <pre className="text-gray-300">
          <code>{currentFile.content}</code>
        </pre>
      </div>
    </div>
  );
};

export default function DevEnvironment() {
  const [activeTab, setActiveTab] = useState("terminal");
  const { terminalLines } = useAppContext();

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <Tabs defaultValue="terminal" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="flex bg-navy-800 rounded-t-xl overflow-hidden w-full justify-start h-auto">
          <TabsTrigger 
            value="terminal" 
            className={`px-4 py-3 flex items-center gap-2 rounded-none ${activeTab === 'terminal' ? 'bg-navy-700 text-cyan-400 border-b-2 border-cyan-400' : 'hover:bg-navy-700/50'}`}
          >
            <Terminal className="h-4 w-4" /> Terminal
          </TabsTrigger>
          <TabsTrigger 
            value="editor" 
            className={`px-4 py-3 flex items-center gap-2 rounded-none ${activeTab === 'editor' ? 'bg-navy-700 text-cyan-400 border-b-2 border-cyan-400' : 'hover:bg-navy-700/50'}`}
          >
            <Code className="h-4 w-4" /> Editor
          </TabsTrigger>
          <TabsTrigger 
            value="structure" 
            className={`px-4 py-3 flex items-center gap-2 rounded-none ${activeTab === 'structure' ? 'bg-navy-700 text-cyan-400 border-b-2 border-cyan-400' : 'hover:bg-navy-700/50'}`}
          >
            <FolderTree className="h-4 w-4" /> Estructura
          </TabsTrigger>
        </TabsList>
        
        <motion.div 
          className="flex-grow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <TabsContent value="terminal" className="h-full m-0 border-none p-0 data-[state=active]:flex-grow">
            <TerminalView lines={terminalLines} />
          </TabsContent>
          
          <TabsContent value="editor" className="h-full m-0 border-none p-0 data-[state=active]:flex-grow">
            <CodeEditor />
          </TabsContent>
          
          <TabsContent value="structure" className="h-full m-0 border-none p-0 data-[state=active]:flex-grow">
            <ProjectStructure />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
