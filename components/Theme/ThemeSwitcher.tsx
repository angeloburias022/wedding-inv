"use client";

import { useSyncExternalStore } from "react";
import type { ThemeName } from "@/lib/wedding";
import { THEMES, THEME_STORAGE_KEY } from "./theme";

// The <html data-theme> attribute is the source of truth (set before paint by themeInitScript).
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getTheme = () => document.documentElement.getAttribute("data-theme") as ThemeName;
const getServerTheme = () => null;

function applyTheme(name: ThemeName) {
  document.documentElement.setAttribute("data-theme", name);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, name);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
}

export function ThemeSwitcher() {
  const current = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  return (
    <div role="group" aria-label="Invitation style" className="flex items-center gap-4">
      {THEMES.map(({ name, label }) => (
        <button
          key={name}
          type="button"
          onClick={() => applyTheme(name)}
          aria-pressed={current === name}
          className="label py-2 text-muted transition-colors hover:text-ink aria-pressed:text-ink aria-pressed:underline aria-pressed:underline-offset-8"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
