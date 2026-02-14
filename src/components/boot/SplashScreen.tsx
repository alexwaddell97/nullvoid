import { motion } from 'framer-motion';

export const SplashScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-black"
    >
      {/* Studio Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mb-8"
      >
        {/* Replace with your actual logo */}
               <img src="./cognis-green.png" alt="Studio Logo" className="w-96 h-96 object-contain" />
      </motion.div>

      {/* Studio Name
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-green-300 text-2xl mb-2"
      >
        The Lonely Tower Studios
      </motion.div> */}

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-green-700 text-sm mb-12 mt-[-125px]"
      >
        presents
      </motion.div>

      {/* Attribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-12 text-center space-y-2"
      >
        <div className="text-green-600 text-xs">
          Created by Alexander Waddell
        </div>
        <div className="text-green-800 text-xs">
          Powered by React · Electron · Vite
        </div>
      </motion.div>
    </motion.div>
  );
};
