import { css } from "lit";

/**
 * `<pq-list-carousel>` styles — mirrors `.carousel2__*` in
 * prize-quest-direction-preview.html. Gold accent resolves from `--arc-display`
 * (arcade) with a static fallback, so the widget works outside arcade mode too.
 */
export const styles = css`
  :host {
    display: flex;
    flex-direction: column;
    position: relative;
    min-height: 0;
    --carousel-gap: 6px;
    --carousel-gutter: 44px;
    --carousel-gold: var(--arc-display, #ffd93d);
    --carousel-glow: var(--arc-display-glow, rgba(255, 217, 61, 0.5));
  }

  /* Content-sized: the viewport height tracks the tallest page (slotted items
     define their own height via flex/grid stretch), so the carousel works inside
     an unconstrained (auto-height, scrollable) screen body without a height chain. */
  .viewport {
    overflow: hidden;
    margin: 0 var(--carousel-gutter);
    padding-bottom: 14px;
  }

  .track {
    display: flex;
    align-items: stretch;
    gap: var(--carousel-gap);
    will-change: transform;
    transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  ::slotted(*) {
    flex: 0 0
      calc((100% - (var(--ipp, 1) - 1) * var(--carousel-gap)) / var(--ipp, 1));
    min-width: 0;
  }

  .arrow {
    position: absolute;
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 217, 61, 0.35) 0%,
      rgba(255, 217, 61, 0.08) 100%
    );
    border: 1.5px solid var(--carousel-gold);
    display: grid;
    place-items: center;
    color: var(--carousel-gold);
    cursor: pointer;
    z-index: 10;
    padding: 0;
    box-shadow: 0 0 16px var(--carousel-glow),
      inset 0 0 8px rgba(255, 217, 61, 0.22);
  }
  .arrow svg {
    width: 13px;
    height: 13px;
  }
  .arrow--prev {
    left: 6px;
  }
  .arrow--next {
    right: 6px;
  }
  .arrow:disabled {
    cursor: default;
    opacity: 0.3;
    box-shadow: none;
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.4);
  }

  .dots {
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 4px;
  }
  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    transition: width 200ms ease, background 200ms ease;
  }
  .dot--active {
    width: 14px;
    border-radius: 999px;
    background: var(--carousel-gold);
    box-shadow: 0 0 5px var(--carousel-glow);
  }

  :host(:focus-visible) {
    outline: 2px solid var(--carousel-gold);
    outline-offset: 2px;
    border-radius: 6px;
  }
`;
