import type { Player } from "./types";

/** Single mock player — "Gold tier · 2,400 pts to Platinum" from screen 01. */
export const player: Player = {
  id: "player-1",
  name: "Jordan Vega",
  tier: "Gold",
  nextTier: "Platinum",
  pointsToNextTier: 2400,
  points: 12540,
};
