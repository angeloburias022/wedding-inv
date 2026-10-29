import { wedding } from "@/lib/wedding";
import { streamStatusOf, youtubeId, type StreamStatus } from "@/lib/youtube";

const YOUTUBE_API = process.env.YOUTUBE_API_URL ?? "https://www.googleapis.com/youtube/v3";

/**
 * Whether the ceremony stream is upcoming, live or over, straight from YouTube,
 * for the "Live now" badge. Every guest's page asks every 30 seconds, so the
 * answer is shared through Vercel's cache for 30 seconds: YouTube is asked
 * about twice a minute however many guests are watching.
 */
export async function GET() {
  return Response.json(
    { status: await fetchStatus() },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" } },
  );
}

async function fetchStatus(): Promise<StreamStatus> {
  const key = process.env.YOUTUBE_API_KEY;
  const id = wedding.onlineCeremony.url ? youtubeId(wedding.onlineCeremony.url) : null;
  if (!key || !id) return "unknown";
  try {
    const query = new URLSearchParams({ part: "snippet,liveStreamingDetails", id, key });
    const response = await fetch(`${YOUTUBE_API}/videos?${query}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`YouTube answered ${response.status}`);
    const { items } = await response.json();
    return streamStatusOf(items?.[0]);
  } catch (error) {
    console.error("[stream-status]", error);
    return "unknown";
  }
}
