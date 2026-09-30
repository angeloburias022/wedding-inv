"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const OpenInvitationContext = createContext<() => void>(() => {});

const HISTORY_KEY = "invitationOpen";

function isOpenEntry() {
  return window.history.state?.[HISTORY_KEY] === true;
}

type InvitationGateProps = {
  opening: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Shows only the opening until the guest taps "Open invitation" (handoff §2.2).
 * Opening adds a history entry on the same URL, so the browser Back button
 * returns to the opening instead of leaving the site.
 */
export function InvitationGate({ opening, children }: InvitationGateProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setOpen(isOpenEntry());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const openInvitation = useCallback(() => {
    // After a refresh we may already be on the "open" entry; don't stack another.
    if (!isOpenEntry()) {
      window.history.pushState({ ...window.history.state, [HISTORY_KEY]: true }, "");
    }
    setOpen(true);
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.div
          key="invitation"
          ref={contentRef}
          tabIndex={-1}
          aria-label="Invitation"
          className="outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onAnimationStart={() => {
            window.scrollTo(0, 0);
            contentRef.current?.focus({ preventScroll: true });
          }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="opening"
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
        >
          <OpenInvitationContext.Provider value={openInvitation}>{opening}</OpenInvitationContext.Provider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OpenInvitationButton({ label }: { label: string }) {
  const openInvitation = useContext(OpenInvitationContext);

  return (
    <button
      type="button"
      onClick={openInvitation}
      className="label min-h-11 border-b border-line pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
    >
      {label}
    </button>
  );
}
