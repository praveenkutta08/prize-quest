// <dm-promo-detail> — the promotion browser inside the Device Manager service
// window (route /promotions). One promotion per page, Prev/Next across the set —
// the pattern the DM wireframe asked for, and the right one for a patron mid-spin:
// a single offer, fully explained, with one obvious action.
//
// The panel is a TALL column (768×1032 at 1920×1080, 410×~700 at 1024×768), so the
// promotion is told top-to-bottom as a story rather than squeezed into a card:
//
//   pager + status  →  name + hook  →  what it is  →  how it works
//                   →  what you can win  →  the action (pinned to the bottom)
//
// HOUSE RULE (from the TTD design): no currency values anywhere on a patron surface,
// and no progress bars. Qualification is expressed in the campaign's own copy, which
// is authored without currency symbols ("Wager 500").
//
// Host chrome (NOT a @pq widget), themed by the tenant's --arc-* tokens. Collect
// dispatches `pq-card-click`, the same contract the widgets use, so main.ts routes
// it into the existing claim flow (prize picker → confirm → PIN → …).
import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { navigate } from "@pq/router";
import { $campaigns, bindAtom } from "@pq/store";
import type { Campaign, CampaignStatus } from "@pq/mock-data";

const calendarIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  aria-hidden="true"
>
  <rect x="3" y="5" width="18" height="16" rx="2" />
  <path d="M3 10h18M8 3v4M16 3v4" />
</svg>`;
const chipIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  aria-hidden="true"
>
  <rect x="2" y="6" width="20" height="12" rx="2" />
  <path d="M2 10h20M6 15h4" />
</svg>`;
const targetIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  aria-hidden="true"
>
  <circle cx="12" cy="12" r="9" />
  <circle cx="12" cy="12" r="5" />
  <circle cx="12" cy="12" r="1.5" />
</svg>`;
const trophyIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  aria-hidden="true"
>
  <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" />
  <path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 15h6M12 13v2M8 20h8" />
</svg>`;
const lockIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  aria-hidden="true"
>
  <rect x="4" y="10" width="16" height="11" rx="2" />
  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
</svg>`;

const STEP_ICONS = [calendarIcon, chipIcon, targetIcon];

/** Status → the one-line hook that sits under the promotion name. */
const HOOK: Record<CampaignStatus, string> = {
  eligible: "You've qualified — pick your prize",
  "in-progress": "Keep playing to qualify",
  locked: "Play to unlock this quest",
  claimed: "Already claimed — nice work",
  expired: "This promotion has ended",
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  eligible: "Ready",
  "in-progress": "In progress",
  locked: "Locked",
  claimed: "Claimed",
  expired: "Ended",
};

export class DmPromoDetail extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100%;
    }
    .root {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 20px 26px 22px;
      gap: 18px;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }

    /* ---------- pager / status ---------- */
    .top {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .back {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border-radius: var(--arc-r-sm, 6px);
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background: transparent;
      color: var(--arc-text-dim, #c0c0c0);
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .back:hover {
      color: var(--arc-display-bright, #ebd08a);
      border-color: var(--arc-display-deep, #a8862a);
    }
    .pager {
      margin-left: auto;
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      border-radius: 999px;
      padding: 4px 11px;
    }
    .pill {
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      border-radius: 999px;
      padding: 4px 11px;
    }
    .pill--ready {
      color: var(--arc-bg-deep, #000);
      background: var(--arc-success, #34d670);
    }
    .pill--active {
      color: var(--arc-display-bright, #ebd08a);
      border: 1px solid var(--arc-display-deep, #a8862a);
      background: var(--arc-glow-soft, rgba(212, 175, 55, 0.16));
    }
    .pill--muted {
      color: var(--arc-text-faint, #8a8a8a);
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }

    /* The story block sits between the pinned pager and the pinned action, centred in
       whatever height is left — the panel is much taller than any one promotion needs. */
    .body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 18px;
    }

    /* ---------- title block ---------- */
    .title {
      margin: 0;
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 40px;
      line-height: 0.98;
      letter-spacing: 0.01em;
      text-transform: uppercase;
      color: var(--arc-cream, #fff);
    }
    .hook {
      margin: 10px 0 0;
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 16px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--arc-display, #d4af37);
    }
    .rule {
      height: 2px;
      margin-top: 14px;
      border-radius: 2px;
      background: linear-gradient(
        90deg,
        var(--arc-display, #d4af37),
        var(--arc-display-deep, #a8862a) 40%,
        transparent
      );
    }
    .overview {
      margin: 0;
      font-size: 14px;
      line-height: 1.55;
      color: var(--arc-text-dim, #c0c0c0);
    }

    /* ---------- how it works ---------- */
    .sec__title {
      font-family: var(--arc-font-mono, monospace);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      color: var(--arc-display, #d4af37);
      margin-bottom: 12px;
    }
    .steps {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .step__icon {
      flex: none;
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: var(--arc-r-sm, 6px);
      background: var(--arc-glow-soft, rgba(212, 175, 55, 0.16));
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      color: var(--arc-display, #d4af37);
    }
    .step__icon svg {
      width: 21px;
      height: 21px;
    }
    .step__name {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 14px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      line-height: 1.15;
    }
    .step__sub {
      margin-top: 3px;
      font-size: 12px;
      line-height: 1.35;
      color: var(--arc-text-faint, #8a8a8a);
    }

    /* ---------- prize pool ---------- */
    .pool {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 18px;
      border-radius: var(--arc-r-sm, 6px);
      background: linear-gradient(
        160deg,
        var(--arc-glow-soft, rgba(212, 175, 55, 0.16)),
        var(--arc-bg-glass-2, rgba(12, 12, 12, 0.9))
      );
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
    }
    .pool svg {
      width: 30px;
      height: 30px;
      flex: none;
      color: var(--arc-display, #d4af37);
    }
    .pool__val {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 26px;
      line-height: 1;
      color: var(--arc-display-bright, #ebd08a);
    }
    .pool__label {
      margin-top: 4px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
    }
    .pool__note {
      margin-left: auto;
      max-width: 46%;
      text-align: right;
      font-size: 11px;
      line-height: 1.35;
      color: var(--arc-text-dim, #c0c0c0);
    }

    /* ---------- action + carousel nav (pinned to the bottom) ---------- */
    .foot {
      margin-top: auto;
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .cta {
      position: relative;
      overflow: hidden;
      width: 100%;
      padding: 17px 20px;
      cursor: pointer;
      border: 1px solid var(--arc-display, #d4af37);
      border-radius: var(--arc-r-md, 8px);
      background: linear-gradient(
        180deg,
        var(--arc-display-bright, #ebd08a) 0%,
        var(--arc-display, #d4af37) 55%,
        var(--arc-display-deep, #a8862a) 100%
      );
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 19px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      box-shadow:
        0 0 14px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }
    .cta::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: -100%;
      width: 50%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
    }
    /* Not-yet states are informative, not clickable — they tell the patron the gap. */
    .state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 16px 20px;
      border-radius: var(--arc-r-md, 8px);
      border: 1px dashed var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.7));
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 15px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--arc-text-dim, #c0c0c0);
    }
    .state svg {
      width: 18px;
      height: 18px;
      color: var(--arc-text-faint, #8a8a8a);
    }
    .state b {
      color: var(--arc-display-bright, #ebd08a);
    }
    .nav {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .navbtn {
      padding: 12px 22px;
      cursor: pointer;
      border-radius: var(--arc-r-sm, 6px);
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background: var(--arc-surface-1, rgba(38, 38, 38, 0.55));
      color: var(--arc-cream, #fff);
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 14px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .navbtn:hover:not(:disabled) {
      border-color: var(--arc-display-deep, #a8862a);
      color: var(--arc-display-bright, #ebd08a);
    }
    .navbtn:disabled {
      opacity: 0.35;
      cursor: default;
    }
    .dots {
      display: flex;
      gap: 8px;
      margin: 0 auto;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--arc-hairline, rgba(192, 192, 192, 0.18));
      border: none;
      padding: 0;
      cursor: pointer;
      transition:
        transform 160ms ease,
        background 160ms ease;
    }
    .dot--on {
      background: var(--arc-display, #d4af37);
      transform: scale(1.25);
      box-shadow: 0 0 8px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
    }
    .empty {
      margin: auto;
      text-align: center;
      font-size: 14px;
      color: var(--arc-text-dim, #c0c0c0);
    }

    @media (prefers-reduced-motion: no-preference) {
      .cta {
        animation: dm-hot-pulse 1.8s ease-in-out infinite;
      }
      .cta::after {
        animation: dm-sweep 3.2s linear infinite;
      }
    }
    @keyframes dm-hot-pulse {
      0%,
      100% {
        box-shadow:
          0 0 14px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
      }
      50% {
        box-shadow:
          0 0 26px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          0 0 0 2px rgba(212, 175, 55, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
      }
    }
    @keyframes dm-sweep {
      to {
        left: 200%;
      }
    }

    /* ---------- 1024×768 · the panel is ~410px wide ---------- */
    :host-context([data-dm-ff="1024x768"]) .root {
      padding: 14px 16px 16px;
      gap: 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .body {
      gap: 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .title {
      font-size: 26px;
    }
    :host-context([data-dm-ff="1024x768"]) .hook {
      font-size: 12px;
      margin-top: 7px;
    }
    :host-context([data-dm-ff="1024x768"]) .overview {
      font-size: 12px;
      line-height: 1.45;
    }
    :host-context([data-dm-ff="1024x768"]) .steps {
      gap: 8px;
    }
    :host-context([data-dm-ff="1024x768"]) .step__icon {
      width: 32px;
      height: 32px;
    }
    :host-context([data-dm-ff="1024x768"]) .step__icon svg {
      width: 16px;
      height: 16px;
    }
    :host-context([data-dm-ff="1024x768"]) .step__name {
      font-size: 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .step__sub {
      font-size: 10px;
    }
    :host-context([data-dm-ff="1024x768"]) .pool {
      padding: 11px 13px;
    }
    :host-context([data-dm-ff="1024x768"]) .pool__val {
      font-size: 20px;
    }
    :host-context([data-dm-ff="1024x768"]) .pool__note {
      font-size: 10px;
    }
    :host-context([data-dm-ff="1024x768"]) .cta {
      padding: 13px 16px;
      font-size: 15px;
    }
    :host-context([data-dm-ff="1024x768"]) .state {
      padding: 12px 14px;
      font-size: 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .navbtn {
      padding: 9px 14px;
      font-size: 12px;
    }
  `;

  static override properties = {
    campaigns: { attribute: false },
    index: { type: Number },
  };

  declare campaigns: Campaign[] | null;
  declare index: number;

  constructor() {
    super();
    this.campaigns = null;
    this.index = 0;
    bindAtom(this, $campaigns, "campaigns");
  }

  /** Ready promotions lead — a patron shouldn't have to page to find what they've won. */
  private get list(): Campaign[] {
    const all = this.campaigns ?? [];
    const rank = (c: Campaign): number =>
      c.status === "eligible" ? 0 : c.status === "in-progress" ? 1 : 2;
    return [...all].sort((a, b) => rank(a) - rank(b));
  }

  #open(id: string): void {
    this.dispatchEvent(
      new CustomEvent("pq-card-click", { detail: { id }, bubbles: true, composed: true }),
    );
  }

  #page(next: number): void {
    const max = this.list.length - 1;
    this.index = Math.max(0, Math.min(max, next));
  }

  override render(): TemplateResult {
    const list = this.list;
    if (list.length === 0) {
      return html`<div class="root">
        <p class="empty">No promotions are running right now — check back soon.</p>
      </div>`;
    }
    const i = Math.min(this.index, list.length - 1);
    const c = list[i];
    const steps = c.steps ?? [];
    const pillClass =
      c.status === "eligible"
        ? "pill--ready"
        : c.status === "in-progress"
          ? "pill--active"
          : "pill--muted";

    return html`
      <div class="root">
        <div class="top">
          <button class="back" type="button" @click=${() => navigate(`/rewards${location.search}`)}>
            ‹ Back
          </button>
          <span class="pill ${pillClass}">${STATUS_LABEL[c.status]}</span>
          <span class="pager">${i + 1} of ${list.length}</span>
        </div>

        <div class="body">
          <div>
            <h1 class="title">${c.name}</h1>
            <p class="hook">${HOOK[c.status]}</p>
            <div class="rule"></div>
          </div>

          <p class="overview">${c.overview ?? c.description ?? c.meta}</p>

          ${steps.length > 0
            ? html`<section>
                <div class="sec__title">How it works</div>
                <div class="steps">
                  ${steps.map(
                    (s, n) =>
                      html`<div class="step">
                        <span class="step__icon">${STEP_ICONS[n] ?? targetIcon}</span>
                        <span>
                          <span class="step__name">${s}</span>
                        </span>
                      </div>`,
                  )}
                </div>
              </section>`
            : nothing}

          <div class="pool">
            ${trophyIcon}
            <div>
              <div class="pool__val">
                ${c.prizeIds.length} prize${c.prizeIds.length === 1 ? "" : "s"}
              </div>
              <div class="pool__label">Yours to choose from</div>
            </div>
            <p class="pool__note">${c.prizesNote ?? c.meta}</p>
          </div>
        </div>

        <div class="foot">
          ${this.renderAction(c)}
          <div class="nav">
            <button
              class="navbtn"
              type="button"
              ?disabled=${i === 0}
              @click=${() => this.#page(i - 1)}
            >
              ‹ Prev
            </button>
            <div class="dots">
              ${list.map(
                (p, n) =>
                  html`<button
                    class="dot ${n === i ? "dot--on" : ""}"
                    type="button"
                    aria-label=${p.name}
                    @click=${() => this.#page(n)}
                  ></button>`,
              )}
            </div>
            <button
              class="navbtn"
              type="button"
              ?disabled=${i >= list.length - 1}
              @click=${() => this.#page(i + 1)}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /** One action per state. Collectible offers get the gold CTA; everything else gets
   *  an honest status line rather than a dead button — and it names the next step in
   *  words, since the qualifying amount is never shown as a currency value. */
  private renderAction(c: Campaign): TemplateResult {
    if (c.status === "eligible") {
      return html`<button class="cta" type="button" @click=${() => this.#open(c.id)}>
        Collect Your Prize
      </button>`;
    }
    if (c.status === "in-progress") {
      return html`<div class="state">${chipIcon}<span>Keep playing to qualify</span></div>`;
    }
    if (c.status === "locked") {
      return html`<div class="state">${lockIcon}<span>Play to unlock this quest</span></div>`;
    }
    if (c.status === "claimed") {
      return html`<div class="state">${trophyIcon}<span>Prize claimed</span></div>`;
    }
    return html`<div class="state">${lockIcon}<span>This promotion has ended</span></div>`;
  }
}

if (!customElements.get("dm-promo-detail")) {
  customElements.define("dm-promo-detail", DmPromoDetail);
}

declare global {
  interface HTMLElementTagNameMap {
    "dm-promo-detail": DmPromoDetail;
  }
}
