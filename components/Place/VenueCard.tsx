import { SectionHeader } from "@/components/Invitation/SectionHeader";
import { Reveal } from "@/components/Motion/Reveal";
import { photoRatio } from "@/lib/photos";
import { mapUrl, type Content, type Wedding } from "@/lib/wedding";
import { VenueArch } from "./VenueArch";
import { VenueFilm } from "./VenueFilm";

type VenueCardProps = {
  location: Wedding["location"];
  copy: Content["place"];
};

/** THE PLACE — the venue as a supporting character (handoff §9). */
export function VenueCard({ location, copy }: VenueCardProps) {
  // The frame takes the photo's shape; 3:2 until a photo is added.
  const ratio = photoRatio(location.image, 3 / 2);

  return (
    <section id="place" aria-labelledby="place-title" className="px-6 py-24 md:py-32">
      <SectionHeader id="place-title" eyebrow={copy.eyebrow} title={copy.title} />

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-12">
        {location.video ? (
          <VenueFilm
            src={location.video}
            poster={location.image}
            alt={`${location.venue}, ${location.city}`}
            ratio={ratio}
          />
        ) : (
          <VenueArch src={location.image} alt={`${location.venue}, ${location.city}`} ratio={ratio} />
        )}

        <Reveal y={12} className="flex flex-col items-center gap-4 text-center">
          <h3 className="font-display text-3xl">{location.venue}</h3>
          {location.room && <p className="label text-ink">{location.room}</p>}
          <p className="text-sm text-muted">{location.address}</p>
          {location.directions && <p className="max-w-sm text-sm text-balance text-muted">{location.directions}</p>}
          <p className="font-display text-2xl leading-snug text-balance italic">“{copy.caption}”</p>
          <a
            href={mapUrl(`${location.venue}, ${location.address}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="label mt-4 border-b border-line pb-1 transition-colors hover:border-accent hover:text-accent"
          >
            {copy.mapCta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
