import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import type { AddressData } from "@pq/contracts";
import { bindAtom, $shippingAddress } from "@pq/store";
import { styles } from "./styles";

const checkIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>`;
const backIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>`;
const arrowIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>`;

/** Editable address field keys (everything except the structural `line2`). */
type Field = "name" | "line1" | "line2" | "city" | "state" | "postalCode" | "phone" | "email";

const EMPTY: AddressData = { line1: "", city: "", state: "", postalCode: "" };

/**
 * `<pq-address-form>` — editable shipping-address form for the claim flow (Session 30).
 *
 * Pre-fills from `$shippingAddress` (or the `initialAddress` prop in Storybook/tests),
 * lets the player edit locally, validates client-side, and on a valid OK click emits
 * `pq-address-submit` (detail = the entered `AddressData`). Back emits `pq-back`.
 * Local edits never write back to the store — the host app persists on submit.
 *
 * Props: `initialAddress` (AddressData), `profile`
 * (`"compact" | "standard" | "expanded"`), optional `onSubmit` / `onBack` callbacks.
 */
export class PqAddressForm extends LitElement {
  static override styles = styles;

  static override properties = {
    initialAddress: { attribute: false },
    profile: { type: String, reflect: true },
    onSubmit: { attribute: false },
    onBack: { attribute: false },
    formValues: { state: true },
    touched: { state: true },
  };

  /** Seed values (store wins via `bindAtom`; the prop is the Storybook/test fallback). */
  declare initialAddress?: AddressData;
  /** Channel layout. `compact` = TTD 480x234, `expanded` = kiosk, `standard` = mobile. */
  declare profile: "compact" | "standard" | "expanded";
  /** Optional callback for Storybook/direct use; the app path relies on the event. */
  declare onSubmit?: (entered: AddressData) => void;
  /** Optional Back callback for Storybook/direct use. */
  declare onBack?: () => void;

  /** Local working copy of the form. Seeded once from `initialAddress`. */
  declare formValues: AddressData;
  /** Field names the user has blurred — gates error styling to touched fields. */
  declare touched: Set<string>;

  /** True once `initialAddress` has seeded `formValues` (prevents re-seeding on re-edit). */
  private seeded = false;

  constructor() {
    super();
    this.profile = "standard";
    this.formValues = { ...EMPTY };
    this.touched = new Set<string>();
    // Store wins when loaded; `initialAddress` is the Storybook/test fallback.
    bindAtom(this, $shippingAddress, "initialAddress");
  }

  override willUpdate(changed: PropertyValues<this>): void {
    // Seed the local working copy the FIRST time initialAddress becomes non-null.
    if (changed.has("initialAddress") && this.initialAddress && !this.seeded) {
      this.formValues = { ...this.initialAddress };
      this.seeded = true;
    }
  }

  // ----- validation ---------------------------------------------------------

  private static isFilled(v: string | undefined): boolean {
    return (v ?? "").trim().length > 0;
  }

  /** All client-side rules pass → OK is enabled. */
  get isValid(): boolean {
    const v = this.formValues;
    if (!PqAddressForm.isFilled(v.line1)) return false;
    if (!PqAddressForm.isFilled(v.city)) return false;
    if (!PqAddressForm.isFilled(v.state)) return false;
    if (!PqAddressForm.isFilled(v.postalCode)) return false;
    if (!/^[A-Za-z]{2}$/.test(v.state.trim())) return false;
    if (!/^\d{5}(-\d{4})?$/.test(v.postalCode.trim())) return false;
    if (PqAddressForm.isFilled(v.phone) && v.phone!.replace(/\D/g, "").length !== 10) return false;
    if (PqAddressForm.isFilled(v.email) && !/.+@.+\..+/.test(v.email!.trim())) return false;
    return true;
  }

  /** Per-field validity — used for touched-field error styling. */
  private fieldInvalid(f: Field): boolean {
    const raw = (this.formValues[f] ?? "").trim();
    switch (f) {
      case "line1":
      case "city":
        return raw.length === 0;
      case "state":
        return raw.length === 0 || !/^[A-Za-z]{2}$/.test(raw);
      case "postalCode":
        return raw.length === 0 || !/^\d{5}(-\d{4})?$/.test(raw);
      case "phone":
        return raw.length > 0 && raw.replace(/\D/g, "").length !== 10;
      case "email":
        return raw.length > 0 && !/.+@.+\..+/.test(raw);
      default:
        return false;
    }
  }

  /** True while a field still equals the originally retrieved (pristine) value. */
  private isRetrieved(f: Field): boolean {
    if (!this.initialAddress) return false;
    return this.formValues[f] === this.initialAddress[f];
  }

  // ----- input handlers -----------------------------------------------------

  private handleInput(f: Field, e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    this.formValues = { ...this.formValues, [f]: value };
  }

  private handleBlur = (f: Field): void => {
    if (this.touched.has(f)) return;
    this.touched = new Set(this.touched).add(f);
  };

  private handleSubmit = (): void => {
    if (!this.isValid) return;
    const entered: AddressData = { ...this.formValues };
    this.onSubmit?.(entered);
    this.dispatchEvent(
      new CustomEvent("pq-address-submit", {
        detail: { ...entered },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private handleBack = (): void => {
    this.onBack?.();
    this.dispatchEvent(new CustomEvent("pq-back", { bubbles: true, composed: true }));
  };

  // ----- render -------------------------------------------------------------

  override render(): TemplateResult {
    return this.profile === "expanded"
      ? this.renderExpanded()
      : this.profile === "compact"
        ? this.renderCompact()
        : this.renderStandard();
  }

  /** Class string for an arcade input (retrieved-pristine vs touched-error). */
  private arcInputClass(f: Field): string {
    const cls = ["addr-form-input"];
    if (this.touched.has(f) && this.fieldInvalid(f)) cls.push("addr-form-input--error");
    else if (this.isRetrieved(f)) cls.push("addr-form-input--retrieved");
    return cls.join(" ");
  }

  /**
   * Compact — TTD 480x234 (ref ttd-arcade Screen 07 markup, lines 1972-2016).
   * Field map: Address->line1, City->city, ST->state, ZIP->postalCode,
   * Phone->phone, Email->email. No name field in compact.
   */
  private renderCompact(): TemplateResult {
    const v = this.formValues;
    return html`
      <div class="wrap-compact">
        <div class="addr-form-head">
          <h2 class="addr-form-title">Shipping Address</h2>
          <span class="addr-retrieved-pill">${checkIcon} Retrieved · edit if needed</span>
        </div>
        <div class="addr-form">
          <div class="addr-form-row">
            <div class="addr-form-field" style="flex: 1;">
              <label class="addr-form-label">Full Name</label>
              <input
                class=${this.arcInputClass("name")}
                .value=${v.name ?? ""}
                @input=${(e: Event) => this.handleInput("name", e)}
                @blur=${() => this.handleBlur("name")}
              />
            </div>
          </div>
          <div class="addr-form-row">
            <div class="addr-form-field" style="flex: 1;">
              <label class="addr-form-label">Address</label>
              <input
                class=${this.arcInputClass("line1")}
                .value=${v.line1 ?? ""}
                @input=${(e: Event) => this.handleInput("line1", e)}
                @blur=${() => this.handleBlur("line1")}
              />
            </div>
          </div>
          <div class="addr-form-row">
            <div class="addr-form-field" style="flex: 1.5;">
              <label class="addr-form-label">City</label>
              <input
                class=${this.arcInputClass("city")}
                .value=${v.city ?? ""}
                @input=${(e: Event) => this.handleInput("city", e)}
                @blur=${() => this.handleBlur("city")}
              />
            </div>
            <div class="addr-form-field" style="flex: 0.6;">
              <label class="addr-form-label">State</label>
              <input
                class=${this.arcInputClass("state")}
                .value=${v.state ?? ""}
                @input=${(e: Event) => this.handleInput("state", e)}
                @blur=${() => this.handleBlur("state")}
              />
            </div>
            <div class="addr-form-field" style="flex: 0.9;">
              <label class="addr-form-label">ZIP</label>
              <input
                class=${this.arcInputClass("postalCode")}
                .value=${v.postalCode ?? ""}
                @input=${(e: Event) => this.handleInput("postalCode", e)}
                @blur=${() => this.handleBlur("postalCode")}
              />
            </div>
          </div>
          <div class="addr-form-row">
            <div class="addr-form-field" style="flex: 1;">
              <label class="addr-form-label">Phone</label>
              <input
                class=${this.arcInputClass("phone")}
                .value=${v.phone ?? ""}
                @input=${(e: Event) => this.handleInput("phone", e)}
                @blur=${() => this.handleBlur("phone")}
              />
            </div>
          </div>
          <div class="addr-form-row">
            <div class="addr-form-field" style="flex: 1;">
              <label class="addr-form-label">Email</label>
              <input
                class=${this.arcInputClass("email")}
                .value=${v.email ?? ""}
                @input=${(e: Event) => this.handleInput("email", e)}
                @blur=${() => this.handleBlur("email")}
              />
            </div>
          </div>
        </div>
        <div class="addr-btn-row">
          <button class="arc-btn arc-btn--ghost" style="flex: 0 0 30%" @click=${this.handleBack}>
            ← Back
          </button>
          <button
            class="arc-btn arc-btn--primary"
            style="flex: 1"
            ?disabled=${!this.isValid}
            @click=${this.handleSubmit}
          >
            Confirm ${arrowIcon}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Expanded — kiosk 1920x1080 (ref kiosk-arcade Screen 07 markup, lines 2361-2413).
   * Has a Recipient name field (-> name) and Street address (-> line1).
   */
  private renderExpanded(): TemplateResult {
    const v = this.formValues;
    return html`
      <div class="wrap-expanded">
        <div class="xl-head">
          <span class="xl-eyebrow">Step 3 of 4 · Shipping</span>
          <h1 class="xl-title">Edit Shipping Address</h1>
          <p class="xl-sub">We pulled what's on file. Change anything before continuing.</p>
        </div>
        <span class="addr-retrieved-pill addr-form-wrap-pill">
          ${checkIcon}
          Retrieved from CMS · edit if needed
        </span>
        <div class="addr-form-wrap">
          <div class="addr-form-row">
            <div class="addr-form-field" style="flex: 1;">
              <label class="addr-form-label">Recipient name</label>
              <input
                class=${this.arcInputClass("name")}
                .value=${v.name ?? ""}
                @input=${(e: Event) => this.handleInput("name", e)}
                @blur=${() => this.handleBlur("name")}
              />
            </div>
          </div>
          <div class="addr-form-row">
            <div class="addr-form-field" style="flex: 1;">
              <label class="addr-form-label">Street address</label>
              <input
                class=${this.arcInputClass("line1")}
                .value=${v.line1 ?? ""}
                @input=${(e: Event) => this.handleInput("line1", e)}
                @blur=${() => this.handleBlur("line1")}
              />
            </div>
          </div>
          <div class="addr-form-row">
            <div class="addr-form-field" style="flex: 2;">
              <label class="addr-form-label">City</label>
              <input
                class=${this.arcInputClass("city")}
                .value=${v.city ?? ""}
                @input=${(e: Event) => this.handleInput("city", e)}
                @blur=${() => this.handleBlur("city")}
              />
            </div>
            <div class="addr-form-field" style="flex: 0.5;">
              <label class="addr-form-label">State</label>
              <input
                class=${this.arcInputClass("state")}
                .value=${v.state ?? ""}
                @input=${(e: Event) => this.handleInput("state", e)}
                @blur=${() => this.handleBlur("state")}
              />
            </div>
            <div class="addr-form-field" style="flex: 1;">
              <label class="addr-form-label">ZIP</label>
              <input
                class=${this.arcInputClass("postalCode")}
                .value=${v.postalCode ?? ""}
                @input=${(e: Event) => this.handleInput("postalCode", e)}
                @blur=${() => this.handleBlur("postalCode")}
              />
            </div>
          </div>
          <div class="addr-form-row">
            <div class="addr-form-field" style="flex: 1;">
              <label class="addr-form-label">Phone</label>
              <input
                class=${this.arcInputClass("phone")}
                .value=${v.phone ?? ""}
                @input=${(e: Event) => this.handleInput("phone", e)}
                @blur=${() => this.handleBlur("phone")}
              />
            </div>
            <div class="addr-form-field" style="flex: 1.5;">
              <label class="addr-form-label">Email</label>
              <input
                class=${this.arcInputClass("email")}
                .value=${v.email ?? ""}
                @input=${(e: Event) => this.handleInput("email", e)}
                @blur=${() => this.handleBlur("email")}
              />
            </div>
          </div>
        </div>
        <div class="xl-btn-row">
          <button class="arc-btn arc-btn--ghost" style="flex: 0 0 22%" @click=${this.handleBack}>
            ${backIcon} Back
          </button>
          <button
            class="arc-btn arc-btn--primary"
            style="flex: 1"
            ?disabled=${!this.isValid}
            @click=${this.handleSubmit}
          >
            OK · Confirm Shipping ${arrowIcon}
          </button>
        </div>
      </div>
    `;
  }

  /** Class string for a standard input (retrieved-pristine vs touched-error). */
  private stdInputClass(f: Field): string {
    const cls = ["std-input"];
    if (this.touched.has(f) && this.fieldInvalid(f)) cls.push("std-input--error");
    else if (this.isRetrieved(f)) cls.push("std-input--retrieved");
    return cls.join(" ");
  }

  /** A single labelled standard field with optional error text. */
  private stdField(f: Field, label: string): TemplateResult {
    const showErr = this.touched.has(f) && this.fieldInvalid(f);
    return html`
      <div class="std-field">
        <label class="std-label">${label}</label>
        <input
          class=${this.stdInputClass(f)}
          .value=${this.formValues[f] ?? ""}
          @input=${(e: Event) => this.handleInput(f, e)}
          @blur=${() => this.handleBlur(f)}
        />
        ${showErr ? html`<span class="std-err">Please check this field.</span>` : nothing}
      </div>
    `;
  }

  /**
   * Standard — mobile/tablet single-column stack (no name field, like compact).
   * Themed on semantic --pq-* tokens.
   */
  private renderStandard(): TemplateResult {
    return html`
      <div class="std-form">
        <span class="std-pill">${checkIcon} Retrieved · edit if needed</span>
        ${this.stdField("line1", "Address")}
        <div class="std-row">${this.stdField("city", "City")} ${this.stdField("state", "State")}</div>
        <div class="std-row">
          ${this.stdField("postalCode", "ZIP")} ${this.stdField("phone", "Phone")}
        </div>
        ${this.stdField("email", "Email")}
        <div class="std-btn-row">
          <button
            class="std-btn std-btn--primary"
            ?disabled=${!this.isValid}
            @click=${this.handleSubmit}
          >
            OK · Confirm ${arrowIcon}
          </button>
          <button class="std-btn std-btn--ghost" @click=${this.handleBack}>Back</button>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("pq-address-form")) {
  customElements.define("pq-address-form", PqAddressForm);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-address-form": PqAddressForm;
  }
}
