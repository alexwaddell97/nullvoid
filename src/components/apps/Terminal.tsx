import { useState, useEffect, useRef } from 'react';
import { commands, type CommandContext } from '../../data/commands';
import { useGameStore } from '../../stores/GameStore';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  onClose: () => void;
}

export const Terminal = ({ onClose }: TerminalProps) => {
  const [history, setHistory] = useState<string[]>([
    'NULLVOID Terminal v2.7.3',
    'Type "help" for available commands',
    ''
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Get state from Zustand store
  const {
    currentTerminalPath,
    setTerminalPath,
    unlockedFiles,
    hasDecryptKey,
    addCommandUsed,
    unlockFile,
  } = useGameStore();

  const [currentPath, setCurrentPath] = useState<string[]>(currentTerminalPath);
  const [unlockedItems] = useState<Set<string>>(unlockedFiles);

  // Sync local path with store
  useEffect(() => {
    setTerminalPath(currentPath);
  }, [currentPath, setTerminalPath]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getPrompt = () => {
    const pathStr = currentPath.length === 1 ? '/' : '/' + currentPath.slice(1).join('/');
    return `user@nullvoid:${pathStr}$`;
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    
    // Add to history display
    setHistory(prev => [...prev, `${getPrompt()} ${trimmedCmd}`]);

    // Add to command history for up/down arrows
    if (trimmedCmd) {
      setCommandHistory(prev => [...prev, trimmedCmd]);
      setHistoryIndex(-1);
      
      // Track command in game store
      const [commandName] = trimmedCmd.split(' ');
      addCommandUsed(commandName.toLowerCase());
    }

    // Handle clear separately
    if (trimmedCmd.toLowerCase() === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (!trimmedCmd) {
      setInput('');
      return;
    }

    // Parse command
    const [commandName, ...args] = trimmedCmd.split(' ');
    const command = commandName.toLowerCase();

    // Create context for commands
    const context: CommandContext = {
      currentPath,
      setCurrentPath: (newPath) => {
        setCurrentPath(newPath);
      },
      unlockedItems,
      unlockItem: (itemId) => {
        unlockedItems.add(itemId);
        unlockFile(itemId); // Track in game store
      },
      hasDecryptKey,
    };

    // Execute command
    if (commands[command]) {
      const result = commands[command](args, context);
      
      // Handle string response
      if (typeof result === 'string') {
        setHistory(prev => [...prev, result, '']);
      } 
      // Handle object response with unlocks
      else {
        setHistory(prev => [...prev, result.output, '']);
        
        // Handle unlocks
        if (result.unlocks) {
          result.unlocks.forEach(id => {
            if (id) unlockedItems.add(id);
          });
        }
      }
    } else {
      setHistory(prev => [
        ...prev, 
        `command not found: ${command}`,
        'Type "help" for available commands',
        ''
      ]);
    }
    
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // TODO: Add tab completion
    }
  };

  return (
    <div className="bg-black text-green-400 font-mono h-full flex flex-col">
      {/* Terminal Header with close button */}
      <div className="flex items-center justify-between p-3 border-b border-green-500/30 bg-green-500/5">
        <div className="flex items-center gap-2">
          <TerminalIcon size={18} />
          <span className="text-sm font-semibold">TERMINAL</span>
          <span className="text-xs text-green-700 ml-2">
            {currentPath.length === 1 ? '/' : '/' + currentPath.slice(1).join('/')}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-red-500 hover:text-red-400 text-sm px-2 py-1 border border-red-500/30 hover:border-red-500/50 transition-colors"
        >
          [X] CLOSE
        </button>
      </div>

      {/* Terminal content */}
      <div 
        ref={historyRef}
        className="flex-1 p-4 overflow-auto"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Command history */}
        <div className="mb-2">
          {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap leading-relaxed">
              {line}
            </div>
          ))}
        </div>
        
        {/* Input line */}
        <div className="flex items-center gap-2">
          <span className="text-green-500 select-none">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent outline-none flex-1 text-green-400 font-mono"
            spellCheck={false}
            autoComplete="off"
          />
          <span className="animate-pulse text-green-400">▊</span>
        </div>
      </div>

      {/* Terminal footer info */}
      <div className="p-2 border-t border-green-500/30 bg-green-500/5 text-xs text-green-700 flex justify-between">
        <span>NULLVOID Terminal v2.7.3</span>
        <div className="flex gap-4">
          <span>PWD: {currentPath.length === 1 ? '/' : '/' + currentPath.slice(1).join('/')}</span>
          <span>Type "help" for commands</span>
        </div>
      </div>
    </div>
  );
};