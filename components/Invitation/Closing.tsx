import { Reveal } from "@/components/Motion/Reveal";
import { ThemeSwitcher } from "@/components/Theme/ThemeSwitcher";
import type { Content, Wedding } from "@/lib/wedding";

type ClosingProps = {
  wedding: Wedding;
  copy: Content["closing"];
  signature: string;
};

/** Closing message and developer signature (handoff §6). */
export function Closing({ wedding, copy, signature }: ClosingProps) {
  return (
    <footer className="flex flex-col items-center gap-16 px-6 pt-32 pb-12 text-center">
      <Reveal y={12} className="flex flex-col items-center gap-8">
        <p className="font-display text-4xl leading-tight text-balance md:text-5xl">{copy.message}</p>
        <p className="font-display text-xl tracking-[0.3em] text-detail" aria-hidden>
          {wedding.couple.monogram}
        </p>
        <div className="flex flex-col gap-2">
          <p className="label">{wedding.couple.displayName}</p>
          <p className="label text-muted">
            {wedding.date.display} · {wedding.location.city}
          </p>
        </div>
      </Reveal>

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
