import { Reveal } from "@/components/Motion/Reveal";
import { photoRatio } from "@/lib/photos";
import type { StoryEntry } from "@/lib/wedding";
import { PhotoCarousel } from "./PhotoCarousel";

type TimelineEntryProps = {
  entry: StoryEntry;
  /** Alternates the image side on desktop. */
  flipped: boolean;
};

export function TimelineEntry({ entry, flipped }: TimelineEntryProps) {
  return (
    <li className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
      <Reveal className={flipped ? "md:order-2" : undefined}>
        <PhotoCarousel
          images={entry.images}
          alt={`${entry.title}, ${entry.location}`}
          sizes="(min-width: 768px) 45vw, 100vw"
          placeholder={entry.date}
          ratio={photoRatio(entry.images[0])}
        />
      </Reveal>

      <Reveal delay={0.15} y={12} className="flex flex-col gap-4 text-center md:text-left">
        <p className="font-display text-5xl leading-none text-accent md:text-6xl">{entry.date}</p>
        <h3 className="label text-ink">{entry.title}</h3>
        <blockquote className="font-display text-2xl leading-snug text-balance italic md:text-3xl">
          “{entry.caption}”
        </blockquote>
        <p className="label text-muted">{entry.location}</p>
      </Reveal>
    </li>
  );
}
