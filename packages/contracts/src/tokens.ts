/**
 * Every Prize Quest CSS custom property (`--pq-*`), mirroring the locked `:root`
 * token block in `prize-quest-html5.html` (cross-checked against `tokens.json`).
 *
 * `TokenSet` is the *complete* set — `@pq/tokens`'s `TOKEN_DEFAULTS` must define
 * all of them. Tenants override any subset via `TenantConfig.theme.tokens`
 * (`TokenOverrides`, see `./tenant.ts`).
 *
 * This file lives in @pq/contracts (types only, no runtime) so both
 * @pq/tokens (consumes it for defaults) and @pq/tenants (consumes it via
 * TenantConfig.theme.tokens) can depend on it without a workspace cycle.
 */
export interface TokenSet {
  // Navy surfaces (H&H brand primary → elevated → hairline)
  "--pq-navy-deep": string;
  "--pq-navy-base": string;
  "--pq-navy-low": string;
  "--pq-navy-mid": string;
  "--pq-navy-hairline": string;

  // Emerald — action / progress
  "--pq-emerald": string;
  "--pq-emerald-soft": string;
  "--pq-emerald-dim": string;

  // Gold — reward / celebration
  "--pq-gold": string;
  "--pq-gold-bright": string;
  "--pq-gold-deep": string;

  // Text on navy
  "--pq-text": string;
  "--pq-text-muted": string;
  "--pq-text-faint": string;

  // Cream — premium warm neutral
  "--pq-cream": string;
  "--pq-cream-muted": string;

  // Status
  "--pq-danger": string;
  "--pq-danger-soft": string;
  "--pq-info": string;

  // Type families (full CSS font stacks)
  "--pq-font-display": string;
  "--pq-font-serif": string;
  "--pq-font-body": string;
  "--pq-font-mono": string;

  // Radius scale
  "--pq-r-sm": string;
  "--pq-r-md": string;
  "--pq-r-lg": string;
  "--pq-r-xl": string;
  "--pq-r-2xl": string;
  "--pq-r-full": string;

  // Motion
  "--pq-ease": string;
}

/** Union of every valid token name. */
export type TokenName = keyof TokenSet;
