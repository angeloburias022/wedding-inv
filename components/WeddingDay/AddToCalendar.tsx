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
 * a calendar file for everything else, each with a line saying what it does.
 * The date goes into the guest's own calendar, in their own time zone, with a
 * link back to their invitation.
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

  const choices = [
    { href: links.google, label: copy.google, hint: copy.googleHint, arrow: "↗", newTab: true },
    { href: links.file, label: copy.file, hint: copy.fileHint, arrow: "↓", newTab: false },
  ];

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
      {/* Stays in the page so it can fade; `inert` keeps it out of reach while closed. */}
      <div
        id={menuId}
        inert={!open}
        className={`absolute top-full z-10 mt-4 flex w-[min(21rem,calc(100vw-3rem))] flex-col divide-y divide-line border border-line bg-surface text-left shadow-[0_12px_32px_-16px_rgb(36_34_32/0.35)] transition duration-200 ease-out motion-reduce:transition-none ${
          open ? "opacity-100" : "invisible -translate-y-1 opacity-0"
        }`}
      >
        {choices.map(({ href, label, hint, arrow, newTab }) => (
          <a
            key={label}
            href={href}
            {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
            onClick={() => setOpen(false)}
            className="group flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-background focus-visible:bg-background focus-visible:-outline-offset-2"
          >
            <span className="flex flex-col gap-1.5">
              <span className="label text-ink transition-colors group-hover:text-accent">{label}</span>
              <span className="text-sm leading-snug text-muted">{hint}</span>
            </span>
            <span aria-hidden className="w-4 text-center text-base leading-none text-detail">
              {arrow}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
