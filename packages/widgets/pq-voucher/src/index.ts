import { LitElement, html, nothing, svg, type TemplateResult } from "lit";
import type { Voucher } from "@pq/mock-data";
import { bindAtom, $vouchers } from "@pq/store";
import { styles } from "./styles";
import type { VoucherAction } from "./types";

const copyIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>`;

/**
 * Deterministic placeholder QR — a 21×21 module grid seeded from the code string.
 * NOT a real QR encoder; it's a stable visual stand-in for the digital voucher.
 */
function placeholderQr(seed: string): TemplateResult {
  const size = 21;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rects = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // finder-pattern corners always filled for a QR-like look
      const corner =
        (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      h ^= (x * 31 + y * 17 + 1);
      h = Math.imul(h, 16777619);
      const on = corner ? (x % 6 === 0 || y % 6 === 0 || (x > 1 && x < 5 && y > 1 && y < 5)) : (h & 1) === 0;
      if (on) rects.push(svg`<rect x=${x} y=${y} width="1" height="1" fill="#0A1A2E" />`);
    }
  }
  return svg`<svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="Voucher QR code">${rects}</svg>`;
}

/**
 * `<pq-voucher>` — digital-prize delivery: brand, big value, placeholder QR, copyable
 * code, expiry, and how-to-redeem steps. Redeemed state shows a stamp + grayscale QR.
 * Copying the code fires `pq-copy`; the action buttons fire `pq-voucher-action` ({action}).
 *
 * Props: `voucher` (Voucher).
 */
export class PqVoucher extends LitElement {
  static override styles = styles;

  static override properties = {
    voucher: { attribute: false },
    redeemed: { type: Boolean, reflect: true },
    profile: { type: String, reflect: true },
  };

  declare voucher?: Voucher;
  declare redeemed: boolean;
  /** `compact` renders the tight split casino voucher (value/code left, QR right). */
  declare profile: "compact" | "standard" | "expanded";

  constructor() {
    super();
    this.redeemed = false;
    this.profile = "standard";
    // Reflect the most recent voucher; the `voucher` prop is the test fallback.
    bindAtom(this, $vouchers, (vouchers, host) => {
      const latest = vouchers?.[0];
      if (latest) (host as PqVoucher).voucher = latest;
    });
  }

  override render(): TemplateResult {
    const v = this.voucher;
    if (!v) return html``;
    if (this.profile === "expanded") return this.renderExpanded(v);
    if (this.profile === "compact") return this.renderCompact(v);
    const valueText = v.amount != null ? `$${v.amount}` : v.code;
    return html`
      <div class="body">
        <div class="hero">
          <span class="badge">${v.redeemed ? "Redeemed" : "Ready to use"}</span>
          <h2 class="hero__title">
            ${v.redeemed ? "Voucher used" : html`You won a <em>${valueText}</em> voucher`}
          </h2>
        </div>

        <div class="card">
          ${v.brand ? html`<span class="card__brand">${v.brand}</span>` : nothing}
          ${v.amount != null ? html`<span class="card__value">$${v.amount}</span>` : nothing}
          ${v.name ? html`<p class="card__name">${v.name}</p>` : nothing}
          <div class="qr">${placeholderQr(v.code)}</div>
          <button class="code" @click=${this.handleCopy}>${v.code} ${copyIcon}</button>
          <span class="expiry">
            ${v.redeemed
              ? `Redeemed ${v.redeemedAt ?? ""}`
              : v.expiresAt
                ? `Expires ${v.expiresAt}`
                : ""}
          </span>
          ${v.redeemed ? html`<span class="stamp">Redeemed</span>` : nothing}
        </div>

        ${!v.redeemed
          ? html`<div class="how">
              <p class="how__title">How to redeem</p>
              <div class="how__row"><span class="how__num">1</span> Show this QR code at any participating outlet.</div>
              <div class="how__row"><span class="how__num">2</span> Staff scans it and applies the value to your bill.</div>
              <div class="how__row"><span class="how__num">3</span> Unused balance carries forward until expiry.</div>
            </div>`
          : nothing}

        <div class="actions">
          ${!v.redeemed
            ? html`<button class="cta" @click=${() => this.act("wallet")}>Add to wallet</button>
                <button class="cta cta--ghost" @click=${() => this.act("email")}>Email to me</button>`
            : nothing}
          <button class="cta cta--ghost" @click=${() => this.act("done")}>Done</button>
        </div>
      </div>
    `;
  }

  /** Tight split casino voucher for the 480×234 TTD (ref `.vou-wrap`). Tap (outside
   *  the code button) dismisses to the dashboard via the `done` action. */
  private renderCompact(v: Voucher): TemplateResult {
    return html`
      <div class="vou-wrap" role="button" tabindex="0" @click=${() => this.act("done")} @keydown=${this.onKey}>
        <div class="vou-left">
          <span class="vou-badge">${v.redeemed ? "Redeemed" : "Ready to use"}</span>
          ${v.amount != null ? html`<h2 class="vou-value">$${v.amount}</h2>` : nothing}
          ${v.name ? html`<p class="vou-name">${v.name}</p>` : nothing}
          <button class="vou-code" @click=${this.handleCopy}>${v.code}</button>
        </div>
        <div class="vou-qr">${placeholderQr(v.code)}</div>
      </div>
    `;
  }

  /** Centered ~800px ticket-style block (ref Section 6.12): mono code on a
   *  notched ticket-stub card, redemption instructions, placeholder QR, and a
   *  CTA row (Copy code primary + Email me the code ghost). Reuses the existing
   *  voucher data, placeholderQr, handleCopy and `act` events. */
  private renderExpanded(v: Voucher): TemplateResult {
    const valueText = v.amount != null ? `$${v.amount}` : v.code;
    return html`
      <div class="exp">
        <div class="exp__head">
          <span class="badge">${v.redeemed ? "Redeemed" : "Ready to use"}</span>
          <h2 class="exp__title">
            ${v.redeemed ? "Voucher used" : html`You won a <em>${valueText}</em> voucher`}
          </h2>
          ${v.brand ? html`<span class="exp__brand">${v.brand}</span>` : nothing}
        </div>

        <div class="ticket">
          <div class="ticket__main">
            ${v.amount != null ? html`<span class="ticket__value">$${v.amount}</span>` : nothing}
            ${v.name ? html`<p class="ticket__name">${v.name}</p>` : nothing}
            <button class="ticket__code" @click=${this.handleCopy}>${v.code} ${copyIcon}</button>
            <span class="expiry">
              ${v.redeemed
                ? `Redeemed ${v.redeemedAt ?? ""}`
                : v.expiresAt
                  ? `Expires ${v.expiresAt}`
                  : ""}
            </span>
          </div>
          <div class="ticket__stub">
            <div class="qr">${placeholderQr(v.code)}</div>
          </div>
          ${v.redeemed ? html`<span class="stamp">Redeemed</span>` : nothing}
        </div>

        ${!v.redeemed
          ? html`<div class="how">
              <p class="how__title">How to redeem</p>
              <div class="how__row"><span class="how__num">1</span> Show this QR code at any participating outlet.</div>
              <div class="how__row"><span class="how__num">2</span> Staff scans it and applies the value to your bill.</div>
              <div class="how__row"><span class="how__num">3</span> Unused balance carries forward until expiry.</div>
            </div>`
          : nothing}

        <div class="exp__actions">
          <button class="cta" @click=${this.handleCopy}>Copy code</button>
          <button class="cta cta--ghost" @click=${() => this.act("email")}>Email me the code</button>
        </div>
        <div class="exp__nav">
          <button class="cta cta--ghost" @click=${() => this.act("done")}>Back to hub</button>
          <button class="cta cta--ghost" @click=${() => this.act("orders")}>View order history</button>
        </div>
      </div>
    `;
  }

  private onKey = (event: KeyboardEvent): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.act("done");
    }
  };

  private handleCopy = (event?: Event): void => {
    event?.stopPropagation();
    const code = this.voucher?.code ?? "";
    if (code && navigator.clipboard) void navigator.clipboard.writeText(code).catch(() => {});
    this.dispatchEvent(new CustomEvent("pq-copy", { detail: { value: code }, bubbles: true, composed: true }));
  };

  private act(action: VoucherAction): void {
    this.dispatchEvent(new CustomEvent("pq-voucher-action", { detail: { action }, bubbles: true, composed: true }));
  }

  protected override updated(): void {
    this.toggleAttribute("redeemed", Boolean(this.voucher?.redeemed));
  }
}

if (!customElements.get("pq-voucher")) {
  customElements.define("pq-voucher", PqVoucher);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-voucher": PqVoucher;
  }
}

export type { VoucherAction, VoucherActionDetail } from "./types";
