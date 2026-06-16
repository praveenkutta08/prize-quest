import { LitElement, html, nothing, type TemplateResult } from "lit";
import { bindAtom, $session } from "@pq/store";
import { styles } from "./styles";
import "@pq/pq-progress-bar";

/** Layout of `<pq-tier-progress>`: the dense chip + progress (standard/compact,
 *  byte-identical) or the glass "Status" pill (expanded). */
export type TierProfile = "standard" | "expanded" | "compact";

/**
 * `<pq-tier-progress>` — loyalty tier chip ("Gold tier · 2,400 pts to Platinum").
 * When `progressPct` is provided it embeds a thin `<pq-progress-bar>` below the chip.
 * At the top tier (no `nextTier`) the "pts to" sub is hidden.
 *
 * `profile` selects the layout: `standard`/`compact` render the dense chip
 * (identical), `expanded` renders the kiosk/arcade glass "Status" pill.
 *
 * Props: `tier`, `nextTier?`, `pointsToNext?`, `progressPct?`, `profile`.
 */
export class PqTierProgress extends LitElement {
  static override styles = styles;

  static override properties = {
    tier: { type: String },
    nextTier: { type: String },
    pointsToNext: { type: Number },
    progressPct: { type: Number },
    profile: { type: String, reflect: true },
  };

  declare tier: string;
  declare nextTier?: string;
  declare pointsToNext?: number;
  declare progressPct?: number;
  declare profile: TierProfile;

  constructor() {
    super();
    this.tier = "Gold";
    this.profile = "standard";
    // Session drives the tier label when present; the `tier` prop is the fallback.
    bindAtom(this, $session, (session, host) => {
      if (session) (host as PqTierProgress).tier = session.tier;
    });
  }

  override render(): TemplateResult {
    if (this.profile === "expanded") return this.renderExpanded();
    return this.renderStandard();
  }

  /** Dense chip + optional progress bar — the standard/compact layout. */
  private renderStandard(): TemplateResult {
    const showSub = Boolean(this.nextTier) && this.pointsToNext != null;
    return html`
      <span class="chip">
        <span class="dot"></span>
        ${this.tier} tier
        ${showSub
          ? html`<span class="sub">${this.pointsToNext?.toLocaleString()} pts to ${this.nextTier}</span>`
          : nothing}
      </span>
      ${this.progressPct != null
        ? html`<pq-progress-bar class="bar" .value=${this.progressPct} .max=${100}></pq-progress-bar>`
        : nothing}
    `;
  }

  /**
   * Kiosk/arcade glass "Status" pill: a gold-gradient ★ circle beside a small
   * "Status" label and the tier value (e.g. "Platinum · Level 5"). Arcade tint
   * comes from the `data-pq-mode="arcade"` block in styles; sizing uses `--pq-*`.
   */
  private renderExpanded(): TemplateResult {
    const value =
      Boolean(this.nextTier) && this.pointsToNext != null
        ? `${this.tier} · ${this.pointsToNext.toLocaleString()} pts to ${this.nextTier}`
        : this.tier;
    return html`
      <span class="pill">
        <span class="pill-icon">★</span>
        <span class="pill-text">
          <span class="pill-label">Status</span>
          <span class="pill-name">${value}</span>
        </span>
      </span>
    `;
  }
}

if (!customElements.get("pq-tier-progress")) {
  customElements.define("pq-tier-progress", PqTierProgress);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-tier-progress": PqTierProgress;
  }
}
