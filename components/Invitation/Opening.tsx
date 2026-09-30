import type { CSSProperties } from "react";
import { OpenInvitationButton } from "./InvitationGate";

type OpeningProps = {
  monogram: string;
  coupleName: string;
  date: string;
  city: string;
  eyebrow: string;
  cta: string;
  signature: string;
  /** Omitted on the generic (non-personalised) landing page. */
  guestName?: string;
  /** Shown instead of the greeting and CTA when there is no guest. */
  fallbackNote?: string;
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
  monogram,
  coupleName,
  date,
  city,
  eyebrow,
  cta,
  signature,
  guestName,
  fallbackNote,
}: OpeningProps) {
  return (
    <header className="relative flex min-h-svh flex-col items-center justify-between px-6 py-12 text-center md:py-16">
      <div className="flex animate-rise flex-col items-center gap-6" style={rise(0)}>
        <p className="font-display text-xl tracking-[0.3em] text-detail" aria-hidden>
          {monogram}
        </p>
        <p className="label text-ink">{coupleName}</p>
        <p className="label text-muted">
          {date}
          <span className="mx-2" aria-hidden>
            ·
          </span>
          {city}
        </p>
      </div>

      {guestName ? (
        <div className="flex max-w-[900px] flex-col items-center gap-5">
          <p className="label animate-rise text-muted" style={rise(200)}>
            {eyebrow}
          </p>
          <h1
            className="animate-rise font-display text-5xl leading-none font-normal tracking-[-0.02em] text-balance uppercase md:text-7xl"
            style={rise(300, 12, 600)}
          >
            {guestName}
          </h1>
        </div>
      ) : (
        <div className="flex max-w-md animate-rise flex-col items-center gap-6" style={rise(200, 12)}>
          <h1 className="font-display text-5xl leading-none font-normal tracking-[-0.02em] uppercase md:text-7xl">
            {coupleName}
          </h1>
          {fallbackNote && <p className="font-display text-xl text-muted italic">{fallbackNote}</p>}
        </div>
      )}

      <div className="flex animate-rise flex-col items-center gap-8" style={rise(900)}>
        {guestName && <OpenInvitationButton label={cta} />}
        <p className="text-[0.7rem] tracking-wide text-muted">{signature}</p>
      </div>
    </header>
  );
}
