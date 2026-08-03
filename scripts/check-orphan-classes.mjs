// Finds class names used in a component's template that have NO rule in its styles.
// This is the check I should have run after bulk-editing CSS: my selector match was a
// substring test, so stripping the shared header's ".label" also stripped the prize
// card's ".label" — same name, completely different element.
import fs from "fs";
let bad = 0;
for (const f of process.argv.slice(2)) {
  const src = fs.readFileSync(f, "utf8");
  const i = src.indexOf("static override styles = css`");
  if (i < 0) continue;
  const css = src.slice(i, src.indexOf("`;", i));
  const tpl = src.slice(src.indexOf("`;", i));
  const used = new Set();
  for (const m of tpl.matchAll(/class="([^"$]*)"/g))
    for (const c of m[1].split(/\s+/)) if (c) used.add(c);
  for (const m of tpl.matchAll(/class="([^"]*)\$\{/g))
    for (const c of m[1].split(/\s+/)) if (c) used.add(c);
  const missing = [...used].filter(
    (c) => !new RegExp(`\\.${c.replace(/[-]/g, "\\-")}(?![\\w-])`).test(css),
  );
  if (missing.length) {
    bad += missing.length;
    console.log(`FAIL ${f}\n      no CSS rule for: ${missing.join(", ")}`);
  }
}
console.log(bad ? `${bad} orphaned class(es)` : `clean — ${process.argv.length - 2} file(s)`);
process.exit(bad ? 1 : 0);
