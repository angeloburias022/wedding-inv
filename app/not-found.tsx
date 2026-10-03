import Link from "next/link";
import { Monogram } from "@/components/Decor/Monogram";
import { wedding } from "@/lib/wedding";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 text-center">
      <Monogram preload className="h-16 w-auto md:h-20" />
      <h1 className="font-display text-4xl leading-tight text-balance md:text-5xl">
        We couldn&rsquo;t find this invitation.
      </h1>
      <p className="max-w-sm font-display text-xl text-muted italic">
        Please check the link, or scan the QR code on your printed invitation again.
      </p>
      <Link href="/" className="label border-b border-line pb-1 hover:border-accent hover:text-accent">
        {wedding.couple.displayName}
      </Link>
    </main>
  );
}
