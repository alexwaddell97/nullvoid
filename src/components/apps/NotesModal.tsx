import { motion, AnimatePresence } from 'framer-motion';
import { Notes } from './Notes';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotesModal = ({ isOpen, onClose }: NotesModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="w-full h-full max-w-7xl max-h-[90vh] bg-black border-2 border-green-500/50 rounded-lg shadow-2xl shadow-green-500/20 overflow-hidden">
              <Notes onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
