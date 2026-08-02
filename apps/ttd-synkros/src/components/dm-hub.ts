// <dm-hub> — Device Manager carded-in state. The game keeps the whole display; the
// service strip the stage hands us in the bottom band becomes the player dashboard: greeting + tier + points on
// the left, the vendor dashboard buttons on the right (Tier Rewards Promotions is
// ours — gold hero with a ready-count badge; My Account / Tier Status are vendor
// system chrome, non-interactive in this demo, mirroring <ttd-hub>).
// Host chrome, themed by the tenant's --arc-* tokens (Casino Luxe default).
import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { navigate } from "@pq/router";
import { $campaigns, $player, bindAtom } from "@pq/store";
import type { Campaign, Player } from "@pq/mock-data";

const userIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <circle cx="12" cy="8" r="4" />
  <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
</svg>`;
const awardIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <circle cx="12" cy="8" r="6" />
  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
</svg>`;
/** Fallback when the product logo asset 404s — the mark degrades to a wordmark. */
const giftIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <rect x="3" y="9" width="18" height="12" rx="1" />
  <path d="M12 9v12M3 13h18M12 9S10 4 7.5 5.5 9 9 12 9ZM12 9s2-5 4.5-3.5S15 9 12 9Z" />
</svg>`;

export class DmHub extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .root {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }
    .strip {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 0 36px;
      background: linear-gradient(180deg, rgba(10, 10, 10, 0.92), rgba(0, 0, 0, 0.99));
      border-top: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      box-shadow: 0 -18px 40px -18px rgba(0, 0, 0, 0.85);
    }
    .id {
      min-width: 0;
    }
    .id__name {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 22px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--arc-cream, #fff);
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .id__meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 5px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .id__tier {
      color: var(--arc-display-bright, #ebd08a);
      border: 1px solid var(--arc-display-deep, #a8862a);
      border-radius: 999px;
      padding: 2px 9px;
      background: var(--arc-glow-soft, rgba(212, 175, 55, 0.16));
      white-space: nowrap;
    }
    .id__pts {
      color: var(--arc-display-bright, #ebd08a);
      white-space: nowrap;
    }
    /* The 1920 strip has a wide empty middle; the live offer belongs there — it is the
       reason to open the window at all. Hidden at 1024, where there is no room. */
    .offer {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 0 auto;
      padding: 10px 20px;
      border-radius: var(--arc-r-md, 8px);
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.7));
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
    }
    .offer__dot {
      width: 8px;
      height: 8px;
      flex: none;
      border-radius: 50%;
      background: var(--arc-success, #34d670);
      box-shadow: 0 0 8px var(--arc-success, #34d670);
    }
    .offer__label {
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
    }
    .offer__name {
      margin-top: 3px;
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 17px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--arc-display-bright, #ebd08a);
      line-height: 1;
    }
    .offer__val {
      padding-left: 14px;
      border-left: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 17px;
      color: var(--arc-display, #d4af37);
      line-height: 1;
    }
    .offer__val small {
      display: block;
      margin-top: 3px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
    }
    @media (prefers-reduced-motion: no-preference) {
      .offer__dot {
        animation: dm-blink 1.8s ease-in-out infinite;
      }
    }
    @keyframes dm-blink {
      50% {
        opacity: 0.4;
      }
    }
    .actions {
      display: flex;
      align-items: stretch;
      gap: 12px;
      margin-left: auto;
      flex: none;
      height: 62px;
    }
    .dash-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      min-width: 132px;
      padding: 0 22px;
      border-radius: var(--arc-r-md, 8px);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      background: linear-gradient(
        160deg,
        var(--arc-bg-glass, rgba(34, 34, 34, 0.6)),
        var(--arc-bg-glass-2, rgba(12, 12, 12, 0.9))
      );
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      color: var(--arc-cream, #fff);
      font: inherit;
      transition:
        transform 200ms ease,
        border-color 200ms ease;
    }
    .dash-btn:hover {
      transform: translateY(-1px);
      border-color: var(--arc-display-deep, #a8862a);
    }
    .dash-btn svg {
      width: 18px;
      height: 18px;
    }
    /* The Tier Rewards mark is silver/white on transparent — it can't sit directly on
       the gold hero. It gets its own dark plate, the way a brand lockup would on a
       printed gold panel; the plate also separates OUR mark from the casino's chrome. */
    .mark {
      display: grid;
      place-items: center;
      padding: 5px 12px;
      border-radius: var(--arc-r-sm, 5px);
      background: var(--arc-bg-deep, #000);
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .mark img {
      display: block;
      height: 22px;
      max-width: 132px;
      object-fit: contain;
    }
    .mark svg {
      color: var(--arc-display-bright, #ebd08a);
    }
    .dash-btn__label {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 12px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      line-height: 1.05;
      text-align: center;
    }
    /* Ours — gold hero that launches the service window. */
    .dash-btn--hero {
      /* Reserve a right gutter for the ready badge — the mark is wide and centred, so
         without it the badge lands on top of the logo. */
      padding: 0 50px 0 20px;
      background: linear-gradient(
        180deg,
        var(--arc-display-bright, #ebd08a) 0%,
        var(--arc-display, #d4af37) 55%,
        var(--arc-display-deep, #a8862a) 100%
      );
      border-color: var(--arc-display, #d4af37);
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
      box-shadow:
        0 0 12px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }
    .dash-btn--hero::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: -100%;
      width: 50%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
    }
    .badge {
      position: absolute;
      top: 8px;
      right: 9px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--arc-bg-deep, #000);
      background: var(--arc-success, #34d670);
      padding: 2px 6px;
      border-radius: 999px;
    }
    @media (prefers-reduced-motion: no-preference) {
      .dash-btn--hero {
        animation: dm-hot-pulse 1.8s ease-in-out infinite;
      }
      .dash-btn--hero::after {
        animation: dm-sweep 3.2s linear infinite;
      }
    }
    @keyframes dm-hot-pulse {
      0%,
      100% {
        box-shadow:
          0 0 12px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
      }
      50% {
        box-shadow:
          0 0 22px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          0 0 0 2px rgba(212, 175, 55, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
      }
    }
    @keyframes dm-sweep {
      to {
        left: 200%;
      }
    }
    /* 1024×768 — tighter strip; points collapse into the tier pill row only. */
    :host-context([data-dm-ff="1024x768"]) .strip {
      gap: 12px;
      padding: 0 18px;
    }
    :host-context([data-dm-ff="1024x768"]) .id__name {
      font-size: 17px;
    }
    :host-context([data-dm-ff="1024x768"]) .id__pts {
      display: none;
    }
    :host-context([data-dm-ff="1024x768"]) .actions {
      height: 50px;
      gap: 8px;
    }
    :host-context([data-dm-ff="1024x768"]) .dash-btn {
      min-width: 100px;
      padding: 0 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .dash-btn svg {
      width: 14px;
      height: 14px;
    }
    :host-context([data-dm-ff="1024x768"]) .dash-btn__label {
      font-size: 10px;
    }
    :host-context([data-dm-ff="1024x768"]) .offer {
      display: none;
    }
    :host-context([data-dm-ff="1024x768"]) .dash-btn--hero {
      padding: 0 38px 0 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .mark {
      padding: 4px 8px;
    }
    :host-context([data-dm-ff="1024x768"]) .mark img {
      height: 16px;
      max-width: 96px;
    }
  `;

  static override properties = {
    player: { attribute: false },
    campaigns: { attribute: false },
    logoBroken: { state: true },
  };

  declare player: Player | null;
  declare campaigns: Campaign[] | null;
  /** Set when the product logo asset 404s — falls the hero back to the gift glyph. */
  declare logoBroken: boolean;

  constructor() {
    super();
    this.player = null;
    this.campaigns = null;
    this.logoBroken = false;
    bindAtom(this, $player, "player");
    bindAtom(this, $campaigns, "campaigns");
  }

  /** The live offer, centred in the strip — what the patron gets for opening the window. */
  private renderOffer(): TemplateResult {
    const c = this.featured;
    if (!c) return html``;
    const ready = c.status === "eligible";
    const count = c.prizeIds.length;
    return html`
      <div class="offer">
        <span class="offer__dot"></span>
        <div>
          <div class="offer__label">${ready ? "Ready to collect" : "In progress"}</div>
          <div class="offer__name">${c.name}</div>
        </div>
        <div class="offer__val">
          ${ready ? `${count} prize${count === 1 ? "" : "s"}` : "Keep playing"}
          <small>${ready ? "Yours to choose from" : "to qualify"}</small>
        </div>
      </div>
    `;
  }

  /**
   * The VENDOR mark — Tier Rewards, identical on every tenant, because this button is
   * the entry point to OUR surface rather than anything the casino owns. Reads
   * `<html data-pq-product-logo>` (published by the host app), so the component stays
   * free of both app and tenant config. Degrades to the gift glyph.
   */
  private renderMark(): TemplateResult {
    const root = document.documentElement.dataset;
    const src = this.logoBroken ? null : root.pqProductLogo || null;
    if (!src) return html`<span class="mark">${giftIcon}</span>`;
    return html`<span class="mark"
      ><img
        src=${src}
        alt=${root.pqProductAlt ?? "Tier Rewards"}
        @error=${() => {
          this.logoBroken = true;
        }}
    /></span>`;
  }

  #go(path: string): void {
    navigate(`${path}${location.search}`);
  }

  private get readyCount(): number {
    return (this.campaigns ?? []).filter((c) => c.status === "eligible").length;
  }

  /** The offer worth advertising in the strip: something to collect, else the closest
   *  in-progress quest. Null when the patron has neither. */
  private get featured(): Campaign | null {
    const all = this.campaigns ?? [];
    return (
      all.find((c) => c.status === "eligible") ??
      [...all].filter((c) => c.status === "in-progress").sort((a, b) => b.pct - a.pct)[0] ??
      null
    );
  }

  override render(): TemplateResult {
    const product = document.documentElement.dataset.pqProductName ?? "Tier Rewards Promotions";
    const name = this.player?.name ?? "Player";
    const tier = this.player?.tier ?? "Member";
    const points = this.player?.points;
    const ready = this.readyCount;
    return html`
      <div class="root">
        <div class="strip">
          <div class="id">
            <div class="id__name">Welcome, ${name}</div>
            <div class="id__meta">
              <span class="id__tier">${tier}</span>
              ${points != null
                ? html`<span class="id__pts">${points.toLocaleString("en-US")} pts</span>`
                : nothing}
            </div>
          </div>
          ${this.renderOffer()}
          <div class="actions">
            <button
              class="dash-btn dash-btn--hero"
              type="button"
              title=${product}
              aria-label=${product}
              @click=${() => this.#go("/rewards")}
            >
              ${ready > 0 ? html`<span class="badge">${ready} Ready</span>` : nothing}
              ${this.renderMark()}
              <!-- The mark already reads "Tier Rewards", so the label carries only the
                   part it doesn't say. Full product name stays on title/aria-label. -->
              <span class="dash-btn__label">Promotions</span>
            </button>
            <button class="dash-btn" type="button" title="Vendor system (demo)">
              ${userIcon}
              <span class="dash-btn__label">My Account</span>
            </button>
            <button class="dash-btn" type="button" title="Vendor system (demo)">
              ${awardIcon}
              <span class="dash-btn__label">Tier Status</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("dm-hub")) {
  customElements.define("dm-hub", DmHub);
}

declare global {
  interface HTMLElementTagNameMap {
    "dm-hub": DmHub;
  }
}
