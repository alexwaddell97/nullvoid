import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { ConfirmModal } from '../../shared/ConfirmModal';
import { useGameStore } from '../../../stores/GameStore';
// adjust import path if needed

export const TopBar = ({
  setShowSaveMenu,
  setShowOnboarding,
} : {
  setShowSaveMenu: (show: boolean) => void,
  setShowOnboarding: React.Dispatch<React.SetStateAction<boolean>>,
}) => {
    const { saveGame } = useGameStore();
    const [now, setNow] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleExit = () => {
        try {
            window.close();
        } catch (e) {
            console.error('Unable to close window:', e);
        }
    };

    const handleSaveAndExit = () => {
        saveGame();
        handleExit();
    };

    return (
        <>
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="py-4 px-4 sm:pb-6 border-b border-green-500/20"
        >
            {/* Main header row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                
                {/* Logo */}
                <div className="text-2xl sm:text-3xl font-bold text-green-300 tracking-wider">
                    NULLVOID OS
                </div>

                {/* Controls - Stack on mobile, row on desktop */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm w-full sm:w-auto">
                    
                    {/* Date/Time - Stack vertically on mobile */}
                    <div className={`flex ${isMobile ? 'flex-col gap-1 sm:flex-row sm:gap-4' : 'flex-row gap-4'} text-green-600 text-xs sm:text-sm`}>
                        <div className="whitespace-nowrap">
                            {now.toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false 
                            })}
                        </div>
                        <div className="whitespace-nowrap">
                            {now.toISOString().split('T')[0]}
                        </div>
                    </div>

                    {/* Buttons - Stack on very small screens, row on larger */}
                    <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
                        <button
                            onClick={() => setShowOnboarding(true)}
                            className="text-xs font-semibold text-green-700 hover:text-green-500 border border-green-500/30 px-2 sm:px-3 py-1 rounded transition-colors duration-200 active:scale-95 hover:border-green-500/50 whitespace-nowrap"
                            title="Show help"
                        >
                            <span className="hidden sm:inline">[?] </span>HELP
                        </button>

                        {/* Save */}
                        <button
                            onClick={() => setShowSaveMenu(true)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-400 border border-blue-500/40 px-2 sm:px-3 py-1 rounded transition-colors duration-200 active:scale-95 hover:border-blue-500/70 whitespace-nowrap flex items-center gap-1"
                            title="Save"
                        >
                            <Save size={14} />
                            <span className="hidden sm:inline">SAVE</span>
                        </button>

                        <button
                            onClick={() => setShowExitModal(true)}
                            className="text-xs font-semibold text-red-600 hover:text-red-400 border border-red-500/40 px-2 sm:px-3 py-1 rounded transition-colors duration-200 active:scale-95 hover:border-red-500/70 whitespace-nowrap"
                            title="Power off"
                        >
                            <span className="hidden sm:inline">⏻ </span>OFF
                        </button>
                    </div>
                </div>
            </div>

            {/* Optional: Responsive status bar for very small screens */}
            {isMobile && (
                <div className="mt-2 pt-2 border-t border-green-500/10 flex items-center justify-between text-xs text-green-700">
                    <span>System Active</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
            )}
        </motion.div>

        {/* Exit Confirmation Modal with custom actions */}
        {showExitModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowExitModal(false)}
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-black border-2 border-red-500/50 rounded-lg max-w-md w-full shadow-2xl shadow-red-500/20 mx-4"
                >
                    {/* Modal Header */}
                    <div className="p-4 border-b border-red-500/50 bg-red-500/10">
                        <div className="text-lg font-bold text-red-300">
                            EXIT NULLVOID OS
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6">
                        <p className="text-green-400 text-sm leading-relaxed">
                            Are you sure you want to exit? Any unsaved progress will be lost.
                        </p>
                    </div>

                    {/* Modal Actions */}
                    <div className="p-4 border-t border-red-500/50 bg-red-500/10 flex flex-col gap-2">
                        <button
                            onClick={handleSaveAndExit}
                            className="w-full px-4 py-2 border bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30 hover:border-green-500/70 transition-colors font-semibold text-sm"
                        >
                            💾 SAVE & EXIT
                        </button>
                        <button
                            onClick={handleExit}
                            className="w-full px-4 py-2 border bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30 hover:border-red-500/70 transition-colors font-semibold text-sm"
                        >
                            EXIT WITHOUT SAVING
                        </button>
                        <button
                            onClick={() => setShowExitModal(false)}
                            className="w-full px-4 py-2 border border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 transition-colors font-semibold text-sm"
                        >
                            CANCEL
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
        </>
    );
};