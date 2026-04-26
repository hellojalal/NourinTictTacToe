import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Moon } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden"
        >
          {/* Animated Background Stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.1, y: Math.random() * 1000 }}
                animate={{ 
                  opacity: [0.1, 0.5, 0.1],
                  y: [null, -100],
                  scale: [1, 1.5, 1]
                }}
                transition={{ 
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 10,
              delay: 0.2
            }}
            className="relative flex flex-col items-center"
          >
            <div className="flex gap-4 mb-8">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Star className="w-16 h-16 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              </motion.div>
              <motion.div
                animate={{ 
                  rotate: [0, -360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <Moon className="w-16 h-16 text-blue-300 fill-blue-300 drop-shadow-[0_0_15px_rgba(147,197,253,0.5)]" />
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-blue-400 drop-shadow-2xl leading-tight uppercase tracking-tighter">
                Nourin
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent mx-auto my-4 opacity-50" />
              <p className="text-purple-200 text-xl font-bold tracking-[0.3em] uppercase">
                Tic-Tac-Toe
              </p>
            </motion.div>
          </motion.div>

          {/* Loading bar */}
          <div className="absolute bottom-20 w-48 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              className="h-full w-full bg-gradient-to-r from-yellow-400 to-pink-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
