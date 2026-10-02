"use client";

import { animate as animateElement, useAnimate } from "motion/react";
import { useRef } from "react";
import { useOpenInvitation } from "./InvitationGate";

type EnvelopeProps = {
  guestName: string;
  eyebrow: string;
  /** Accessible name of the seal button, e.g. "Open invitation". */
  cta: string;
  hint: string;
  monogram: string;
  coupleName: string;
  date: string;
};

/** A wax seal's slightly uneven edge: a circle whose radius wobbles a little. */
const SEAL_EDGE = `polygon(${Array.from({ length: 36 }, (_, i) => {
  const angle = (i / 36) * Math.PI * 2;
  const radius = 50 - (i % 3 === 0 ? 3 : i % 2 === 0 ? 1.5 : 0);
  return `${(50 + radius * Math.cos(angle)).toFixed(2)}% ${(50 + radius * Math.sin(angle)).toFixed(2)}%`;
}).join(", ")})`;

/** Where the flap's point (and the seal) sits, as a percentage of the envelope's height. */
const FLAP_DEPTH = 46;

/**
 * The opening as a sealed envelope addressed to the guest (handoff §4), drawn
 * from the theme tokens so it follows Heritage / Editorial. Tapping the seal
 * lifts it, folds the flap back and slides the card out; the card then grows
 * to fill the screen and dissolves into the story, one continuous shot.
 * Reduced motion skips straight to the invitation.
 */
export function Envelope({ guestName, eyebrow, cta, hint, monogram, coupleName, date }: EnvelopeProps) {
  const openInvitation = useOpenInvitation();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const opening = useRef(false);

  const open = async () => {
    if (opening.current) return;
    opening.current = true;
    // A light tick where supported (Android); iPhones don't let websites vibrate.
    navigator.vibrate?.(12);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      openInvitation();
      return;
    }

    await animate("[data-seal]", { scale: [1, 1.08, 0.6], opacity: [1, 1, 0] }, { duration: 0.5, ease: "easeInOut" });
    const flap = animate(
      "[data-flap]",
      { transform: ["perspective(1200px) rotateX(0deg)", "perspective(1200px) rotateX(180deg)"] },
      { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    );
    // Halfway over, the flap passes behind the card.
    setTimeout(() => scope.current?.querySelector<HTMLElement>("[data-flap]")?.style.setProperty("z-index", "1"), 400);
    await flap;
    await animate("[data-card]", { y: "-58%" }, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    await new Promise((resolve) => setTimeout(resolve, 200));

    const card = scope.current?.querySelector<HTMLElement>("[data-card]");
    if (!card) return openInvitation();
    await cardBecomesTheScreen(card, () => openInvitation({ seamless: true }));
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div ref={scope} className="@container relative aspect-[7/5] w-[min(86vw,520px)]">
        {/* Inside of the envelope, seen once the flap opens. */}
        <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-line)_55%,var(--color-surface))] shadow-[0_18px_40px_-18px_rgb(36_34_32/0.35)]" />

        {/* The card inside: slides up and out. */}
        <div
          data-card
          className="paper absolute inset-x-[5%] top-[5%] bottom-[8%] z-[2] flex flex-col items-center justify-start gap-2 border border-line bg-surface pt-[6%] text-center"
        >
          <p className="font-display text-sm tracking-[0.3em] text-detail" aria-hidden>
            {monogram}
          </p>
          <p className="font-display text-base tracking-[0.14em] text-ink uppercase md:text-lg">{coupleName}</p>
          <p className="label text-[0.6rem] text-muted">{date}</p>
        </div>

        {/* Front pocket: everything but the top V, with faint fold lines. */}
        <div
          className="paper absolute inset-0 z-[3] bg-surface"
          style={{ clipPath: `polygon(0 0, 50% ${FLAP_DEPTH}%, 100% 0, 100% 100%, 0 100%)` }}
        >
          <svg aria-hidden className="absolute inset-0 size-full text-line" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d={`M0 100 L42 ${FLAP_DEPTH + 8} M100 100 L58 ${FLAP_DEPTH + 8}`} stroke="currentColor" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* The guest's name, written on the envelope (real text: first paint, screen readers). */}
        {/* Its own band below the seal, so one- and two-line names both fit. */}
        <div
          className="pointer-events-none absolute inset-x-[7%] bottom-[7%] z-[4] flex flex-col items-center justify-center gap-[1.5cqw] text-center"
          style={{ top: `calc(${FLAP_DEPTH}% + 9cqw)` }}
        >
          <p className="label text-[max(0.6rem,2.3cqw)] text-muted">{eyebrow}</p>
          {/* The focal point (handoff §4): larger than the couple's names above the envelope. */}
          <h1 className="font-display text-[min(9cqw,3rem)] leading-[0.95] font-normal tracking-[-0.01em] text-balance uppercase">
            {guestName}
          </h1>
        </div>

        {/* Top flap, closed over the card; folds back from its top edge. */}
        <div data-flap className="absolute inset-0 z-[5] origin-top drop-shadow-[0_2px_2px_rgb(36_34_32/0.12)]">
          <div
            className="paper size-full bg-[color-mix(in_srgb,var(--color-surface)_88%,var(--color-line))]"
            style={{ clipPath: `polygon(0 0, 100% 0, 50% ${FLAP_DEPTH}%)` }}
          />
        </div>

        {/* Wax seal at the flap's point: the way in. */}
        <button
          type="button"
          data-seal
          onClick={open}
          aria-label={cta}
          className="absolute left-1/2 z-[6] flex size-[clamp(3.5rem,15cqw,5rem)] items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 hover:scale-105 focus-visible:outline-offset-8 active:scale-95"
          style={{ top: `${FLAP_DEPTH}%` }}
        >
          {/* A slow glow behind the wax while the seal waits to be tapped. */}
          <span aria-hidden className="animate-seal-glow absolute -inset-[18%] rounded-full" />
          <span
            className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,color-mix(in_srgb,var(--color-accent)_70%,white),var(--color-accent)_55%,color-mix(in_srgb,var(--color-accent)_75%,black))] shadow-[0_3px_6px_rgb(36_34_32/0.35)]"
            style={{ clipPath: SEAL_EDGE }}
          />
          <span className="absolute inset-[14%] rounded-full border border-[color-mix(in_srgb,var(--color-accent)_70%,black)] shadow-[inset_0_1px_1px_rgb(255_255_255/0.18)]" />
          <span className="relative font-display text-sm tracking-wide text-[color-mix(in_srgb,var(--color-accent)_55%,black)] [text-shadow:0_1px_0_rgb(255_255_255/0.25)] md:text-base">
            {monogram.replace(/\s/g, "")}
          </span>
        </button>
      </div>

      <button type="button" onClick={open} className="label min-h-11 text-muted transition-colors hover:text-accent">
        {hint}
      </button>
    </div>
  );
}

/**
 * The card becomes the screen: a copy of the card is lifted onto the page
 * (outside the envelope, so it survives the swap to the invitation), grows to
 * fill the viewport while its writing fades and its paper turns into the page
 * background, then dissolves to reveal the story already in place beneath.
 */
async function cardBecomesTheScreen(card: HTMLElement, openUnderneath: () => void) {
  const rect = card.getBoundingClientRect();
  const page = getComputedStyle(document.body).backgroundColor;

  const sheet = card.cloneNode(true) as HTMLElement;
  sheet.removeAttribute("data-card");
  sheet.setAttribute("aria-hidden", "true");
  Object.assign(sheet.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    right: "auto",
    bottom: "auto",
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    transform: "none",
    zIndex: "60",
    pointerEvents: "none",
  });
  document.body.appendChild(sheet);
  card.style.visibility = "hidden";

  animateElement([...sheet.children], { opacity: 0 }, { duration: 0.4, ease: "easeOut" });
  await animateElement(
    sheet,
    { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, backgroundColor: page, borderColor: page },
    { duration: 0.9, ease: [0.65, 0, 0.35, 1] },
  );

  openUnderneath();
  // Two frames so the invitation has rendered beneath the sheet before it dissolves.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await animateElement(sheet, { opacity: 0 }, { duration: 0.7, ease: "easeOut" });
  sheet.remove();
}
