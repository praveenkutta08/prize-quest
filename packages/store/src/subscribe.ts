// @pq/store — Lit-friendly subscription helpers.
import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { ReadableAtom } from "nanostores";

type Host = ReactiveControllerHost & HTMLElement;

/**
 * How an atom value reaches the host:
 * - a **property name**: mirror the value onto `host[name]` (skipped when the value
 *   is `null`/`undefined`, so explicitly-set props survive when the store is unset);
 * - a **callback**: apply the value yourself (for derived mappings, e.g. session→tier).
 */
type Applier<T> = string | ((value: T, host: Host) => void);

interface BindOptions {
  /**
   * `true` (default): read the atom's current value on connect *and* on change
   * (`subscribe`) — needed for widgets that mount after data has loaded.
   * `false`: react to future changes only (`listen`) — leaves the host untouched
   * until the store actually changes (keeps Storybook/test defaults intact).
   */
  immediate?: boolean;
}

class AtomBinder<T> implements ReactiveController {
  #unsubscribe?: () => void;

  constructor(
    private readonly host: Host,
    private readonly atom: ReadableAtom<T>,
    private readonly applier: Applier<T>,
    private readonly immediate: boolean,
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    const handler = (value: T): void => this.#apply(value);
    this.#unsubscribe = this.immediate
      ? this.atom.subscribe(handler)
      : this.atom.listen(handler);
  }

  hostDisconnected(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
  }

  #apply(value: T): void {
    if (typeof this.applier === "string") {
      if (value !== null && value !== undefined) {
        (this.host as unknown as Record<string, unknown>)[this.applier] = value;
      }
    } else {
      this.applier(value, this.host);
    }
    this.host.requestUpdate();
  }
}

/**
 * Bind a nanostores atom to a Lit host as a `ReactiveController`: it subscribes in
 * `connectedCallback` and unsubscribes in `disconnectedCallback`. Call it once (e.g.
 * in the constructor).
 *
 * @example bindAtom(this, $campaigns, "campaigns");
 * @example bindAtom(this, $session, (s, host) => { if (s) host.tier = s.tier; });
 */
export function bindAtom<T>(
  host: Host,
  atom: ReadableAtom<T>,
  applier: Applier<T>,
  options: BindOptions = {},
): ReactiveController {
  return new AtomBinder(host, atom, applier, options.immediate ?? true);
}
