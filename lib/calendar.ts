import { content, events, wedding } from "@/lib/wedding";

/** Same origin the printed QR codes use, so the event links back to the guest's own invitation. */
const origin = (process.env.PUBLIC_INVITATION_ORIGIN ?? "https://angeloandgichelle.com").replace(/\/+$/, "");

const DAY_MS = 24 * 60 * 60 * 1000;

type CalendarEvent = {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  description: string;
  url: string;
  /** Alerts, in whole days before the start. */
  remindDaysBefore: number[];
};

/** The ceremony as a calendar event for one invitation (the dinner is mentioned in its notes). */
export function weddingEvent(code: string): CalendarEvent {
  const { ceremony, reception } = events;
  const start = new Date(wedding.date.startsAt);
  const url = `${origin}/invite/${code}`;

  // "One month before" is the same day of the previous month, so count its days.
  const monthBefore = new Date(start);
  monthBefore.setUTCMonth(start.getUTCMonth() - 1);

  return {
    uid: `wedding-${wedding.date.iso}-${code}@${new URL(origin).hostname}`,
    title: content.calendar.eventTitle,
    start,
    end: new Date(start.getTime() + wedding.date.ceremonyMinutes * 60 * 1000),
    location: `${ceremony.venue}, ${ceremony.address}`,
    description: [
      `${ceremony.label} at ${ceremony.time}${ceremony.room ? `, ${ceremony.room}` : ""}.`,
      `${reception.label} at ${reception.time}.`,
      ...(wedding.onlineCeremony.enabled ? [content.calendar.livestreamNote] : []),
      `${content.calendar.invitationLabel}: ${url}`,
    ].join("\n"),
    url,
    remindDaysBefore: [Math.round((start.getTime() - monthBefore.getTime()) / DAY_MS), 7, 1],
  };
}

/** 20270210T030000Z: UTC, so every calendar shows the guest their own local time. */
function utcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Google Calendar's "new event" screen, pre-filled. It can't carry reminders; guests get their own defaults. */
export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${utcStamp(event.start)}/${utcStamp(event.end)}`,
    location: event.location,
    details: event.description,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

/** iCalendar lines may be at most 75 bytes; longer ones continue on the next line after a space. */
function fold(line: string): string {
  const bytes = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  for (const char of line) {
    if (bytes.encode(current + char).length > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = "";
    }
    current += char;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

/** The event as an .ics file, for Apple Calendar, Outlook and anything else. */
export function icsFile(event: CalendarEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Angelo & Gichelle//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    // When the file was written (build time); a later build's copy updates the same event.
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(event.start)}`,
    `DTEND:${utcStamp(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(event.location)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `URL:${event.url}`,
    ...event.remindDaysBefore.flatMap((days) => [
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(event.title)}`,
      `TRIGGER:-P${days}D`,
      "END:VALARM",
    ]),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(fold).join("\r\n")}\r\n`;
}
