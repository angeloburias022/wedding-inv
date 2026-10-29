import { useSyncExternalStore } from "react";
import weddingData from "@/data/wedding.json";
import { weddingPhaseAt, type WeddingPhase } from "@/lib/days";

const { startsAt, timeZone } = weddingData.date;

// Checked once a minute; React re-renders only when the phase itself changes.
function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}

/**
 * Where the guest is relative to the wedding, for the parts of the invitation
 * that step aside once it has happened: the calendar buttons from the start of
 * the ceremony, the RSVP from the day after. Pages are prerendered, so the
 * server can't know (null) and renders everything; the browser then decides.
 */
export function useWeddingPhase(): WeddingPhase | null {
  return useSyncExternalStore(
    subscribe,
    () => weddingPhaseAt(Date.now(), startsAt, timeZone),
    () => null,
  );
}
