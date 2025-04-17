import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useEditor } from '@/hooks/useEditor';

interface CodeEditorProps {
  content: string;
  language: string;
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ content, language, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { settings, updateCursorPosition } = useEditor();

  useEffect(() => {
    // Load Monaco Editor lazily
    async function loadMonacoEditor() {
      if (!editorRef.current) return;
      
      // Only create editor if it doesn't exist
      if (!monacoEditorRef.current) {
        // Configure editor theme
        monaco.editor.defineTheme('codeEditDark', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#1e1e1e',
            'editor.foreground': '#d4d4d4',
            'editor.lineHighlightBackground': '#2a2a2a',
            'editorLineNumber.foreground': '#858585',
            'editorLineNumber.activeForeground': '#c6c6c6',
          }
        });
        
        monaco.editor.defineTheme('codeEditLight', {
          base: 'vs',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#f8f9fa',
            'editor.foreground': '#1e1e1e',
            'editor.lineHighlightBackground': '#f0f0f0',
            'editorLineNumber.foreground': '#999999',
            'editorLineNumber.activeForeground': '#333333',
          }
        });
        
        // Create editor
        monacoEditorRef.current = monaco.editor.create(editorRef.current, {
          value: content,
          language,
          theme: settings.theme === 'dark' ? 'codeEditDark' : 'codeEditLight',
          minimap: { enabled: true },
          automaticLayout: true,
          fontSize: settings.fontSize,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap ? 'on' : 'off',
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          roundedSelection: true,
          selectOnLineNumbers: true,
          readOnly: false,
          cursorStyle: 'line',
          renderWhitespace: 'none',
          renderLineHighlight: 'all',
          scrollbar: {
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          }
        });
        
        // Listen for changes
        monacoEditorRef.current.onDidChangeModelContent(() => {
          const newValue = monacoEditorRef.current?.getValue() || '';
          onChange(newValue);
        });
        
        // Track cursor position
        monacoEditorRef.current.onDidChangeCursorPosition((e) => {
          updateCursorPosition({
            lineNumber: e.position.lineNumber,
            column: e.position.column
          });
        });
      } else {
        // Update model if editor already exists
        if (monacoEditorRef.current.getValue() !== content) {
          monacoEditorRef.current.setValue(content);
        }
        
        monaco.editor.setModelLanguage(
          monacoEditorRef.current.getModel()!,
          language
        );
        
        monacoEditorRef.current.updateOptions({
          theme: settings.theme === 'dark' ? 'codeEditDark' : 'codeEditLight',
          fontSize: settings.fontSize,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap ? 'on' : 'off',
        });
      }
    }
    
    loadMonacoEditor();
    
    // Cleanup
    return () => {
      monacoEditorRef.current?.dispose();
    };
  }, [content, language, onChange, settings.theme, settings.fontSize, settings.tabSize, settings.wordWrap]);

  return <div ref={editorRef} className="code-editor w-full h-full" />;
};

export default CodeEditor;
