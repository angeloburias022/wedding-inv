"use client";

import { useEffect, useState } from "react";

type Chapter = { id: string; label: string };

/** Scrolled this far (px), the guest is reading and the dots appear. */
const SHOW_AFTER_PX = 200;

/**
 * Chapter dots on the right edge: which section the guest is in, how much is
 * left, and a tap to jump (e.g. straight to the RSVP). Appears once the guest
 * starts scrolling; labels show on hover and to screen readers.
 */
export function ChapterNav({ chapters }: { chapters: Chapter[] }) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    window.addEventListener("scroll", onScroll, { passive: true });

    // A chapter is current while it crosses the middle of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const { id } of chapters) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [chapters]);

  return (
    <nav
      aria-label="Chapters"
      className={`fixed top-1/2 right-1 z-10 -translate-y-1/2 transition-opacity duration-700 md:right-4 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ol className="flex flex-col items-end">
        {chapters.map(({ id, label }) => {
          const current = id === active;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-label={label}
                aria-current={current ? "location" : undefined}
                className="group flex items-center gap-3 p-2.5"
              >
                <span className="label hidden text-[0.6rem] text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
                  {label}
                </span>
                <span
                  aria-hidden
                  className={`block size-1.5 rounded-full transition-all duration-500 ${
                    current ? "scale-150 bg-detail" : "bg-line group-hover:bg-detail"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
