import guestsData from "@/data/guests.json";

export type RecipientType = "individual" | "couple" | "family" | "group";

export type Guest = {
  code: string;
  type: RecipientType;
  names: string[];
  familyName?: string;
  displayName?: string;
};

const CODE_PATTERN = /^[A-Z0-9]{6}$/;

function validate(guests: Guest[]): Guest[] {
  const seen = new Set<string>();
  for (const guest of guests) {
    if (!CODE_PATTERN.test(guest.code)) {
      throw new Error(`Invalid invitation code "${guest.code}" (expected 6 uppercase letters/digits)`);
    }
    if (seen.has(guest.code)) {
      throw new Error(`Duplicate invitation code "${guest.code}"`);
    }
    if (guest.names.length === 0) {
      throw new Error(`Invitation "${guest.code}" has no names`);
    }
    if (guest.type === "family" && !guest.familyName && !guest.displayName) {
      throw new Error(`Family invitation "${guest.code}" needs a familyName or displayName`);
    }
    seen.add(guest.code);
  }
  return guests;
}

export const guests = validate(guestsData as Guest[]);

export function getGuest(code: string): Guest | undefined {
  return guests.find((guest) => guest.code === code);
}

/** The name shown on the opening screen, e.g. "Rhea & Erwin" or "The Santos Family". */
export function guestDisplayName(guest: Guest): string {
  if (guest.displayName) return guest.displayName;

  switch (guest.type) {
    case "family":
      return `The ${guest.familyName} Family`;
    case "group":
      return `${guest.names[0]} & Friends`;
    default:
      return joinNames(guest.names);
  }
}

/** "Rhea", "Rhea & Erwin", "Jose, Carmen & Luis" */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
}

export function isPlural(guest: Guest): boolean {
  return guest.names.length > 1;
}
