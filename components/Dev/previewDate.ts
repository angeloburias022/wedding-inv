/**
 * Development only: see the invitation as it will look on another date.
 *
 *   /invite/CODE?now=day      an hour into the ceremony
 *   /invite/CODE?now=after    the day after the wedding
 *   /invite/CODE?now=2027-02-09T20:00+11:00   any moment
 *   /invite/CODE?now=off      back to today
 *
 * The choice is kept for the browser tab, so it survives reloads and opening
 * the envelope. The clock keeps ticking from the chosen moment. A badge in the
 * corner shows it's on. Never included in the built site (see app/layout.tsx).
 */
export function previewDateScript(ceremonyStartsAt: string): string {
  return `(() => {
  try {
    const KEY = "previewDateOffset";
    const ceremony = Date.parse(${JSON.stringify(ceremonyStartsAt)});
    const HOUR = 3600000;
    const presets = { before: ceremony - HOUR, day: ceremony + HOUR, after: ceremony + 24 * HOUR };
    const asked = new URLSearchParams(location.search).get("now");
    if (asked === "off") sessionStorage.removeItem(KEY);
    else if (asked) {
      const target = asked in presets ? presets[asked] : Date.parse(asked);
      if (!Number.isNaN(target)) sessionStorage.setItem(KEY, String(target - Date.now()));
    }
    const offset = Number(sessionStorage.getItem(KEY));
    if (!offset) return;

    const RealDate = Date;
    class PreviewDate extends RealDate {
      constructor(...args) {
        if (args.length) super(...args);
        else super(RealDate.now() + offset);
      }
      static now() {
        return RealDate.now() + offset;
      }
    }
    window.Date = PreviewDate;

    addEventListener("DOMContentLoaded", () => {
      const badge = document.createElement("div");
      badge.textContent = "Preview: " + new PreviewDate().toLocaleString() + "  ·  ?now=off to stop";
      badge.style.cssText =
        "position:fixed;left:8px;bottom:8px;z-index:9999;padding:4px 8px;font:12px system-ui;" +
        "background:#000c;color:#fff;border-radius:4px;pointer-events:none";
      document.body.append(badge);
    });
  } catch {}
})();`;
}
