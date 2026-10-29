/**
 * The video ID from any common YouTube link: watch?v=, youtu.be/, /live/,
 * /embed/ or /shorts/. Null for anything else, so callers fall back to a link.
 */
export function youtubeId(url: string): string | null {
  try {
    const { hostname, pathname, searchParams } = new URL(url);
    const host = hostname.replace(/^(www\.|m\.)/, "");
    let id: string | null = null;
    if (host === "youtu.be") id = pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = searchParams.get("v") ?? pathname.match(/^\/(?:live|embed|shorts)\/([^/]+)/)?.[1] ?? null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Where the stream really is, from YouTube; "unknown" when YouTube can't say (no key, no answer). */
export type StreamStatus = "upcoming" | "live" | "ended" | "unknown";

/** One video from the YouTube Data API (videos.list with snippet and liveStreamingDetails). */
type VideoItem = {
  snippet?: { liveBroadcastContent?: string };
  liveStreamingDetails?: { actualStartTime?: string; actualEndTime?: string };
};

export function streamStatusOf(video: VideoItem | undefined): StreamStatus {
  const broadcast = video?.snippet?.liveBroadcastContent;
  if (broadcast === "live") return "live";
  if (broadcast === "upcoming") return "upcoming";
  if (video?.liveStreamingDetails?.actualEndTime) return "ended";
  return "unknown";
}
