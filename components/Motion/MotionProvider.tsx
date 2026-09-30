"use client";

import { MotionConfig } from "motion/react";

/** Honour the visitor's reduced-motion setting across every animation (handoff §20). */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
