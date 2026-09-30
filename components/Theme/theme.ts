import type { ThemeName } from "@/lib/wedding";

export const THEMES: { name: ThemeName; label: string }[] = [
  { name: "heritage", label: "Heritage" },
  { name: "editorial", label: "Editorial" },
];

export const THEME_STORAGE_KEY = "invitation-theme";

/**
 * Runs before first paint so a returning visitor's saved theme doesn't flash.
 * Theme choice is a visitor preference, so it lives in localStorage (handoff §15).
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(${JSON.stringify(THEMES.map((t) => t.name))}.indexOf(t)>-1)document.documentElement.dataset.theme=t}catch(e){}})()`;
