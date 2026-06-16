/**
 * Layout profile for `<pq-promo-hero>`:
 * - `compact`  — glanceable (eyebrow + title + progress; no CTA / thumbnails)
 * - `standard` — vertical hero with prize-thumb row + full-width CTA
 * - `expanded` — 2-column hero (content + prize-thumbnail grid)
 */
export type HeroProfile = "compact" | "standard" | "expanded";

/** Detail payload of the `pq-hero-cta` event. */
export interface HeroCtaDetail {
  id: string;
}
