import { SectionHeader } from "@/components/Invitation/SectionHeader";
import type { Content, StoryEntry } from "@/lib/wedding";
import { TimelineEntry } from "./TimelineEntry";

type TimelineProps = {
  entries: StoryEntry[];
  copy: Content["story"];
};

/** US — the relationship timeline (handoff §7). */
export function Timeline({ entries, copy }: TimelineProps) {
  return (
    <section id="story" aria-labelledby="story-title" className="scroll-mt-8 px-6 py-24 md:py-32">
      <SectionHeader id="story-title" eyebrow={copy.eyebrow} title={copy.title} />
      <ol className="mx-auto flex max-w-5xl flex-col gap-24 md:gap-32">
        {entries.map((entry, index) => (
          <TimelineEntry key={`${entry.date}-${entry.title}`} entry={entry} flipped={index % 2 === 1} />
        ))}
      </ol>
    </section>
  );
}
