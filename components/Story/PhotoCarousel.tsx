"use client";

import { useRef, useState } from "react";
import { Photo } from "@/components/Invitation/Photo";

type PhotoCarouselProps = {
  images: string[];
  alt: string;
  placeholder: string;
  sizes: string;
  /** Width / height shared by every slide (from the first photo), like an Instagram carousel. */
  ratio: number;
};

/** Swipeable photos (scroll-snap slides, a counter and dots); a single photo renders plainly. */
export function PhotoCarousel({ images, alt, placeholder, sizes, ratio }: PhotoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  if (count <= 1) {
    return <Photo src={images[0] ?? null} alt={alt} aspect={ratio} sizes={sizes} placeholder={placeholder} />;
  }

  const goTo = (next: number) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  };

  const arrowClass =
    "absolute top-1/2 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/85 text-ink shadow-sm transition-opacity hover:bg-surface disabled:pointer-events-none disabled:opacity-0 md:flex";

  return (
    <div>
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={(event) => {
            const track = event.currentTarget;
            setIndex(Math.round(track.scrollLeft / track.clientWidth));
          }}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={alt}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <div
              key={src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              className="w-full shrink-0 snap-center"
            >
              <Photo src={src} alt={alt} aspect={ratio} sizes={sizes} placeholder={placeholder} />
            </div>
          ))}
        </div>

        <span className="absolute top-3 right-3 rounded-full bg-ink/60 px-2.5 py-1 text-[0.7rem] leading-none text-surface tabular-nums">
          {index + 1}/{count}
        </span>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous photo"
          className={`${arrowClass} left-3`}
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === count - 1}
          aria-label="Next photo"
          className={`${arrowClass} right-3`}
        >
          ›
        </button>
      </div>

      <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
        {images.map((src, i) => (
          <span
            key={src}
            className={`size-1.5 rounded-full transition-colors ${i === index ? "bg-accent" : "bg-line"}`}
          />
        ))}
      </div>
    </div>
  );
}
