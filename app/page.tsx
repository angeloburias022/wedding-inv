import { Opening } from "@/components/Invitation/Opening";
import { content, wedding } from "@/lib/wedding";

/** Generic landing (e.g. someone types the bare domain). Personal details live behind /invite/[code]. */
export default function Home() {
  return (
    <main>
      <Opening
        monogram={wedding.couple.monogram}
        coupleName={wedding.couple.displayName}
        date={wedding.date.display}
        city={wedding.location.city}
        eyebrow={content.opening.eyebrow}
        cta={content.opening.cta}
        envelopeHint={content.opening.envelopeHint}
        signature={content.opening.signature}
        fallbackNote="Please scan the QR code on your invitation, or open the link we sent you."
        countdown={{
          startsAt: wedding.date.startsAt,
          timeZone: wedding.date.timeZone,
          copy: content.day.countdown,
          daysToGo: content.opening.daysToGo,
          tomorrow: content.opening.tomorrow,
        }}
      />
    </main>
  );
}
