import { css } from "lit";

/**
 * Shared page chrome for the host's own mockup screens (Home/Rewards/Activity/Account).
 * The embedded Prize Quest is the only server-driven surface — these screens are static
 * Luminara-branded mockups built on this common heading + section scaffolding.
 */
export const pageStyles = css`
  :host {
    display: block;
  }
  .page-head {
    margin-bottom: 32px;
  }
  h1 {
    margin: 0 0 8px;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(28px, 3.5vw, 40px);
    line-height: 1.05;
    letter-spacing: -0.035em;
    color: var(--cream);
  }
  .lead {
    margin: 0;
    font: 400 18px/1.55 var(--font-body);
    color: var(--cream-dim);
  }
  .section {
    margin-top: 36px;
  }
  .section__title {
    margin: 0 0 16px;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 22px;
    letter-spacing: -0.025em;
    color: var(--cream);
  }
  .eyebrow {
    margin: 0 0 8px;
    font: 400 11px/1.3 var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--amber);
  }
`;
