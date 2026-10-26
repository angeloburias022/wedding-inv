import { Photo } from "./Photo";

type PortraitProps = {
  src: string;
  coupleName: string;
  date: string;
};

/**
 * The first thing after the envelope opens: the couple, before the story
 * begins. One screen, and the first page the scroll settles on (StorySnap).
 */
export function Portrait({ src, coupleName, date }: PortraitProps) {
  return (
    <section
      aria-label={coupleName}
      className="story-snap flex min-h-svh flex-col items-center justify-center gap-6 px-6 py-12"
    >
      {/* 4:5, leaving about 12rem of the screen for the names and some air. */}
      <div className="w-[min(100%,28rem,calc((100svh-12rem)*0.8))]">
        {/* Preloaded with the envelope, so it is ready the moment the seal is tapped. */}
        <Photo src={src} alt={coupleName} aspect={4 / 5} sizes="(min-width: 768px) 28rem, 100vw" placeholder="" priority />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-display text-3xl italic md:text-4xl">{coupleName}</p>
        <p className="label text-muted">{date}</p>
      </div>
    </section>
  );
}
