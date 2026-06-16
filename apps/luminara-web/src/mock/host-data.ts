// Mock data for the host's own mockup screens. The embedded Prize Quest pulls its own
// data from @pq/store / @pq/mock-data — this file is purely the static Luminara host
// content (the "HTML content" of the app is the only dynamic surface).

export interface Reward {
  id: string;
  eyebrow: string;
  name: string;
  detail: string;
  cost: number;
}

export interface ActivityRow {
  date: string;
  time: string;
  event: string;
  context: string;
  points: number; // signed; 0 = neutral
}

export interface Preference {
  key: string;
  value: string;
  accent?: boolean;
}

export const member = {
  name: "Marcus Chen",
  monogram: "MC",
  email: "marcus.chen@mail.com",
  tier: "Gold",
  nextTier: "Platinum",
  memberSince: 2021,
  points: 6400,
  nextTierAt: 10000,
} as const;

export const tierBenefits: string[] = [
  "Priority check-in",
  "2pm late checkout",
  "Complimentary valet",
  "Lounge access",
  "Bonus 1.5× points",
];

export const rewards: Reward[] = [
  { id: "suite", eyebrow: "Stay", name: "Suite upgrade", detail: "One category up, subject to availability.", cost: 2500 },
  { id: "spa", eyebrow: "Spa", name: "Spa half-day", detail: "Thermal circuit + one 50-min treatment.", cost: 1800 },
  { id: "dining", eyebrow: "Dining", name: "Chef's tasting for two", detail: "Seven courses at the west-tower table.", cost: 3200 },
  { id: "night", eyebrow: "Stay", name: "Free night, west tower", detail: "Sunday–Thursday, blackout dates apply.", cost: 5000 },
  { id: "credit", eyebrow: "Play", name: "$50 free play", detail: "Loaded to your card within the hour.", cost: 900 },
  { id: "transfer", eyebrow: "Arrival", name: "Airport transfer", detail: "Black car, one way, within 40 miles.", cost: 1400 },
];

export const activity: ActivityRow[] = [
  { date: "Jun 3", time: "21:14", event: "Claimed Amazon $100 voucher", context: "Prize Quest", points: 0 },
  { date: "Jun 3", time: "18:40", event: "Earned points", context: "Blackjack — Table 7", points: 240 },
  { date: "Jun 2", time: "20:05", event: "Redeemed suite upgrade", context: "Rewards", points: -2500 },
  { date: "Jun 2", time: "16:22", event: "Earned points", context: "Dining — west tower", points: 180 },
  { date: "Jun 1", time: "19:30", event: "Check-in", context: "Room 1402, west tower", points: 0 },
  { date: "May 30", time: "22:10", event: "Viewed offer", context: "Tonight at the casino", points: 0 },
  { date: "May 29", time: "13:05", event: "Earned points", context: "Spa — thermal circuit", points: 120 },
];

export const preferences: Preference[] = [
  { key: "Theme", value: "Twilight", accent: true },
  { key: "Notifications", value: "On" },
  { key: "Language", value: "English (US)" },
  { key: "Two-factor", value: "Enabled" },
  { key: "Marketing emails", value: "Off" },
];
