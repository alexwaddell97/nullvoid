import { motion, AnimatePresence } from 'framer-motion';
import { useWindowManager } from '../../../stores/WindowManager';
import { X, Home, Folder, Terminal, Globe, FileText, Unlock, Archive, Mail, Microscope, Settings, StickyNote, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NotesModal } from '../../apps/NotesModal';
import { useGameStore } from '../../../stores/GameStore';
import { useSoundManager } from '../../../hooks/useSoundManager';

interface TabBarProps {
  onDesktopClick: () => void;
  onAppTabClick?: () => void;
  isDesktopActive: boolean;
}

export const TabBar = ({ onDesktopClick, onAppTabClick, isDesktopActive }: TabBarProps) => {
  const { openWindows, activeWindowId, setActiveWindow, closeWindow, clearNotification } = useWindowManager();
  const [showNotes, setShowNotes] = useState(false);
  const { notes } = useGameStore();
  const sound = useSoundManager();

  // Helper function to get icon component by appId
  const getIconComponent = (appId: string) => {
    const iconSize = 14;
    switch (appId) {
      case 'files': return <Folder size={iconSize} />;
      case 'terminal': return <Terminal size={iconSize} />;
      case 'network': return <Globe size={iconSize} />;
      case 'logs': return <FileText size={iconSize} />;
      case 'decrypt': return <Unlock size={iconSize} />;
      case 'archive': return <Archive size={iconSize} />;
      case 'email': return <Mail size={iconSize} />;
      case 'research': return <Microscope size={iconSize} />;
      case 'settings': return <Settings size={iconSize} />;
      default: return null;
    }
  };

  // Keyboard shortcuts for tab navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + W to close current tab
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        if (activeWindowId) {
          closeWindow(activeWindowId);
        }
      }

      // Cmd/Ctrl + Tab to cycle through tabs
      if ((e.metaKey || e.ctrlKey) && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = openWindows.findIndex(w => w.id === activeWindowId);
        if (currentIndex !== -1) {
          const nextIndex = e.shiftKey
            ? (currentIndex - 1 + openWindows.length) % openWindows.length
            : (currentIndex + 1) % openWindows.length;
          setActiveWindow(openWindows[nextIndex].id);
        }
      }

      // Cmd/Ctrl + 1-9 to jump to specific tab
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (openWindows[index]) {
          setActiveWindow(openWindows[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openWindows, activeWindowId, setActiveWindow, closeWindow]);

  const handleTabClick = (e: React.MouseEvent, windowId: string, appId: string) => {
    // Middle click (mouse button 1) closes the tab
    if (e.button === 1) {
      e.preventDefault();
      closeWindow(windowId);
    } else if (e.button === 0) {
      // Left click switches to tab
      setActiveWindow(windowId);
      // Clear notification when clicking on a tab
      clearNotification(appId);
      // Notify parent that an app tab was clicked (to hide desktop)
      onAppTabClick?.();
    }
  };

  const handleCloseTab = (e: React.MouseEvent, windowId: string) => {
    e.stopPropagation();
    closeWindow(windowId);
  };

  return (
    <>
      <div className=" backdrop-blur-sm border-b border-green-500/30 overflow-x-auto">
        <div className="flex items-center gap-1 p-1">
          {/* Desktop/Home tab */}
          <motion.div className="relative flex-shrink-0">
            <button
              onMouseDown={(e) => {
                if (e.button === 0) {
                  onDesktopClick();
                }
              }}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-t-lg transition-all
                min-w-[120px] max-w-[200px] group relative
                focus:outline-none focus-visible:outline-none
                ${
                  isDesktopActive
                    ? 'bg-gray-800 text-green-400 border-t border-x border-green-500/50'
                    : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800/70 hover:text-green-300'
                }
              `}
            >
              <Home size={14} className="flex-shrink-0" />
              <span className="text-xs font-mono truncate flex-1 uppercase">Desktop</span>
            </button>

            {/* Active indicator */}
            {isDesktopActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
          </motion.div>

          {/* App tabs */}
          <AnimatePresence mode="popLayout">
            {openWindows.map((window) => {
              const isActive = window.id === activeWindowId;

              return (
                <motion.div
                  key={window.id}
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="relative flex-shrink-0"
                >
                  <button
                    onMouseDown={(e) => handleTabClick(e, window.id, window.appId)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-t-lg transition-all
                      min-w-[120px] max-w-[200px] group relative
                      focus:outline-none focus-visible:outline-none
                      ${
                        isActive
                          ? 'bg-gray-800 text-green-400 border-t border-x border-green-500/50'
                          : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800/70 hover:text-green-300'
                      }
                    `}
                  >
                    {/* Icon with notification dot */}
                    <span className="flex-shrink-0 relative">
                      {getIconComponent(window.appId)}
                      {window.hasNotification && !isActive && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"
                        />
                      )}
                    </span>

                    {/* Title */}
                    <span className="text-xs font-mono truncate flex-1 uppercase">
                      {window.title}
                    </span>

                    {/* Notification count or Close button */}
                    {window.hasNotification && !isActive && window.notificationCount ? (
                      <span className="flex-shrink-0 w-5 h-5 bg-amber-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                        {window.notificationCount > 9 ? '9+' : window.notificationCount}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleCloseTab(e, window.id)}
                        className={`
                          flex-shrink-0 p-0.5 rounded transition-all self-start mt-0.5
                          focus:outline-none focus-visible:outline-none
                          ${
                            isActive
                              ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                              : 'hover:bg-red-500/20 text-gray-500 hover:text-red-400'
                          }
                          opacity-0 group-hover:opacity-100
                        `}
                        aria-label="Close tab"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </button>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Spacer to push Notes to the right */}
          <div className="flex-1" />

          {/* Notes tab - Fixed on the right */}
          <motion.div className="relative flex-shrink-0">
            <button
              onClick={() => setShowNotes(true)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-t-lg transition-all
                min-w-[120px] max-w-[200px] group relative
                focus:outline-none focus-visible:outline-none
                ${
                  showNotes
                    ? 'bg-gray-800 text-amber-400 border-t border-x border-amber-500/50'
                    : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800/70 hover:text-amber-300'
                }
              `}
              title={`Notes (${notes.length} saved)`}
            >
              <StickyNote size={14} className="flex-shrink-0" />
              <span className="text-xs font-mono truncate flex-1 uppercase">Notes</span>
              {notes.length > 0 && (
                <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {notes.length > 9 ? '9+' : notes.length}
                </span>
              )}
            </button>

            {/* Active indicator */}
            {showNotes && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Notes Modal */}
      <NotesModal isOpen={showNotes} onClose={() => setShowNotes(false)} />
    </>
  );
};
