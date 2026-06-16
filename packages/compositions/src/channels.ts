import type { Channel, Profile } from "./types";

const KNOWN_CHANNELS: readonly Channel[] = [
  "mobile-web",
  "desktop-web",
  "kiosk-portrait",
  "kiosk-landscape",
  "egm",
  "egm-main",
  "iview-3",
  "iview-4",
  "ttd",
];

function isChannel(value: string | null): value is Channel {
  return value != null && (KNOWN_CHANNELS as readonly string[]).includes(value);
}

/**
 * Resolve the active channel. An explicit `?channel=` URL param always wins
 * (lets the playground / QA force any surface); otherwise fall back to a coarse
 * viewport heuristic.
 */
export function detectChannel(): Channel {
  const requested = new URLSearchParams(location.search).get("channel");
  if (isChannel(requested)) return requested;
  return window.innerWidth < 600 ? "mobile-web" : "desktop-web";
}

/** The density profile a given channel renders at. */
export function getProfileForChannel(channel: Channel): Profile {
  switch (channel) {
    case "ttd":
    case "iview-3":
    case "iview-4":
      return "compact";
    case "kiosk-landscape":
    case "kiosk-portrait":
    case "egm":
    case "egm-main":
    case "desktop-web":
      return "expanded";
    default:
      return "standard";
  }
}

/** Write the active density profile to `<html data-pq-profile>` for CSS to key off. */
export function applyProfile(profile: Profile): void {
  document.documentElement.dataset.pqProfile = profile;
}
