import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/GameStore';

interface SelectionContextMenuProps {
  children: ReactNode;
  source?: string; // e.g., "email:email_001", "file:readme", "log:log_001"
  sourceName?: string; // e.g., "Re: Project Status", "readme.txt"
  category?: string;
}

export const SelectionContextMenu = ({
  children,
  source,
  sourceName,
  category,
}: SelectionContextMenuProps) => {
  const { addNote } = useGameStore();
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedText(text);
      setMenuPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleAddToNotes = () => {
    if (selectedText) {
      // Create a descriptive title from the first 50 chars
      const title = selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : '');

      addNote({
        title,
        content: selectedText,
        source,
        sourceName,
        category,
      });

      // Close menu
      setMenuPosition(null);
      setSelectedText('');

      // Show toast notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

      // Clear selection after a short delay
      setTimeout(() => {
        window.getSelection()?.removeAllRanges();
      }, 100);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuPosition &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setMenuPosition(null);
        setSelectedText('');
      }
    };

    // Use mousedown with capture to prevent menu from closing before clicks register
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [menuPosition]);

  const getSourceLabel = () => {
    if (!source) return 'Custom';
    if (source.startsWith('email')) return 'Email';
    if (source.startsWith('file')) return 'File';
    if (source.startsWith('log')) return 'Log';
    return 'Custom';
  };

  return (
    <div ref={containerRef} onContextMenu={handleContextMenu}>
      {children}

      {/* Context Menu */}
      <AnimatePresence>
        {menuPosition && selectedText && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              left: menuPosition.x,
              top: menuPosition.y,
              zIndex: 9999,
            }}
            className="bg-black border-2 border-green-500/50 rounded shadow-2xl shadow-green-500/20 overflow-hidden"
          >
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToNotes();
              }}
              className="w-full px-4 py-2 text-left text-xs text-green-400 hover:bg-green-500/10 transition-colors flex items-center gap-2 min-w-[180px]"
            >
              <span>📝</span>
              <div className="flex-1">
                <div>Add to Notes</div>
                {source && (
                  <div className="text-xs text-green-700 mt-0.5">
                    Source: {getSourceLabel()}
                  </div>
                )}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-[9999] bg-green-500/20 border-2 border-green-500/50 rounded-lg px-4 py-3 shadow-2xl shadow-green-500/20"
          >
            <div className="flex items-center gap-2 text-green-300">
              <span className="text-lg">✓</span>
              <div className="text-sm font-semibold">
                Note saved!
                {source && (
                  <div className="text-xs text-green-600 font-normal">
                    From {getSourceLabel()}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
