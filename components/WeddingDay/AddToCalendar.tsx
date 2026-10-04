"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Content } from "@/lib/wedding";

/** Where each choice in the menu goes; built on the server for this guest's invitation. */
export type CalendarLinks = {
  google: string;
  /** The .ics file: Apple Calendar, Outlook and the rest. */
  file: string;
};

type AddToCalendarProps = {
  links: CalendarLinks;
  copy: Content["calendar"];
  /** A quiet text link beside the ceremony, or the main button after a "yes". */
  emphasis: "link" | "button";
};

/**
 * "Add to calendar": a small menu with Google Calendar (opens pre-filled) and
 * a calendar file for everything else. The date goes into the guest's own
 * calendar, in their own time zone, with a link back to their invitation.
 */
export function AddToCalendar({ links, copy, emphasis }: AddToCalendarProps) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const itemClass =
    "label flex min-h-12 items-center justify-center px-6 text-ink transition-colors hover:text-accent focus-visible:text-accent";

  return (
    <div ref={wrapper} className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        className={
          emphasis === "button"
            ? "label min-h-12 border border-ink px-10 py-3 transition-colors hover:bg-ink hover:text-surface focus-visible:bg-ink focus-visible:text-surface"
            : "label border-b border-accent/40 pb-1 text-accent transition-colors hover:border-accent"
        }
      >
        {copy.cta}
      </button>
      <div
        id={menuId}
        hidden={!open}
        className="absolute top-full z-10 mt-3 flex w-max flex-col divide-y divide-line border border-line bg-surface shadow-sm"
      >
        <a href={links.google} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={itemClass}>
          {copy.google}
        </a>
        <a href={links.file} onClick={() => setOpen(false)} className={itemClass}>
          {copy.file}
        </a>
      </div>
    </div>
  );
}
