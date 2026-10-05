"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";

type OpenOptions = {
  /** The opening has already covered the screen (the envelope's card): swap instantly, no fades. */
  seamless?: boolean;
};

const OpenInvitationContext = createContext<(options?: OpenOptions) => void>(() => {});

const HISTORY_KEY = "invitationOpen";
const SCROLL_KEY = "invitationScroll";
const OPENED_KEY = "invitationOpened";

function isOpenEntry() {
  return window.history.state?.[HISTORY_KEY] === true;
}

// The "open" flag lives on the history entry, so it survives a reload of that
// entry (but not a fresh visit). Components read it through this tiny store.
const listeners = new Set<() => void>();
function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}
const getServerSnapshot = () => false;

/**
 * Set by a tap on "Open invitation": play the transitions and start at the top.
 * When the invitation opens without a tap (a reload, or browser Forward), it
 * appears instantly at the guest's last scroll position instead.
 */
let openedByTap = false;
let seamlessOpen = false;

if (typeof window !== "undefined") {
  // We restore the scroll ourselves once the content is rendered.
  window.history.scrollRestoration = "manual";
}

// Remembered on this device, so a guest coming back another day can skip the envelope.
function wasOpenedBefore() {
  try {
    return localStorage.getItem(`${OPENED_KEY}:${location.pathname}`) === "1";
  } catch {
    return false;
  }
}

function rememberOpened() {
  try {
    localStorage.setItem(`${OPENED_KEY}:${location.pathname}`, "1");
  } catch {
    // Storage can be unavailable (private mode); the guest just opens the envelope again next time.
  }
}

function readSavedScroll() {
  try {
    return Number(sessionStorage.getItem(`${SCROLL_KEY}:${location.pathname}`)) || 0;
  } catch {
    return 0;
  }
}

function saveScroll() {
  try {
    sessionStorage.setItem(`${SCROLL_KEY}:${location.pathname}`, String(Math.round(window.scrollY)));
  } catch {
    // Storage can be unavailable (private mode); a reload then starts at the top.
  }
}

type InvitationGateProps = {
  opening: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Shows only the opening until the guest taps "Open invitation" (handoff §2.2).
 * Opening adds a history entry on the same URL, so the browser Back button
 * returns to the opening instead of leaving the site. Reloading an opened
 * invitation stays on it, at the same scroll position.
 */
export function InvitationGate({ opening, children }: InvitationGateProps) {
  const open = useInvitationOpen();

  const openInvitation = (options?: OpenOptions) => {
    if (!isOpenEntry()) {
      window.history.pushState({ ...window.history.state, [HISTORY_KEY]: true }, "");
    }
    openedByTap = true;
    seamlessOpen = Boolean(options?.seamless);
    rememberOpened();
    listeners.forEach((notify) => notify());
  };

  return (
    // `custom` reaches the exiting opening too, so it knows whether to animate out.
    <AnimatePresence mode="wait" initial={false} custom={openedByTap && !seamlessOpen}>
      {open ? (
        <motion.div
          key="invitation"
          initial={openedByTap && !seamlessOpen ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <OpenedContent>{children}</OpenedContent>
        </motion.div>
      ) : (
        <motion.div
          key="opening"
          variants={{
            exit: (tapped: boolean) => ({ opacity: 0, y: -12, transition: { duration: tapped ? 0.6 : 0, ease: "easeIn" } }),
          }}
          exit="exit"
        >
          <OpenInvitationContext.Provider value={openInvitation}>{opening}</OpenInvitationContext.Provider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Positions the page when the content appears, then keeps track of the scroll for a reload. */
function OpenedContent({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // Read once per mount: dev-mode effects run twice and must agree on how we got here.
  const [byTap] = useState(() => openedByTap);

  useEffect(() => {
    openedByTap = false;
    seamlessOpen = false;
    if (byTap) {
      window.scrollTo({ top: 0, behavior: "instant" });
      ref.current?.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: readSavedScroll(), behavior: "instant" });
    }

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(saveScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", saveScroll);

    // In-page links (#rsvp, #top, chapter dots…) would add a history entry without
    // the open flag and close the invitation; scroll to the section instead.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const id = decodeURIComponent(link.hash.slice(1));
      const target = id === "top" ? null : document.getElementById(id);
      if (id !== "top" && !target) return;
      event.preventDefault();
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
      if (target) target.scrollIntoView({ behavior, block: "start" });
      else window.scrollTo({ top: 0, behavior });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", saveScroll);
      document.removeEventListener("click", onClick);
    };
  }, [byTap]);

  return (
    <div ref={ref} tabIndex={-1} aria-label="Invitation" className="outline-none">
      {children}
    </div>
  );
}

/** Whether the invitation is open, for anything living outside the gate (the music). */
export function useInvitationOpen() {
  return useSyncExternalStore(subscribe, isOpenEntry, getServerSnapshot);
}

/** Whether this guest has opened their invitation on this device before (the envelope offers a way past it). */
export function useOpenedBefore() {
  return useSyncExternalStore(subscribe, wasOpenedBefore, getServerSnapshot);
}

/** Opens the invitation from inside the opening (the envelope's seal). */
export function useOpenInvitation() {
  return useContext(OpenInvitationContext);
}
