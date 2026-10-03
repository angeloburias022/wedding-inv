"use client";

import { useEffect, useState } from "react";
import { useInvitationOpen } from "@/components/Invitation/InvitationGate";
import type { Content } from "@/lib/wedding";

type MusicProps = {
  src: string;
  /** Shown as the button's tooltip, e.g. "Risk It All · Bruno Mars". */
  title: string;
  copy: Content["music"];
};

const VOLUME = 0.7;
const FADE_IN_MS = 2500;

// One player per page, reachable from the envelope's tap handler.
let player: HTMLAudioElement | null = null;
let fadeFrame = 0;

/**
 * Starts the song from the beginning, fading in. Browsers only allow sound
 * from inside a tap, so the envelope calls this straight from the seal's click
 * handler, before any awaiting. iPhones ignore the volume and start at full level.
 */
export function startMusic() {
  const audio = player;
  if (!audio || !audio.paused) return;
  // Opening the envelope again (after Back) is a fresh start, not a resume.
  audio.currentTime = 0;
  audio.volume = 0;
  audio.play().then(
    () => {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / FADE_IN_MS, 1);
        audio.volume = VOLUME * progress;
        if (progress < 1) fadeFrame = requestAnimationFrame(step);
      };
      fadeFrame = requestAnimationFrame(step);
    },
    // No file yet, or the browser refused: the invitation opens in silence.
    () => {},
  );
}

function toggleMusic() {
  const audio = player;
  if (!audio) return;
  if (!audio.paused) return audio.pause();
  cancelAnimationFrame(fadeFrame);
  audio.volume = VOLUME;
  audio.play().catch(() => {});
}

/**
 * The invitation's song (set by `music` in wedding.json). It starts with the
 * tap on the seal and loops; a small button in the bottom-left corner pauses
 * and resumes it. It pauses when the guest leaves the tab, returns to the
 * envelope, or taps into an embedded player (the livestream). A reloaded
 * invitation has no tap to start from, so the button waits to be pressed.
 * Lives outside the gate so the song carries from the envelope into the story.
 */
export function Music({ src, title, copy }: MusicProps) {
  const open = useInvitationOpen();
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  // Browser Back to the envelope: the button is gone, so the song stops too.
  useEffect(() => {
    if (!open) player?.pause();
  }, [open]);

  useEffect(() => {
    let resume = false;
    const onVisibility = () => {
      if (!player) return;
      if (document.hidden) {
        resume = !player.paused;
        player.pause();
      } else if (resume) {
        resume = false;
        player.play().catch(() => {});
      }
    };
    // Focus moving into an iframe is the only sign that an embedded video was tapped.
    const onBlur = () => {
      if (document.activeElement instanceof HTMLIFrameElement) player?.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <>
      <audio
        ref={(element) => {
          player = element;
          // A missing file can fail before React is listening for the error event.
          if (element?.error) setFailed(true);
        }}
        src={src}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />
      {open && !failed && (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={playing ? copy.pause : copy.play}
          title={title}
          style={{ animationDelay: "1200ms" }}
          className="animate-rise fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-4 z-10 flex size-11 items-center justify-center rounded-full bg-background/85 text-muted shadow-sm backdrop-blur-sm transition-colors hover:text-accent md:left-6"
        >
          {playing ? (
            <span aria-hidden className="flex h-3.5 items-end gap-[3px]">
              {[0, 450, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="animate-equalizer h-full w-px origin-bottom bg-current"
                  style={{ animationDelay: `-${delay}ms` }}
                />
              ))}
            </span>
          ) : (
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="size-4 fill-none stroke-current"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l10-2v13" />
              <circle cx="6.5" cy="18" r="2.5" />
              <circle cx="16.5" cy="16" r="2.5" />
            </svg>
          )}
        </button>
      )}
    </>
  );
}
