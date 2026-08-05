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

/** Gap between the game rect and the bezel ring that frames it. */
const BEZEL = 12;

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
      /* 1 1 auto, not 1 0 auto. With shrink disabled a screen whose content ran even a
         few pixels past the rail could not give them back, so it grew instead and the
         RAIL scrolled — a scrollbar down the middle of the service window, beside a
         game. Screens may fill the rail; they may not exceed it. */
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
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
      .game,
      .bezel {
        transition: none;
      }
    }

    /* ---------- The BEZEL — draws the square, never covers the game ----------
       We ask the mixer for a square rect, but we do not control what it does with the
       source inside one. It may letterback a 16:9 game (black bars) or stretch it. If
       it letterboxes, those bars land on OUR black layer and the square disappears —
       the window would read as a smaller rectangle floating in nothing, which is the
       opposite of the intent. So the square is drawn by us, on our own layer, as a ring
       around the hole. Then the shape is ours and holds whatever the video does.

       EVERY value here is OUTSET: a border on a box inflated past the rect, and outer
       shadows. No background, no inset shadow, no pseudo-element that reaches inward.
       One painted pixel inside the rect would sit over game meters, which is a
       compliance problem, not a cosmetic one. */
    .bezel {
      position: absolute;
      pointer-events: none;
      border: 1px solid var(--arc-display-deep, #a8862a);
      border-radius: 6px;
      box-shadow:
        0 0 0 1px rgba(0, 0, 0, 0.9),
        0 24px 58px rgba(0, 0, 0, 0.55),
        0 0 40px rgba(212, 175, 55, 0.13);
      transition:
        left 320ms cubic-bezier(0.22, 1, 0.36, 1),
        top 320ms cubic-bezier(0.22, 1, 0.36, 1),
        width 320ms cubic-bezier(0.22, 1, 0.36, 1),
        height 320ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    /* Corner brackets, in the language the rewards plaques already use. Two pseudos
       cover four corners: each draws one facing PAIR of rules and is then masked away
       across the middle, so what survives is the ends — the corners. */
    .bezel::before,
    .bezel::after {
      content: "";
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      border: 2px solid var(--arc-display, #d4af37);
    }
    .bezel::before {
      border-left-color: transparent;
      border-right-color: transparent;
      -webkit-mask-image: linear-gradient(90deg, #000 0 9%, transparent 15% 85%, #000 91%);
      mask-image: linear-gradient(90deg, #000 0 9%, transparent 15% 85%, #000 91%);
    }
    .bezel::after {
      border-top-color: transparent;
      border-bottom-color: transparent;
      -webkit-mask-image: linear-gradient(180deg, #000 0 9%, transparent 15% 85%, #000 91%);
      mask-image: linear-gradient(180deg, #000 0 9%, transparent 15% 85%, #000 91%);
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
    /* The "Your game · Live" tag is GONE. It was reassurance for a patron who might
       think the game had stopped — but the game is now a large square window with a lit
       bezel a foot from their hands, which says the same thing without a label. A
       blinking red dot beside a live game is noise, and on a cabinet it competes with
       real status indicators that DO mean something. */

    /* ---------- identity strip (bottom band, hard right) ---------- */
    .id {
      display: flex;
      align-items: center;
      /* Hard right, in the band UNDER the game. It sat top-left, which put the greeting
         directly above the window and made the patron's name the first thing on the
         screen — louder than the promotion they came for. Under the game and to the
         right it reads as a signature on the session rather than a headline. */
      justify-content: flex-end;
      text-align: right;
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
      justify-content: flex-end;
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
    /* CLOSE — the corner, on its own, at cabinet scale.
       It used to ride the right end of the identity strip, which meant it moved whenever
       the greeting did and was sized like a form control. It is now positioned from
       cfg.reserved.exit: the rect the config already reserves for EXIT chrome in the top
       right. Anchoring to that rect is what keeps it in the corner on any cabinet
       without a second set of magic numbers — see the note in render(). */
    .close {
      position: absolute;
      display: grid;
      place-items: center;
      border-radius: var(--arc-r-md, 8px);
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      background: var(--arc-bg-glass, rgba(34, 34, 34, 0.6));
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.6);
      color: var(--arc-cream, #fff);
      font-family: var(--arc-font-body, sans-serif);
      font-size: 30px;
      font-weight: 300;
      line-height: 1;
      cursor: pointer;
      transition:
        border-color 180ms ease,
        background 180ms ease,
        color 180ms ease;
    }
    .close:hover {
      border-color: var(--arc-display, #d4af37);
      background: var(--arc-glow-soft, rgba(212, 175, 55, 0.16));
      color: var(--arc-display-bright, #ebd08a);
    }

    /* The band under the game is only 358px wide now, and the SPIN dead-zone claims
       140 of it, so the greeting has ~200px to live in. At 15px it truncated to
       "WELCOME, JAMES M…" — a half-name is worse than a small one. */
    :host([data-ff="1024x768"]) .id {
      padding: 0 10px;
      gap: 10px;
    }
    :host([data-ff="1024x768"]) .id__name {
      font-size: 12px;
    }
    :host([data-ff="1024x768"]) .id__pts {
      display: none;
    }
    :host([data-ff="1024x768"]) .close {
      font-size: 23px;
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
    // The live tag hangs off the top-left of the game rect, never inside it — and now
    // clear of the bezel too, which sits BEZEL px further out on every side.
    const ex = cfg.reserved.exit;

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
          <slot name="top"></slot>
        </div>

        <div class="region region--bottom" style=${this.box(s.bottom)} ?hidden=${!s.bottom}>
          ${this.identity ? this.renderIdentity() : nothing}
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
        <!-- The square, drawn on our layer so it survives whatever the mixer does
             inside the rect. Suppressed in band mode, where the game is full-bleed and
             a ring would just trace the edge of the screen. -->
        ${s.mode !== "band"
          ? html`<div
              class="bezel"
              style="left:${g.x - BEZEL}px;top:${g.y - BEZEL}px;width:${g.w +
              BEZEL * 2}px;height:${g.h + BEZEL * 2}px"
            ></div>`
          : nothing}
        <!-- CLOSE, in the top-right corner. Sized and placed from cfg.reserved.exit so
             it lands in the corner on every cabinet without its own coordinates: a
             square the height of that rect, flush with its right edge. NOTE for the
             vendor conversation — this is the rect the config reserves for host EXIT
             chrome. Our button IS the exit from Tier Rewards, so the two should not
             both be drawn there; if the cabinet paints its own EXIT, move this. -->
        ${this.identity
          ? html`<button
              class="close"
              style="left:${ex.x + ex.w - ex.h}px;top:${ex.y}px;width:${ex.h}px;height:${ex.h}px"
              type="button"
              aria-label="Close and return to your game"
              title="Return to game"
              @click=${this.#close}
            >
              ✕
            </button>`
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
