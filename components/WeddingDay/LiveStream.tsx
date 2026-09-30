"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Content } from "@/lib/wedding";
import { youtubeId } from "@/lib/youtube";

type LiveStreamProps = {
  url: string;
  startsAt: string;
  copy: Content["onlineCeremony"];
};

type Phase = "upcoming" | "soon" | "live" | "replay";

const HOUR = 60 * 60 * 1000;
/** The player replaces the link this long before the start… */
const EMBED_LEAD_MS = 2 * HOUR;
/** …and "Live now" shows for this long after it, then "Watch the replay". */
const LIVE_FOR_MS = 3 * HOUR;
/** setTimeout's limit (~24.8 days); pages opened earlier update on the next visit instead. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

const getServerSnapshot = (): Phase => "upcoming";

function phaseAt(now: number, start: number): Phase {
  if (now < start - EMBED_LEAD_MS) return "upcoming";
  if (now < start) return "soon";
  if (now < start + LIVE_FOR_MS) return "live";
  return "replay";
}

/**
 * The ceremony stream (handoff §21). Pages are prerendered, so the phase is
 * worked out in the browser: a play button to YouTube (where guests can set a
 * reminder) until two hours before, then the player embedded here with a
 * status badge — starting soon, live now, then the replay.
 */
export function LiveStream({ url, startsAt, copy }: LiveStreamProps) {
  const id = youtubeId(url);
  const start = new Date(startsAt).getTime();

  // The clock is the external store: guests who keep the page open move through each phase on time.
  const subscribe = useCallback(
    (onChange: () => void) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const schedule = () => {
        const now = Date.now();
        const next = [start - EMBED_LEAD_MS, start, start + LIVE_FOR_MS].find((boundary) => boundary > now);
        if (next === undefined || next - now > MAX_TIMEOUT_MS) return;
        timer = setTimeout(() => {
          onChange();
          schedule();
        }, next - now);
      };
      schedule();
      return () => clearTimeout(timer);
    },
    [start],
  );
  const phase = useSyncExternalStore(subscribe, () => phaseAt(Date.now(), start), getServerSnapshot);

  const playButton = (label: string) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="label inline-flex min-h-12 items-center gap-3 rounded-full bg-accent px-7 text-surface transition-opacity hover:opacity-85"
    >
      <svg viewBox="0 0 12 14" aria-hidden className="size-3 fill-current">
        <path d="M0 0v14l12-7z" />
      </svg>
      {label}
    </a>
  );

  if (phase === "upcoming" || !id) return playButton(copy.cta);

  const badge = { soon: copy.startingSoon, live: copy.liveNow, replay: copy.replay }[phase];

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <p className="label flex items-center gap-2 text-accent" role="status">
        {phase === "live" && (
          <span aria-hidden className="size-2 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
        )}
        {badge}
      </p>
      <div className="aspect-video w-full overflow-hidden bg-surface">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={copy.cta}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="size-full"
        />
      </div>
      {/* Some phones play better in the YouTube app. */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="label border-b border-line pb-1 text-muted hover:border-accent hover:text-accent"
      >
        {copy.openInYouTube}
      </a>
    </div>
  );
}
