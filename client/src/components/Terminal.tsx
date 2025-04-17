import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '@/hooks/useEditor';

const Terminal: React.FC = () => {
  const { activeFile } = useEditor();
  const [output, setOutput] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(command);
      setCommand('');
    }
  };

  const executeCommand = (cmd: string) => {
    // Add command to output
    setOutput([...output, `$ ${cmd}`]);

    // Simple simulated command execution
    if (cmd === 'clear') {
      setOutput([]);
      return;
    }

    if (cmd === 'ls') {
      setOutput([...output, `$ ${cmd}`, 'README.md  package.json  src/']);
      return;
    }

    if (cmd.startsWith('node ')) {
      const filename = cmd.split(' ')[1];
      if (activeFile && activeFile.name === filename) {
        // Simulate running the active file
        setOutput([...output, `$ ${cmd}`, 'Running file...', 'Hello from simulated JavaScript runtime!']);
        return;
      }
      setOutput([...output, `$ ${cmd}`, `Error: Cannot find file ${filename}`]);
      return;
    }

    // Default response for unknown commands
    setOutput([...output, `$ ${cmd}`, `Command not found: ${cmd}`]);
  };

  return (
    <div 
      ref={terminalRef}
      className="bg-sidebar border-t border-border h-32 overflow-auto"
    >
      <div className="p-2 font-mono text-sm">
        {output.map((line, index) => (
          <div key={index} className={line.startsWith('$') ? 'text-green-500' : 'text-foreground'}>
            {line}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-green-500">$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="ml-1 bg-transparent outline-none border-none flex-1 text-foreground"
            placeholder="Type a command..."
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
