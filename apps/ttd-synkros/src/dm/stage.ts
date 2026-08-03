// Device Manager STAGE model.
//
// An EGM cannot split its screen. What it can do is Picture-in-Picture: the game is a
// video layer the cabinet's mixer scales and positions, and our HTML is a second layer
// composited by z-order. So the mental model is the inverse of a split:
//
//   WE OWN A FULL-SCREEN LAYER WITH A HOLE IN IT.
//
// The game rect is an INPUT to our layout, never an output of it. We never render the
// game, and we never paint inside its rect. Everything the UI needs is derived from one
// descriptor, so a new cabinet is a config change rather than a layout rewrite.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Size {
  w: number;
  h: number;
}

/** The stage shapes we design for. Each maps onto an existing density profile. */
export type StageMode = "band" | "frame" | "rail" | "takeover" | "none";

export interface StageConfig {
  canvas: Size;
  /** Narrowest column that can still carry a story; below this we fall back to a band. */
  minRail: number;
  /** Shallowest band that can still carry a touch target plus padding. */
  minBand: number;
  /** Host chrome the EGM owns (EXIT, SPIN). We lay out around these, never over them. */
  reserved: Record<string, Rect>;
  /** Game rects per stage mode — vendor-confirmable defaults, see DEFAULTS below. */
  presets: Record<Exclude<StageMode, "none">, Rect>;
}

export interface StageSolution {
  mode: StageMode;
  /** The primary content column, when the geometry affords one. */
  rail: Rect | null;
  top: Rect | null;
  bottom: Rect | null;
  full: Rect;
  /** Density profile the widgets should render at for this stage. */
  profile: "compact" | "standard" | "expanded";
}

/**
 * DEFAULT CONFIG — pending vendor confirmation.
 *
 * The 1920×1080 frame rect reproduces the reference cabinet photo: the game seated
 * centre-right at 16:9, leaving an L of content (left rail + top and bottom bands).
 * `band` is the game at full width with only a service strip beneath it — the state
 * the attract and carded-in screens run in, where the game is untouched.
 *
 * OPEN with the vendor: whether these rects can be requested at runtime or are
 * operator-configured; whether the mixer accepts arbitrary rects or fixed presets.
 */
export const DM_STAGES: Record<string, StageConfig> = {
  "1920x1080": {
    canvas: { w: 1920, h: 1080 },
    minRail: 320,
    minBand: 96,
    reserved: {
      exit: { x: 1786, y: 24, w: 110, h: 64 },
      spin: { x: 1752, y: 912, w: 132, h: 132 },
    },
    presets: {
      // The service strip. Was 122px — enough for a line of type and nothing else, so
      // the attract teaser and the carded-in greeting had to whisper. 208px gives the
      // strip a real presence at the bottom of the cabinet without the game losing
      // anything a player would notice mid-spin.
      band: { x: 0, y: 0, w: 1920, h: 872 },
      // CENTRED IN THE RIGHT COLUMN, both axes. The rail is unchanged at 800px: with a
      // gutter g on each side of the game, rail = canvas - gameW - 2g, so g=40 keeps
      // 800 exactly. Vertically (1080-585)/2. Equal gutters read as a mounted window;
      // unequal ones read as a mistake.
      frame: { x: 840, y: 248, w: 1040, h: 585 },
      rail: { x: 768, y: 0, w: 1152, h: 1080 },
      // Big enough to still read as YOUR game from a seated position — a postage
      // stamp reads as "the game stopped", which is the wrong message mid-claim.
      // CENTRED in its column: a window pinned to the top edge with a column of black
      // under it reads as a UI that fell over, not as picture-in-picture.
      takeover: { x: 1240, y: 365, w: 620, h: 349 },
    },
  },
  "1024x768": {
    canvas: { w: 1024, h: 768 },
    minRail: 260,
    minBand: 78,
    reserved: {
      exit: { x: 924, y: 16, w: 84, h: 48 },
      spin: { x: 904, y: 648, w: 96, h: 96 },
    },
    presets: {
      band: { x: 0, y: 0, w: 1024, h: 600 }, // 168px strip (was 96px)
      frame: { x: 412, y: 215, w: 600, h: 338 }, // g=12 keeps the rail at 400 exactly
      rail: { x: 410, y: 0, w: 614, h: 768 },
      // The claim window. Was pinned to the top-right with 505px of black beneath it —
      // two thirds of the column empty, the game reading as a corner stamp rather than
      // as the patron's own game still running. Now centred in its column and a little
      // larger; at this size the stage solves to FRAME, so the identity strip takes the
      // band above the game and the 1024 claim matches the 1920 one.
      takeover: { x: 584, y: 267, w: 416, h: 234 },
    },
  },
};

/**
 * Design width the embedded flow (<pq-screen>) was authored at — the iview-4
 * compositions are drawn for a 1024×600 landscape panel. The stage lays the flow out
 * at this width (or the region width, whichever is smaller) and then scales the whole
 * block to fit, so it is never starved of width and never clipped.
 */
export const FLOW_DESIGN_WIDTH = 1024;
/**
 * Below this the flow cannot lay out at all; the stage stops shrinking here.
 *
 * CORRECTED. This was 520, then 460, on the assumption that the PIN pad needed four
 * fixed columns. It does not: at [data-formfactor^="iview"] + compact the keypad is
 * `repeat(4, 1fr)` with `max-width: 520px` — a MAXIMUM, not a minimum — and the order
 * list, claim rows and address block are all single-column or fr-based at that
 * breakpoint. The same widgets already run the `ttd` channel on a 480x234 panel.
 *
 * The invented floor was expensive: it is what pushed the 1024 claim flow out of frame
 * mode into a takeover, which shrank the game and widened the content column halfway
 * through the journey. 320 is a real floor (the PIN cells are 44px x 4 plus gaps).
 */
export const FLOW_MIN_WIDTH = 320;

/** Form factors that run the Device Manager (PIP) chrome. */
export const DM_FORM_FACTORS = Object.keys(DM_STAGES);

export function isDmFormFactor(ff: string | undefined): boolean {
  return ff != null && ff in DM_STAGES;
}

export function stageConfig(ff: string): StageConfig {
  return DM_STAGES[ff] ?? DM_STAGES["1920x1080"];
}

/**
 * Derive the usable content regions from the game rect.
 *
 * The rail takes whichever side of the game has the most room; the bands span the
 * remainder. A mode falls out of the measurements rather than being declared, so an
 * unexpected rect from the mixer still resolves to something we have designed for.
 */
export function solveStage(cfg: StageConfig, game: Rect): StageSolution {
  const c = cfg.canvas;
  const full: Rect = { x: 0, y: 0, w: c.w, h: c.h };

  const leftW = Math.max(0, game.x);
  const rightW = Math.max(0, c.w - (game.x + game.w));
  const topH = Math.max(0, game.y);
  const botH = Math.max(0, c.h - (game.y + game.h));

  const railSide: "left" | "right" = leftW >= rightW ? "left" : "right";
  const railW = Math.max(leftW, rightW);
  const gameShare = (game.w * game.h) / (c.w * c.h);

  let mode: StageMode;
  if (gameShare < 0.12) mode = "takeover";
  else if (railW >= cfg.minRail)
    mode = topH >= cfg.minBand || botH >= cfg.minBand ? "frame" : "rail";
  else if (botH >= cfg.minBand || topH >= cfg.minBand) mode = "band";
  else mode = "none";

  const profile: StageSolution["profile"] =
    mode === "band" ? "compact" : c.w >= 1920 ? "expanded" : "standard";

  const rail =
    railW >= cfg.minRail
      ? { x: railSide === "left" ? 0 : game.x + game.w, y: 0, w: railW, h: c.h }
      : null;

  // TAKEOVER — the game is a thumbnail in a corner, so the bands would overlap the
  // rail and fragment the screen. The transacting patron gets ONE region instead: the
  // full column beside the thumbnail, which is where the claim flow wants to live.
  if (mode === "takeover") {
    return { mode, rail: rail ?? full, top: null, bottom: null, full, profile };
  }

  const spansFull = mode === "band";
  const bandX = spansFull ? 0 : railSide === "left" ? game.x : 0;
  const bandW = spansFull ? c.w : c.w - railW;

  return {
    mode,
    rail,
    top: topH >= cfg.minBand ? { x: bandX, y: 0, w: bandW, h: topH } : null,
    bottom: botH >= cfg.minBand ? { x: bandX, y: game.y + game.h, w: bandW, h: botH } : null,
    full,
    profile,
  };
}

/**
 * Right-hand padding a region needs so host chrome (EXIT / SPIN) stays clear.
 *
 * Only meaningful while the game is SCALED. With the game at full size it draws its
 * own controls inside its own rect, so reserving floor space beside our service strip
 * just opens a band of dead black — callers pass `skip` in that case.
 */
export function reservedPadding(cfg: StageConfig, region: Rect, gutter = 20, skip = false): number {
  if (skip) return 0;
  let pad = 0;
  for (const z of Object.values(cfg.reserved)) {
    const overlapsY = z.y < region.y + region.h && z.y + z.h > region.y;
    const overlapsX = z.x < region.x + region.w && z.x + z.w > region.x;
    if (overlapsY && overlapsX) pad = Math.max(pad, region.x + region.w - z.x + gutter);
  }
  return pad;
}

/**
 * VENDOR SEAM — asking the mixer to move the game.
 *
 * A resize is a REQUEST, not a command: the DM can refuse while the game is in a bonus
 * round, a free-spin sequence or a hand-pay. Every caller must survive `false`.
 *
 * TODO(vendor): replace the resolved stub with the cabinet SDK call (GSA G2S media
 * display, or the vendor's own bridge). Everything above this line is transport-free.
 */
export interface DmBridge {
  requestGameRect(rect: Rect): Promise<boolean>;
}

let bridge: DmBridge | null = null;

/** Install the cabinet adapter at boot. Without one, requests are granted locally. */
export function setDmBridge(next: DmBridge | null): void {
  bridge = next;
}

export async function requestGameRect(rect: Rect): Promise<boolean> {
  if (!bridge) return true;
  try {
    return await bridge.requestGameRect(rect);
  } catch {
    return false;
  }
}
