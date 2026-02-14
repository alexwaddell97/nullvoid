import { motion } from 'framer-motion';

interface FloatingNotesButtonProps {
  onClick: () => void;
}

export const FloatingNotesButton = ({ onClick }: FloatingNotesButtonProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-amber-500/20 border-2 border-amber-500/50 rounded-full flex items-center justify-center text-2xl hover:bg-amber-500/30 hover:border-amber-500/70 transition-all duration-200 shadow-lg shadow-amber-500/20"
      title="Open Notes (Global Access)"
    >
      📝
    </motion.button>
  );
};
