import { notFound } from "next/navigation";
import { Closing } from "@/components/Invitation/Closing";
import { InvitationGate } from "@/components/Invitation/InvitationGate";
import { Opening } from "@/components/Invitation/Opening";
import { VenueCard } from "@/components/Place/VenueCard";
import { RSVP } from "@/components/RSVP/RSVP";
import { Timeline } from "@/components/Story/Timeline";
import { Schedule } from "@/components/WeddingDay/Schedule";
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

  return (
    <main id="top">
      <InvitationGate
        opening={
          <Opening
            monogram={wedding.couple.monogram}
            coupleName={wedding.couple.displayName}
            date={wedding.date.display}
            city={wedding.location.city}
            eyebrow={content.opening.eyebrow}
            cta={content.opening.cta}
            signature={content.opening.signature}
            guestName={displayName}
          />
        }
      >
        {sections.story && <Timeline entries={story} copy={content.story} />}
        {sections.day && (
          <Schedule wedding={wedding} events={events} copy={content.day} onlineCopy={content.onlineCeremony} />
        )}
        {sections.place && <VenueCard location={wedding.location} copy={content.place} />}
        {sections.rsvp && (
          <RSVP code={guest.code} greeting={displayName} names={guest.names} copy={content.rsvp} />
        )}
        <Closing wedding={wedding} copy={content.closing} signature={content.opening.signature} />
      </InvitationGate>
    </main>
  );
}
