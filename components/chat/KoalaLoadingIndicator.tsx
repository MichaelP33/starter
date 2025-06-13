"use client";

import { motion } from "framer-motion";

export function KoalaLoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Koala with subtle circle background */}
      <div className="relative">
        {/* Subtle background circle */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r from-blue-50 to-gray-50 border border-gray-100/50"
        />
        
        {/* Inner circle for depth */}
        <div className="absolute inset-2 rounded-full bg-white/80 border border-gray-100/30" />
        
        {/* Koala emoji */}
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 w-24 h-24 flex items-center justify-center text-5xl"
        >
          🐨
        </motion.div>
      </div>

      {/* Loading dots */}
      <motion.div
        animate={{
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex space-x-1"
      >
        <motion.div 
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.div 
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: 0.2,
          }}
        />
        <motion.div 
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: 0.4,
          }}
        />
      </motion.div>
    </div>
  );
}