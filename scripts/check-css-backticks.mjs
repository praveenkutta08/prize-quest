// Guard for the mistake I have now made three times: a stray backtick inside a css``
// template literal silently terminates it, and the file fails to parse.
import fs from "fs";
const files = process.argv.slice(2);
let bad = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const re = /\b(css|html)`/g;
  let m;
  while ((m = re.exec(src))) {
    // walk to the matching close, respecting ${...} and escapes
    let i = m.index + m[0].length,
      depth = 0;
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === "$" && src[i + 1] === "{") {
        depth++;
        i++;
        continue;
      }
      if (c === "}" && depth) {
        depth--;
        continue;
      }
      if (c === "`" && !depth) break;
    }
    const body = src.slice(m.index + m[0].length, i);
    // a backtick inside a CSS comment is the classic form
    const cmt = body.match(/\/\*[\s\S]*?\*\//g) || [];
    for (const c of cmt)
      if (c.includes("`")) {
        bad++;
        const line = src.slice(0, m.index + m[0].length + body.indexOf(c)).split("\n").length;
        console.log(`FAIL ${f}:${line} backtick inside a ${m[1]}\`\` comment`);
      }
    re.lastIndex = i;
  }
}
console.log(bad ? `${bad} problem(s)` : `clean — ${files.length} file(s)`);
process.exit(bad ? 1 : 0);
