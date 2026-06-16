#!/usr/bin/env node
/**
 * scope-widgets.mjs — rename the unscoped `pq-*` widget packages to the
 * `@pq/pq-*` scope so package naming is consistent with the rest of the
 * workspace (which already uses `@pq/...`).
 *
 * What it rewrites:
 *   1. Each widget's package.json  "name": "pq-x"        -> "@pq/pq-x"
 *   2. Every package.json dependency key  "pq-x": "..."  -> "@pq/pq-x": "..."
 *   3. ES module specifiers in *.ts / *.mjs:
 *        import "pq-x";              -> import "@pq/pq-x";
 *        import ... from "pq-x";     -> import ... from "@pq/pq-x";
 *
 * What it deliberately does NOT touch:
 *   - Custom-element tags in templates:  <pq-x> ... </pq-x>
 *   - customElements.define("pq-x", ...) registrations
 *   (these are matched by neither the package.json rule nor the
 *    `import`/`from` specifier rule, so the runtime tag stays `pq-x`.)
 *
 * Safe to run repeatedly (idempotent) and reversible with --revert.
 *
 * Usage:
 *   node tooling/scope-widgets.mjs           # apply
 *   node tooling/scope-widgets.mjs --dry     # show files that would change
 *   node tooling/scope-widgets.mjs --revert  # undo (@pq/pq-x -> pq-x)
 *
 * After applying, run:  pnpm install
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");
const REVERT = process.argv.includes("--revert");

// Discover widget package names from packages/widgets/*/package.json.
const widgetsDir = join(ROOT, "packages", "widgets");
const names = [];
for (const entry of readdirSync(widgetsDir)) {
  const pkgPath = join(widgetsDir, entry, "package.json");
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const bare = String(pkg.name).replace(/^@pq\//, "");
    if (bare.startsWith("pq-")) names.push(bare);
  } catch {
    /* no package.json in this dir */
  }
}
names.sort((a, b) => b.length - a.length); // longest first (defensive)

const alt = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

// "pq-x" as an exact, fully-quoted JSON token (name value or dependency key).
const jsonRe = new RegExp(`"(${alt})"`, "g");
const jsonReRev = new RegExp(`"@pq/(${alt})"`, "g");

// ES module specifiers only: a quote that follows `from` or a side-effect
// `import`, with the spec running to the closing quote (prefix-safe).
const specRe = new RegExp(`((?:\\bfrom|\\bimport)\\s+)(['"])(${alt})\\2`, "g");
const specReRev = new RegExp(`((?:\\bfrom|\\bimport)\\s+)(['"])@pq/(${alt})\\2`, "g");

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === "dist" || e === ".git" || e === ".vite") continue;
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const isPkg = file.endsWith("package.json");
  const isSrc = file.endsWith(".ts") || file.endsWith(".mjs");
  if (!isPkg && !isSrc) continue;

  const before = readFileSync(file, "utf8");
  let after = before;

  if (isPkg) {
    after = REVERT ? after.replace(jsonReRev, '"$1"') : after.replace(jsonRe, '"@pq/$1"');
  }
  if (isSrc) {
    after = REVERT
      ? after.replace(specReRev, "$1$2$3$2")
      : after.replace(specRe, "$1$2@pq/$3$2");
  }

  if (after !== before) {
    changed++;
    console.log(`${DRY ? "[dry] " : ""}${file.replace(ROOT + "/", "").replace(ROOT + "\\", "")}`);
    if (!DRY) writeFileSync(file, after);
  }
}

console.log(
  `\n${DRY ? "Would change" : REVERT ? "Reverted" : "Updated"} ${changed} file(s) across ${names.length} widgets.`,
);
if (!DRY && !REVERT) console.log("Next step:  pnpm install");
