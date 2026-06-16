// Dev chrome — the Device · Orientation · Scale switcher (ported from the bottom
// <script> of prize-quest-kiosk-arcade.html). Drives --device-w / --device-h /
// --scale and [data-orientation] on <html>, sets the active composition channel
// (?channel=) + [data-formfactor] + --iview-pin-key, persists the choice, and
// dispatches `pq-device-change` so main.ts can reload the form factor.
//
// Session 27: every device now maps to a real channel with its own compositions
// (kiosk-landscape / kiosk-portrait / egm / iview-4 / iview-3) — no placeholder.
//
// Production gate: when VITE_PROD_BUILD is true the switcher wiring is skipped, the
// chrome is hidden (CSS), and the device comes from a ?device= param / the default.

type ChannelId = "kiosk-landscape" | "kiosk-portrait" | "egm" | "iview-4" | "iview-3";

interface DeviceSpec {
  w: number;
  h: number;
  allowsOrientation: boolean;
  defaultOrient?: "landscape" | "portrait";
  channel: ChannelId;
  /** Form factor family for CSS (iVIEW gets single-column compact overrides). */
  formfactor: "kiosk" | "egm" | "iview-4" | "iview-3";
  /** Touch-target size for the compact PIN keypad (iVIEW only). */
  pinKey?: number;
}

const DEVICES: Record<string, DeviceSpec> = {
  "kiosk-1920x1080": { w: 1920, h: 1080, allowsOrientation: true, channel: "kiosk-landscape", formfactor: "kiosk" },
  "kiosk-1080x1920": { w: 1080, h: 1920, allowsOrientation: true, defaultOrient: "portrait", channel: "kiosk-portrait", formfactor: "kiosk" },
  "egm-1920x1080": { w: 1920, h: 1080, allowsOrientation: false, channel: "egm", formfactor: "egm" },
  "iview4-1024x600": { w: 1024, h: 600, allowsOrientation: false, channel: "iview-4", formfactor: "iview-4", pinKey: 80 },
  "iview3-800x480": { w: 800, h: 480, allowsOrientation: false, channel: "iview-3", formfactor: "iview-3", pinKey: 70 },
};

const STORAGE_KEY = "pq.kiosk.dev";
const DEFAULTS = { device: "kiosk-1920x1080", orient: "landscape" as const, scale: 0.5 };

/** What main.ts needs to know after a device/orientation/scale change. */
export interface DeviceChange {
  device: string;
  orient: "landscape" | "portrait";
  channel: ChannelId;
}

interface Choice {
  device: string;
  orient: "landscape" | "portrait";
  scale: number;
}

function readChoice(): Choice {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Choice>;
      if (parsed.device && DEVICES[parsed.device]) {
        return {
          device: parsed.device,
          orient: parsed.orient === "portrait" ? "portrait" : "landscape",
          scale: typeof parsed.scale === "number" ? parsed.scale : DEFAULTS.scale,
        };
      }
    }
  } catch {
    /* private browsing — ignore */
  }
  return { ...DEFAULTS };
}

function persist(choice: Choice): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch {
    /* ignore */
  }
}

/** Point the ?channel= param at the device's channel so pq-screen resolves it. */
function setChannel(channel: ChannelId): void {
  const u = new URL(location.href);
  if (u.searchParams.get("channel") !== channel) {
    u.searchParams.set("channel", channel);
    history.replaceState({}, "", u);
  }
}

/** Apply a resolved choice to the DOM + notify main.ts. */
function apply(choice: Choice): void {
  const device = DEVICES[choice.device] ?? DEVICES[DEFAULTS.device];
  let orient = choice.orient;
  if (!device.allowsOrientation) {
    orient = device.w >= device.h ? "landscape" : "portrait";
  }

  let w = device.w;
  let h = device.h;
  if (orient === "portrait" && w > h) [w, h] = [h, w];
  if (orient === "landscape" && h > w) [w, h] = [h, w];

  const root = document.documentElement;
  root.style.setProperty("--device-w", `${w}px`);
  root.style.setProperty("--device-h", `${h}px`);
  root.style.setProperty("--scale", String(choice.scale));
  root.setAttribute("data-orientation", orient);
  root.setAttribute("data-formfactor", device.formfactor);
  if (device.pinKey) root.style.setProperty("--iview-pin-key", `${device.pinKey}px`);
  else root.style.removeProperty("--iview-pin-key");

  const dims = document.getElementById("dims-text");
  const scaleText = document.getElementById("scale-text");
  if (dims) dims.textContent = `${w} × ${h}`;
  if (scaleText) scaleText.textContent = `${Math.round(choice.scale * 100)}%`;

  setChannel(device.channel);

  window.dispatchEvent(
    new CustomEvent<DeviceChange>("pq-device-change", {
      detail: { device: choice.device, orient, channel: device.channel },
    }),
  );
}

/**
 * Wire the dev-chrome switchers. In a production build the switcher is skipped and
 * the device is taken from `?device=` (or the default), applied once.
 */
export function wireDevChrome(): void {
  const prod = Boolean(import.meta.env.VITE_PROD_BUILD);
  if (prod) {
    document.documentElement.dataset.prodBuild = "true";
    const requested = new URLSearchParams(location.search).get("device");
    const device = requested && DEVICES[requested] ? requested : DEFAULTS.device;
    const spec = DEVICES[device];
    const orient = spec.defaultOrient ?? (spec.w >= spec.h ? "landscape" : "portrait");
    apply({ device, orient, scale: 1 });
    return;
  }

  const deviceSel = document.getElementById("device-switch") as HTMLSelectElement | null;
  const orientSel = document.getElementById("orient-switch") as HTMLSelectElement | null;
  const scaleSel = document.getElementById("scale-switch") as HTMLSelectElement | null;

  const choice = readChoice();

  const sync = (): void => {
    const device = DEVICES[choice.device] ?? DEVICES[DEFAULTS.device];
    if (orientSel) orientSel.disabled = !device.allowsOrientation;
    apply(choice);
    persist(choice);
  };

  if (deviceSel) {
    deviceSel.value = choice.device;
    deviceSel.addEventListener("change", () => {
      choice.device = deviceSel.value;
      const spec = DEVICES[choice.device];
      if (spec?.defaultOrient) choice.orient = spec.defaultOrient;
      if (orientSel) orientSel.value = choice.orient;
      sync();
    });
  }
  if (orientSel) {
    orientSel.value = choice.orient;
    orientSel.addEventListener("change", () => {
      choice.orient = orientSel.value === "portrait" ? "portrait" : "landscape";
      sync();
    });
  }
  if (scaleSel) {
    scaleSel.value = String(choice.scale);
    scaleSel.addEventListener("change", () => {
      choice.scale = parseFloat(scaleSel.value) || DEFAULTS.scale;
      sync();
    });
  }

  sync();
}
