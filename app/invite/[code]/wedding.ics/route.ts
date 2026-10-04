import { icsFile, weddingEvent } from "@/lib/calendar";
import { guests } from "@/lib/guests";

// One calendar file per invitation, written at build time like the pages; unknown codes 404.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return guests.map((guest) => ({ code: guest.code }));
}

export async function GET(_request: Request, { params }: RouteContext<"/invite/[code]/wedding.ics">) {
  const { code } = await params;

  return new Response(icsFile(weddingEvent(code)), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // Inline, so iPhones offer "Add to Calendar" straight away; other browsers download it.
      "Content-Disposition": 'inline; filename="angelo-gichelle-wedding.ics"',
    },
  });
}
