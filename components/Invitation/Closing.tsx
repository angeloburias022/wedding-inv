import { Monogram } from "@/components/Decor/Monogram";
import { Reveal } from "@/components/Motion/Reveal";
import { RsvpReminder } from "@/components/RSVP/RsvpReminder";
import { ThemeSwitcher } from "@/components/Theme/ThemeSwitcher";
import type { Content, Wedding } from "@/lib/wedding";

type ClosingProps = {
  wedding: Wedding;
  copy: Content["closing"];
  signature: string;
  /** The guest's code, when the RSVP is on: shows a reminder until they've replied. */
  rsvpCode?: string;
};

/** Closing message and developer signature (handoff §6). */
export function Closing({ wedding, copy, signature, rsvpCode }: ClosingProps) {
  return (
    <footer className="flex flex-col items-center gap-16 px-6 pt-32 pb-12 text-center">
      <Reveal y={12} className="flex flex-col items-center gap-8">
        <p className="font-display text-4xl leading-tight text-balance md:text-5xl">{copy.message}</p>
        <Monogram className="h-16 w-auto md:h-20" />
        <div className="flex flex-col gap-2">
          <p className="font-display text-2xl leading-tight tracking-[0.14em] uppercase md:text-3xl">
            {wedding.couple.displayName}
          </p>
          <p className="label text-muted">
            {wedding.date.display} · {wedding.location.city}
          </p>
        </div>
      </Reveal>

      {rsvpCode && <RsvpReminder code={rsvpCode} message={copy.rsvpReminder} cta={copy.rsvpReminderCta} />}

      <div className="flex w-full max-w-md flex-col items-center gap-6 border-t border-line pt-8">
        <ThemeSwitcher />
        <a href="#top" className="label text-muted transition-colors hover:text-ink">
          {copy.backToTop} ↑
        </a>
        <p className="text-[0.7rem] tracking-wide text-muted">{signature}</p>
      </div>
    </footer>
  );
}
