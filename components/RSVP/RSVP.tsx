"use client";

import { useActionState, useState } from "react";
import { submitRsvp, type RsvpState } from "@/app/actions/rsvp";
import { SectionHeader } from "@/components/Invitation/SectionHeader";
import { Reveal } from "@/components/Motion/Reveal";
import type { Content } from "@/lib/wedding";

type RSVPProps = {
  code: string;
  greeting: string;
  names: string[];
  copy: Content["rsvp"];
};

const initialState: RsvpState = { status: "idle" };

const fieldClass =
  "w-full border-b border-line bg-transparent py-3 font-display text-xl placeholder:text-muted/70 focus:border-accent focus:outline-none";

/**
 * RSVP (handoff §10). The guest is already known from the invitation code,
 * so we never ask for their name — only attendance, who's coming and dietary needs.
 */
export function RSVP({ code, greeting, names, copy }: RSVPProps) {
  const [state, formAction, pending] = useActionState(submitRsvp, initialState);
  const [attendance, setAttendance] = useState<"yes" | "no" | null>(null);
  const [editing, setEditing] = useState(false);
  const plural = names.length > 1;

  const submitted = state.status === "success" && !editing;

  return (
    <section id="rsvp" aria-labelledby="rsvp-title" className="bg-surface/80 px-6 py-24 md:py-32">
      <SectionHeader id="rsvp-title" eyebrow={copy.eyebrow} title={copy.title} />

      <Reveal className="mx-auto max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center gap-8 text-center" role="status">
            <p className="font-display text-3xl leading-snug text-balance">
              {state.attending ? copy.thanksYes : copy.thanksNo}
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="label text-muted underline underline-offset-8 hover:text-accent"
            >
              Change response
            </button>
          </div>
        ) : (
          <form action={formAction} onSubmit={() => setEditing(false)} className="flex flex-col gap-12">
            <input type="hidden" name="code" value={code} />
            <fieldset className="flex flex-col gap-4">
              <legend className="mb-6 w-full text-center font-display text-3xl">{greeting},</legend>
              {(
                [
                  ["yes", copy.yes],
                  ["no", plural ? copy.no : copy.noSingular],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="flex min-h-12 cursor-pointer items-center gap-4 border border-line px-5 py-3 transition-colors hover:border-accent has-checked:border-accent has-checked:text-accent has-focus-visible:outline has-focus-visible:outline-accent"
                >
                  <input
                    type="radio"
                    name="attendance"
                    value={value}
                    required
                    checked={attendance === value}
                    onChange={() => setAttendance(value)}
                    className="size-4 accent-(--color-accent)"
                  />
                  <span className="label">{label}</span>
                </label>
              ))}
            </fieldset>

            {attendance === "yes" && (
              <>
                {plural ? (
                  <fieldset className="flex flex-col gap-3">
                    <legend className="label mb-4 text-muted">{copy.whoLabel}</legend>
                    {names.map((name) => (
                      <label key={name} className="flex min-h-11 cursor-pointer items-center gap-4">
                        <input
                          type="checkbox"
                          name="guests"
                          value={name}
                          defaultChecked
                          className="size-4 accent-(--color-accent)"
                        />
                        <span className="font-display text-xl">{name}</span>
                      </label>
                    ))}
                  </fieldset>
                ) : (
                  <input type="hidden" name="guests" value={names[0]} />
                )}

                <label className="flex flex-col gap-2">
                  <span className="label text-muted">{copy.dietaryLabel}</span>
                  <input
                    type="text"
                    name="dietary"
                    maxLength={500}
                    placeholder={copy.dietaryPlaceholder}
                    className={fieldClass}
                  />
                </label>
              </>
            )}

            {attendance && (
              <label className="flex flex-col gap-2">
                <span className="label text-muted">
                  {copy.messageLabel} <span className="normal-case tracking-normal">(optional)</span>
                </span>
                <textarea name="message" rows={3} maxLength={500} className={`${fieldClass} resize-none`} />
              </label>
            )}

            {state.status === "error" && (
              <p role="alert" className="text-center text-sm text-accent">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={pending || !attendance}
              className="label mx-auto min-h-12 border border-ink px-10 py-3 transition-colors hover:bg-ink hover:text-surface focus-visible:bg-ink focus-visible:text-surface disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
            >
              {pending ? "Sending…" : copy.submit}
            </button>
          </form>
        )}
      </Reveal>
    </section>
  );
}
