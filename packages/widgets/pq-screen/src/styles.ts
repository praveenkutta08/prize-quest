import { css } from "lit";

/** Scoped styles for `<pq-screen>`. The host is a vertical flow of composed widgets. */
export const styles = css`
  :host {
    display: block;
  }
  .layout {
    display: flex;
    flex-direction: column;
    gap: var(--pq-gap-screen, 28px);
  }
  /* Compact surfaces (TTD 480×234, iView, mobile) can't afford the 28px inter-widget
     gap — the header→body gap reads as dead space at the top of every screen. The
     header carries its own bottom border and #screen pads the body, so a tight 6px
     is enough. Gated on the channel profile written to <html data-pq-profile>. */
  :host-context([data-pq-profile="compact"]) .layout {
    gap: 6px;
  }
  .layout > * {
    display: block;
  }
  .missing {
    padding: 12px 16px;
    border: 1px dashed var(--pq-danger, #ef4444);
    border-radius: var(--pq-r-md, 8px);
    color: var(--pq-danger, #ef4444);
    font-family: var(--pq-font-mono, monospace);
    font-size: 12px;
  }
`;
