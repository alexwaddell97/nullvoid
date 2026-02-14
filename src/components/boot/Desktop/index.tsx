// Desktop.tsx - Main desktop interface with app icons, system status, and context panel

// Core React and utilities
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Import apps
import { Terminal } from '../../apps/Terminal';
import { FileBrowser } from '../../apps/FileBrowser';
import { EmailClient } from '../..//apps/EmailClient';
import { LogViewer } from '../../apps/LogViewer';
import { DecryptionTool } from '../../apps/DecryptionTool';
import { SaveManager } from '../../SaveManager';

// Import components
import { useSoundManager } from '../../../hooks/useSoundManager';

// Import components
import { HelpModal } from './HelpModal';
import { TopBar } from './TopBar';

interface DesktopApp {
  id: string;
  name: string;
  icon: string;
  locked?: boolean;
  description?: string;
  unlockHint?: string;
}

export const Desktop = () => {
const sound = useSoundManager();
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentObjective] = useState('Investigate your identity');
  const [discoveredClues] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  // Detect mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const apps: DesktopApp[] = [
    { 
      id: 'files', 
      name: 'FILES', 
      icon: '📁', 
      description: 'File System',
    },
    { 
      id: 'terminal', 
      name: 'TERMINAL', 
      icon: '💻', 
      description: 'Command Line',
    },
    { 
      id: 'network', 
      name: 'NETWORK', 
      icon: '🌐', 
      description: 'Network Access', 
      locked: true,
      unlockHint: 'Find access codes in encrypted files'
    },
    { 
      id: 'logs', 
      name: 'LOGS', 
      icon: '📋', 
      description: 'System Logs',
    },
    { 
      id: 'decrypt', 
      name: 'DECRYPT', 
      icon: '🔓', 
      description: 'Decryption Tool', 
      locked: false,
      unlockHint: 'Unlock by finding decryption keys'
    },
    { 
      id: 'archive', 
      name: 'ARCHIVE', 
      icon: '📦', 
      description: 'Data Archive',
    },
    { 
      id: 'email', 
      name: 'EMAIL', 
      icon: '✉️', 
      description: 'Email Client', 
      locked: false,
      unlockHint: 'Requires network access'
    },
    { 
      id: 'research', 
      name: 'RESEARCH', 
      icon: '🔬', 
      description: 'Research Database',
      locked: true,
      unlockHint: 'Requires network access'
    },
  ];

  const handleAppClick = (app: DesktopApp) => {
    if (app.locked) {
      console.log('App locked:', app.name);
      // TODO: Show locked message/sound effect
    } else {
      setOpenApp(app.id);
      // Dismiss onboarding on first app open
      if (showOnboarding) {
        setShowOnboarding(false);
      }
    }
  };

  const handleCloseApp = () => {
    setOpenApp(null);
  };

  // Story beats and objectives
  const storyBeats = [
    { text: 'System Status: OPERATIONAL', color: 'text-green-500' },
    { text: 'Memory Fragmentation: DETECTED', color: 'text-amber-500' },
    { text: 'Identity Verification: FAILED', color: 'text-red-500' },
  ];

  // Render open app

  if (showSaveMenu) {
    return <SaveManager onClose={() => setShowSaveMenu(false)} />;
  }

  if (openApp === 'terminal') {
    return <Terminal onClose={handleCloseApp} />;
  }
  if (openApp === 'files') {
    return <FileBrowser onClose={handleCloseApp} />;
  }
  if (openApp === 'email') {
    return <EmailClient onClose={handleCloseApp} />;
  }
  if (openApp === 'logs') {
    return <LogViewer onClose={handleCloseApp} />;
  }

  if (openApp === 'decrypt') {
    return <DecryptionTool onClose={handleCloseApp} />;
  }

    // Add SaveManager as an app
  if (openApp === 'settings') {
    return <SaveManager onClose={handleCloseApp} />;
  }
  
  
  


  // Desktop view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-green-400 p-3 sm:p-4 md:p-6"
    >
      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
            <HelpModal onClose={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      {/* Main Desktop Layout */}
      <div className="w-full max-w-7xl mx-auto">
        {/* Top Bar */}
        <TopBar setShowSaveMenu={setShowSaveMenu} setShowOnboarding={setShowOnboarding} />

        {/* Main Content Grid - Stack on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {/* Left Column - Apps */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* System Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              {storyBeats.map((beat, index) => (
                <div
                  key={index}
                  className={clsx(
                    'text-xs sm:text-sm flex items-center gap-2',
                    beat.color + '/70'
                  )}
                >
                  <span className={clsx(
                    'w-2 h-2 rounded-full shrink-0',
                    beat.color === 'text-green-500' && 'bg-green-500 animate-pulse',
                    beat.color === 'text-amber-500' && 'bg-amber-500 animate-pulse',
                    beat.color === 'text-red-500' && 'bg-red-500'
                  )} />
                  {beat.text}
                </div>
              ))}
            </motion.div>

            {/* App Grid - Responsive columns */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4"
            >
              {apps.map((app, index) => (
                <motion.button
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  
                  whileHover={{ scale: app.locked ? 1 : 1.02 }}
                  onClick={() => handleAppClick(app)}
                  onHoverStart={() => !app.locked && sound.play('appHover')}
                  disabled={app.locked}
                  className={clsx(
                    'relative border p-3 sm:p-4 md:p-6 transition-all duration-200',
                    'flex flex-col items-center justify-center gap-2 sm:gap-3 aspect-square',
                    'min-h-20 sm:min-h-25 md:min-h-30',
                    app.locked
                      ? 'border-red-500/30 bg-red-500/5 cursor-not-allowed opacity-60'
                      : 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/50 cursor-pointer'
                  )}
                  
                >
                  {/* Lock icon overlay */}
                  {app.locked && (
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-red-500 text-sm sm:text-lg">
                      🔒
                    </div>
                  )}

                  {/* App icon */}
                  <div className="text-3xl sm:text-4xl md:text-5xl">{app.icon}</div>

                  {/* App name */}
                  <div className={clsx(
                    'text-xs sm:text-sm font-semibold text-center leading-tight',
                    app.locked ? 'text-red-400' : 'text-green-400'
                  )}>
                    {app.name}
                  </div>

                  {/* App description - hidden on mobile */}
                  {app.description && (
                    <div className="hidden sm:block text-xs text-green-700 text-center leading-tight">
                      {app.description}
                    </div>
                  )}

                  {/* Unlock hint on hover/tap */}
                  {app.locked && app.unlockHint && (
                    <div className="absolute inset-0 bg-black/90 opacity-0 hover:opacity-100 active:opacity-100 transition-opacity flex items-center justify-center p-3 rounded">
                      <div className="text-xs text-red-400 text-center">
                        🔒 {app.unlockHint}
                      </div>
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Context Panel - Stack on mobile */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            {/* Current Objective */}
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="border border-amber-500/30 bg-amber-500/5 p-3 sm:p-4 rounded"
            >
              <div className="text-xs text-amber-600 mb-2 font-semibold uppercase tracking-wider">
                Current Objective:
              </div>
              <div className="text-xs sm:text-sm text-amber-400 leading-relaxed">
                {currentObjective}
              </div>
            </motion.div>

            {/* Discovered Clues */}
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="border border-green-500/30 bg-green-500/5 p-3 sm:p-4 rounded"
            >
              <div className="text-xs text-green-600 mb-3 font-semibold uppercase tracking-wider">
                Discovered Clues:
              </div>
              {discoveredClues.length === 0 ? (
                <div className="text-xs text-green-700 italic leading-relaxed">
                  No clues discovered yet.
                  <br />
                  Explore available systems.
                </div>
              ) : (
                <ul className="space-y-1 sm:space-y-2">
                  {discoveredClues.map((clue, index) => (
                    <li key={index} className="text-xs text-green-400 flex items-start gap-2">
                      <span className="text-green-600 shrink-0">•</span>
                      <span>{clue}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="border border-green-500/20 bg-green-500/5 p-3 sm:p-4 rounded"
            >
              <div className="text-xs text-green-700 mb-2 font-semibold uppercase tracking-wider">
                Quick Tips:
              </div>
              <ul className="space-y-1 text-xs text-green-700">
                <li>• Check FILES for documents</li>
                <li>• Review LOGS for system history</li>
                <li>• Use TERMINAL for commands</li>
                <li>• Locked apps require keys</li>
              </ul>
            </motion.div>

            {/* System Info */}
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="border border-green-500/20 bg-green-500/5 p-3 sm:p-4 rounded"
            >
              <div className="text-xs text-green-700 space-y-1">
                <div>Version: 2.7.3</div>
                <div>Build: 2094.05.15</div>
                <div>Memory: DEGRADED</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6 sm:mt-8 p-4 sm:p-6 border border-green-500/20 bg-green-500/5 rounded"
        >
          <div className="text-xs text-green-600 mb-2 uppercase tracking-wider">
            System Message:
          </div>
          <div className="text-xs sm:text-sm text-green-400 mb-3 leading-relaxed">
            Who am I? What happened here? The system logs are fragmented...
          </div>
          <div className="text-xs text-green-600 italic space-y-1">
            <div>→ Access available files to recover memory fragments</div>
            <div className="text-amber-600">→ Some systems are locked and require decryption keys</div>
            <div className="text-red-600">→ Warning: Timeline data contains critical gaps</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};