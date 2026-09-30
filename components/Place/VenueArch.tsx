"use client";

import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Photo } from "@/components/Invitation/Photo";

type VenueArchProps = {
  src: string | null;
  alt: string;
  /** Width / height of the photo frame. */
  ratio: number;
};

/**
 * The venue photo unveiled through an arch — a nod to the building's arched
 * windows. As the frame scrolls up to the middle of the screen, a narrow arch
 * widens to the full frame while the photo settles from a slight zoom.
 */
export function VenueArch({ src, alt, ratio }: VenueArchProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });

  const side = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const top = useTransform(scrollYProgress, [0, 1], [12, 0]);
  // Taller curve while narrow, so it reads as a round arch before relaxing into the wide one.
  const curve = useTransform(scrollYProgress, [0, 1], [70, 20]);
  const clipPath = useMotionTemplate`inset(${top}% ${side}% 0% ${side}% round 50% 50% 0 0 / ${curve}% ${curve}% 0 0)`;
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  return (
    // Cap the height at 75% of the screen so portrait photos don't tower over the page.
    <div ref={ref} className="mx-auto w-full" style={{ maxWidth: `calc(75svh * ${ratio})` }}>
      <motion.div
        style={{ clipPath }}
        className="motion-reduce:[clip-path:inset(0_round_50%_50%_0_0/20%_20%_0_0)]!"
      >
        <motion.div style={{ scale }} className="motion-reduce:transform-none!">
          <Photo src={src} alt={alt} aspect={ratio} sizes="(min-width: 896px) 896px, 100vw" placeholder="The venue" />
        </motion.div>
      </motion.div>
    </div>
  );
}
