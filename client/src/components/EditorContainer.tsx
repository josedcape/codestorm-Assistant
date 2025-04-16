import React, { useState } from 'react';
import FileTab from './FileTab';
import CodeEditor from './CodeEditor';
import StatusBar from './StatusBar';
import Terminal from './Terminal';
import { useEditor } from '@/hooks/useEditor';

const EditorContainer: React.FC = () => {
  const {
    tabs,
    activateTab,
    closeTab,
    activeFile,
    updateFileContent,
    cursorPosition
  } = useEditor();
  
  const [showTerminal, setShowTerminal] = useState(false);
  
  const toggleTerminal = () => {
    setShowTerminal(!showTerminal);
  };

  return (
    <div className="editor-container flex-1 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="bg-background border-b border-border flex overflow-x-auto">
        {tabs.map((tab) => (
          <FileTab
            key={tab.id}
            id={tab.id}
            name={tab.name}
            isActive={tab.isActive}
            isDirty={tab.isDirty}
            onActivate={activateTab}
            onClose={closeTab}
          />
        ))}
        {tabs.length === 0 && (
          <div className="p-2 text-sm text-muted-foreground">
            No files open. Create or open a file to start editing.
          </div>
        )}
      </div>
      
      {/* Code Editor */}
      {activeFile ? (
        <CodeEditor
          content={activeFile.content}
          language={activeFile.language}
          onChange={(value) => updateFileContent(activeFile.id, value)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground text-center">
          <div>
            <h3 className="text-lg font-medium mb-2">Welcome to CodeEdit</h3>
            <p className="mb-4">Open a file from the sidebar or create a new file to get started.</p>
          </div>
        </div>
      )}
      
      {/* Terminal Panel */}
      {showTerminal && <Terminal />}
      
      {/* Status bar */}
      <StatusBar 
        showTerminal={showTerminal} 
        toggleTerminal={toggleTerminal}
        cursorPosition={cursorPosition}
        language={activeFile?.language || 'plaintext'}
      />
    </div>
  );
};

export default EditorContainer;
