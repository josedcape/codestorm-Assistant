import React, { useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { editor } from 'monaco-editor';
import { EditorTab } from '@/pages/EditorPage';

interface CodeEditorProps {
  activeTab: EditorTab | null;
  tabs: EditorTab[];
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onCodeChange: (tabId: string, newContent: string) => void;
  onCursorPositionChange: (line: number, column: number) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  activeTab,
  tabs,
  onTabChange,
  onTabClose,
  onCodeChange,
  onCursorPositionChange
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set editor options
    editor.updateOptions({
      fontFamily: "'Roboto Mono', 'Consolas', 'Courier New', 'monospace'",
      fontSize: 14,
      lineNumbers: 'on',
      lineHeight: 21,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      theme: 'vs-dark', // Use dark theme
    });

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      onCursorPositionChange(e.position.lineNumber, e.position.column);
    });
  };

  // Update editor content when activeTab changes
  useEffect(() => {
    if (editorRef.current && activeTab) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== activeTab.content) {
        editorRef.current.setValue(activeTab.content);
      }
    }
  }, [activeTab?.id]);

  const handleEditorChange = (value: string | undefined) => {
    if (activeTab && value !== undefined) {
      onCodeChange(activeTab.id, value);
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop() || '';
    
    switch (extension.toLowerCase()) {
      case 'js':
        return <i className="fas fa-file-code text-editor-variable mr-2"></i>;
      case 'ts':
      case 'tsx':
        return <i className="fas fa-file-code text-blue-400 mr-2"></i>;
      case 'jsx':
        return <i className="fas fa-file-code text-yellow-400 mr-2"></i>;
      case 'css':
        return <i className="fas fa-file-code text-purple-400 mr-2"></i>;
      case 'html':
        return <i className="fas fa-file-code text-orange-400 mr-2"></i>;
      case 'json':
        return <i className="fas fa-file-code text-yellow-300 mr-2"></i>;
      case 'md':
        return <i className="fas fa-file-alt text-gray-300 mr-2"></i>;
      default:
        return <i className="fas fa-file text-white mr-2"></i>;
    }
  };

  if (!activeTab) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-editor-bg">
        <div className="text-editor-text text-opacity-60 flex flex-col items-center">
          <i className="fas fa-code text-4xl mb-4"></i>
          <p className="text-lg">No file is open</p>
          <p className="text-sm mt-1">Open a file from the explorer to start coding</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab Bar */}
      <ScrollArea orientation="horizontal" className="border-b border-editor-border bg-editor-bg">
        <div className="flex text-sm">
          {tabs.map((tab) => (
            <div 
              key={tab.id}
              className={`flex items-center px-3 py-2 border-r border-editor-border cursor-pointer ${tab.id === activeTab.id ? 'bg-editor-activeLine' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {getFileIcon(tab.filename)}
              <span>{tab.filename}</span>
              <button 
                className="ml-2 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          className="monaco-editor"
          height="100%"
          language={activeTab.language}
          value={activeTab.content}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            fontFamily: "'Roboto Mono', 'Consolas', 'Courier New', 'monospace'",
            fontSize: 14,
            lineNumbers: 'on',
            lineHeight: 21,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
