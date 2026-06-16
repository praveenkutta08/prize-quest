import { LitElement, html, nothing, type TemplateResult } from "lit";
import { styles } from "./styles";
import type { ProgressBarProfile, ProgressBarVariant } from "./types";

/**
 * `<pq-progress-bar>` — a thin (2px) tenant-themed progress line.
 *
 * Props (reflected where useful):
 * - `value`   number, default 0 (clamped to [0, max])
 * - `max`     number, default 100
 * - `variant` 'default' | 'complete' | 'loading', default 'default'
 * - `label`   optional mono eyebrow shown above the track
 *
 * Uses the static-properties API (no decorators) so the same source compiles
 * cleanly under Vite, Storybook, and Web Test Runner's esbuild transform.
 */
export class PqProgressBar extends LitElement {
  static override styles = styles;

  static override properties = {
    value: { type: Number },
    max: { type: Number },
    variant: { type: String, reflect: true },
    label: { type: String },
    profile: { type: String, reflect: true },
  };

  // `declare` (no field initializer) + constructor assignment avoids shadowing
  // Lit's reactive accessors — robust whether or not the toolchain sets
  // useDefineForClassFields:false. See lit.dev/msg/class-field-shadowing.
  declare value: number;
  declare max: number;
  declare variant: ProgressBarVariant;
  declare label?: string;
  /**
   * Form-factor profile pushed by `pq-screen`. `compact` and `standard` both
   * render the original thin-track template byte-for-byte; only `expanded`
   * switches to the kiosk header-row + 18px pill bar.
   */
  declare profile: ProgressBarProfile;

  constructor() {
    super();
    this.value = 0;
    this.max = 100;
    this.variant = "default";
    this.profile = "standard";
  }

  /** `max`, guarded against zero/negative so division is always safe. */
  get effectiveMax(): number {
    return this.max > 0 ? this.max : 100;
  }

  /** `value` clamped into `[0, effectiveMax]`. */
  get clampedValue(): number {
    return Math.min(Math.max(this.value, 0), this.effectiveMax);
  }

  /** Fill width as a percentage (0–100). */
  get percent(): number {
    return (this.clampedValue / this.effectiveMax) * 100;
  }

  override render(): TemplateResult {
    // `compact` and `standard` are intentionally identical to the original
    // template (keeps TTD + Luminara byte-for-byte). Only `expanded` differs.
    if (this.profile === "expanded") return this.renderExpanded();
    return this.renderStandard();
  }

  /** Original thin (2px) track template — shared by `compact` + `standard`. */
  private renderStandard(): TemplateResult {
    const loading = this.variant === "loading";
    return html`
      ${this.label
        ? html`<span class="eyebrow">${this.label}</span>`
        : nothing}
      <div class="track">
        ${loading
          ? html`<div class="shimmer"></div>`
          : html`<div class="fill" style="width:${this.percent}%"></div>`}
      </div>
    `;
  }

  /**
   * Kiosk bar (ref `.arc-progress` in prize-quest-kiosk-arcade.html): a header
   * row (label + value/max) above an 18px pill track with a gradient fill.
   * Loading still shows the indeterminate shimmer in the taller track.
   */
  private renderExpanded(): TemplateResult {
    const loading = this.variant === "loading";
    return html`
      <div class="arc-head">
        <span class="arc-label">${this.label ?? "Progress"}</span>
        <span class="arc-val"
          ><strong>${Math.round(this.clampedValue)}</strong> / ${this.effectiveMax}</span
        >
      </div>
      <div class="track track--arc">
        ${loading
          ? html`<div class="shimmer"></div>`
          : html`<div class="fill fill--arc" style="width:${this.percent}%"></div>`}
      </div>
    `;
  }

  /** Keep host ARIA in sync with state (role=progressbar / aria-busy when loading). */
  protected override updated(): void {
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", String(this.effectiveMax));

    if (this.variant === "loading") {
      this.setAttribute("aria-busy", "true");
      this.setAttribute("aria-valuetext", "Loading");
      this.removeAttribute("aria-valuenow");
    } else {
      this.removeAttribute("aria-busy");
      this.removeAttribute("aria-valuetext");
      this.setAttribute("aria-valuenow", String(Math.round(this.clampedValue)));
    }
  }
}

if (!customElements.get("pq-progress-bar")) {
  customElements.define("pq-progress-bar", PqProgressBar);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-progress-bar": PqProgressBar;
  }
}

export type { ProgressBarProfile, ProgressBarVariant };
