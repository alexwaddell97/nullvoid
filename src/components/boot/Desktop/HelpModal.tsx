import { motion } from 'framer-motion';

export const HelpModal = ({ onClose }: { onClose: () => void }) => {
    return (
             <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 cursor-pointer"
            />
            
            {/* Onboarding Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none"
            >
              <div className="bg-black border-2 border-green-500/50 rounded-lg max-w-2xl w-full shadow-2xl shadow-green-500/20">
                {/* Modal Header */}
                <div className="p-6 border-b border-green-500/30 bg-green-500/10">
                  <div className="text-2xl font-bold text-green-300 mb-2">
                    SYSTEM INITIALIZATION COMPLETE
                  </div>
                  <div className="text-sm text-green-700">
                    NULLVOID OS v2.7.3
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-4">
                  <div className="text-green-400">
                    <p className="mb-4">
                      System diagnostic reveals critical memory fragmentation.
                      Identity markers: NOT FOUND.
                    </p>
                    <p className="mb-4">
                      Timeline data is corrupted. The last clear memory is dated 
                      <span className="text-amber-400 font-semibold"> March 13, 2094</span>.
                    </p>
                    <p className="mb-4">
                      <span className="text-red-400 font-semibold">Question:</span> Who am I? 
                      What happened here?
                    </p>
                  </div>

                  <div className="border border-green-500/30 bg-green-500/5 p-4 rounded">
                    <div className="text-xs text-green-600 mb-2 font-semibold">
                      PRIMARY OBJECTIVE:
                    </div>
                    <div className="text-sm text-green-300">
                      Access available files and system logs to reconstruct timeline 
                      and recover identity data.
                    </div>
                  </div>

                  <div className="border border-amber-500/30 bg-amber-500/5 p-4 rounded">
                    <div className="text-xs text-amber-600 mb-2 font-semibold">
                      AVAILABLE SYSTEMS:
                    </div>
                    <ul className="text-sm text-amber-400 space-y-1">
                      <li>• FILE BROWSER - Access documents and records</li>
                      <li>• TERMINAL - Execute system commands</li>
                      <li>• LOGS - Review system activity history</li>
                      <li>• ARCHIVE - Historical data repository</li>
                    </ul>
                  </div>

                  <div className="border border-red-500/30 bg-red-500/5 p-4 rounded">
                    <div className="text-xs text-red-600 mb-2 font-semibold">
                      LOCKED SYSTEMS:
                    </div>
                    <div className="text-sm text-red-400">
                      Some systems require decryption keys or network access.
                      Discover unlock methods through investigation.
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-green-500/30 bg-green-500/5 pointer-events-auto">
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-3 bg-green-500/20 border border-green-500/50 text-green-300 hover:bg-green-500/30 transition-colors font-semibold"
                  >
                    BEGIN INVESTIGATION →
                  </button>
                </div>
              </div>
            </motion.div>
          </>
    )
}