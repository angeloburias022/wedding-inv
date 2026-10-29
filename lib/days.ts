/** The calendar date ("2027-02-10") of a moment, in a given time zone. */
export function dayIn(ms: number, timeZone: string): string {
  return new Date(ms).toLocaleDateString("en-CA", { timeZone });
}

/** Whole calendar days from one "YYYY-MM-DD" date to another (negative if `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Before the ceremony, after it on the wedding day, or any later day (in the wedding's time zone). */
export type WeddingPhase = "before" | "underway" | "after";

export function weddingPhaseAt(ms: number, startsAt: string, timeZone: string): WeddingPhase {
  const start = new Date(startsAt).getTime();
  if (ms < start) return "before";
  return dayIn(ms, timeZone) === dayIn(start, timeZone) ? "underway" : "after";
}
