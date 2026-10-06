"use client";

import { useEffect, useRef } from "react";

type StoryVideoProps = {
  src: string;
  /** Still shown until the clip loads, and instead of it for reduced motion. */
  poster: string;
  alt: string;
};

/**
 * A milestone's moment on film (the proposal), in a portrait frame: a short,
 * silent clip that plays by itself while it is on screen and loops, like a
 * photo that comes alive. Being silent, browsers let it start without a tap,
 * and the invitation's song carries on over it. Reduced motion keeps the still.
 */
export function StoryVideo({ src, poster, alt }: StoryVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Set here too: browsers only allow the autoplay if the element itself is muted.
    video.muted = true;

    // Plays only while in view; off screen it rests (and saves the guest's battery).
    const observer = new IntersectionObserver(
      ([entry]) => {
        // A phone in low-power mode can refuse; the still stays, and a tap plays it.
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
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
        className="size-full object-cover [filter:var(--photo-filter)]"
      />
    </div>
  );
}
