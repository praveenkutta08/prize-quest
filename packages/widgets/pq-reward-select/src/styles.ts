import { css } from "lit";

/**
 * `<pq-reward-select>` styles — the reward-selection screen body: a single
 * `<pq-list-carousel>` of full-width `<pq-reward-card layout="wide">` product wells,
 * one per page. The pinned strip that used to sit above it is gone.
 */
export const styles = css`
  :host {
    display: block;
  }
  .rwd-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 2px 2px 4px;
    min-height: 0;
  }
  .empty {
    padding: 16px;
    color: var(--arc-text-dim, #d0bfec);
    font-family: var(--arc-font-body, sans-serif);
    font-size: 12px;
    text-align: center;
  }

  /* One prize per page, full width. The gutter shrinks (the arrows sit closer in)
     because a single wide card wants the horizontal room, and the carousel is told
     to fill the screen body so no dead band opens up above the dots. */
  pq-list-carousel {
    /* 44px, not less: the arrows occupy 6–36px, so a narrower gutter puts the card
       border underneath them. Matches the campaign carousel. */
    --carousel-gutter: 44px;
    flex: 1;
    min-height: 0;
  }
`;
