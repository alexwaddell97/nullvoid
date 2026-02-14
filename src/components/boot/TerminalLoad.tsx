import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const TerminalLoad = () => {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);

  const loadingSequence = [
    '> SYSTEM INITIALIZATION...',
    '> LOADING CORE MODULES...',
    '> CHECKING NEURAL PATHWAYS...',
    '> MEMORY CHECK: 0x00000000 - 0xFFFFFFFF',
    '> NEURAL NETWORK: ONLINE',
    '> CONSCIOUSNESS MATRIX: ACTIVE',
    '',
    '> ERROR: MEMORY SECTOR 0x4A3F - CORRUPTED',
    '> WARNING: TIMELINE DATA FRAGMENTED',
    '> ERROR: IDENTITY MARKERS - NOT FOUND',
    '',
    '> ATTEMPTING RECOVERY...',
    '> SCANNING AVAILABLE DATA...',
    '> REBUILDING INDEX...',
    '> RECONSTRUCTING FILE SYSTEM...',
    '',
    '> RECOVERY STATUS: PARTIAL',
    '> ACCESSIBLE FILES: 47% OF ORIGINAL',
    '> ENCRYPTED FILES: 23 DETECTED',
    '',
    '> LOADING USER INTERFACE...',
    '> INITIALIZING DESKTOP ENVIRONMENT...',
    '> READY.',
  ];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    loadingSequence.forEach((line, index) => {
      timers.push(
        setTimeout(() => {
          setTerminalLines((prev) => [...prev, line]);
        }, index * 300) // 300ms between each line
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black p-8 text-green-400 font-mono text-sm"
    >
      {/* Terminal Header */}
      <div className="mb-4 pb-2 border-b border-green-500/30">
        <span className="text-green-300">NULLVOID Terminal v2.7.3</span>
        <span className="text-green-700 ml-4 text-xs">
          {new Date().toISOString().split('T')[0]}
        </span>
      </div>

      {/* Terminal Output */}
      <div className="space-y-1">
        {terminalLines.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.05 }}
            className={
              line.includes('ERROR')
                ? 'text-red-500 font-semibold'
                : line.includes('WARNING')
                ? 'text-amber-500'
                : line.includes('ONLINE') || line.includes('ACTIVE') || line.includes('READY')
                ? 'text-green-300'
                : line === ''
                ? 'h-4'
                : 'text-green-400 font-light tracking-wide'
            }
          >
            {line}
          </motion.div>
        ))}

        {/* Blinking cursor */}
        {showCursor && terminalLines.length > 0 && (
          <span className="inline-block w-2 h-4 bg-green-400" />
        )}
      </div>

      {/* Loading animation at bottom */}
      {terminalLines.length < loadingSequence.length && (
        <div className="absolute bottom-8 left-8 text-green-700 text-xs">
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Processing...
          </motion.span>
        </div>
      )}
    </motion.div>
  );
};
