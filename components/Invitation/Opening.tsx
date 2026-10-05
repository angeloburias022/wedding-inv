import type { CSSProperties } from "react";
import { Monogram } from "@/components/Decor/Monogram";
import { Countdown } from "@/components/WeddingDay/Countdown";
import { DaysToGo } from "@/components/WeddingDay/DaysToGo";
import type { Content } from "@/lib/wedding";
import { Envelope } from "./Envelope";

type OpeningProps = {
  coupleName: string;
  date: string;
  city: string;
  eyebrow: string;
  cta: string;
  /** Under the envelope, e.g. "Tap the seal to open". */
  envelopeHint: string;
  /** Under the hint for returning guests, e.g. "Skip to the invitation". */
  skip: string;
  signature: string;
  /** Omitted on the generic (non-personalised) landing page. */
  guestName?: string;
  /** Shown instead of the greeting and CTA when there is no guest. */
  fallbackNote?: string;
  /** Guests get a quiet "131 days to go" line on the envelope's card; the generic landing gets the full clock. */
  countdown: {
    startsAt: string;
    timeZone: string;
    copy: Content["day"]["countdown"];
    daysToGo: string;
    tomorrow: string;
  };
};

function rise(delayMs: number, risePx = 0, durationMs?: number): CSSProperties {
  return {
    animationDelay: `${delayMs}ms`,
    ...(durationMs && { animationDuration: `${durationMs}ms` }),
    ["--rise" as string]: `${risePx}px`,
  };
}

/** The first screen (handoff §4): whose invitation is this, and what am I about to experience? */
export function Opening({
  coupleName,
  date,
  city,
  eyebrow,
  cta,
  envelopeHint,
  skip,
  signature,
  guestName,
  fallbackNote,
  countdown,
}: OpeningProps) {
  return (
    <header className="relative flex min-h-svh flex-col items-center justify-between px-6 py-12 text-center md:py-16">
      {guestName ? (
        // A guest sees only the envelope addressed to them, like a real one: the monogram,
        // names and date are on the card inside. This empty slot keeps the envelope centred.
        <span aria-hidden />
      ) : (
        <div className="flex animate-rise flex-col items-center gap-6" style={rise(0)}>
          <Monogram preload className="h-16 w-auto md:h-20" />
          <p className="font-display text-2xl leading-tight tracking-[0.14em] text-ink uppercase md:text-3xl">
            {coupleName}
          </p>
          <p className="label text-muted">
            {date}
            <span className="mx-2" aria-hidden>
              ·
            </span>
            {city}
          </p>
        </div>
      )}

      {guestName ? (
        <div className="animate-rise" style={rise(0, 12, 800)}>
          <Envelope
            guestName={guestName}
            eyebrow={eyebrow}
            cta={cta}
            hint={envelopeHint}
            skipLabel={skip}
            coupleName={coupleName}
            date={date}
            daysToGo={
              <DaysToGo
                startsAt={countdown.startsAt}
                timeZone={countdown.timeZone}
                copy={{ ...countdown.copy, daysToGo: countdown.daysToGo, tomorrow: countdown.tomorrow }}
                className="label text-[0.6rem] text-detail"
              />
            }
          />
        </div>
      ) : (
        <div className="flex max-w-md animate-rise flex-col items-center gap-6" style={rise(200, 12)}>
          <h1 className="font-display text-5xl leading-none font-normal tracking-[-0.02em] uppercase md:text-7xl">
            {coupleName}
          </h1>
          <div className="py-4">
            <Countdown startsAt={countdown.startsAt} timeZone={countdown.timeZone} copy={countdown.copy} />
          </div>
          {fallbackNote && <p className="font-display text-xl text-muted italic">{fallbackNote}</p>}
        </div>
      )}

      <div className="flex animate-rise flex-col items-center gap-8" style={rise(900)}>
        <p className="text-[0.7rem] tracking-wide text-muted">{signature}</p>
      </div>
    </header>
  );
}
