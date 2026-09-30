import { Reveal } from "@/components/Motion/Reveal";

type SectionHeaderProps = {
  id: string;
  eyebrow: string;
  title: string;
};

export function SectionHeader({ id, eyebrow, title }: SectionHeaderProps) {
  return (
    <Reveal y={12} className="mb-16 flex flex-col items-center gap-4 text-center md:mb-24">
      <p className="label text-muted">{eyebrow}</p>
      <h2 id={id} className="font-display text-4xl leading-tight font-normal text-balance md:text-5xl">
        {title}
      </h2>
    </Reveal>
  );
}
