import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { Campaign, Player } from "@pq/mock-data";
import { bindAtom, $activeCampaign, $player } from "@pq/store";
import { styles } from "./styles";

const backIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="3"
  aria-hidden="true"
>
  <polyline points="15 18 9 12 15 6" />
</svg>`;

/** Form-factor density profile pushed by `pq-screen` from the surface channel. */
export type ScreenHeaderProfile = "compact" | "standard" | "expanded";

/**
 * `<pq-screen-header>` — the screen chrome bar (back chevron · brand/title · tenant
 * logo) shown on top of each screen on dense surfaces (TTD / iVIEW).
 *
 * Title precedence: explicit `title` prop → active campaign name (`$activeCampaign`) →
 * `brand` (which defaults to the active tenant's product name).
 *
 * The right slot carries the ACTIVE TENANT'S LOGO. It used to show the patron's points
 * balance; points were removed from the patron-facing chrome so the brand owns that
 * corner on every tenant. The logo source comes from `<html data-pq-brand-logo>` (written
 * by applyTokens); if the asset fails to load the slot falls back to a text wordmark, so
 * a tenant with no logo file on disk still reads correctly.
 *
 * The back button fires a composed `pq-back` event; the host decides what back means.
 *
 * Premium surfaces don't list this widget, so it never appears outside casino channels.
 */
export class PqScreenHeader extends LitElement {
  static override styles = styles;

  static override properties = {
    title: { type: String },
    points: { type: Number },
    showBack: { type: Boolean },
    backTo: { type: String },
    brand: { type: String },
    profile: { type: String, reflect: true },
    _campaign: { state: true },
    _player: { state: true },
    _logoBroken: { state: true },
  };

  // NB: `title` overrides HTMLElement.title, so it must stay a plain `string`.
  declare title: string;
  /**
   * @deprecated No-op. The points balance was removed from the patron-facing chrome —
   * the right slot now carries the tenant logo. Kept so existing compositions that
   * still pass `points` keep type-checking.
   */
  declare points?: number;
  declare showBack: boolean;
  /**
   * @deprecated No-op. Kept only for backwards-compat with existing compositions.
   * The reference kiosk chrome renders the brand block on EVERY screen (including
   * ones with back navigation); back affordances live in the title rows below the
   * header, owned by the body widgets — never in this header. See Session 28.
   */
  declare backTo?: string;
  declare brand: string;
  /**
   * Form-factor profile pushed by `pq-screen` (TTD → `compact`). `compact` and
   * `standard` render the original `.bar` chrome byte-for-byte; only `expanded`
   * switches to the big kiosk arc-header.
   */
  declare profile: ScreenHeaderProfile;
  declare private _campaign: Campaign | null;
  declare private _player: Player | null;
  /** Set when the tenant logo 404s — falls the right slot back to a text wordmark. */
  declare private _logoBroken: boolean;

  constructor() {
    super();
    this.title = "";
    this.showBack = false;
    // Tenant-driven, with the product name as the floor. applyTokens has already run by
    // the time any screen mounts, so this resolves to e.g. "Tier Rewards Promotions".
    this.brand = document.documentElement.dataset.pqBrandName ?? "Tier Rewards Promotions";
    this.profile = "standard";
    this._campaign = null;
    this._player = null;
    this._logoBroken = false;
    bindAtom(this, $activeCampaign, "_campaign");
    bindAtom(this, $player, "_player");
  }

  private get displayTitle(): string {
    return this.title || this._campaign?.name || this.brand;
  }

  /** The vendor logo src (tenant logo as a fallback), or null once an asset failed. */
  private get brandLogo(): string | null {
    if (this._logoBroken) return null;
    const d = document.documentElement.dataset;
    return d.pqProductLogo || d.pqBrandLogo || null;
  }

  private get brandAlt(): string {
    const d = document.documentElement.dataset;
    return d.pqProductAlt || d.pqBrandAlt || this.brand;
  }

  /** Render the vendor logo, degrading to a text wordmark when there is no asset. */
  private renderBrandmark(): TemplateResult {
    const src = this.brandLogo;
    if (!src) return html`<span class="wordmark">${this.brand}</span>`;
    return html`<img
      class="brandmark"
      src=${src}
      alt=${this.brandAlt}
      @error=${this.onLogoError}
    />`;
  }

  private onLogoError = (): void => {
    this._logoBroken = true;
  };

  override render(): TemplateResult {
    // `compact` and `standard` are intentionally identical to the original
    // `.bar` template (keeps TTD + kiosk-compact byte-for-byte). Only the
    // `expanded` profile switches to the big kiosk arc-header.
    if (this.profile === "expanded") return this.renderExpanded();
    return this.renderStandard();
  }

  /** Original `.bar` chrome (back chevron · brand · points) — compact + standard. */
  private renderStandard(): TemplateResult {
    return html`
      <div class="bar">
        <div class="left">
          ${this.showBack
            ? html`<button class="back" type="button" @click=${this.back} aria-label="Back">
                ${backIcon}<span>Back</span>
              </button>`
            : html`<span class="spacer"></span>`}
        </div>
        <span class="brand">${this.displayTitle}</span>
        <div class="right">${this.renderBrandmark()}</div>
      </div>
    `;
  }

  /**
   * Big kiosk header (ref `.arc-header` in prize-quest-kiosk-arcade.html): the
   * brand block (logo square + name + "Member · {name} · ID {id}" sub) ALWAYS
   * renders on the left — no back affordance lives here (Session 28). The right
   * side carries a tier pill, reward-points column, and time block. `$player`
   * drives the member name/id/points; the tier/time are static demo values.
   */
  private renderExpanded(): TemplateResult {
    const player = this._player;
    const memberName = player?.name ?? "Guest";
    const memberId = player?.id;
    const tier = player?.tier ?? "Member";

    return html`
      <header class="arc-header">
        <div class="arc-brand">
          <div class="arc-logo">${this.brand.charAt(0) || "T"}</div>
          <div>
            <div class="arc-brand__name">${this.displayTitle}</div>
            <div class="arc-brand__sub">
              Member · ${memberName}${memberId ? html` · ID ${memberId}` : nothing}
            </div>
          </div>
        </div>
        <div class="arc-header__right">
          <div class="arc-tier-pill">
            <div class="arc-tier-pill__icon">★</div>
            <div>
              <div class="arc-tier-pill__label">Status</div>
              <div class="arc-tier-pill__name">${tier}</div>
            </div>
          </div>
          <div class="arc-brandmark">${this.renderBrandmark()}</div>
          <div class="arc-time">
            <div class="arc-time__big">2:48 PM</div>
            <div class="arc-time__sub">Sun · Jun 7</div>
          </div>
        </div>
      </header>
    `;
  }

  private back = (): void => {
    this.dispatchEvent(new CustomEvent("pq-back", { bubbles: true, composed: true }));
  };
}

if (!customElements.get("pq-screen-header")) {
  customElements.define("pq-screen-header", PqScreenHeader);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-screen-header": PqScreenHeader;
  }
}
