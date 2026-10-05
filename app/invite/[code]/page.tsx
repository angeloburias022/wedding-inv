import { notFound } from "next/navigation";
import { ChapterNav } from "@/components/Invitation/ChapterNav";
import { Closing } from "@/components/Invitation/Closing";
import { InvitationGate } from "@/components/Invitation/InvitationGate";
import { Opening } from "@/components/Invitation/Opening";
import { ScrollHint } from "@/components/Invitation/ScrollHint";
import { Music } from "@/components/Music/Music";
import { VenueCard } from "@/components/Place/VenueCard";
import { RSVP } from "@/components/RSVP/RSVP";
import { Timeline } from "@/components/Story/Timeline";
import { Schedule } from "@/components/WeddingDay/Schedule";
import { googleCalendarUrl, weddingEvent } from "@/lib/calendar";
import { getGuest, guestDisplayName, guests } from "@/lib/guests";
import { content, events, story, wedding } from "@/lib/wedding";

// Every invitation is prerendered from guests.json; unknown codes 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return guests.map((guest) => ({ code: guest.code }));
}

export default async function InvitePage({ params }: PageProps<"/invite/[code]">) {
  const { code } = await params;
  const guest = getGuest(code);
  if (!guest) notFound();

  const displayName = guestDisplayName(guest);
  const { sections } = wedding.settings;
  const calendar = {
    google: googleCalendarUrl(weddingEvent(guest.code)),
    file: `/invite/${guest.code}/wedding.ics`,
  };

  return (
    <main id="top">
      {wedding.music && (
        <Music
          src={wedding.music.src}
          title={`${wedding.music.title} · ${wedding.music.artist}`}
          copy={content.music}
        />
      )}
      <InvitationGate
        opening={
          <Opening
            coupleName={wedding.couple.displayName}
            date={wedding.date.display}
            city={wedding.location.city}
            eyebrow={content.opening.eyebrow}
            cta={content.opening.cta}
            envelopeHint={content.opening.envelopeHint}
            skip={content.opening.skip}
            signature={content.opening.signature}
            guestName={displayName}
            countdown={{
              startsAt: wedding.date.startsAt,
              timeZone: wedding.date.timeZone,
              copy: content.day.countdown,
              daysToGo: content.opening.daysToGo,
              tomorrow: content.opening.tomorrow,
            }}
          />
        }
      >
        <ScrollHint label={content.opening.scrollHint} />
        <ChapterNav
          chapters={[
            { id: "story", label: content.story.eyebrow, on: sections.story },
            { id: "day", label: content.day.eyebrow, on: sections.day },
            { id: "place", label: content.place.eyebrow, on: sections.place },
            { id: "rsvp", label: content.rsvp.eyebrow, on: sections.rsvp },
          ]
            .filter((chapter) => chapter.on)
            .map(({ id, label }) => ({ id, label }))}
        />
        {sections.story && <Timeline entries={story} copy={content.story} />}
        {sections.day && (
          <Schedule
            wedding={wedding}
            events={events}
            copy={content.day}
            onlineCopy={content.onlineCeremony}
            calendarCopy={content.calendar}
            calendar={calendar}
          />
        )}
        {sections.place && <VenueCard location={wedding.location} copy={content.place} />}
        {sections.rsvp && (
          <RSVP
            code={guest.code}
            greeting={displayName}
            names={guest.names}
            copy={content.rsvp}
            calendarCopy={content.calendar}
            calendar={calendar}
          />
        )}
        <Closing
          wedding={wedding}
          copy={content.closing}
          signature={content.opening.signature}
          rsvpCode={sections.rsvp ? guest.code : undefined}
        />
      </InvitationGate>
    </main>
  );
}
