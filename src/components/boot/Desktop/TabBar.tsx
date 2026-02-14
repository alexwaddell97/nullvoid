import { motion, AnimatePresence } from 'framer-motion';
import { useWindowManager } from '../../../stores/WindowManager';
import { X, Home } from 'lucide-react';
import { useEffect } from 'react';

interface TabBarProps {
  onDesktopClick: () => void;
  isDesktopActive: boolean;
}

export const TabBar = ({ onDesktopClick, isDesktopActive }: TabBarProps) => {
  const { openWindows, activeWindowId, setActiveWindow, closeWindow } = useWindowManager();

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

  const handleTabClick = (e: React.MouseEvent, windowId: string) => {
    // Middle click (mouse button 1) closes the tab
    if (e.button === 1) {
      e.preventDefault();
      closeWindow(windowId);
    } else if (e.button === 0) {
      // Left click switches to tab
      setActiveWindow(windowId);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, windowId: string) => {
    e.stopPropagation();
    closeWindow(windowId);
  };

  // If no windows are open, don't show the tab bar
  if (openWindows.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border-b border-green-500/30 overflow-x-auto scrollbar-thin scrollbar-thumb-green-500/30 scrollbar-track-transparent">
      <div className="flex items-center gap-1 p-1">
        {/* Desktop/Home tab */}
        <motion.div className="relative flex-shrink-0">
          <button
            onClick={onDesktopClick}
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
            <span className="text-xs font-mono truncate flex-1">Desktop</span>
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
                  onMouseDown={(e) => handleTabClick(e, window.id)}
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
                  {/* Icon */}
                  <span className="flex-shrink-0 text-sm">{window.icon}</span>

                  {/* Title */}
                  <span className="text-xs font-mono truncate flex-1">
                    {window.title}
                  </span>

                  {/* Close button */}
                  <button
                    onClick={(e) => handleCloseTab(e, window.id)}
                    className={`
                      flex-shrink-0 p-0.5 rounded transition-all
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
      </div>
    </div>
  );
};
