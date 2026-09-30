"use server";

import { getGuest } from "@/lib/guests";

export type RsvpState =
  | { status: "idle" }
  | { status: "success"; attending: boolean }
  | { status: "error"; message: string };

const MAX_TEXT = 500;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_TEXT) : "";
}

export async function submitRsvp(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  // Anyone can call a server action, so the code and names are always re-checked here.
  if (!(formData instanceof FormData)) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  const code = formData.get("code");
  const guest = typeof code === "string" ? getGuest(code) : undefined;
  if (!guest) {
    return { status: "error", message: "We couldn't find this invitation." };
  }

  const attendance = formData.get("attendance");
  if (attendance !== "yes" && attendance !== "no") {
    return { status: "error", message: "Please let us know if you can make it." };
  }
  const attending = attendance === "yes";

  const attendingGuests = attending
    ? formData
        .getAll("guests")
        .filter((name): name is string => typeof name === "string" && guest.names.includes(name))
    : [];

  if (attending && attendingGuests.length === 0) {
    return { status: "error", message: "Please choose who will be joining us." };
  }

  const response = {
    submittedAt: new Date().toISOString(),
    code: guest.code,
    invitation: guest.names.join(", "),
    attending,
    attendingGuests: attendingGuests.join(", "),
    attendingCount: attendingGuests.length,
    dietary: attending ? text(formData.get("dietary")) : "",
    message: text(formData.get("message")),
  };

  const webhookUrl = process.env.RSVP_WEBHOOK_URL;
  if (!webhookUrl) {
    if (process.env.NODE_ENV === "production") {
      console.error("RSVP_WEBHOOK_URL is not set; RSVP was not saved", response.code);
      return { status: "error", message: "RSVPs aren't open just yet. Please try again later." };
    }
    console.info("[rsvp] RSVP_WEBHOOK_URL not set — dev mode, not saved:", response);
    return { status: "success", attending };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: process.env.RSVP_WEBHOOK_SECRET ?? "", ...response }),
      signal: AbortSignal.timeout(10_000),
    });
    // Apps Script always answers 200, so the body is what confirms the row was written.
    const body = (await res.text()).trim();
    if (!res.ok || body !== "ok") throw new Error(`Webhook responded ${res.status}: ${body.slice(0, 100)}`);
  } catch (error) {
    console.error("[rsvp] failed to save RSVP", response.code, error);
    return { status: "error", message: "Something went wrong sending your RSVP. Please try again." };
  }

  return { status: "success", attending };
}
