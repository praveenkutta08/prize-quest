// @pq/compositions — types.
//
// Per the locked server-driven-UI architecture, screens are not coded — they are
// *declared* as composition documents that list which widgets render, in what order,
// with what props. The same widget library renders under different compositions per
// channel and profile.

/** Surfaces the patron module renders on. */
export type Channel =
  | "mobile-web"
  | "desktop-web"
  | "kiosk-portrait"
  | "kiosk-landscape"
  | "egm"
  | "egm-main"
  | "iview-3"
  | "iview-4"
  | "ttd";

/** Density profile applied to `<html data-pq-profile>` — widgets adapt their layout. */
export type Profile = "compact" | "standard" | "expanded";

/** One widget in a composition: its custom-element tag + optional props. */
export interface WidgetSpec {
  /** Custom-element tag name, e.g. `pq-campaign-list`. */
  widget: string;
  /** Property values assigned via the element's property setters (objects pass through). */
  props?: Record<string, unknown>;
}

/** A declared screen for one channel × route. */
export interface CompositionDoc {
  id: string;
  channel: Channel;
  profile: Profile;
  layout: WidgetSpec[];
}
