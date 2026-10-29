"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { holdMusic, releaseMusic } from "@/components/Music/Music";
import type { Content } from "@/lib/wedding";
import { youtubeId, type StreamStatus } from "@/lib/youtube";

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
/** How often an open page asks whether the stream is live (the server shares one answer per 30 s). */
const STATUS_EVERY_MS = 30 * 1000;
/** Stop asking this long after the start, even if YouTube never says it ended. */
const STATUS_FOR_MS = 12 * HOUR;
/** setTimeout's limit (~24.8 days); pages opened earlier update on the next visit instead. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

const getServerSnapshot = (): Phase => "upcoming";

const PLAYER_ORIGIN = "https://www.youtube-nocookie.com";
// YouTube's player states: playing, buffering → the song steps aside; paused, ended → it may return.
const PLAYING = [1, 3];
const STOPPED = [0, 2];

/**
 * Whether the stream is really live, from /api/stream-status, while it could
 * be: from when the player appears until YouTube says it has ended. Asked again
 * when the guest comes back to the tab. "unknown" leaves the badge to the clock.
 */
function useStreamStatus(asking: boolean, until: number): StreamStatus {
  const [status, setStatus] = useState<StreamStatus>("unknown");
  useEffect(() => {
    if (!asking) return;
    let cancelled = false;
    const stop = () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", ask);
    };
    const ask = async () => {
      if (Date.now() > until) return stop();
      if (document.hidden) return;
      try {
        const response = await fetch("/api/stream-status");
        const { status } = (await response.json()) as { status: StreamStatus };
        if (cancelled) return;
        setStatus(status);
        // Over for good: nothing more to ask.
        if (status === "ended") stop();
      } catch {
        // Offline for a moment: keep the last answer.
      }
    };
    const timer = setInterval(ask, STATUS_EVERY_MS);
    document.addEventListener("visibilitychange", ask);
    ask();
    return () => {
      cancelled = true;
      stop();
    };
  }, [asking, until]);
  return status;
}

/** The player state in one of YouTube's messages, if it carries one. */
function playerState(data: unknown): number | undefined {
  try {
    const message = typeof data === "string" ? JSON.parse(data) : data;
    if (message?.event === "onStateChange") return message.info;
    if (message?.event === "infoDelivery") return message.info?.playerState;
  } catch {
    // Not one of YouTube's messages.
  }
  return undefined;
}

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
 * status badge — starting soon, live now, then the replay. The badge follows
 * YouTube's own answer (/api/stream-status) and falls back to the clock.
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

  const status = useStreamStatus(phase !== "upcoming" && Boolean(id), start + STATUS_FOR_MS);
  // The song steps aside while the stream plays and comes back when it stops.
  // The player reports its state by message once we say we're listening.
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;
    const listen = () =>
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: "livestream", channel: "widget" }), PLAYER_ORIGIN);
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow || event.origin !== PLAYER_ORIGIN) return;
      const state = playerState(event.data);
      if (state === undefined) return;
      if (PLAYING.includes(state)) holdMusic("stream");
      else if (STOPPED.includes(state)) releaseMusic("stream");
    };
    iframe.addEventListener("load", listen);
    window.addEventListener("message", onMessage);
    return () => {
      iframe.removeEventListener("load", listen);
      window.removeEventListener("message", onMessage);
      releaseMusic("stream");
    };
  }, [phase]);

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

  // YouTube's answer when there is one; otherwise the clock's best guess.
  const shown =
    status === "live" ? "live" : status === "upcoming" ? "soon" : status === "ended" ? "replay" : phase;
  const badge = { soon: copy.startingSoon, live: copy.liveNow, replay: copy.replay }[shown];

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <p className="label flex items-center gap-2 text-accent" role="status">
        {shown === "live" && (
          <span aria-hidden className="size-2 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
        )}
        {badge}
      </p>
      <div className="aspect-video w-full overflow-hidden bg-surface">
        <iframe
          ref={frame}
          src={`${PLAYER_ORIGIN}/embed/${id}?enablejsapi=1`}
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
