import { LitElement, html, type TemplateResult } from "lit";
import { styles } from "./styles";
import type { TrustBadge } from "./types";

const ICONS: Record<string, TemplateResult> = {
  shield: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" /></svg>`,
  truck: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>`,
  phone: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.6 2Z" /></svg>`,
  audit: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 14l2 2 4-4" /></svg>`,
};

const DEFAULT_BADGES: TrustBadge[] = [
  { icon: "shield", title: "Insured fulfillment", sub: "Every prize fully insured by Tier Rewards" },
  { icon: "truck", title: "Verified shipping", sub: "UPS Ground · live tracking from claim" },
  { icon: "phone", title: "24/7 Player Services", sub: "Real humans · on-property & phone" },
  { icon: "audit", title: "Audit-trail compliant", sub: "NV Gaming · tribal compliance verified" },
];

/**
 * `<pq-trust-strip>` — a row of trust badges (insured / shipping / support / compliance).
 * Props: `badges` (defaults to the four above), `columns` (default 4; collapses to 2 on
 * narrow widths).
 */
export class PqTrustStrip extends LitElement {
  static override styles = styles;

  static override properties = {
    badges: { attribute: false },
    columns: { type: Number },
  };

  declare badges: TrustBadge[];
  declare columns: number;

  constructor() {
    super();
    this.badges = DEFAULT_BADGES;
    this.columns = 4;
  }

  override render(): TemplateResult {
    return html`
      <div class="strip">
        <div class="inner" style="--pq-trust-cols:${this.columns}">
          ${this.badges.map(
            (b) => html`<div class="badge">
              <span class="icon">${ICONS[b.icon] ?? ICONS.shield}</span>
              <div>
                <h4 class="title">${b.title}</h4>
                <p class="sub">${b.sub}</p>
              </div>
            </div>`,
          )}
        </div>
      </div>
    `;
  }
}

if (!customElements.get("pq-trust-strip")) {
  customElements.define("pq-trust-strip", PqTrustStrip);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-trust-strip": PqTrustStrip;
  }
}

export type { TrustBadge } from "./types";
