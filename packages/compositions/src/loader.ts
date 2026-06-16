import type { Channel, CompositionDoc } from "./types";

type ConfigMap = Record<string, () => Promise<unknown>>;

// Vite statically rewrites the literal `import.meta.glob(...)` call below into a map
// of path → lazy importer for every composition JSON under ./configs; only the
// requested doc is fetched. The call must stay literal (an aliased reference would
// defeat Vite's static detection), so the type is supplied via an inline cast rather
// than a global `ImportMeta` augmentation (which would clash with `vite/client`).
// Outside Vite (e.g. the Web Test Runner / esbuild pipeline) there is no runtime
// `glob`, so the call throws and we fall back to an empty map.
let CONFIGS: ConfigMap = {};
try {
  CONFIGS = (import.meta as ImportMeta & { glob(pattern: string): ConfigMap }).glob(
    "./configs/**/*.json",
  );
} catch {
  CONFIGS = {};
}

const FALLBACK_CHANNEL: Channel = "mobile-web";

async function readDoc(
  importer: () => Promise<unknown>,
): Promise<CompositionDoc> {
  const mod = (await importer()) as { default: CompositionDoc };
  return mod.default;
}

/**
 * Load the composition for `channel` × `route`.
 *
 * If the channel has no config for the route yet, fall back to the `mobile-web`
 * config for the same route (and warn). Returns `null` when no config exists on
 * either the requested channel or the fallback.
 */
export async function loadComposition(
  channel: Channel,
  route: string,
): Promise<CompositionDoc | null> {
  const key = `./configs/${channel}/${route}.json`;
  const importer = CONFIGS[key];
  if (importer) return readDoc(importer);

  if (channel !== FALLBACK_CHANNEL) {
    const fallbackKey = `./configs/${FALLBACK_CHANNEL}/${route}.json`;
    const fallback = CONFIGS[fallbackKey];
    if (fallback) {
      console.warn(
        `[@pq/compositions] no "${route}" config for channel "${channel}" — falling back to "${FALLBACK_CHANNEL}".`,
      );
      return readDoc(fallback);
    }
  }

  console.warn(
    `[@pq/compositions] no composition found for "${channel}/${route}".`,
  );
  return null;
}
