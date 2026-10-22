import type { CSSProperties } from "react";
import { RevealGroup, RevealItem } from "@/components/Motion/Reveal";
import { photoRatio } from "@/lib/photos";
import type { StoryEntry } from "@/lib/wedding";
import { PhotoCarousel } from "./PhotoCarousel";
import { StoryVideo } from "./StoryVideo";

type TimelineEntryProps = {
  entry: StoryEntry;
  /** Alternates the image side on desktop. */
  flipped: boolean;
};

/** The proposal clip's portrait frame. */
const VIDEO_RATIO = 9 / 16;

/**
 * One milestone, one screen: the page settles on it when the guest stops
 * scrolling nearby (see `.story-snap` in globals.css). The photo is sized so
 * it and its words fit together on the screen: above them on a phone (which
 * keeps about 20rem for the words and the carousel dots), beside them on
 * desktop.
 */
export function TimelineEntry({ entry, flipped }: TimelineEntryProps) {
  const ratio = entry.video ? VIDEO_RATIO : photoRatio(entry.images[0]);

  return (
    <RevealGroup
      as="li"
      className="story-snap grid min-h-svh content-center items-center gap-8 py-8 md:grid-cols-2 md:gap-16"
    >
      <RevealItem className={flipped ? "md:order-2" : undefined}>
        <div
          style={{ "--ratio": ratio } as CSSProperties}
          className="mx-auto w-[min(100%,calc((100svh-20rem)*var(--ratio)))] md:w-[min(100%,calc((100svh-8rem)*var(--ratio)))]"
        >
          {entry.video ? (
            <StoryVideo src={entry.video.src} poster={entry.video.poster} alt={`${entry.title}, ${entry.location}`} />
          ) : (
            <PhotoCarousel
              images={entry.images}
              alt={`${entry.title}, ${entry.location}`}
              sizes="(min-width: 768px) 45vw, 100vw"
              placeholder={entry.date}
              ratio={ratio}
            />
          )}
        </div>
      </RevealItem>

      <RevealItem delay={0.1} y={12} className="flex flex-col gap-4 text-center md:text-left">
        <p className="font-display text-5xl leading-none text-accent md:text-6xl">{entry.date}</p>
        <h3 className="label text-ink">{entry.title}</h3>
        <blockquote className="font-display text-2xl leading-snug text-balance italic md:text-3xl">
          “{entry.caption}”
        </blockquote>
        <p className="label text-muted">{entry.location}</p>
      </RevealItem>
    </RevealGroup>
  );
}
