import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
// adjust import path if needed

export const TopBar = ({
  setShowSaveMenu,
  setShowOnboarding,
} : {
  setShowSaveMenu: (show: boolean) => void,
  setShowOnboarding: React.Dispatch<React.SetStateAction<boolean>>,
}) => {

    const [now, setNow] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);
    
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

    return (
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
                            onClick={() => {
                                try {
                                    window.close();
                                } catch (e) {
                                    console.error('Unable to close window:', e);
                                }
                            }}
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
    );
};