import { motion } from 'framer-motion';
import { useState } from 'react';
import { NotesModal } from '../apps/NotesModal';
import { useGameStore } from '../../stores/GameStore';

export const GlobalNotesButton = () => {
  const [showNotes, setShowNotes] = useState(false);
  const { notes } = useGameStore();
  const noteCount = notes.length;

  return (
    <>
      {/* Global Notes Button - Top Right Corner, Minimal */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNotes(true)}
        className="fixed top-4 right-4 z-[90] w-10 h-10 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-400 hover:bg-amber-500/30 hover:border-amber-500/70 transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center relative"
        title={`Notes (${noteCount} saved)`}
      >
        <span className="text-lg">📝</span>
        {noteCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-black text-xs font-bold rounded-full flex items-center justify-center border border-black">
            {noteCount > 9 ? '9+' : noteCount}
          </span>
        )}
      </motion.button>

      {/* Notes Modal */}
      <NotesModal isOpen={showNotes} onClose={() => setShowNotes(false)} />
    </>
  );
};
