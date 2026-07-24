/**
 * Re-export of the tenant-theme DOM utilities, which now live in `shared/lib` so
 * the Settings feature's live theme editor can call them without crossing the
 * FSD boundary (feature → platform is disallowed). Platform → shared is fine.
 */
export {
  applyTenantTheme,
  clearTenantTheme,
  tokenToHex,
  hexToChannels,
  relativeLuminance,
} from "@/shared/lib/theme";
