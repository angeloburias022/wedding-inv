import { test as base } from "@playwright/test";

export { expect, type Page } from "@playwright/test";

/**
 * Keeps every song and clip silent at the speakers while the page carries on as
 * normal. Chrome is muted from its launch options, but WebKit (the Safari run)
 * has no such switch, so the real volume is held at 0 here. The page still reads
 * back whatever volume it set, since the clip checks it to tell whether its
 * sound is on.
 */
function silence() {
  const real = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "volume")!;
  const wanted = new WeakMap<HTMLMediaElement, number>();
  const hush = (media: HTMLMediaElement) => {
    if (real.get!.call(media) !== 0) real.set!.call(media, 0);
  };
  Object.defineProperty(HTMLMediaElement.prototype, "volume", {
    configurable: true,
    get() {
      return wanted.get(this) ?? 1;
    },
    set(value: number) {
      wanted.set(this, value);
      hush(this);
    },
  });
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    hush(this);
    return play.call(this);
  };
  // Autoplay starts without play(); media events don't bubble, so listen on the way down.
  for (const type of ["play", "volumechange"]) {
    document.addEventListener(type, (event) => event.target instanceof HTMLMediaElement && hush(event.target), true);
  }
}

/** Playwright's test, with every page silent (see above). Use this in place of @playwright/test's. */
export const test = base.extend({
  context: async ({ context }, provide) => {
    await context.addInitScript(silence);
    await provide(context);
  },
});
