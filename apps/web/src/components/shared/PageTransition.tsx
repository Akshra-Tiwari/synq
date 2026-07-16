'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const ease = [0.4, 0, 0.2, 1];

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease }}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className}
      initial="hidden" animate="show"
      variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.05 } } }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className}
      variants={{ hidden:{ opacity:0, y:10 }, show:{ opacity:1, y:0, transition:{ duration:0.25, ease } } }}>
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, delay=0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className}
      initial={{ opacity:0, y:6 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.25, delay, ease }}>
      {children}
    </motion.div>
  );
}

export function ScalePop({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className}
      initial={{ opacity:0, scale:0.96 }}
      animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.96 }}
      transition={{ duration:0.15, ease }}>
      {children}
    </motion.div>
  );
}
