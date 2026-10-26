"use client";

import { useEffect } from "react";

/** Pages the scroll settles on: the opening portrait and each milestone. */
const PAGES = ".story-snap";
/** Below this, a stop isn't a scroll worth settling, e.g. a brush of the trackpad (px). */
const MIN_MOVE = 8;
/** A page this close to the middle of the screen counts as settled (px). */
const SETTLED = 4;
/**
 * A scroll has stopped after this long without a scroll event (ms). Backs up
 * `scrollend`, which Firefox announces but doesn't send after a wheel scroll.
 */
const STOPPED_AFTER = 150;

/**
 * Makes the story's pages (the portrait and each milestone) settle in the
 * middle of the screen when the guest stops scrolling near them.
 *
 * By touch (iPhone, Android), the browser's own snapping does it:
 * `html.story-snapping` in globals.css, switched on by a touch.
 *
 * With a mouse wheel or trackpad (Mac), that snapping pulled each small step
 * back to the page the guest was on, so the page felt stuck. There, once the
 * scroll stops inside the story, the page glides on to the next page in the
 * direction the guest was going: one notch or a short swipe moves one page,
 * never back. Scrolling again mid-glide stops the glide and goes the new way.
 * Past the last milestone the page scrolls freely. Only scrolls the guest
 * makes count (wheel, trackpad, keys), so the chapter dots and the skip link
 * land where they aim. Which mode applies is decided by what the guest does,
 * not what the browser says it is: Chrome on a Mac can report a touch screen.
 */
export function StorySnap() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let byTouch = false;
    /** The guest has scrolled with a wheel, trackpad or key since the last settle. */
    let guestScrolled = false;
    /** The guest stopped a glide by scrolling again: settle even if they barely moved. */
    let interrupted = false;
    /**
     * Which way the guest last scrolled (1 down, -1 up), from the wheel or key itself:
     * working it out from positions went wrong when they scrolled again mid-glide.
     */
    let direction = 0;
    /** Where the last scroll stopped or settled, to tell whether the guest moved at all. */
    let lastStop = window.scrollY;
    /** Where a glide is heading, while one is under way. */
    let glidingTo: number | null = null;
    let timer = 0;

    const switchToTouch = () => {
      byTouch = true;
      root.classList.add("story-snapping");
    };
    const switchToPointer = () => {
      byTouch = false;
      root.classList.remove("story-snapping");
    };
    const onWheel = (event: WheelEvent) => {
      switchToPointer();
      guestScrolled = true;
      direction = Math.sign(event.deltaY) || direction;
      // Chrome would carry on gliding and only then turn round; stop it here instead.
      if (glidingTo !== null) {
        glidingTo = null;
        interrupted = true;
        window.scrollTo({ top: window.scrollY, behavior: "instant" });
      }
    };
    // Moving the pointer comes before any wheel: Chrome starts a wheel scroll before
    // the page hears of it, so switching off on the wheel alone let the first notch be
    // pulled back.
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse") switchToPointer();
    };
    const onKey = (event: KeyboardEvent) => {
      const up = ["ArrowUp", "PageUp", "Home"].includes(event.key) || (event.key === " " && event.shiftKey);
      const down = ["ArrowDown", "PageDown", "End", " "].includes(event.key);
      if (!up && !down) return;
      guestScrolled = true;
      direction = up ? -1 : 1;
    };

    const settle = () => {
      const moved = window.scrollY - lastStop;
      lastStop = window.scrollY;
      // The scroll that stopped was our own glide.
      if (glidingTo !== null) {
        glidingTo = null;
        return;
      }
      if (byTouch || !guestScrolled || reducedMotion.matches) return;
      if (Math.abs(moved) < MIN_MOVE && !interrupted) return;
      guestScrolled = false;
      interrupted = false;

      const middle = window.innerHeight / 2;
      const pages = [...document.querySelectorAll<HTMLElement>(PAGES)].map((page) => {
        const box = page.getBoundingClientRect();
        return { top: box.top, bottom: box.bottom, offset: box.top + box.height / 2 - middle };
      });
      if (pages.length === 0) return;
      // Only inside the story: from the portrait to the end of the last milestone.
      if (pages[0].top > middle || pages[pages.length - 1].bottom < middle) return;

      const ahead =
        (direction || Math.sign(moved)) > 0
          ? pages.find((page) => page.offset > SETTLED)
          : pages.findLast((page) => page.offset < -SETTLED);
      // Scrolling down past the last milestone, or up past the portrait: leave it free.
      if (!ahead) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      glidingTo = Math.min(maxScroll, Math.max(0, window.scrollY + ahead.offset));
      window.scrollTo({ top: glidingTo, behavior: "smooth" });
    };

    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, STOPPED_AFTER);
    };
    const onScrollEnd = () => {
      window.clearTimeout(timer);
      settle();
    };

    window.addEventListener("touchstart", switchToTouch, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scrollend", onScrollEnd);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("touchstart", switchToTouch);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("scroll", onScroll);
      root.classList.remove("story-snapping");
    };
  }, []);

  return null;
}
