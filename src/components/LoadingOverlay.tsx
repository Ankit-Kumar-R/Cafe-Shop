import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProgress } from '@react-three/drei';
import { Coffee } from 'lucide-react';

export function LoadingOverlay() {
  const { progress } = useProgress();
  const [show, setShow] = useState(true);

  // Auto-hide once progress reaches 100 or after a timeout just in case
  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => setShow(false), 500);
    }
  }, [progress]);

  // Fallback timeout to hide loading overlay if Three.js assets aren't loading properly
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="w-16 h-16 rounded-full border-2 border-amber-500/30 flex items-center justify-center"
              >
                <Coffee className="w-8 h-8 text-amber-500" />
              </motion.div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-xl font-display font-bold text-cream-50 tracking-widest">
                AK CAFE
              </h2>
              <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm font-mono text-amber-500/80">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
