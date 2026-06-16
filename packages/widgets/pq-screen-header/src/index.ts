import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { Campaign, Player } from "@pq/mock-data";
import { bindAtom, $activeCampaign, $player } from "@pq/store";
import { styles } from "./styles";

const backIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">
  <polyline points="15 18 9 12 15 6" />
</svg>`;

/** Form-factor density profile pushed by `pq-screen` from the surface channel. */
export type ScreenHeaderProfile = "compact" | "standard" | "expanded";

/**
 * `<pq-screen-header>` — the casino screen chrome bar (back chevron · brand/title ·
 * points balance) shown on top of each Prize Quest screen on dense surfaces (TTD).
 *
 * Title precedence: explicit `title` prop → active campaign name (`$activeCampaign`) →
 * `brand`. Points come from `$player.points` (the `points` prop is the test fallback).
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
  };

  // NB: `title` overrides HTMLElement.title, so it must stay a plain `string`.
  declare title: string;
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
  private declare _campaign: Campaign | null;
  private declare _player: Player | null;

  constructor() {
    super();
    this.title = "";
    this.showBack = false;
    this.brand = "Prize Quest";
    this.profile = "standard";
    this._campaign = null;
    this._player = null;
    bindAtom(this, $activeCampaign, "_campaign");
    bindAtom(this, $player, "_player");
  }

  private get displayTitle(): string {
    return this.title || this._campaign?.name || this.brand;
  }

  private get displayPoints(): number | undefined {
    return this._player?.points ?? this.points;
  }

  override render(): TemplateResult {
    // `compact` and `standard` are intentionally identical to the original
    // `.bar` template (keeps TTD + kiosk-compact byte-for-byte). Only the
    // `expanded` profile switches to the big kiosk arc-header.
    if (this.profile === "expanded") return this.renderExpanded();
    return this.renderStandard();
  }

  /** Original `.bar` chrome (back chevron · brand · points) — compact + standard. */
  private renderStandard(): TemplateResult {
    const pts = this.displayPoints;
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
        <div class="right">
          ${pts != null
            ? html`<span class="pts">${pts.toLocaleString()} pts</span>`
            : html`<span class="spacer"></span>`}
        </div>
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
    const pts = this.displayPoints;
    const tier = player?.tier ?? "Member";

    return html`
      <header class="arc-header">
        <div class="arc-brand">
          <div class="arc-logo">${this.brand.charAt(0) || "P"}</div>
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
          <div class="arc-points">
            <div class="arc-points__label">Reward Points</div>
            <div class="arc-points__val">${pts != null ? pts.toLocaleString() : "—"}</div>
          </div>
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
