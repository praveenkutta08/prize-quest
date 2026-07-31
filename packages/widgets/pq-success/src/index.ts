import { LitElement, html, nothing, type TemplateResult } from "lit";
import { bindAtom, $claims } from "@pq/store";
import { styles } from "./styles";

const checkIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="3"
  aria-hidden="true"
>
  <polyline points="20 6 9 17 4 12" />
</svg>`;
const trophyIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
  <path d="M4 22h16" />
  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
</svg>`;
const copyIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <rect x="9" y="9" width="13" height="13" rx="2" />
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
</svg>`;
const giftIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.4"
  aria-hidden="true"
>
  <rect x="3" y="8" width="18" height="13" rx="1" />
  <path d="M12 8v13M3 12h18M12 8S10 3 7.5 4.5 9 8 12 8ZM12 8s2-5 4.5-3.5S15 8 12 8Z" />
</svg>`;

/** Celebration burst illustration for the expanded kiosk profile (ref screen 09). */
const burstIllustration = html`
  <svg viewBox="0 0 600 280" width="100%" height="280" aria-hidden="true">
    <g class="burst__rays">
      <line
        x1="300"
        y1="140"
        x2="300"
        y2="20"
        stroke="var(--arc-display-bright, #FFEE5C)"
        stroke-width="4"
        stroke-linecap="round"
      />
      <line
        x1="300"
        y1="140"
        x2="380"
        y2="40"
        stroke="var(--cat-pink, #FF3FA4)"
        stroke-width="4"
        stroke-linecap="round"
      />
      <line
        x1="300"
        y1="140"
        x2="440"
        y2="100"
        stroke="var(--cat-purple, #8E47E8)"
        stroke-width="4"
        stroke-linecap="round"
      />
      <line
        x1="300"
        y1="140"
        x2="460"
        y2="180"
        stroke="var(--cat-blue, #3D8BF5)"
        stroke-width="4"
        stroke-linecap="round"
      />
      <line
        x1="300"
        y1="140"
        x2="380"
        y2="240"
        stroke="var(--arc-success, #34D670)"
        stroke-width="4"
        stroke-linecap="round"
      />
      <line
        x1="300"
        y1="140"
        x2="220"
        y2="240"
        stroke="var(--cat-orange, #FF8C2C)"
        stroke-width="4"
        stroke-linecap="round"
      />
      <line
        x1="300"
        y1="140"
        x2="140"
        y2="180"
        stroke="var(--arc-display-bright, #FFEE5C)"
        stroke-width="4"
        stroke-linecap="round"
      />
      <line
        x1="300"
        y1="140"
        x2="160"
        y2="100"
        stroke="var(--cat-pink, #FF3FA4)"
        stroke-width="4"
        stroke-linecap="round"
      />
      <line
        x1="300"
        y1="140"
        x2="220"
        y2="40"
        stroke="var(--cat-teal, #2DD4BF)"
        stroke-width="4"
        stroke-linecap="round"
      />
    </g>
    <circle cx="100" cy="60" r="6" fill="var(--arc-display-bright, #FFEE5C)" />
    <circle cx="500" cy="80" r="5" fill="var(--cat-pink, #FF3FA4)" />
    <circle cx="80" cy="200" r="7" fill="var(--cat-purple, #8E47E8)" />
    <rect
      x="520"
      y="200"
      width="12"
      height="12"
      fill="var(--arc-success, #34D670)"
      transform="rotate(25 526 206)"
    />
    <rect
      x="70"
      y="140"
      width="10"
      height="10"
      fill="var(--cat-blue, #3D8BF5)"
      transform="rotate(-15 75 145)"
    />
    <circle cx="540" cy="140" r="5" fill="var(--cat-orange, #FF8C2C)" />
    <rect
      x="200"
      y="20"
      width="8"
      height="14"
      fill="var(--arc-display-bright, #FFEE5C)"
      transform="rotate(30 204 27)"
    />
    <rect
      x="400"
      y="20"
      width="8"
      height="14"
      fill="var(--cat-pink, #FF3FA4)"
      transform="rotate(-30 404 27)"
    />
    <circle cx="200" cy="260" r="5" fill="var(--cat-teal, #2DD4BF)" />
    <circle cx="400" cy="260" r="5" fill="var(--cat-purple, #8E47E8)" />
    <g class="burst__trophy" transform="translate(300 140) scale(1.2)">
      <path
        d="M-40 -40 L40 -40 L36 30 Q32 50 0 50 Q-32 50 -36 30 Z"
        fill="var(--arc-display-bright, #FFEE5C)"
        stroke="var(--cat-orange, #FF8C2C)"
        stroke-width="3"
      />
      <rect x="-12" y="50" width="24" height="14" fill="var(--cat-orange, #FF8C2C)" />
      <rect x="-22" y="64" width="44" height="8" rx="2" fill="var(--cat-orange, #FF8C2C)" />
      <path
        d="M-13 12 L-3 19 L13 -4"
        fill="none"
        stroke="var(--arc-bg-deep, #15042E)"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
  </svg>
`;

/**
 * `<pq-success>` — physical-prize claim confirmation: check, eyebrow, "You won X",
 * a copyable reference code, the prize echo card, and primary/ghost actions.
 *
 * Props: `prizeName`, `shipMeta?`, `referenceCode`, `eyebrow?`, `title?`,
 * `ctaLabel?`, `dismissLabel?`. Events: `pq-copy` (code), `pq-success-cta`,
 * `pq-success-dismiss`.
 */
export class PqSuccess extends LitElement {
  static override styles = styles;

  static override properties = {
    prizeName: { type: String },
    shipMeta: { type: String },
    referenceCode: { type: String },
    eyebrow: { type: String },
    heading: { type: String },
    ctaLabel: { type: String },
    dismissLabel: { type: String },
    profile: { type: String, reflect: true },
  };

  declare prizeName: string;
  declare shipMeta?: string;
  declare referenceCode?: string;
  declare eyebrow: string;
  declare heading?: string;
  declare ctaLabel: string;
  declare dismissLabel: string;
  /** `compact` renders the tight casino celebration (check + title + sub + ref). */
  declare profile: "compact" | "standard" | "expanded";

  constructor() {
    super();
    this.prizeName = "";
    this.eyebrow = "Claim submitted";
    this.ctaLabel = "Track your prize";
    this.dismissLabel = "Return to promotions";
    this.profile = "standard";
    // Reflect the most recent claim; props remain the Storybook/test fallback.
    bindAtom(this, $claims, (claims, host) => {
      const latest = claims?.[0];
      if (!latest) return;
      const self = host as PqSuccess;
      self.prizeName = latest.prizeName;
      if (latest.confirmation) self.referenceCode = latest.confirmation;
      self.shipMeta = "Ships to your address on file";
    });
  }

  override render(): TemplateResult {
    if (this.profile === "expanded") return this.renderExpanded();
    if (this.profile === "compact") return this.renderCompact();
    return html`
      <div class="wrap">
        <div class="check">${checkIcon}</div>
        <p class="eyebrow">${this.eyebrow}</p>
        <h1 class="title">${this.heading ?? html`You won <em>${this.prizeName}</em>`}</h1>
        <p class="sub">Shipping to your address on file. Track it from your prize history.</p>
        ${this.referenceCode
          ? html`<button class="ref" @click=${this.handleCopy}>
              ${this.referenceCode} ${copyIcon}
            </button>`
          : nothing}
        <div class="card">
          <span class="card__img">${giftIcon}</span>
          <div>
            <h4 class="card__name">${this.prizeName}</h4>
            ${this.shipMeta ? html`<p class="card__meta">${this.shipMeta}</p>` : nothing}
          </div>
        </div>
        <div class="actions">
          <button class="cta" @click=${this.handleCta}>${this.ctaLabel}</button>
          <button class="cta cta--ghost" @click=${this.handleDismiss}>${this.dismissLabel}</button>
        </div>
      </div>
    `;
  }

  /** TTD 480×234 celebration (ref Screen 09): burst check, "Reward Claimed!", a lede,
   *  a condensed order strip (Order # + tracking/ship note), and an explicit action
   *  row (View Order History / Back to Hub) — mirrors the kiosk success, just dense. */
  private renderCompact(): TemplateResult {
    // Fold the tracking/ship note into the sub line so the block above the buttons is
    // a single centered column (trophy → title → sub → order pill), matching Screen 09.
    const subParts: string[] = [];
    if (this.prizeName) subParts.push(`Your ${this.prizeName} is on the way`);
    if (this.shipMeta) subParts.push(this.shipMeta);
    subParts.push("tracking by email + text");
    const sub = subParts.join(" · ");
    return html`
      <div class="wrap wrap--compact">
        <div class="check check--trophy">${trophyIcon}</div>
        <h1 class="title">${this.heading ?? "Reward Claimed!"}</h1>
        <p class="sub">${sub}</p>
        ${this.referenceCode
          ? html`<button class="sc-order" @click=${this.handleCopy}>
              <span class="sc-order__label">Order #</span>
              <span class="sc-order__code">${this.referenceCode}</span>
              ${copyIcon}
            </button>`
          : nothing}
        <div class="actions actions--row">
          <button class="cta" @click=${this.handleCta}>${this.ctaLabel}</button>
          <button class="cta cta--ghost" @click=${this.handleDismiss}>${this.dismissLabel}</button>
        </div>
      </div>
    `;
  }

  /** Full-canvas kiosk "Reward Claimed!" celebration (ref screen 09). */
  private renderExpanded(): TemplateResult {
    // Headline lede is the celebratory prize line; the ship details live in the
    // order card (avoid duplicating shipMeta in both places, which crowded both).
    const lede = this.prizeName ? `Your ${this.prizeName} is on the way.` : "";
    const shipLines = this.shipMeta ? this.shipMeta.split(" · ") : [];
    return html`
      <div class="wrap wrap--expanded">
        <div class="burst">
          <span class="burst__glow" aria-hidden="true"></span>
          ${burstIllustration}
        </div>
        <div class="hero">
          <span class="pill">${checkIcon} Confirmed</span>
          <h1 class="display">${this.heading ?? "Reward Claimed!"}</h1>
          ${lede ? html`<p class="lede">${lede}</p>` : nothing}
        </div>
        <div class="order">
          <span class="order__img">${giftIcon}</span>
          <div class="order__info">
            <span class="order__label">Order #</span>
            ${this.referenceCode
              ? html`<button class="order__ref" @click=${this.handleCopy}>
                  ${this.referenceCode} ${copyIcon}
                </button>`
              : nothing}
            <span class="order__note">Tracking arrives by email + text within 24 hrs</span>
          </div>
          ${shipLines.length
            ? html`<div class="order__ships">
                <span class="order__label">Shipping</span>
                ${shipLines.map((part) => html`<span class="order__shipline">${part}</span>`)}
              </div>`
            : nothing}
        </div>
        <div class="actions actions--row">
          <button class="cta cta--xl" @click=${this.handleCta}>
            ${this.ctaLabel} ${checkIcon}
          </button>
          <button class="cta cta--ghost cta--xl" @click=${this.handleDismiss}>
            ${this.dismissLabel}
          </button>
        </div>
      </div>
    `;
  }

  private handleCopy = (event?: Event): void => {
    event?.stopPropagation();
    if (this.referenceCode && navigator.clipboard) {
      void navigator.clipboard.writeText(this.referenceCode).catch(() => {});
    }
    this.dispatchEvent(
      new CustomEvent("pq-copy", {
        detail: { value: this.referenceCode ?? "" },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private handleCta = (): void => {
    this.dispatchEvent(new CustomEvent("pq-success-cta", { bubbles: true, composed: true }));
  };

  private handleDismiss = (): void => {
    this.dispatchEvent(new CustomEvent("pq-success-dismiss", { bubbles: true, composed: true }));
  };
}

if (!customElements.get("pq-success")) {
  customElements.define("pq-success", PqSuccess);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-success": PqSuccess;
  }
}

export type { CopyDetail } from "./types";
