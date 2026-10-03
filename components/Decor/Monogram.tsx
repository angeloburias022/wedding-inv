import Image from "next/image";

type MonogramProps = {
  /** Sets the size, e.g. "h-16 w-auto". */
  className: string;
  /** For the one above the fold on first paint. */
  preload?: boolean;
};

/**
 * The couple's monogram artwork (G and A with a floral sprig). Decorative: the
 * names are always written out nearby. Follows the theme through the photo
 * filter, so Editorial shows it in grey.
 */
export function Monogram({ className, preload }: MonogramProps) {
  return (
    <Image
      src="/images/monogram.webp"
      alt=""
      width={640}
      height={490}
      sizes="160px"
      preload={preload}
      className={`[filter:var(--photo-filter)] ${className}`}
    />
  );
}
