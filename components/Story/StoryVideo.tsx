"use client";

import { useEffect, useRef, useState } from "react";
import { holdMusic, releaseMusic } from "@/components/Music/Music";

type StoryVideoProps = {
  src: string;
  /** Still shown until the clip loads, and instead of it for reduced motion. */
  poster: string;
  alt: string;
  /** Accessible names for the speaker button: turning the clip's sound on, and off again. */
  soundLabels: { on: string; off: string };
};

/**
 * A milestone's moment on film (the proposal), in a portrait frame: a short
 * clip that plays silently by itself while it is on screen and loops, like a
 * photo that comes alive, with the invitation's song carrying on over it.
 * Browsers allow that only because it starts muted. A speaker button plays it
 * once from the start with its own sound, and the song steps aside until it
 * ends, is muted again or leaves the screen. Reduced motion keeps the still.
 */
export function StoryVideo({ src, poster, alt, soundLabels }: StoryVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);

  /** Back to the silent loop, and the song returns. */
  const silence = () => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.loop = true;
    setSound(false);
    releaseMusic();
  };

  const toggleSound = () => {
    const video = ref.current;
    if (!video) return;
    if (sound) return silence();
    holdMusic();
    video.muted = false;
    // Heard once, from the start, rather than joined halfway.
    video.loop = false;
    video.currentTime = 0;
    setSound(true);
    video.play().catch(() => {});
  };

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // Set here too: browsers only allow the autoplay if the element itself is muted.
    video.muted = true;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Plays only while in view; off screen it rests (and saves the guest's battery).
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // A phone in low-power mode can refuse; the still stays, and a tap plays it.
          if (!still) video.play().catch(() => {});
          return;
        }
        video.pause();
        // Scrolled past with the sound on: don't leave the song waiting.
        if (!video.muted) {
          video.muted = true;
          video.loop = true;
          setSound(false);
          releaseMusic();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    // Never taller than most of the screen, on a phone or beside the text on desktop.
    <div className="relative mx-auto aspect-[9/16] w-[min(100%,45svh)] overflow-hidden bg-surface">
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
        onClick={(event) => {
          const video = event.currentTarget;
          if (video.paused) video.play().catch(() => {});
          else video.pause();
        }}
        // With the sound on it plays once; then the silent loop and the song resume.
        onEnded={() => {
          silence();
          ref.current?.play().catch(() => {});
        }}
        className="size-full object-cover [filter:var(--photo-filter)]"
      />
      <button
        type="button"
        onClick={toggleSound}
        aria-label={sound ? soundLabels.off : soundLabels.on}
        aria-pressed={sound}
        className="absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full bg-background/85 text-muted shadow-sm backdrop-blur-sm transition-colors hover:text-accent aria-pressed:text-accent"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="size-4 fill-none stroke-current"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 5 6.5 8.5H3v7h3.5L11 19z" />
          {sound ? (
            <>
              <path d="M15.5 9a4.5 4.5 0 0 1 0 6" />
              <path d="M18.5 6.5a8.5 8.5 0 0 1 0 11" />
            </>
          ) : (
            <path d="m21 9.5-5 5m0-5 5 5" />
          )}
        </svg>
      </button>
    </div>
  );
}
