"use client";

import { useEffect, useRef } from "react";
import { holdMusic, releaseMusic } from "@/components/Music/Music";

type StoryVideoProps = {
  src: string;
  /** Still shown until the clip loads, and instead of it for reduced motion. */
  poster: string;
  alt: string;
};

/**
 * A milestone's moment on film (the proposal), in a portrait frame: a short
 * clip that plays silently by itself while it is on screen and loops, like a
 * photo that comes alive, with the invitation's song carrying on over it.
 * Browsers allow that only because it starts muted.
 *
 * The guest has the browser's own player controls: pause, scrub, sound, full
 * screen (no download). A button of our own for the sound was tried and
 * dropped: iPhones put their own mute control in the same corner. Turning the
 * sound on carries on from where the clip is; the song steps aside until the
 * clip is muted again, ends or leaves the screen. Reduced motion keeps the
 * still until the guest plays it.
 */
export function StoryVideo({ src, poster, alt }: StoryVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // Set here too: browsers only allow the autoplay if the element itself is muted.
    video.muted = true;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Starts once a good part of it is on screen, and rests when it has left entirely
    // (which saves the guest's battery). In between it is left as the guest has it:
    // they can use the controls while only part of the frame is showing.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.4) {
          // A phone in low-power mode can refuse; the still stays, and the controls play it.
          if (!still) video.play().catch(() => {});
        } else if (!entry.isIntersecting) {
          video.pause();
          // Scrolled past with the sound on: back to silent, so the song isn't left waiting.
          video.muted = true;
        }
      },
      { threshold: [0, 0.4] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    // As wide as its milestone allows; the milestone keeps it within the screen.
    <div className="relative aspect-[9/16] w-full overflow-hidden bg-surface">
      <video
        ref={ref}
        src={src}
        poster={poster}
        controls
        // No "Download" in the player's menu, and no "Save video as" on a right-click.
        controlsList="nodownload"
        onContextMenu={(event) => event.preventDefault()}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
        // The guest turned the clip's sound on or off with the player's controls.
        onVolumeChange={(event) => {
          const video = event.currentTarget;
          const audible = !video.muted && video.volume > 0;
          // Silent, it loops; with sound it plays through once.
          video.loop = !audible;
          if (audible) holdMusic("clip");
          else releaseMusic("clip");
        }}
        // Reached the end with the sound on: back to the silent loop, and the song returns.
        onEnded={(event) => {
          const video = event.currentTarget;
          video.muted = true;
          video.play().catch(() => {});
        }}
        className="size-full object-cover [filter:var(--photo-filter)]"
      />
    </div>
  );
}
