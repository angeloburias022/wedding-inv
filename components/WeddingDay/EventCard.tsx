import { mapUrl, type WeddingEvent } from "@/lib/wedding";

type EventCardProps = {
  event: WeddingEvent;
  /** The ceremony leads; dinner is visually subordinate (handoff §8). */
  emphasis: "primary" | "secondary";
  /** The same moment in several places (Melbourne, Manila), shown side by side at equal size in place of the single time. */
  times?: { time: string; label: string }[];
};

export function EventCard({ event, emphasis, times }: EventCardProps) {
  const primary = emphasis === "primary";

  return (
    <article className="flex flex-col items-center gap-3 text-center">
      <h3 className="label text-muted">{event.label}</h3>
      {times && times.length > 1 ? (
        // Sized to the screen so two times fit on one line on a phone.
        <dl className="mb-3 flex items-start justify-center divide-x divide-line">
          {times.map(({ time, label }) => (
            <div key={label} className="flex flex-col-reverse items-center gap-3 px-[4vw] first:pl-0 last:pr-0 md:px-8">
              <dt className="label text-muted">{label}</dt>
              <dd className="font-display text-[clamp(2rem,10.5vw,3.75rem)] leading-none whitespace-nowrap md:text-7xl">
                {time}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p
          className={`font-display leading-none ${primary ? "text-6xl md:text-7xl" : "text-4xl md:text-5xl"}`}
        >
          {event.time}
        </p>
      )}
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
