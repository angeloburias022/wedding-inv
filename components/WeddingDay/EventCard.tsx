import { mapUrl, type WeddingEvent } from "@/lib/wedding";

type EventCardProps = {
  event: WeddingEvent;
  /** The ceremony leads; dinner is visually subordinate (handoff §8). */
  emphasis: "primary" | "secondary";
};

export function EventCard({ event, emphasis }: EventCardProps) {
  const primary = emphasis === "primary";

  return (
    <article className="flex flex-col items-center gap-3 text-center">
      <h3 className="label text-muted">{event.label}</h3>
      <p
        className={`font-display leading-none ${primary ? "text-6xl md:text-7xl" : "text-4xl md:text-5xl"}`}
      >
        {event.time}
      </p>
      <p className={`font-display ${primary ? "text-2xl" : "text-xl"}`}>{event.venue}</p>
      {event.room && <p className="label text-ink">{event.room}</p>}
      <a
        href={mapUrl(`${event.venue}, ${event.address}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
      >
        {event.address}
      </a>
      {event.note && <p className="mt-2 font-display text-xl text-muted italic">{event.note}</p>}
    </article>
  );
}
