"use client";

import { Fragment, useSyncExternalStore } from "react";
import { dayIn } from "@/lib/days";
import type { Content } from "@/lib/wedding";

type CountdownProps = {
  /** The ceremony start with its UTC offset, e.g. "2027-02-10T14:00:00+11:00". */
  startsAt: string;
  /** IANA zone the wedding day belongs to, for "Today" (e.g. "Australia/Melbourne"). */
  timeZone: string;
  copy: Content["day"]["countdown"];
};

// The clock is an external store ticking once a second; the snapshot is the
// whole second, so React only re-renders when the display changes.
function subscribe(onTick: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const tick = () => {
    onTick();
    timer = setTimeout(tick, 1000 - (Date.now() % 1000));
  };
  timer = setTimeout(tick, 1000 - (Date.now() % 1000));
  return () => clearTimeout(timer);
}
const getSecond = () => Math.floor(Date.now() / 1000);
const getServerSecond = () => null;



/**
 * Days · hours · minutes · seconds to the ceremony, under the date in THE DAY.
 * Counted against the absolute start time, so every guest sees the same
 * numbers wherever they are. On the wedding day (wedding time zone) "Today is
 * the day" appears above the clock, which keeps ticking to the ceremony; once
 * it starts, the message stays alone for the rest of the day, then "Happily
 * married". Prerendered pages can't
 * know the time, so the server renders dashes in the same layout and the
 * browser fills them in.
 */
export function Countdown({ startsAt, timeZone, copy }: CountdownProps) {
  const second = useSyncExternalStore(subscribe, getSecond, getServerSecond);
  const start = new Date(startsAt).getTime();

  const isWeddingDay = second !== null && dayIn(second * 1000, timeZone) === dayIn(start, timeZone);
  const message = <p className="font-display text-3xl text-accent italic md:text-4xl">{copy.today}</p>;

  // Once the ceremony has started: the message alone that day, then "Married".
  if (second !== null && second * 1000 >= start) {
    return isWeddingDay ? message : <p className="font-display text-3xl text-accent italic md:text-4xl">{copy.married}</p>;
  }

  const left = second === null ? null : Math.max(0, Math.floor(start / 1000) - second);
  const units = [
    { label: copy.days, value: left === null ? null : Math.floor(left / 86400) },
    { label: copy.hours, value: left === null ? null : Math.floor(left / 3600) % 24 },
    { label: copy.minutes, value: left === null ? null : Math.floor(left / 60) % 60 },
    { label: copy.seconds, value: left === null ? null : left % 60 },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      {isWeddingDay && message}
      {/* Read once, not every second. */}
      <p className="sr-only">{copy.label}</p>
      <div aria-hidden className="flex items-start justify-center gap-3 md:gap-5">
        {units.map(({ label, value }, i) => (
          <Fragment key={label}>
            {i > 0 && <span className="pt-1 font-display text-2xl text-detail md:text-3xl">·</span>}
            <div className="flex min-w-[3.25rem] flex-col items-center gap-1.5 md:min-w-16">
              <span className="font-display text-4xl leading-none text-ink tabular-nums lining-nums md:text-5xl">
                {value === null ? "––" : String(value).padStart(2, "0")}
              </span>
              <span className="label text-[0.6rem] text-muted">{label}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
