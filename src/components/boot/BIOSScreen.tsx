import { motion } from 'framer-motion';

export const BIOSScreen = () => {
  const biosLines = [
    'NULLVOID SYSTEMS v2.7.3',
    'Copyright (C) 2094 Automated Intelligence Division',
    '',
    'CPU: Neural Processing Unit X9-4700K @ 8.4 PHz',
    'Memory Test: 524288 TB OK',
    'Cache: L1: 2048 KB, L2: 16384 KB, L3: 262144 KB',
    '',
    'Primary Master: Quantum SSD Array',
    'Secondary Master: Neural Network Storage',
    '',
    'Boot Sequence: [OK]',
    'Neural Integrity: [WARNING]',
    'Memory Sectors: [DEGRADED]',
    '',
    'Press DEL to enter SETUP...',
    '',
    'Loading NULLVOID OS...',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-black p-8 text-green-500 font-mono text-sm"
    >
      {/* BIOS Header */}
      <div className="mb-6">
        <div className="text-green-400 font-bold">NULLVOID BIOS Setup Utility</div>
        <div className="text-green-700 text-xs">Build: 2094.07.15</div>
      </div>

      {/* BIOS Information */}
      <div className="space-y-1">
        {biosLines.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.1 }}
            className={
              line.includes('WARNING') 
                ? 'text-amber-500' 
                : line.includes('DEGRADED')
                ? 'text-red-500'
                : line.includes('[OK]')
                ? 'text-green-400'
                : 'text-green-500'
            }
          >
            {line || '\u00A0'} {/* Non-breaking space for empty lines */}
          </motion.div>
        ))}
      </div>

      {/* Blinking cursor at the end */}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="inline-block w-2 h-4 bg-green-400 ml-1"
      />
    </motion.div>
  );
};
