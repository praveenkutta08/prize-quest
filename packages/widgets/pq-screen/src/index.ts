import { LitElement, html, type TemplateResult } from "lit";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import {
  applyProfile,
  detectChannel,
  getProfileForChannel,
  loadComposition,
  type Channel,
  type CompositionDoc,
} from "@pq/compositions";
import { getCurrentRoute, matchPattern, onRouteChange } from "@pq/router";
import { styles } from "./styles";

/**
 * `<pq-screen>` — renders a server-driven composition document.
 *
 * Two modes:
 * - **Explicit**: set `.composition=${doc}` and the layout renders directly. The
 *   document's own `profile` is applied to `<html data-pq-profile>`.
 * - **Route**: set the `route` attribute to operate off `@pq/router`. The screen
 *   resolves the live route → composition name, loads the doc for the detected
 *   channel, applies the *channel's* profile (the authoritative surface context),
 *   and reloads on every route change. Call `reload()` after a channel switch.
 *
 * Layout is rendered imperatively (createElement + property setters) so object
 * props pass through intact and unknown widgets degrade to an inline placeholder.
 */
export class PqScreen extends LitElement {
  static override styles = styles;

  static override properties = {
    /**
     * Widget tags this host renders ITSELF, so the composition's copy is skipped.
     *
     * Added for the Device Manager, where the service window supplies one screen
     * header for every screen — DM-native and composed alike — so that Back, the
     * campaign name and the brandmark sit in the same place throughout. Without this
     * the composed screens draw a SECOND header inside the flow block, which lands
     * wherever that block happens to be vertically centred: measured at y=167 on
     * review, y=211 on PIN and y=225 on confirm, against y=18 everywhere else.
     *
     * Purely additive: unset (the default) paints every widget, exactly as before.
     */
    omit: { attribute: false },
    composition: { attribute: false },
    route: { type: String },
  };

  declare composition?: CompositionDoc;
  declare route?: string;
  declare omit?: readonly string[];

  #layout: Ref<HTMLDivElement> = createRef();
  #unsubscribe?: () => void;
  #channel?: Channel;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.route != null) {
      this.#unsubscribe = onRouteChange(() => void this.#loadForCurrentRoute());
      void this.#loadForCurrentRoute();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
  }

  /** Re-resolve and reload the composition for the current route + channel. */
  reload(): void {
    if (this.route != null) void this.#loadForCurrentRoute();
  }

  async #loadForCurrentRoute(): Promise<void> {
    const channel = detectChannel();
    this.#channel = channel;
    // Apply the channel profile up front so it holds even if no composition resolves.
    applyProfile(getProfileForChannel(channel));
    const route = this.#resolveRouteName(getCurrentRoute().path);
    const doc = await loadComposition(channel, route);
    this.composition = doc ?? undefined;
    // Force a repaint even when the composition object is unchanged: different
    // channels can resolve to the *same* (cached) composition module, but the
    // channel-derived density profile pushed to children may differ.
    this.requestUpdate();
  }

  /** Route table: URL path → composition file name. */
  #resolveRouteName(path: string): string {
    if (matchPattern("/campaign/:id/rewards", path)) return "campaign-rewards";
    if (matchPattern("/campaign/:id", path)) return "campaign-detail";
    if (matchPattern("/success/:claimId", path)) return "success";
    if (matchPattern("/voucher/:claimId", path)) return "voucher";
    for (const name of ["confirm", "pin", "address", "loading", "submit", "orders"]) {
      if (path === `/${name}`) return name;
    }
    return "home";
  }

  override render(): TemplateResult {
    return html`<div class="layout" ${ref(this.#layout)}></div>`;
  }

  override updated(): void {
    this.#paint();
  }

  #paint(): void {
    const root = this.#layout.value;
    if (!root) return;

    root.replaceChildren();
    const doc = this.composition;
    if (!doc) return;

    // Channel-derived profile in route mode; the doc's own profile otherwise.
    const profile = this.#channel ? getProfileForChannel(this.#channel) : doc.profile;
    applyProfile(profile);

    for (const spec of doc.layout) {
      // The host says it draws this one; the composition still declares it, so any
      // other surface is unaffected.
      if (this.omit?.includes(spec.widget)) continue;
      if (!customElements.get(spec.widget)) {
        const placeholder = document.createElement("div");
        placeholder.className = "missing";
        placeholder.textContent = `Unknown widget <${spec.widget}> — is it registered?`;
        root.append(placeholder);
        continue;
      }
      const el = document.createElement(spec.widget);
      if (spec.props) {
        for (const [key, value] of Object.entries(spec.props)) {
          (el as unknown as Record<string, unknown>)[key] = value;
        }
      }
      // Propagate the surface's density profile to widgets that support it, unless the
      // composition set one explicitly. This lets every channel adapt (compact /
      // standard / expanded) with no per-channel composition files.
      if (!(spec.props && "profile" in spec.props) && "profile" in el) {
        (el as unknown as Record<string, unknown>)["profile"] = profile;
      }
      root.append(el);
    }
  }
}

if (!customElements.get("pq-screen")) {
  customElements.define("pq-screen", PqScreen);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-screen": PqScreen;
  }
}
