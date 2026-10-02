"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/** Scrolled this far (px), the guest has found the scroll and the hint leaves for good. */
const DISMISS_AFTER_PX = 40;

/**
 * Tells guests there's more below once the invitation opens, without moving
 * anything for them. Fixed at the bottom centre, it fades in after the content,
 * fades out on the first scroll and never returns. Tapping it scrolls down a
 * screen for anyone unsure how to.
 */
export function ScrollHint({ label }: { label: string }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > DISMISS_AFTER_PX) setDismissed(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.button
          type="button"
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })}
          aria-label={`${label} down`}
          // Fades in with the CSS entrance (after the content's own fade); Motion only handles the exit.
          style={{ animationDelay: "1200ms" }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="animate-rise fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2.5 rounded-full bg-background/85 px-5 pt-3 pb-2.5 text-muted shadow-sm backdrop-blur-sm transition-colors hover:text-ink"
        >
          <span className="label">{label}</span>
          <span aria-hidden className="relative h-8 w-px overflow-hidden bg-line">
            <span className="absolute inset-0 animate-scroll-cue bg-detail" />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
