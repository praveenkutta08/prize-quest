// @pq/compositions — public API.
export type { Channel, Profile, WidgetSpec, CompositionDoc } from "./types";
export { detectChannel, getProfileForChannel, applyProfile } from "./channels";
export { loadComposition } from "./loader";
