'use client';

import { motion } from 'motion/react';

export default function BlogAnimations() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[2px] h-[2px] rounded-full bg-gold/70"
          style={{
            top: `${15 + i * 15}%`,
            left: `${10 + i * 18}%`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7 }}
        />
      ))}
    </>
  );
}
