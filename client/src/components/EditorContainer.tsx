import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditorContainer() {
  const { 
    tabs, 
    activeTab, 
    setActiveTab, 
    closeTab,
    openFile,
    currentProject
  } = useAppContext();
  
  const [cursorPosition, setCursorPosition] = useState<{ lineNumber: number; column: number }>({
    lineNumber: 1,
    column: 1
  });

  const handleEditorMount = (editor: any, monaco: any) => {
    // Configurar el editor
    editor.updateOptions({
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      lineHeight: 1.5,
      formatOnPaste: true,
      formatOnType: true,
    });
    
    // Escuchar cambios de posición del cursor
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });
  };

  const createNewFile = () => {
    // En una implementación real, esto debería abrir un diálogo para crear un nuevo archivo
    // Por ahora, creamos un archivo temporal con un nombre aleatorio
    const fileId = `new-file-${Date.now()}`;
    const fileName = `nuevo-archivo-${Math.floor(Math.random() * 1000)}.js`;
    
    openFile(
      fileId,
      '// Nuevo archivo\n\n', // Contenido vacío
      'javascript',
      `/src/${fileName}`,
      fileName
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Tabs de archivos */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900">
        <Tabs value={activeTab?.id || ''} className="flex-grow">
          <TabsList className="bg-transparent h-auto p-0 justify-start w-full overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative data-[state=active]:bg-slate-800 rounded-none border-r border-slate-800 px-4 py-2
                  hover:bg-slate-800/40 data-[state=active]:shadow-none h-10 text-xs
                `}
              >
                <div className="flex items-center">
                  {getFileIcon(tab.filename)}
                  <span className="truncate max-w-[120px] ml-1.5">{tab.filename}</span>
                  {tab.isDirty && <span className="ml-1 text-blue-400">•</span>}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="ml-2 opacity-50 hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={createNewFile}
          className="h-10 w-10 rounded-none border-l border-slate-800"
        >
          <Plus size={18} />
        </Button>
      </div>
      
      {/* Editor */}
      <div className="flex-grow">
        {activeTab ? (
          <Editor
            height="100%"
            language={activeTab.language}
            theme="vs-dark"
            value={activeTab.content}
            onChange={(value) => {
              // En una implementación real, esta función actualizaría el contenido del archivo
              console.log('Contenido cambiado:', value);
            }}
            onMount={handleEditorMount}
            options={{
              readOnly: false,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 text-slate-500">
                <Plus size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No hay archivos abiertos</h3>
              <p className="text-sm max-w-md">
                Selecciona un archivo del explorador o crea uno nuevo para comenzar a editar
              </p>
              <Button 
                variant="default" 
                size="sm" 
                onClick={createNewFile} 
                className="mt-4"
              >
                <Plus size={16} className="mr-1" />
                Nuevo archivo
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// Función auxiliar para obtener icono según extensión
function getFileIcon(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'js':
      return <span className="text-yellow-300">📄</span>;
    case 'jsx':
      return <span className="text-blue-300">📄</span>;
    case 'ts':
      return <span className="text-blue-400">📄</span>;
    case 'tsx':
      return <span className="text-blue-500">📄</span>;
    case 'html':
      return <span className="text-orange-400">📄</span>;
    case 'css':
      return <span className="text-purple-400">📄</span>;
    case 'json':
      return <span className="text-yellow-200">📄</span>;
    case 'md':
      return <span className="text-white">📄</span>;
    default:
      return <span className="text-slate-400">📄</span>;
  }
}