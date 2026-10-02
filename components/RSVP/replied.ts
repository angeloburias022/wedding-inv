import { useSyncExternalStore } from "react";

/**
 * Remembers on this device that a guest has replied, so the closing's RSVP
 * reminder disappears for good. The Sheet stays the source of truth; this is
 * only a courtesy, and it's per device.
 */
const key = (code: string) => `rsvpReplied:${code}`;
const CHANGE_EVENT = "rsvp-replied";

export function markReplied(code: string) {
  try {
    localStorage.setItem(key(code), "1");
  } catch {
    // Storage unavailable (private mode): the reminder may show again on reload.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** null until known in the browser (the server can't tell), then true / false. */
export function useHasReplied(code: string): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key(code)) === "1";
      } catch {
        return false;
      }
    },
    () => null,
  );
}
