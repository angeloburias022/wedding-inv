import weddingData from "@/data/wedding.json";
import storyData from "@/data/story.json";
import eventsData from "@/data/events.json";
import contentData from "@/data/content.json";

export type ThemeName = "heritage" | "editorial";

export type Wedding = {
  couple: {
    groom: string;
    bride: string;
    displayName: string;
  };
  date: {
    display: string;
    iso: string;
    /** Ceremony start with its UTC offset; the countdown counts to this. */
    startsAt: string;
    /** How long the ceremony runs; the length of the "Add to calendar" event. */
    ceremonyMinutes: number;
    /** The zone the wedding day belongs to ("Today" in the countdown). */
    timeZone: string;
  };
  location: {
    city: string;
    region: string;
    country: string;
    venue: string;
    /** The room inside the venue, shown under its name. */
    room: string | null;
    address: string;
    /** One line on finding the room once inside (entrance, floor). */
    directions: string | null;
    image: string | null;
    /** Short clip played as the guest scrolls; replaces the photo when set (see README). */
    video: string | null;
  };
  onlineCeremony: {
    enabled: boolean;
    platform: string | null;
    /** The YouTube stream link; until it's set, the message promises one. */
    url: string | null;
    /** Start with its UTC offset, e.g. "2027-02-10T14:00:00+11:00". */
    startsAt: string;
    /** The start time is shown in each of these, e.g. Melbourne and Manila. */
    timeZones: { label: string; zone: string }[];
  };
  /** The song that starts when the envelope opens; null for a silent invitation. */
  music: {
    src: string;
    title: string;
    artist: string;
    /** Seconds into the song where it starts when the envelope opens (0 = the beginning). */
    startAt: number;
    /** Seconds into the song where it starts for a returning guest who skips the envelope. */
    skipStartAt: number;
    /** Seconds into the song where it starts on the generic landing page (no envelope there). */
    landingStartAt: number;
  } | null;
  settings: {
    theme: ThemeName;
    sections: {
      story: boolean;
      day: boolean;
      place: boolean;
      rsvp: boolean;
    };
  };
};

export type StoryEntry = {
  date: string;
  title: string;
  location: string;
  /** One photo, or several for a swipeable carousel. Empty shows a placeholder. */
  images: string[];
  caption: string;
};

export type WeddingEvent = {
  label: string;
  time: string;
  venue: string;
  room: string | null;
  address: string;
  note: string | null;
};

export type Events = {
  ceremony: WeddingEvent;
  reception: WeddingEvent;
  details: {
    dressCode: string | null;
    parking: string | null;
    transportation: string | null;
  };
};

export type Content = typeof contentData;

export const wedding = weddingData as Wedding;
export const story = storyData as StoryEntry[];
export const events = eventsData as Events;
export const content: Content = contentData;

export function mapUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
