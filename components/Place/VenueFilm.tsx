"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Invitation/Photo";

type VenueFilmProps = {
  src: string;
  /** Still shown before the video loads, and instead of it for reduced motion. */
  poster: string | null;
  alt: string;
  /** Width / height of the poster, for the reduced-motion still. */
  ratio: number;
};

/**
 * A short venue clip that plays as the guest scrolls — forward down the page,
 * backward up it. The frame stays pinned while the tall wrapper scrolls past.
 * Seeking is only smooth when every frame is a keyframe (see README).
 */
export function VenueFilm({ src, poster, alt, ratio }: VenueFilmProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const target = useRef(0);

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    target.current = progress;
  });

  // Ease the playhead towards the scroll position each frame, so seeking feels continuous.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const video = videoRef.current;
      if (video?.duration) {
        const goal = target.current * video.duration;
        if (Math.abs(goal - video.currentTime) > 0.01) {
          video.currentTime += (goal - video.currentTime) * 0.2;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Reduced motion swaps in the still via CSS, so server and client render the same markup.
  return (
    <>
      <div className="w-full motion-safe:hidden">
        <Photo src={poster} alt={alt} aspect={ratio} sizes="(min-width: 896px) 896px, 100vw" placeholder="The venue" />
      </div>

      <div ref={wrapperRef} className="relative h-[200svh] w-full motion-reduce:hidden">
        <div className="sticky top-0 flex h-svh items-center">
          <video
            ref={videoRef}
            src={src}
            poster={poster ?? undefined}
            muted
            playsInline
            preload="auto"
            aria-label={alt}
            // iOS won't paint seeked frames until the video has played once.
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              video.play().then(
                () => video.pause(),
                () => {},
              );
            }}
            className="aspect-[4/5] max-h-[85svh] w-full bg-surface object-cover [filter:var(--photo-filter)] md:aspect-video"
          />
        </div>
      </div>
    </>
  );
}
