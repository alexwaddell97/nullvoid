import { motion } from 'framer-motion';

export const CRTBoot = () => {
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.7, 1, 0.8, 1] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
      className="flex items-center justify-center min-h-screen bg-black"
    >
      {/* CRT Power-on effect - expanding dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 0.1, 1],
          opacity: [0, 1, 1]
        }}
        transition={{ duration: 1, times: [0, 0.3, 1] }}
        className="relative"
      >
        {/* Center dot */}
        <div className="text-green-500 text-6xl">█</div>
        
        {/* Glow effect */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 blur-xl bg-green-500/50"
        />
      </motion.div>

      {/* Static noise overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.5, times: [0, 0.5, 1] }}
        className="absolute inset-0 bg-noise opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />
    </motion.div>
  );
};
