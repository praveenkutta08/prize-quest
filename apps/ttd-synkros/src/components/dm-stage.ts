// <dm-stage> — the Device Manager Picture-in-Picture shell.
//
// Replaces the old split-screen window. We do NOT split the display: the EGM cannot.
// The game is a separate video layer the cabinet's mixer scales and positions; this
// element owns a full-screen content layer with a HOLE where the game sits, and exposes
// the leftover geometry as named regions:
//
//   slot="rail"    the primary content column
//   slot="top"     band above the game (identity strip, rendered here)
//   slot="bottom"  band below the game (service strip: attract / carded-in)
//   slot="full"    whole canvas, used when the game is a thumbnail or hidden
//
// Regions are DERIVED from the stage descriptor (see ../dm/stage.ts) — never hardcoded —
// so a different cabinet is a config change, not a layout rewrite.
//
// Nothing is ever painted inside the game rect, and nothing crosses its boundary: with
// two composited layers a modal over the game either will not render or will obscure
// game meters, which is a compliance problem. Host chrome (EXIT, SPIN) is laid out
// around, with a dead zone so a mis-tap cannot drop a spin.
import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { $player, bindAtom } from "@pq/store";
import type { Player } from "@pq/mock-data";
import {
  FLOW_DESIGN_WIDTH,
  FLOW_MIN_WIDTH,
  reservedPadding,
  requestGameRect,
  solveStage,
  stageConfig,
  type Rect,
  type StageMode,
  type StageSolution,
} from "../dm/stage";

/** How far the flow may be scaled up to fill a region taller than it needs. */
const FLOW_MAX_ZOOM = 1.5;

/** Dev-only game art. Production never renders the game — the mixer owns that layer. */
const GAME_SIM_SRC = "/dm-game.jpg";

export class DmStage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    /* Shadow DOM does not inherit the page reset — and every region carries a
       padding computed from the reserved chrome, so border-box is load-bearing. */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    .canvas {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--arc-bg-deep, #000);
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }

    /* ---------- LAYER 1 · our content, positioned from the solved regions ---------- */
    .region {
      position: absolute;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .region[hidden] {
      display: none;
    }
    .region--rail {
      overflow: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--arc-hairline-2, rgba(212, 175, 55, 0.35)) transparent;
      /* Screens that do not fill the column are centred; taller ones top-align so
         nothing is ever scrolled out of reach. */
      justify-content: safe center;
    }
    /* Transacting screens get the column beside the thumbnail — centre them in it. */
    .region--takeover {
      align-items: center;
    }
    .region--rail::-webkit-scrollbar {
      width: 6px;
    }
    .region--rail::-webkit-scrollbar-thumb {
      background: var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      border-radius: 3px;
    }
    ::slotted(*) {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    /* The embedded flow keeps its natural height and is centred as a card. */
    ::slotted(pq-screen) {
      flex: 0 0 auto;
      display: block;
      width: 100%;
    }

    /* ---------- LAYER 2 · the game. EGM-owned. We never paint in here. ---------- */
    .game {
      position: absolute;
      overflow: hidden;
      background: #000;
      transition:
        left 320ms cubic-bezier(0.22, 1, 0.36, 1),
        top 320ms cubic-bezier(0.22, 1, 0.36, 1),
        width 320ms cubic-bezier(0.22, 1, 0.36, 1),
        height 320ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    @media (prefers-reduced-motion: reduce) {
      .game {
        transition: none;
      }
    }
    .game img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .game__sim {
      position: absolute;
      top: 8px;
      left: 8px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #ffd9a0;
      background: rgba(0, 0, 0, 0.72);
      border: 1px solid rgba(255, 180, 80, 0.4);
      border-radius: 999px;
      padding: 3px 9px;
    }
    /* The live tag reads as OUR reassurance, so it sits just outside the game rect. */
    .livetag {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.78);
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--arc-cream, #fff);
      pointer-events: none;
    }
    .livetag i {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--arc-danger, #ff4d6d);
      box-shadow: 0 0 8px var(--arc-danger, #ff4d6d);
    }
    @media (prefers-reduced-motion: no-preference) {
      .livetag i {
        animation: dm-blink 1.6s ease-in-out infinite;
      }
    }
    @keyframes dm-blink {
      50% {
        opacity: 0.35;
      }
    }

    /* ---------- identity strip (top band) ---------- */
    .id {
      display: flex;
      align-items: center;
      gap: 18px;
      width: 100%;
      height: 100%;
      min-width: 0;
      padding: 0 28px;
    }
    .id > div {
      min-width: 0;
    }
    .id__name {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 22px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      line-height: 1;
      color: var(--arc-cream, #fff);
      /* A greeting that wraps mid-name reads as a layout fault. When the band narrows
         — as it does beside the claim window — it truncates instead. */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .id__meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 7px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .id__tier {
      color: var(--arc-display-bright, #ebd08a);
      border: 1px solid var(--arc-display-deep, #a8862a);
      background: var(--arc-glow-soft, rgba(212, 175, 55, 0.16));
      border-radius: 999px;
      padding: 3px 10px;
    }
    .id__pts {
      color: var(--arc-display-bright, #ebd08a);
    }
    .id__close {
      margin-left: auto;
      flex: none;
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: var(--arc-r-md, 8px);
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background: transparent;
      color: var(--arc-cream, #fff);
      font-size: 17px;
      line-height: 1;
      cursor: pointer;
    }
    .id__close:hover {
      border-color: var(--arc-display, #d4af37);
      background: var(--arc-glow-soft, rgba(212, 175, 55, 0.16));
    }

    :host([data-ff="1024x768"]) .id {
      padding: 0 16px;
      gap: 12px;
    }
    :host([data-ff="1024x768"]) .id__name {
      font-size: 15px;
    }
    :host([data-ff="1024x768"]) .id__pts {
      display: none;
    }
    :host([data-ff="1024x768"]) .id__close {
      width: 36px;
      height: 36px;
      font-size: 14px;
    }
  `;

  static override properties = {
    ff: { type: String, reflect: true, attribute: "data-ff" },
    mode: { type: String },
    identity: { type: Boolean },
    player: { attribute: false },
    _rect: { state: true },
  };

  /** Device Manager form factor key, e.g. "1920x1080". */
  declare ff: string;
  /** Requested stage mode. The solved mode may differ if the mixer gives another rect. */
  declare mode: Exclude<StageMode, "none">;
  /** Render the identity strip in the top band (off where a screen owns identity). */
  declare identity: boolean;
  declare player: Player | null;
  declare private _rect: Rect;

  #frame?: number;
  #resize?: ResizeObserver;

  constructor() {
    super();
    this.ff = "1920x1080";
    this.mode = "band";
    this.identity = false;
    this.player = null;
    this._rect = { ...stageConfig("1920x1080").presets.band };
    bindAtom(this, $player, "player");
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#resize = new ResizeObserver(() => this.#scheduleFit());
    window.addEventListener("resize", this.#scheduleFit);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#resize?.disconnect();
    window.removeEventListener("resize", this.#scheduleFit);
    if (this.#frame) cancelAnimationFrame(this.#frame);
  }

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("mode") || changed.has("ff")) void this.#applyMode();
  }

  /**
   * Ask the mixer for this mode's rect. A refusal is normal — the game may be mid-bonus
   * — so the stage simply keeps the rect it has and reports the outcome upward.
   */
  async #applyMode(): Promise<void> {
    const next = stageConfig(this.ff).presets[this.mode];
    if (!next) return;
    const granted = await requestGameRect(next);
    if (granted) {
      this._rect = { ...next };
    }
    this.dispatchEvent(
      new CustomEvent("dm-stage-change", {
        detail: { mode: this.mode, granted, rect: this._rect },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** The solved geometry for the current rect — the single source for every region. */
  private get solution(): StageSolution {
    return solveStage(stageConfig(this.ff), this._rect);
  }

  #scheduleFit = (): void => {
    if (this.#frame) cancelAnimationFrame(this.#frame);
    this.#frame = requestAnimationFrame(() => this.#fit());
  };

  /**
   * Fit the embedded flow to whatever region it landed in.
   *
   * The flow is authored for a landscape panel, so in a DM region it is short and wide
   * while the region is tall — uniform scaling alone can never fill it. What DOES fill
   * it is choosing the layout WIDTH: a narrower layout wraps taller, and can then be
   * scaled up further before it hits the region edge. So we measure the flow at a few
   * candidate widths and keep whichever fills both axes best.
   *
   * Width is still a hard ceiling — the block may never exceed the region, which is
   * what clipped the reward card.
   */
  #fit(): void {
    // When the flow is wrapped in <dm-flow-panel>, the panel bounds it and owns the
    // fit — measuring against the whole rail here would scale it straight through the
    // panel's frame.
    if (this.querySelector("dm-flow-panel")) return;
    const screen = this.querySelector<HTMLElement>("pq-screen");
    const rail = this.renderRoot.querySelector<HTMLElement>(".region--rail");
    if (!screen || !rail) return;

    const availW = rail.clientWidth - 40;
    const availH = rail.clientHeight - 40;
    if (availW <= 0 || availH <= 0) return;

    const candidates = [FLOW_MIN_WIDTH, 640, 768, 896, FLOW_DESIGN_WIDTH].filter(
      (w, i, a) => w <= FLOW_DESIGN_WIDTH && a.indexOf(w) === i,
    );

    let best = {
      width: Math.min(FLOW_DESIGN_WIDTH, Math.max(FLOW_MIN_WIDTH, availW)),
      zoom: 1,
      score: -1,
    };
    for (const width of candidates) {
      screen.style.width = `${width}px`;
      screen.style.zoom = "1";
      const naturalH = screen.scrollHeight || 1;
      const zoom = Math.min(availW / width, availH / naturalH, FLOW_MAX_ZOOM);
      if (zoom <= 0) continue;
      // Balance both axes: the worst-filled dimension is what reads as dead space.
      const score = Math.min((width * zoom) / availW, (naturalH * zoom) / availH);
      if (score > best.score) best = { width, zoom, score };
    }

    screen.style.width = `${best.width}px`;
    screen.style.zoom =
      best.zoom >= 0.999 && best.zoom <= 1.001 ? "1" : String(Number(best.zoom.toFixed(3)));
  }

  #onSlotChange = (): void => {
    this.#resize?.disconnect();
    const rail = this.renderRoot.querySelector<HTMLElement>(".region--rail");
    if (rail) this.#resize?.observe(rail);
    this.#scheduleFit();
  };

  #close = (): void => {
    this.dispatchEvent(new CustomEvent("dm-stage-close", { bubbles: true, composed: true }));
  };

  private box(region: Rect | null, gutter = true): string {
    if (!region) return "display:none";
    // With the game at full size it draws its own EXIT/SPIN inside its own rect, so
    // reserving floor space beside the service strip would just open a band of black.
    const skip = this.solution.mode === "band";
    const pad = gutter ? reservedPadding(stageConfig(this.ff), region, 20, skip) : 0;
    return (
      `left:${region.x}px;top:${region.y}px;width:${region.w}px;height:${region.h}px;` +
      (pad ? `padding-right:${pad}px;` : "")
    );
  }

  override render(): TemplateResult {
    const s = this.solution;
    const g = this._rect;
    const cfg = stageConfig(this.ff);
    const sim = import.meta.env.VITE_PROD_BUILD !== "true";
    // The live tag hangs off the top-left of the game rect, never inside it.
    const tagTop = Math.max(8, g.y - 30);

    return html`
      <div class="canvas">
        <div
          class="region region--rail ${s.mode === "takeover" ? "region--takeover" : ""}"
          style=${this.box(s.rail)}
          ?hidden=${!s.rail}
        >
          <slot name="rail" @slotchange=${this.#onSlotChange}></slot>
        </div>

        <div class="region region--top" style=${this.box(s.top)} ?hidden=${!s.top}>
          ${this.identity ? this.renderIdentity() : nothing}
          <slot name="top"></slot>
        </div>

        <div class="region region--bottom" style=${this.box(s.bottom)} ?hidden=${!s.bottom}>
          <slot name="bottom"></slot>
        </div>

        <div
          class="region region--full"
          style=${this.box(s.full, false)}
          ?hidden=${s.mode !== "none"}
        >
          <slot name="full"></slot>
        </div>

        <!-- LAYER 2 · the game. In production this is an empty hole: the mixer draws
             the game here. The image is dev scaffolding for demos only. -->
        <div
          class="game"
          style="left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px"
          aria-hidden="true"
        >
          ${sim
            ? html`<img src=${GAME_SIM_SRC} alt="" />
                <span class="game__sim">Simulated · dev only</span>`
            : nothing}
        </div>
        ${s.mode !== "band"
          ? html`<span class="livetag" style="left:${g.x}px;top:${tagTop}px">
              <i></i>Your game · Live
            </span>`
          : nothing}

        <!-- Host chrome the EGM owns. Laid out around, never over. -->
        <div
          style="position:absolute;${this.box(cfg.reserved.exit, false)};pointer-events:none"
        ></div>
        <div
          style="position:absolute;${this.box(cfg.reserved.spin, false)};pointer-events:none"
        ></div>
      </div>
    `;
  }

  private renderIdentity(): TemplateResult {
    const p = this.player;
    return html`
      <div class="id">
        <div>
          <div class="id__name">Welcome, ${p?.name ?? "Player"}</div>
          <div class="id__meta">
            <span class="id__tier">${p?.tier ?? "Member"}</span>
            ${p?.points != null
              ? html`<span class="id__pts">${p.points.toLocaleString("en-US")} pts</span>`
              : nothing}
          </div>
        </div>
        <button
          class="id__close"
          type="button"
          aria-label="Close and return to your game"
          title="Return to game"
          @click=${this.#close}
        >
          ✕
        </button>
      </div>
    `;
  }
}

if (!customElements.get("dm-stage")) {
  customElements.define("dm-stage", DmStage);
}

declare global {
  interface HTMLElementTagNameMap {
    "dm-stage": DmStage;
  }
}
