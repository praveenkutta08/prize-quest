// Pull in the `declare module "*.css"` ambient so the side-effect import below
// typechecks here AND in every consumer that compiles this module. A triple-slash
// reference is the only way to propagate an ambient .d.ts across package programs
// (a plain import can't carry it); Vite/Storybook bundle the real stylesheet.
/* eslint-disable-next-line @typescript-eslint/triple-slash-reference */
/// <reference path="./css.d.ts" />

// @pq/tokens — public API.
// Side-effect import: ships the casino-loud CSS layer (--cl-* palette + the
// [data-pq-mode="casino-loud"] --pq-* remap) into the consuming app's CSS chunk
// whenever tokens are loaded. Inert until applyTokens writes data-pq-mode.
import "./casino-loud.css";
// Side-effect import: ships the arcade CSS layer (--arc-* / --cat-* palette + the
// [data-pq-mode="arcade"] --pq-* remap + shared keyframes). Inert until arcade mode.
import "./arcade.css";

export { TOKEN_DEFAULTS } from "./primitive";
export { applyTokens } from "./apply";
export type { TokenSet, TokenName } from "./types";
