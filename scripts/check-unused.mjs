// Catches what the repo's eslint catches on commit — unused module-level consts and
// unused #private class members — so I stop finding out at the husky hook.
//
// NOTE on the regex: a #private is ALWAYS read as `this.#name`, so the usual
// "not preceded by a dot" guard (which is right for plain identifiers, to avoid
// counting `foo.bar` as a use of `bar`) must NOT be applied to them.
import fs from "fs";

const esc = (s) => s.replace(/[$]/g, "\\$");
const usesOf = (src, name) => {
  const re = name.startsWith("#")
    ? new RegExp(`${esc(name)}(?![\\w$])`, "g") // this.#name — dot allowed
    : new RegExp(`(?<![\\w$.])${esc(name)}(?![\\w$])`, "g"); // bare identifier only
  return [...src.matchAll(re)].length;
};

let bad = 0;
const files = process.argv.slice(2);
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const names = new Set();
  for (const m of src.matchAll(/^(?:const|let)\s+([A-Za-z_$][\w$]*)\s*[:=]/gm)) names.add(m[1]);
  for (const m of src.matchAll(/^\s*(#[\w$]+)\s*(?:[:=]|\()/gm)) names.add(m[1]);
  for (const name of names) {
    if (usesOf(src, name) > 1) continue; // declaration + at least one read
    bad++;
    const at = src.search(new RegExp(esc(name) + "(?![\\w$])"));
    console.log(
      `FAIL ${f}:${src.slice(0, at).split("\n").length} "${name}" declared but never used`,
    );
  }
}
console.log(bad ? `${bad} unused symbol(s)` : `clean — ${files.length} file(s)`);
process.exit(bad ? 1 : 0);
