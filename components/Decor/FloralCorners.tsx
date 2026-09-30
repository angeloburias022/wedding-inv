import Image from "next/image";

/**
 * Fixed floral corners (top-left and bottom-right) that frame every screen.
 * Cropped from background-flowers.png; the crops keep their ivory backdrop,
 * so a radial mask fades each edge into the page background instead of
 * needing transparency. Both are nudged past the viewport edge so they read as
 * cropped by the page, not placed on it. Sits behind content, ignores pointer events.
 */
export function FloralCorners() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Image
        src="/decor/flowers-top-left.png"
        alt=""
        width={720}
        height={450}
        preload
        className="floral-corner absolute top-0 left-0 w-[min(76vw,460px)] -translate-x-[6%] -translate-y-[8%] [--fade-origin:0%_0%] md:w-[min(46vw,640px)] md:-translate-x-[4%] md:-translate-y-[6%]"
      />
      <Image
        src="/decor/flowers-bottom-right.png"
        alt=""
        width={349}
        height={627}
        className="floral-corner absolute right-0 bottom-0 w-[min(42vw,250px)] translate-x-[10%] translate-y-[6%] [--fade-origin:100%_100%] md:w-[min(24vw,349px)]"
      />
    </div>
  );
}
