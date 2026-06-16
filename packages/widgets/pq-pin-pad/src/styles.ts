import { css } from "lit";

/** Scoped styles for `<pq-pin-pad>`. Visual reference: `.pin-*` (PIN screens 05a/05b). */
export const styles = css`
  :host {
    display: block;
    color: var(--pq-text, #f1f5f9);
    text-align: center;
  }

  .cells {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .cell {
    width: 48px;
    height: 56px;
    border: 1.5px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-md, 8px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }
  .cell--filled {
    border-color: var(--pq-emerald, #10b981);
    background: rgba(16, 185, 129, 0.1);
  }
  .cell--filled::after {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--pq-emerald, #10b981);
  }
  :host([data-error]) .cell {
    border-color: var(--pq-danger, #ef4444);
    background: rgba(239, 68, 68, 0.1);
  }

  @media (prefers-reduced-motion: no-preference) {
    :host([data-error]) .cells {
      animation: pq-shake 320ms var(--pq-ease, ease);
    }
  }
  @keyframes pq-shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }

  .keys {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    max-width: 280px;
    margin: 0 auto;
  }
  .key {
    height: 52px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-md, 8px);
    background: linear-gradient(180deg, var(--pq-navy-low, #143352) 0%, var(--pq-navy-base, #102a43) 100%);
    color: var(--pq-text, #f1f5f9);
    font-family: var(--pq-font-display, sans-serif);
    font-size: 22px;
    font-weight: 700;
    cursor: pointer;
    transition: background 120ms var(--pq-ease, ease), transform 120ms var(--pq-ease, ease);
  }
  .key:hover {
    background: var(--pq-navy-mid, #1b3756);
  }
  .key:active {
    transform: scale(0.96);
    background: var(--pq-emerald-dim, #0b5c4a);
  }
  .key--util {
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--pq-text-muted, #94a3b8);
  }

  .msg {
    margin: 16px 0 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 12px;
    color: var(--pq-text-muted, #94a3b8);
  }
  :host([data-error]) .msg {
    color: var(--pq-danger, #ef4444);
    font-weight: 600;
  }

  /* ====================== COMPACT (ref .pin-cells + .pin-keypad) ======================
     4 small cells + a clean 4-col × 3-row keypad: 1-2-3-Clr / 4-5-6-⌫ / 7-8-9-0.
     No Enter key (entry auto-completes on the final digit) — dropping it frees the
     4th row, so the keys are taller and rounder (closer to the Kiosk keypad feel). */
  :host([profile="compact"]) {
    text-align: center;
  }
  :host([profile="compact"]) .cells {
    gap: 6px;
    margin-bottom: 6px;
  }
  :host([profile="compact"]) .cell {
    width: 32px;
    height: 28px;
    border-radius: 3px;
  }
  :host([profile="compact"]) .cell--filled::after {
    width: 8px;
    height: 8px;
  }
  :host([profile="compact"]) .keys {
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    max-width: none;
  }
  :host([profile="compact"]) .key {
    height: 38px;
    border-radius: var(--arc-r-md, var(--cl-r-md, var(--pq-r-md, 8px)));
    font-size: 15px;
  }
  :host([profile="compact"]) .key--util {
    font-size: 9px;
  }
  :host([profile="compact"]) .key--util svg {
    width: 15px;
    height: 15px;
  }
  :host([profile="compact"]) .msg {
    margin-top: 6px;
    font-size: 9px;
  }

  /* ====================== EXPANDED (ref Screen 05 big kiosk keypad) ======================
     Big touch keypad: 3-col x 4-row grid of 140px keys, scaled-up dots, ghost Clear/Backspace.
     Sizes/grid use --pq-* fallbacks so it's sane outside arcade; arcade colors live below. */
  :host([profile="expanded"]) .cells--expanded {
    gap: 18px;
    margin-bottom: 28px;
  }
  :host([profile="expanded"]) .cell {
    width: 64px;
    height: 72px;
    border-width: 3px;
    border-radius: var(--pq-r-lg, 16px);
  }
  :host([profile="expanded"]) .cell--filled::after {
    width: 16px;
    height: 16px;
  }
  :host([profile="expanded"]) .keys--expanded {
    grid-template-columns: repeat(3, 140px);
    grid-template-rows: repeat(4, 140px);
    gap: 20px;
    max-width: none;
    justify-content: center;
  }
  :host([profile="expanded"]) .key {
    height: auto;
    border-radius: var(--pq-r-lg, 16px);
    font-size: 56px;
    letter-spacing: 0.02em;
  }
  :host([profile="expanded"]) .key svg {
    width: 36px;
    height: 36px;
  }
  :host([profile="expanded"]) .key--ghost {
    font-family: var(--pq-font-body, sans-serif);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--pq-text-muted, #94a3b8);
  }

  /* ===== arcade — purple-gradient kiosk keys + neon dots (expanded profile) =====
     Colors only; the expanded layout above is mode-agnostic. */
  :host-context([data-pq-mode="arcade"]):host([profile]) .cell--filled {
    border-color: var(--arc-display, #ffd93d);
    background: transparent;
  }
  :host-context([data-pq-mode="arcade"]):host([profile]) .cell--filled::after {
    background: var(--arc-display, #ffd93d);
    box-shadow: 0 0 16px var(--arc-display-glow, rgba(255, 217, 61, 0.55));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) .key {
    background: linear-gradient(180deg, var(--arc-bg-elev, #3d1f6e), var(--arc-bg-mid, #2a1454));
    border: 1px solid var(--arc-hairline-2, rgba(255, 217, 61, 0.18));
    border-radius: var(--arc-r-lg, var(--pq-r-lg, 16px));
    color: var(--arc-cream, #fef3e2);
    font-family: var(--pq-font-display, sans-serif);
    box-shadow:
      0 4px 0 rgba(15, 4, 46, 0.9),
      inset 0 1px 0 rgba(255, 255, 255, 0.18),
      0 0 0 1px rgba(255, 217, 61, 0.08);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) .key:hover {
    background: var(--arc-bg-elev, #4a2580);
    box-shadow:
      0 4px 0 rgba(15, 4, 46, 0.9),
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      0 0 0 1px rgba(255, 217, 61, 0.25),
      0 0 18px var(--arc-glow-soft, rgba(255, 217, 61, 0.35));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) .key:focus-visible {
    outline: 2px solid var(--arc-display, #ffd93d);
    outline-offset: 2px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) .key--ghost {
    font-family: var(--pq-font-body, sans-serif);
    color: var(--arc-text-dim, #c8b6e2);
    background: linear-gradient(180deg, var(--arc-bg-mid, #2a1454), var(--arc-bg-deep, #15042e));
  }
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) .key:active {
      transform: translateY(2px);
      box-shadow:
        0 2px 0 rgba(15, 4, 46, 0.9),
        inset 0 1px 0 rgba(255, 255, 255, 0.18);
    }
  }

  /* ===== casino-loud — noir keys, gold hover/focus, gold filled dot =====
     (filled-cell border + dot already flip to gold via the emerald→gold remap.) */
  :host-context([data-pq-mode="casino-loud"]) .key {
    background: linear-gradient(180deg, var(--cl-wine-elev, #320e20), var(--cl-wine, #1f0815));
    border-color: var(--cl-burgundy, #4a152e);
  }
  :host-context([data-pq-mode="casino-loud"]) .key:hover {
    border-color: var(--cl-gold, #ffb627);
    color: var(--cl-gold-bright, #ffd55c);
    box-shadow: 0 0 6px var(--cl-gold-glow, rgba(255, 182, 39, 0.55));
    background: linear-gradient(180deg, var(--cl-wine-elev, #320e20), var(--cl-wine, #1f0815));
  }
  :host-context([data-pq-mode="casino-loud"]) .key:focus-visible {
    outline: 2px solid var(--cl-gold, #ffb627);
    outline-offset: 2px;
  }
  :host-context([data-pq-mode="casino-loud"]) .cell--filled {
    background: rgba(255, 182, 39, 0.12);
    box-shadow: inset 0 0 6px rgba(255, 182, 39, 0.4);
  }

  /* ===== portrait orientation (kiosk-portrait 1080×1920) — Section 10.6 =====
     The expanded keypad isn't a multi-col content grid (its outer screen layout
     stacks at the composition level), so the widget only ensures the big pad
     stays centred and never stretches to fill a tall portrait column. */
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .keys--expanded {
    justify-content: center;
    align-content: start;
    flex: none;
  }

  /* ===== iVIEW form factors (compact profile · single-column flow) =====
     The TTD compact keypad is tiny (30px); iVIEW needs proper touch targets.
     Key size is driven by --iview-pin-key (80px on iVIEW 4, 70px on iVIEW 3),
     set by the host dev chrome. */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cells {
    gap: 12px;
    margin-bottom: 16px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cell {
    width: 44px;
    height: 50px;
    border-radius: 8px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cell--filled::after {
    width: 12px;
    height: 12px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .keys--compact {
    gap: 10px;
    max-width: 520px;
    margin: 0 auto;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .key {
    height: var(--iview-pin-key, 76px);
    border-radius: 12px;
    font-size: 30px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .key--util {
    font-size: 14px;
  }

  /* ====================== arcade — compact TTD keypad (480×234) ======================
     Skins the compact 4-col × 3-row keypad (1-2-3-Clr / 4-5-6-⌫ / 7-8-9-0, no Enter)
     with arcade tokens — the 3D purple key + gold dots from the preview's .pin-key.
     Colors only; the compact sizing above (38px keys / 4px gap) stays. Same selector
     FORM as the arcade expanded block. Canonical ref: prize-quest-ttd-arcade.html .pin-*. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .key {
    /* Tenant-themed key (was hardcoded purple) — navy on Resort, etc. */
    background: linear-gradient(180deg, var(--arc-bg-elev, #3d1f6e), var(--arc-bg-mid, #2a1454));
    border: 1px solid var(--arc-hairline-2, rgba(255, 217, 61, 0.18));
    border-radius: var(--arc-r-md, 8px);
    color: var(--arc-cream, #fef3e2);
    font-family: var(--pq-font-display, sans-serif);
    box-shadow:
      0 1px 0 rgba(15, 4, 46, 0.9),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .key:hover {
    background: var(--arc-bg-elev, #4a2580);
    box-shadow:
      0 1px 0 rgba(15, 4, 46, 0.9),
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      0 0 12px var(--arc-glow-soft, rgba(255, 217, 61, 0.35));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .key:focus-visible {
    outline: 2px solid var(--arc-display, #ffd93d);
    outline-offset: 2px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .key--util {
    font-family: var(--pq-font-body, sans-serif);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--arc-text-dim, #c8b6e2);
    background: linear-gradient(180deg, var(--arc-bg-mid, #2a1454), var(--arc-bg-deep, #15042e));
  }
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .key:active {
      transform: translateY(1px);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
    }
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cell--filled {
    border-color: var(--arc-display, #ffd93d);
    background: transparent;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cell--filled::after {
    background: var(--arc-display, #ffd93d);
    box-shadow: 0 0 6px var(--arc-display-glow, rgba(255, 217, 61, 0.55));
  }
`;
