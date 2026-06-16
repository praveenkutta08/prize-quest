import { LitElement, css, html, type TemplateResult } from "lit";

export type AvatarSize = 24 | 32 | 40 | 56 | 80;

/**
 * `<lum-avatar>` — monogram on a copper→amber-soft gradient (§6.10). Never photos,
 * never emoji. `monogram` is 1–2 letters; `size` is 24 | 32 | 40 | 56 | 80.
 */
export class Avatar extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
    .avatar {
      width: var(--avatar-size, 40px);
      height: var(--avatar-size, 40px);
      border-radius: 50%;
      background: linear-gradient(135deg, var(--copper), var(--amber-soft));
      display: grid;
      place-items: center;
      font-family: var(--font-display);
      font-weight: 500;
      font-size: calc(var(--avatar-size, 40px) * 0.4);
      line-height: 1;
      color: var(--on-accent);
      border: 1px solid var(--mist);
      user-select: none;
    }
  `;

  static override properties = {
    monogram: { type: String },
    size: { type: Number },
  };

  declare monogram: string;
  declare size: AvatarSize;

  constructor() {
    super();
    this.monogram = "";
    this.size = 40;
  }

  override render(): TemplateResult {
    return html`<div class="avatar" aria-hidden="true" style="--avatar-size:${this.size}px">
      ${this.monogram}
    </div>`;
  }
}

if (!customElements.get("lum-avatar")) {
  customElements.define("lum-avatar", Avatar);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-avatar": Avatar;
  }
}
