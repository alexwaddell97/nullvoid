import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  confirmButtonClass,
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmModalProps) => {
  const variantColors = {
    danger: {
      border: 'border-red-500/50',
      bg: 'bg-red-500/10',
      text: 'text-red-300',
      button: 'bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30 hover:border-red-500/70',
    },
    warning: {
      border: 'border-amber-500/50',
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      button: 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 hover:border-amber-500/70',
    },
    info: {
      border: 'border-green-500/50',
      bg: 'bg-green-500/10',
      text: 'text-green-300',
      button: 'bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30 hover:border-green-500/70',
    },
  };

  const colors = variantColors[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] cursor-pointer"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
          >
            <div className={`bg-black border-2 ${colors.border} rounded-lg max-w-md w-full shadow-2xl shadow-${variant === 'danger' ? 'red' : variant === 'warning' ? 'amber' : 'green'}-500/20`}>
              {/* Modal Header */}
              <div className={`p-4 border-b ${colors.border} ${colors.bg}`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={colors.text} size={24} />
                  <div className={`text-lg font-bold ${colors.text}`}>
                    {title}
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p className="text-green-400 text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Modal Actions */}
              <div className={`p-4 border-t ${colors.border} ${colors.bg} flex gap-3`}>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2 border ${confirmButtonClass || colors.button} transition-colors font-semibold text-sm`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 transition-colors font-semibold text-sm"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
