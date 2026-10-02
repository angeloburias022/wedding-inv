"use client";

import { useHasReplied } from "./replied";

type RsvpReminderProps = {
  code: string;
  message: string;
  cta: string;
};

/** A soft nudge in the closing for guests who reach the end without replying; gone once they have. */
export function RsvpReminder({ code, message, cta }: RsvpReminderProps) {
  const replied = useHasReplied(code);
  if (replied !== false) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-display text-xl text-muted italic">{message}</p>
      <a href="#rsvp" className="label border-b border-accent/40 pb-1 text-accent transition-colors hover:border-accent">
        {cta} ↑
      </a>
    </div>
  );
}
