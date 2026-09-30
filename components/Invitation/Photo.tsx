import Image from "next/image";

type PhotoProps = {
  src: string | null;
  alt: string;
  /** Tailwind aspect class, e.g. "aspect-[4/5]" (handoff §31), or a width / height ratio. */
  aspect: string | number;
  sizes: string;
  /** Text shown in the frame until a real photo is added. */
  placeholder: string;
  priority?: boolean;
};

/** Theme-aware photo frame. Renders a quiet placeholder until the JSON points at a real image. */
export function Photo({ src, alt, aspect, sizes, placeholder, priority }: PhotoProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-surface ${typeof aspect === "string" ? aspect : ""}`}
      style={typeof aspect === "number" ? { aspectRatio: aspect } : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-center [filter:var(--photo-filter)]"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-3 flex items-center justify-center border border-line"
        >
          <span className="label text-detail">{placeholder}</span>
        </div>
      )}
    </div>
  );
}
