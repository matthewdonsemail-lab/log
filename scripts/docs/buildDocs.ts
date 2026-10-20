// Rule 56: the README and the diagrams are generated from the code.
// Usage: bun scripts/docs/buildDocs.ts           (writes README.md's surface section and docs/diagrams/*.mmd)
//        bun scripts/docs/buildDocs.ts --check   (lefthook pre-commit and pre-push: refuses any drift)
//
// Checked:
//   README.md's section between the surface markers   equals what the catalog renders
//   docs/diagrams/<name>.mmd                           equals each generated diagram; no stale .mmd left
//   every flag a command parses (parseArgs)            is in its usage, and every flag in its usage is parsed
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { COMMANDS } from "../../src/cli/runner/index.ts";
import { savedFlows } from "../../src/mcp/server/index.ts";
import { catalog, flagsOf, flowEntries, GLOBAL_FLAGS } from "../../src/surface/catalog/index.ts";
import { diagrams } from "../../src/surface/diagrams/index.ts";
import { renderSurface, withSurface } from "../../src/surface/readme/index.ts";

const root = join(import.meta.dir, "..", "..");
const check = process.argv.includes("--check");
const problems: string[] = [];
const wrote: string[] = [];

const entries = catalog(COMMANDS);
const flows = flowEntries(savedFlows());
const all = diagrams(entries, flows);

/** Writes `path` (or, with --check, records that it differs). */
function put(rel: string, text: string): void {
  const path = join(root, rel);
  const current = existsSync(path) ? readFileSync(path, "utf8").replace(/\r\n/g, "\n") : null;
  if (current === text) return;
  if (check) problems.push(`${rel} is out of date: run \`bun run docs:build\``);
  else {
    writeFileSync(path, text);
    wrote.push(rel);
  }
}

// 1. The diagrams, one .mmd each, and no stale one left behind.
const diagramDir = join(root, "docs/diagrams");
mkdirSync(diagramDir, { recursive: true });
for (const d of all) put(`docs/diagrams/${d.name}.mmd`, `%% ${d.title}. ${d.about}\n%% Written by \`bun run docs:build\` from the code (rule 56). Not edited by hand.\n${d.mermaid}\n`);
for (const file of readdirSync(diagramDir)) {
  if (!file.endsWith(".mmd") || all.some((d) => `${d.name}.mmd` === file)) continue;
  if (check) problems.push(`docs/diagrams/${file} is no longer generated: run \`bun run docs:build\``);
  else {
    rmSync(join(diagramDir, file));
    wrote.push(`removed docs/diagrams/${file}`);
  }
}

// 2. The README's generated section.
const readme = readFileSync(join(root, "README.md"), "utf8").replace(/\r\n/g, "\n");
put("README.md", withSurface(readme, renderSurface(entries, flows, all)));

// 3. Flags: what each command folder parses against what its commands' usage says.
const filesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? filesUnder(p) : p.endsWith(".ts") && !p.endsWith(".test.ts") ? [p] : [];
  });
const strings = (text: string | undefined) => [...(text ?? "").matchAll(/"([A-Za-z][A-Za-z0-9]*)"/g)].map((m) => m[1]);
const cliDir = join(root, "src/cli");
for (const dir of readdirSync(cliDir)) {
  const index = join(cliDir, dir, "index.ts");
  if (dir === "runner" || !existsSync(index)) continue;
  const names = [...readFileSync(index, "utf8").matchAll(/Command: Command = \{\s*usage: \w+,\s*name: "(\w+)"/g)].map((m) => m[1]);
  const usage = new Set(entries.filter((e) => names.includes(e.name)).flatMap((e) => flagsOf(e.usage.join("\n")).map((f) => f.name)));
  const parsed = new Set<string>();
  for (const file of filesUnder(join(cliDir, dir))) {
    for (const m of readFileSync(file, "utf8").matchAll(/parseArgs\([^,]+,\s*\{([^}]*)\}\)/g)) {
      const spec = m[1];
      for (const key of ["boolean", "valued"]) strings(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`).exec(spec)?.[1]).forEach((f) => parsed.add(f));
    }
    // Flags taken by hand: repeated pairs (`takePairs(argv, "set")`) and a token compared as is (`token === "--json"`).
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/takePairs\([^,]+,\s*"(\w+)"\)/g)) parsed.add(m[1]);
    for (const m of text.matchAll(/=== "--(\w+)"/g)) parsed.add(m[1]);
  }
  const global = new Set(GLOBAL_FLAGS.map((f) => f.name));
  for (const f of parsed) if (!usage.has(f) && !global.has(f)) problems.push(`src/cli/${dir}: parses --${f}, but no usage of ${names.join(", ")} names it`);
  for (const f of usage) if (!parsed.has(f) && !global.has(f)) problems.push(`src/cli/${dir}: the usage of ${names.join(", ")} names --${f}, but nothing parses it`);
}

// 4. Every diagram parses as GitHub's Mermaid would (a `;` in a note broke one on GitHub once).
{
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, DOMParser: dom.window.DOMParser, Element: dom.window.Element, HTMLElement: dom.window.HTMLElement });
  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({ startOnLoad: false });
  for (const d of all) {
    try {
      await mermaid.parse(d.mermaid);
    } catch (error) {
      problems.push(`docs/diagrams/${d.name}.mmd doesn't parse as Mermaid: ${String((error as Error).message).split("\n").slice(0, 3).join(" ")}`);
    }
  }
}

// 5. Names are browser-agnostic (rules 46, 57): a command's summary names no browser, unless the command is that
//    browser's own (`log adsPower`) or launches only Camoufox; and no README heading outside the generated section
//    presents one browser as log-cli's.
const BROWSER_NAME = /\b(camoufox|adspower|firefox|chromium)\b/i;
for (const e of entries) {
  const named = BROWSER_NAME.exec(e.summary)?.[1].toLowerCase();
  if (!named || named === e.name.toLowerCase() || (named === "camoufox" && e.browser === "camoufoxOnly")) continue;
  problems.push(`log ${e.name}'s summary names ${named}: say what it does, on "the account's browser" (rule 46)`);
}
const prose = readme.replace(/<!-- surface:start[\s\S]*?<!-- surface:end -->/, "");
for (const heading of prose.match(/^#{1,3} .*$/gm) ?? []) {
  if (BROWSER_NAME.test(heading) && !/setup/i.test(heading)) problems.push(`README heading "${heading}" names one browser: log-cli is browser-agnostic, its browsers are in the generated Browsers section (rules 46, 57)`);
}

if (problems.length) {
  console.error(`The docs are out of step with the code (rule 56):\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(check ? `docs: README and ${all.length} diagrams match the code (${entries.length} commands, ${flows.length} flows, every flag in its usage).` : wrote.length ? `wrote ${wrote.join(", ")}` : "docs: already up to date");
