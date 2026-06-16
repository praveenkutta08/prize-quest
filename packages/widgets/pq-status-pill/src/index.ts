import { LitElement, html, type TemplateResult } from "lit";
import { styles } from "./styles";
import type { StatusPillVariant } from "./types";

/** Default mono label per variant (overridable via the `label` prop). */
const DEFAULT_LABELS: Record<StatusPillVariant, string> = {
  eligible: "Eligible",
  "in-progress": "In progress",
  expired: "Expired",
  claimed: "Claimed",
  shipped: "Shipped",
  delivered: "Delivered",
  locked: "Locked",
  danger: "Action needed",
};

/**
 * `<pq-status-pill>` — consolidated status indicator: a mono uppercase label
 * preceded by a 5px colored dot. No background/border; the color comes from
 * tenant tokens, so it re-themes on tenant switch.
 *
 * Props:
 * - `variant` StatusPillVariant, default 'in-progress'
 * - `label`   optional text that overrides the variant's default label
 * - `profile` density profile pushed by `<pq-screen>` from the surface channel:
 *   - `compact` / `standard` → BYTE-IDENTICAL legacy dot + mono label
 *   - `expanded` → larger arcade pill (16px glyph + display-font label); the
 *     gradient/glow treatment lives in the arcade `:host-context` CSS block.
 *
 * Two orthogonal axes drive presentation, both handled in CSS (never via
 * mode/profile branching in TS): MODE (`data-pq-mode="arcade"`) and PROFILE
 * (`expanded`). `render()` simply picks the standard vs. expanded template.
 *
 * Uses the static-properties + `declare`/constructor pattern (no decorators) so
 * the same source compiles under Vite, Storybook, and Web Test Runner.
 */
export class PqStatusPill extends LitElement {
  static override styles = styles;

  static override properties = {
    variant: { type: String, reflect: true },
    label: { type: String },
    profile: { type: String, reflect: true },
  };

  declare variant: StatusPillVariant;
  declare label?: string;
  declare profile: "compact" | "standard" | "expanded";

  constructor() {
    super();
    this.variant = "in-progress";
    this.profile = "standard";
  }

  get text(): string {
    return this.label ?? DEFAULT_LABELS[this.variant] ?? this.variant;
  }

  /**
   * Legacy template — dot + mono label. Rendered VERBATIM for both `compact`
   * and `standard` so those profiles stay byte-identical to the original widget
   * (no regression for campaign-card/detail/order-history and TTD).
   */
  private renderStandard(): TemplateResult {
    return html`
      <span class="dot" aria-hidden="true"></span>
      <span class="label">${this.text}</span>
    `;
  }

  /**
   * Expanded arcade pill — a 16px glyph + display-font label. Layout sizes use
   * `--pq-*` fallbacks here; the gradient/border/glow per variant lives in the
   * arcade `:host-context([data-pq-mode="arcade"])` block in styles.ts.
   */
  private renderExpanded(): TemplateResult {
    return html`
      <span class="icon" aria-hidden="true"></span>
      <span class="label">${this.text}</span>
    `;
  }

  override render(): TemplateResult {
    return this.profile === "expanded"
      ? this.renderExpanded()
      : this.renderStandard();
  }

  protected override updated(): void {
    this.setAttribute("role", "status");
    this.setAttribute("aria-label", this.text);
  }
}

if (!customElements.get("pq-status-pill")) {
  customElements.define("pq-status-pill", PqStatusPill);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-status-pill": PqStatusPill;
  }
}

export type { StatusPillVariant };
