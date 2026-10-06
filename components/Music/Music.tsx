"use client";

import { useEffect, useState } from "react";
import { useInvitationOpen } from "@/components/Invitation/InvitationGate";
import type { Content } from "@/lib/wedding";

type MusicProps = {
  src: string;
  /** Seconds into the song where it starts when the envelope opens. */
  startAt: number;
  /** Seconds into the song where it starts for a returning guest who skips the envelope. */
  skipStartAt: number;
  /** Shown as the button's tooltip, e.g. "Risk It All · Bruno Mars". */
  title: string;
  copy: Content["music"];
};

const VOLUME = 0.7;
const FADE_IN_MS = 2500;

const STORAGE_KEY = "invitationMusic";
const QUIET_KEY = "invitationMusicQuiet";

// One player per page, reachable from the envelope's tap handler.
let player: HTMLAudioElement | null = null;
let fadeFrame = 0;
/** Whether the guest wants the song on; stays true through a pause we made (hidden tab, reload). */
let wanted = false;
/** Set the first time the invitation is open in this page load; a reload is picked up then. */
let hasOpened = false;

type Saved = { time: number; playing: boolean };

/**
 * Whether the guest turned the song off, remembered on this device: a
 * returning guest who skips the envelope gets the song only if they left it
 * playing last time.
 */
function rememberChoice(on: boolean) {
  wanted = on;
  try {
    localStorage.setItem(`${QUIET_KEY}:${location.pathname}`, on ? "0" : "1");
  } catch {
    // Storage can be unavailable (private mode); returning guests then get the song.
  }
}

function choseQuiet() {
  try {
    return localStorage.getItem(`${QUIET_KEY}:${location.pathname}`) === "1";
  } catch {
    return false;
  }
}

function savePlayback() {
  if (!player) return;
  try {
    const saved: Saved = { time: player.currentTime, playing: wanted };
    sessionStorage.setItem(`${STORAGE_KEY}:${location.pathname}`, JSON.stringify(saved));
  } catch {
    // Storage can be unavailable (private mode); a reload then starts quiet.
  }
}

function readPlayback(): Saved | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(`${STORAGE_KEY}:${location.pathname}`) ?? "null");
    return typeof saved?.time === "number" ? saved : null;
  } catch {
    return null;
  }
}

/**
 * After a reload: back to where the song was and, if it was playing, on again.
 * A reload has no tap, so most browsers refuse the sound; the song then
 * resumes with the guest's first tap or key press anywhere on the page.
 */
function pickUpAfterReload(audio: HTMLAudioElement, saved: Saved) {
  const resume = () => {
    audio.currentTime = saved.time;
    if (!saved.playing) return;
    wanted = true;
    audio.volume = VOLUME;
    audio.play().catch(() => {
      const onGesture = (event: Event) => {
        document.removeEventListener("pointerup", onGesture, true);
        document.removeEventListener("keydown", onGesture, true);
        // The music button does its own toggling.
        if ((event.target as Element | null)?.closest?.("[data-music-button]")) return;
        if (wanted && audio.paused) audio.play().catch(() => {});
      };
      document.addEventListener("pointerup", onGesture, true);
      document.addEventListener("keydown", onGesture, true);
    });
  };
  if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) resume();
  else audio.addEventListener("loadedmetadata", resume, { once: true });
}

/**
 * Starts the song from its opening cue, fading in. Browsers only allow sound
 * from inside a tap, so the envelope calls this straight from the seal's click
 * handler, before any awaiting. iPhones ignore the volume and start at full level.
 * A song already playing (the guest came Back to the envelope) just carries on.
 */
export function startMusic() {
  if (player) playFrom(player, Number(player.dataset.startAt) || 0);
}

/**
 * For a returning guest who skips the envelope: the song from its own cue if
 * they left it playing last time, silence if they had turned it off. Either
 * way there is no earlier playback to pick up.
 */
export function startMusicOnSkip() {
  hasOpened = true;
  if (player && !choseQuiet()) playFrom(player, Number(player.dataset.skipStartAt) || 0);
}

function playFrom(audio: HTMLAudioElement, seconds: number) {
  if (!audio.paused) return;
  rememberChoice(true);
  // Opening the envelope with the song paused is a fresh start, not a resume.
  audio.currentTime = seconds;
  audio.volume = 0;
  audio.play().then(
    () => {
      // Some phones ignore a position set before the song has loaded; set it again once it plays.
      if (audio.currentTime < seconds - 1) audio.currentTime = seconds;
      const start = performance.now();
      const step = (now: number) => {
        // A frame's timestamp can be slightly earlier than `start`; a negative volume throws.
        const progress = Math.min(Math.max((now - start) / FADE_IN_MS, 0), 1);
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
  if (!audio.paused) {
    rememberChoice(false);
    return audio.pause();
  }
  rememberChoice(true);
  cancelAnimationFrame(fadeFrame);
  audio.volume = VOLUME;
  audio.play().catch(() => {});
}

/**
 * The invitation's song (set by `music` in wedding.json). It starts with the
 * tap on the seal and loops; a small button in the bottom-left corner pauses
 * and resumes it. It keeps playing if the guest goes Back to the envelope
 * (the button stays with it), and pauses when the guest leaves the tab or
 * taps into an embedded player (the livestream). A reload keeps
 * its place in the song and carries on as soon as the browser allows: at once
 * where it permits sound without a tap, otherwise on the guest's next tap.
 * Lives outside the gate so the song carries from the envelope into the story.
 */
export function Music({ src, startAt, skipStartAt, title, copy }: MusicProps) {
  const open = useInvitationOpen();
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || hasOpened) return;
    hasOpened = true;
    // Opened by the seal's tap: the song is already starting from the top.
    if (wanted || !player) return;
    const saved = readPlayback();
    if (saved) pickUpAfterReload(player, saved);
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
      if (!(document.activeElement instanceof HTMLIFrameElement)) return;
      wanted = false;
      player?.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("pagehide", savePlayback);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pagehide", savePlayback);
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
        data-start-at={startAt}
        data-skip-start-at={skipStartAt}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />
      {/* Hidden while the envelope first opens; back on the envelope it stays while the song plays. */}
      {(open || (playing && hasOpened)) && !failed && (
        <button
          type="button"
          data-music-button
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
