import { LitElement, html, type TemplateResult } from "lit";
import { bindAtom, $claimFlowStep, type ClaimFlowStep } from "@pq/store";
import { styles } from "./styles";

type StepState = "done" | "active" | "pending";

/** A derived/overridable step in the expanded kiosk stepper. */
export interface FlowStep {
  id: string;
  label: string;
  status: StepState;
}

/**
 * An explicit, self-advancing phase for the multi-phase loader (Session 30).
 * Supplied via the `phases` prop; the widget owns the sequencing/auto-advance.
 */
export interface LoadingPhase {
  id: string;
  /** Short stepper label, e.g. "PIN" / "Address". */
  label: string;
  /** Full spinner headline, e.g. "Validating PIN…" / "Retrieving Address…".
   *  Falls back to `${label}…` when omitted. */
  title?: string;
  /** Built-in icons: "lock" (PIN), "location" (Address), "check"; or any custom string. */
  icon?: "lock" | "location" | "check" | string;
  /** Auto-advance delay; if set on the active phase, it advances after this many ms. */
  durationMs?: number;
}

const checkIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>`;

/** Spinning ring glyph used inside the active phase circle (matches preview 06a). */
const phaseSpinnerIcon = html`<svg class="phase__spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>`;
/** White check inside a completed phase circle (preview polyline check). */
const phaseCheckIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>`;

/** Maps a phase `icon` to the big spinner-center svg glyph (verbatim from the previews). */
function phaseCenterIcon(icon?: string): TemplateResult {
  if (icon === "location") {
    return html`<svg class="load-spinner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>`;
  }
  if (icon === "check") {
    return html`<svg class="load-spinner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>`;
  }
  // default + "lock": padlock
  return html`<svg class="load-spinner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>`;
}

/**
 * `<pq-flow-loading>` — the post-PIN orchestration screen (ref `.loading`). Shows a
 * spinner, a headline ("Validating PIN" → "Retrieving Address"), and a two-dot stepper
 * driven by `$claimFlowStep`. Presentational only: it does NOT run the async work or
 * navigate — the host (`runPostPinFlow()` + router) owns that.
 *
 * `profile` selects the layout: `compact`/`standard` render the original TTD/flow
 * template (byte-identical); `expanded` renders the large kiosk loader + pill stepper
 * (spec 6.10). Arcade visuals are CSS-only (`[data-pq-mode="arcade"]`).
 */
export class PqFlowLoading extends LitElement {
  static override styles = styles;

  static override properties = {
    profile: { type: String, reflect: true },
    steps: { attribute: false },
    phases: { attribute: false },
    _step: { state: true },
    activePhaseIndex: { state: true },
    completedPhases: { state: true },
  };

  /** Channel-driven layout. `compact`/`standard` are byte-identical to the original. */
  declare profile: "compact" | "standard" | "expanded";
  /**
   * @deprecated Prefer `phases` for explicit multi-phase sequencing. Retained for
   * back-compat: optional explicit steps for the expanded stepper; defaults from
   * `$claimFlowStep`.
   */
  declare steps?: FlowStep[];
  /**
   * Explicit, self-advancing phases (Session 30). When provided and non-empty, the
   * widget drives the sequence itself (auto-advance via `durationMs`) and fires
   * `pq-flow-loading-done` once it advances past the last phase.
   */
  declare phases?: LoadingPhase[];
  private declare _step: ClaimFlowStep | null;
  /** Index of the currently-active phase (phases mode only). */
  declare activePhaseIndex: number;
  /** Ids of phases already completed (phases mode only). */
  declare completedPhases: Set<string>;

  private _phaseTimer: ReturnType<typeof setTimeout> | null = null;
  private _doneFired = false;

  constructor() {
    super();
    this.profile = "standard";
    this._step = "pin";
    this.activePhaseIndex = 0;
    this.completedPhases = new Set<string>();
    bindAtom(this, $claimFlowStep, "_step");
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.phases && this.phases.length > 0) {
      this.scheduleActivePhase();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearPhaseTimer();
  }

  private clearPhaseTimer(): void {
    if (this._phaseTimer !== null) {
      clearTimeout(this._phaseTimer);
      this._phaseTimer = null;
    }
  }

  /** Schedules auto-advance for the active phase if it declares a `durationMs`. */
  private scheduleActivePhase(): void {
    this.clearPhaseTimer();
    const phase = this.phases?.[this.activePhaseIndex];
    if (phase && typeof phase.durationMs === "number") {
      this._phaseTimer = setTimeout(() => this.advancePhase(), phase.durationMs);
    }
  }

  /**
   * Marks the current phase complete and advances to the next. When advancing past
   * the last phase, dispatches `pq-flow-loading-done` exactly once. Public so hosts
   * can drive the sequence manually (e.g. when async work, not a timer, gates it).
   */
  advancePhase(): void {
    const phases = this.phases;
    if (!phases || phases.length === 0) return;
    this.clearPhaseTimer();

    const current = phases[this.activePhaseIndex];
    if (current) {
      const next = new Set(this.completedPhases);
      next.add(current.id);
      this.completedPhases = next;
    }

    this.activePhaseIndex += 1;

    if (this.activePhaseIndex >= phases.length) {
      if (!this._doneFired) {
        this._doneFired = true;
        this.dispatchEvent(
          new CustomEvent("pq-flow-loading-done", { bubbles: true, composed: true }),
        );
      }
      return;
    }

    this.scheduleActivePhase();
  }

  override render(): TemplateResult {
    if (this.phases && this.phases.length > 0) return this.renderPhases();
    if (this.profile === "expanded") return this.renderExpanded();
    return this.renderStandard();
  }

  /** Original TTD/flow template — kept byte-identical for compact and standard. */
  private renderStandard(): TemplateResult {
    const step = this._step ?? "pin";
    const onAddress = step === "address" || step === "done";
    const headline = onAddress ? "Retrieving Address" : "Validating PIN";
    const sub = onAddress ? "From your profile" : "Verifying with vendor";
    const pinState: StepState = step === "pin" ? "active" : "done";
    const addrState: StepState = step === "pin" ? "pending" : step === "address" ? "active" : "done";
    return html`
      <div class="loading">
        <div class="spinner"></div>
        <h2 class="text">${headline}</h2>
        <p class="sub">${sub}</p>
        <div class="steps">
          <span class="step step--${pinState}"
            ><span class="dot"></span>PIN${pinState === "done" ? " ✓" : ""}</span
          >
          <span class="sep">→</span>
          <span class="step step--${addrState}"><span class="dot"></span>Address</span>
        </div>
      </div>
    `;
  }

  /** Large kiosk loader + pill stepper (spec 6.10). */
  private renderExpanded(): TemplateResult {
    const steps = this.steps ?? this.deriveSteps();
    return html`
      <div class="kiosk">
        <div class="loader">
          <div class="loader__glow"></div>
          <svg class="loader__ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="loader__track" cx="50" cy="50" r="44" />
            <circle class="loader__arc" cx="50" cy="50" r="44" />
          </svg>
          <span class="loader__label">WORKING</span>
        </div>
        <div class="copy">
          <h2 class="headline">Setting Up Your Reward</h2>
          <p class="subline">Hold tight — this only takes a second.</p>
        </div>
        <div class="pills">
          ${steps.map(
            (s) => html`
              <span class="pill pill--${s.status}">
                <span class="pill__mark">
                  ${s.status === "done"
                    ? checkIcon
                    : s.status === "active"
                      ? html`<span class="pill__spinner"></span>`
                      : html`<span class="pill__dot"></span>`}
                </span>
                <span class="pill__label">${s.label}</span>
              </span>
            `,
          )}
        </div>
      </div>
    `;
  }

  /** Derives PIN/Address/Almost-done statuses from `$claimFlowStep` (same logic as standard). */
  private deriveSteps(): FlowStep[] {
    const step = this._step ?? "pin";
    const pinState: StepState = step === "pin" ? "active" : "done";
    const addrState: StepState = step === "pin" ? "pending" : step === "address" ? "active" : "done";
    const doneState: StepState = step === "done" ? "active" : "pending";
    return [
      { id: "pin", label: "Verify PIN", status: pinState },
      { id: "address", label: "Confirm Address", status: addrState },
      { id: "done", label: "Almost done", status: doneState },
    ];
  }

  // ============================================================
  // PHASES MODE · explicit multi-phase sequencing (Session 30)
  // ============================================================

  /** Resolves the state of a phase at `index` from completedPhases/activePhaseIndex. */
  private phaseState(phase: LoadingPhase, index: number): StepState {
    if (this.completedPhases.has(phase.id) || index < this.activePhaseIndex) return "done";
    if (index === this.activePhaseIndex) return "active";
    return "pending";
  }

  /** The active phase, clamped to the last phase once the sequence has finished. */
  private get activePhase(): LoadingPhase | undefined {
    const phases = this.phases ?? [];
    if (phases.length === 0) return undefined;
    const idx = Math.min(this.activePhaseIndex, phases.length - 1);
    return phases[idx];
  }

  private renderPhases(): TemplateResult {
    if (this.profile === "expanded") return this.renderPhasesExpanded();
    return this.renderPhasesCompact();
  }

  /** One stepper item (compact): circle + mono label, reflecting its state. */
  private renderPhaseStepCompact(phase: LoadingPhase, index: number): TemplateResult {
    const state = this.phaseState(phase, index);
    return html`
      <div class="phase phase--${state}">
        <span class="phase__mark">
          ${state === "done"
            ? phaseCheckIcon
            : state === "active"
              ? phaseSpinnerIcon
              : html`<span class="phase__dot"></span>`}
        </span>
        <span class="phase__label">${phase.label}${state === "done" ? " ✓" : ""}</span>
      </div>
    `;
  }

  /** Compact loader — verbatim visuals from ttd-arcade 06a/06b (480×234). */
  private renderPhasesCompact(): TemplateResult {
    const active = this.activePhase;
    const phases = this.phases ?? [];
    return html`
      <div class="load-wrap">
        <div class="load-spinner">
          <span class="load-spinner__ring"></span>
          ${phaseCenterIcon(active?.icon)}
        </div>
        <h3 class="load-title">${active ? (active.title ?? `${active.label}…`) : ""}</h3>
        <div class="stepper">
          ${phases.map((phase, i) =>
            i === 0
              ? this.renderPhaseStepCompact(phase, i)
              : html`<span class="stepper__connector"></span>${this.renderPhaseStepCompact(
                  phase,
                  i,
                )}`,
          )}
        </div>
      </div>
    `;
  }

  /** One stepper item (expanded): larger circle + 13px label. */
  private renderPhaseStepExpanded(phase: LoadingPhase, index: number): TemplateResult {
    const state = this.phaseState(phase, index);
    return html`
      <div class="phase phase--${state}">
        <span class="phase__mark">
          ${state === "done"
            ? phaseCheckIcon
            : state === "active"
              ? phaseSpinnerIcon
              : html`<span class="phase__dot"></span>`}
        </span>
        <span class="phase__label">${phase.label}${state === "done" ? " ✓" : ""}</span>
      </div>
    `;
  }

  /** Expanded loader — scaled per kiosk-arcade 06a/06b (240×240 spinner, 56px headline). */
  private renderPhasesExpanded(): TemplateResult {
    const active = this.activePhase;
    const phases = this.phases ?? [];
    return html`
      <div class="load-wrap load-wrap--expanded">
        <div class="load-spinner">
          <span class="load-spinner__ring"></span>
          ${phaseCenterIcon(active?.icon)}
        </div>
        <h2 class="load-title">${active ? (active.title ?? `${active.label}…`) : ""}</h2>
        <div class="stepper">
          ${phases.map((phase, i) =>
            i === 0
              ? this.renderPhaseStepExpanded(phase, i)
              : html`<span class="stepper__connector"></span>${this.renderPhaseStepExpanded(
                  phase,
                  i,
                )}`,
          )}
        </div>
      </div>
    `;
  }
}

if (!customElements.get("pq-flow-loading")) {
  customElements.define("pq-flow-loading", PqFlowLoading);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-flow-loading": PqFlowLoading;
  }
}
