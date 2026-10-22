"use client";

import { motion } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Vertical travel in px. Handoff §20: ~12px for text, ~20px for sections. */
  y?: number;
};

/** Fade + small upward move when scrolled into view. */
export function Reveal({ children, className, delay = 0, y = 20 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * A screen whose parts (a milestone's photo and words) reveal together once a
 * good part of it is in view, instead of each waiting to cross the screen's
 * edge, which left the words missing under a photo that had already landed.
 */
export function RevealGroup({ as = "div", children, className }: { as?: "div" | "li"; children: React.ReactNode; className?: string }) {
  const Group = as === "li" ? motion.li : motion.div;
  return (
    <Group className={className} initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.3 }}>
      {children}
    </Group>
  );
}

/** One part of a RevealGroup: fades and rises when the group comes into view. */
export function RevealItem({ children, className, delay = 0, y = 20 }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        shown: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease } },
      }}
    >
      {children}
    </motion.div>
  );
}
