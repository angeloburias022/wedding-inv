import { SectionHeader } from "@/components/Invitation/SectionHeader";
import { Reveal } from "@/components/Motion/Reveal";
import type { Content, Events, Wedding } from "@/lib/wedding";
import { AddToCalendar, type CalendarLinks } from "./AddToCalendar";
import { Countdown } from "./Countdown";
import { EventCard } from "./EventCard";
import { LiveStream } from "./LiveStream";

type ScheduleProps = {
  wedding: Wedding;
  events: Events;
  copy: Content["day"];
  onlineCopy: Content["onlineCeremony"];
  calendarCopy: Content["calendar"];
  calendar: CalendarLinks;
};

type TimeZones = Wedding["onlineCeremony"]["timeZones"];

/** One per zone: "2:00 PM" in Melbourne, "11:00 AM" in Manila, adding the day wherever it differs from the first zone's. */
function localTimes(startsAt: string, timeZones: TimeZones) {
  const start = new Date(startsAt);
  const day = (zone: string) => start.toLocaleDateString("en-US", { timeZone: zone, weekday: "short" });
  const firstDay = timeZones[0] && day(timeZones[0].zone);
  return timeZones.map(({ label, zone }) => {
    const time = start.toLocaleTimeString("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit" });
    return { time: `${time}${day(zone) === firstDay ? "" : ` ${day(zone)}`}`, label };
  });
}

/** THE DAY — ceremony, then dinner & celebration (handoff §8, §21). */
export function Schedule({ wedding, events, copy, onlineCopy, calendarCopy, calendar }: ScheduleProps) {
  const { onlineCeremony } = wedding;
  const details = [
    ["Dress code", events.details.dressCode],
    ["Parking", events.details.parking],
    ["Getting there", events.details.transportation],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]));

  return (
    <section id="day" aria-labelledby="day-title" className="bg-surface px-6 py-24 md:py-32">
      <SectionHeader id="day-title" eyebrow={copy.eyebrow} title={copy.title} />

      <div className="mx-auto flex max-w-xl flex-col items-center gap-12">
        <Reveal y={12} className="flex flex-col items-center gap-2 text-center">
          <p className="label text-ink">{wedding.date.display}</p>
          <p className="label text-muted">{wedding.location.city}</p>
        </Reveal>

        <Reveal y={12}>
          <Countdown startsAt={wedding.date.startsAt} timeZone={wedding.date.timeZone} copy={copy.countdown} />
        </Reveal>

        <Reveal className="flex flex-col items-center gap-6">
          <EventCard
            event={events.ceremony}
            emphasis="primary"
            times={localTimes(wedding.date.startsAt, onlineCeremony.timeZones)}
          />
          <AddToCalendar links={calendar} copy={calendarCopy} emphasis="link" />
          {onlineCeremony.enabled && onlineCeremony.url && (
            <a
              href="#livestream"
              className="label border-b border-accent/40 pb-1 text-accent transition-colors hover:border-accent"
            >
              {onlineCopy.jumpLink} ↓
            </a>
          )}
        </Reveal>

        <span className="font-display text-3xl text-detail" aria-hidden>
          ↓
        </span>

        <Reveal>
          <EventCard event={events.reception} emphasis="secondary" />
        </Reveal>

        {onlineCeremony.enabled && (
          <div id="livestream" className="w-full scroll-mt-8 md:w-3xl md:max-w-[calc(100vw-3rem)]">
            {/* Wider than the text column on desktop so the player isn't cramped. */}
            <Reveal className="flex flex-col items-center gap-5 border border-line bg-background px-6 py-10 text-center md:px-12">
              <p className="label text-detail">{onlineCopy.eyebrow}</p>
              <p className="font-display text-2xl leading-snug text-balance italic">
                {onlineCeremony.url ? onlineCopy.liveMessage : onlineCopy.message}
              </p>
              <p className="label text-ink">
                {localTimes(onlineCeremony.startsAt, onlineCeremony.timeZones)
                  .map(({ time, label }) => `${time} ${label}`)
                  .join(" · ")}
              </p>
              {onlineCeremony.url && (
                <div className="mt-2 flex w-full justify-center">
                  <LiveStream url={onlineCeremony.url} startsAt={onlineCeremony.startsAt} copy={onlineCopy} />
                </div>
              )}
            </Reveal>
          </div>
        )}

        {details.length > 0 && (
          <Reveal className="w-full border-t border-line pt-12">
            <dl className="grid gap-6 text-center">
              {details.map(([term, value]) => (
                <div key={term} className="flex flex-col gap-1">
                  <dt className="label text-muted">{term}</dt>
                  <dd className="font-display text-xl">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </section>
  );
}
