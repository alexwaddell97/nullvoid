import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/GameStore';
import { Save } from 'lucide-react';

interface SaveManagerProps {
  onClose: () => void;
}

export const SaveManager = ({ onClose }: SaveManagerProps) => {
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'stats'>('save');
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const {
    gameStartTime,
    lastSaveTime,
    playTime,
    discoveredClues,
    readFiles,
    solvedPuzzles,
    readEmails,
    unreadEmailCount,
    commandsUsed,
    saveGame,
    resetGame,
    exportSave,
    importSave,
  } = useGameStore();

  const handleExport = () => {
    const saveData = exportSave();
    
    // Copy to clipboard
    navigator.clipboard.writeText(saveData).then(() => {
      setMessage({ type: 'success', text: 'Save data copied to clipboard!' });
      setTimeout(() => setMessage(null), 3000);
    }).catch(() => {
      setMessage({ type: 'error', text: 'Failed to copy to clipboard' });
      setTimeout(() => setMessage(null), 3000);
    });

    // Also trigger download
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nullvoid-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const success = importSave(importText);
    
    if (success) {
      setMessage({ type: 'success', text: 'Save data loaded successfully!' });
      setImportText('');
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 2000);
    } else {
      setMessage({ type: 'error', text: 'Failed to load save data. Invalid format.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleQuickSave = () => {
    saveGame();
    setMessage({ type: 'success', text: 'Game saved!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
      resetGame();
      setMessage({ type: 'success', text: 'Game reset. Starting fresh...' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-black text-green-400 font-mono h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-green-500/30 bg-green-500/5">
        <div className="flex items-center gap-2">
          <Save size={18} />
          <span className="text-sm font-semibold">SAVE MANAGER</span>
        </div>
        <button 
          onClick={onClose}
          className="text-red-500 hover:text-red-400 text-sm px-2 py-1 border border-red-500/30 hover:border-red-500/50 transition-colors"
        >
          [X] CLOSE
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-500/20 bg-green-500/5">
        {(['save', 'load', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              activeTab === tab
                ? 'px-6 py-3 border-b-2 border-green-500 text-green-400 font-semibold'
                : 'px-6 py-3 text-green-700 hover:text-green-500 transition-colors'
            }
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Message Banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={
              message.type === 'success'
                ? 'bg-green-500/20 border-b border-green-500/50 text-green-300 p-3 text-center'
                : 'bg-red-500/20 border-b border-red-500/50 text-red-300 p-3 text-center'
            }
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'save' && (
            <motion.div
              key="save"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div>
                <h2 className="text-2xl font-bold text-green-300 mb-4">Save Game</h2>
                <p className="text-sm text-green-600 mb-6">
                  Your progress is automatically saved. Use these options to backup or transfer your save data.
                </p>
              </div>

              {/* Quick Save */}
              <div className="border border-green-500/30 bg-green-500/5 p-6 rounded">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Quick Save</h3>
                <p className="text-sm text-green-600 mb-4">
                  Save your current progress to browser storage.
                </p>
                <button
                  onClick={handleQuickSave}
                  className="w-full py-3 bg-green-500/20 border border-green-500/50 text-green-300 hover:bg-green-500/30 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Save size={16} /> SAVE GAME
                </button>
                <div className="mt-3 text-xs text-green-700">
                  Last saved: {formatDate(lastSaveTime)}
                </div>
              </div>

              {/* Export Save */}
              <div className="border border-amber-500/30 bg-amber-500/5 p-6 rounded">
                <h3 className="text-lg font-semibold text-amber-400 mb-3">Export Save Data</h3>
                <p className="text-sm text-amber-600 mb-4">
                  Download your save file and copy to clipboard. Use this to backup or transfer progress to another device.
                </p>
                <button
                  onClick={handleExport}
                  className="w-full py-3 bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-colors font-semibold"
                >
                  📤 EXPORT SAVE FILE
                </button>
              </div>

              {/* Reset */}
              <div className="border border-red-500/30 bg-red-500/5 p-6 rounded">
                <h3 className="text-lg font-semibold text-red-400 mb-3">⚠ Reset Progress</h3>
                <p className="text-sm text-red-600 mb-4">
                  Delete all progress and start over. This cannot be undone!
                </p>
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 transition-colors font-semibold"
                >
                  🔄 RESET GAME
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'load' && (
            <motion.div
              key="load"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div>
                <h2 className="text-2xl font-bold text-green-300 mb-4">Load Game</h2>
                <p className="text-sm text-green-600 mb-6">
                  Import a save file to restore your progress.
                </p>
              </div>

              <div className="border border-green-500/30 bg-green-500/5 p-6 rounded">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Import Save Data</h3>
                <p className="text-sm text-green-600 mb-4">
                  Paste your save data below or upload a save file.
                </p>
                
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste save data here..."
                  className="w-full h-64 bg-black border border-green-500/30 text-green-400 p-4 font-mono text-xs outline-none focus:border-green-500/50 resize-none"
                />

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleImport}
                    disabled={!importText}
                    className="flex-1 py-3 bg-green-500/20 border border-green-500/50 text-green-300 hover:bg-green-500/30 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📥 IMPORT SAVE
                  </button>
                  
                  <label className="flex-1 py-3 bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-colors font-semibold text-center cursor-pointer">
                    📂 CHOOSE FILE
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setImportText(event.target?.result as string);
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div>
                <h2 className="text-2xl font-bold text-green-300 mb-4">Statistics</h2>
                <p className="text-sm text-green-600 mb-6">
                  Your progress through NULLVOID.
                </p>
              </div>

              {/* Play Time */}
              <div className="border border-green-500/30 bg-green-500/5 p-6 rounded">
                <h3 className="text-lg font-semibold text-green-400 mb-4">Session Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-green-700">Started:</div>
                    <div className="text-green-400">{formatDate(gameStartTime)}</div>
                  </div>
                  <div>
                    <div className="text-green-700">Play Time:</div>
                    <div className="text-green-400">{formatTime(playTime)}</div>
                  </div>
                </div>
              </div>

              {/* Story Progress */}
              <div className="border border-amber-500/30 bg-amber-500/5 p-6 rounded">
                <h3 className="text-lg font-semibold text-amber-400 mb-4">Story Progress</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-600">Clues Discovered:</span>
                    <span className="text-amber-400 font-semibold">{discoveredClues.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-600">Files Read:</span>
                    <span className="text-amber-400 font-semibold">{readFiles.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-600">Emails Read:</span>
                    <span className="text-amber-400 font-semibold">{readEmails.size} / {readEmails.size + unreadEmailCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-600">Puzzles Solved:</span>
                    <span className="text-amber-400 font-semibold">{solvedPuzzles.size} / 6</span>
                  </div>
                </div>
              </div>

              {/* Terminal Stats */}
              <div className="border border-green-500/30 bg-green-500/5 p-6 rounded">
                <h3 className="text-lg font-semibold text-green-400 mb-4">Terminal Activity</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Commands Used:</span>
                  <span className="text-green-400 font-semibold">{commandsUsed.size}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from(commandsUsed).slice(0, 10).map((cmd) => (
                    <span key={cmd} className="text-xs px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/30">
                      {cmd}
                    </span>
                  ))}
                </div>
              </div>

              {/* Discovered Clues */}
              {discoveredClues.length > 0 && (
                <div className="border border-cyan-500/30 bg-cyan-500/5 p-6 rounded">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">Discovered Clues</h3>
                  <ul className="space-y-2 text-sm">
                    {discoveredClues.map((clue, index) => (
                      <li key={index} className="text-cyan-400 flex items-start gap-2">
                        <span className="text-cyan-600">•</span>
                        <span>{clue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-green-500/30 bg-green-500/5 text-xs text-green-700">
        Auto-save enabled • Progress saved to browser storage
      </div>
    </div>
  );
};