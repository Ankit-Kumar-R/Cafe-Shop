import { motion, useScroll, useSpring } from 'motion/react';
import React from 'react';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1.5 origin-left z-[100] bg-gradient-to-r from-cream-50 to-amber-600"
      style={{ scaleX }}
    />
  );
}
