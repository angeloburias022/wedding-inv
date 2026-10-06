import { Opening } from "@/components/Invitation/Opening";
import { Music } from "@/components/Music/Music";
import { content, wedding } from "@/lib/wedding";

/** Generic landing (e.g. someone types the bare domain). Personal details live behind /invite/[code]. */
export default function Home() {
  return (
    <main>
      {wedding.music && (
        <Music
          src={wedding.music.src}
          autoStartAt={wedding.music.landingStartAt}
          title={`${wedding.music.title} · ${wedding.music.artist}`}
          copy={content.music}
        />
      )}
      <Opening
        coupleName={wedding.couple.displayName}
        date={wedding.date.display}
        city={wedding.location.city}
        eyebrow={content.opening.eyebrow}
        cta={content.opening.cta}
        envelopeHint={content.opening.envelopeHint}
        skip={content.opening.skip}
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
