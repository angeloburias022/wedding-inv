"use client";

import { useSyncExternalStore } from "react";
import { dayIn, daysBetween } from "@/lib/days";

type DaysToGoProps = {
  startsAt: string;
  timeZone: string;
  copy: { daysToGo: string; tomorrow: string; today: string; married: string };
  className?: string;
};

// Only the calendar date matters here, so check once a minute and re-render only when it changes.
function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}

/**
 * A quiet, non-ticking line for the opening: "131 days to go", "Tomorrow",
 * "Today is the day", then "Happily married". Counted in calendar days in the
 * wedding's time zone. The server renders an invisible placeholder of the same
 * height, so nothing shifts when the browser fills it in.
 */
export function DaysToGo({ startsAt, timeZone, copy, className }: DaysToGoProps) {
  const weddingDay = dayIn(new Date(startsAt).getTime(), timeZone);
  const today = useSyncExternalStore(
    subscribe,
    () => dayIn(Date.now(), timeZone),
    () => null,
  );

  if (today === null) {
    return (
      <p aria-hidden className={`invisible ${className ?? ""}`}>
        {copy.daysToGo}
      </p>
    );
  }

  const days = daysBetween(today, weddingDay);
  const text =
    days > 1 ? `${days} ${copy.daysToGo}` : days === 1 ? copy.tomorrow : days === 0 ? copy.today : copy.married;
  return <p className={className}>{text}</p>;
}
