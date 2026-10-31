import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { inputFlagNames, isPlatform } from "../../src/cli/runner/helpers/index.ts";
import { commandKey } from "../../src/cli/runner/helpers/platforms.ts";
import { COMMANDS } from "../../src/cli/runner/index.ts";
import { agentsSection, commandTools, CORE_GUIDE, CORE_PRINCIPLES, GUIDE_TOOL, GUIDE_TOPICS, guideOfCommand, listUseCases, longRunLine, renderGuide, savedFlows, toolsFromCommands, toolsFromFlows, withUseCases } from "../../src/mcp/server/index.ts";
import { catalog, flagsOf, flowEntries, GLOBAL_FLAGS } from "../../src/surface/catalog/index.ts";
import { diagrams } from "../../src/surface/diagrams/index.ts";
import { DIRECT_ROUTES } from "../../src/directApi/engine/index.ts";
import { renderSurface, withSurface } from "../../src/surface/readme/index.ts";

const root = join(import.meta.dir, "..", "..");
const check = process.argv.includes("--check");
const problems: string[] = [];
const wrote: string[] = [];

const entries = catalog(COMMANDS);
const flows = flowEntries(savedFlows());
const all = diagrams(entries, flows);

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

{
  const cli = join(root, "src/cli");
  const found: { name: string; platform: string; module: string; exportName: string }[] = [];
  for (const dir of readdirSync(cli).sort()) {
    const index = join(cli, dir, "index.ts");
    if (dir === "runner" || !existsSync(index)) continue;
    const loaded = (await import(index)) as Record<string, unknown>;
    for (const [exportName, value] of Object.entries(loaded).sort(([a], [b]) => a.localeCompare(b))) {
      const command = COMMANDS.find((c) => c === value);
      if (command && !found.some((f) => f.name === command.name && f.platform === command.platform)) found.push({ name: command.name, platform: command.platform, module: `src/cli/${dir}/index.ts`, exportName });
    }
  }
  for (const command of COMMANDS) if (!found.some((f) => f.name === command.name && f.platform === command.platform)) problems.push(`${command.name} (${command.platform}) is in COMMANDS but no src/cli/<dir>/index.ts exports it, so log can't load it on its own`);
  const ordered = COMMANDS.map((c) => found.find((f) => f.name === c.name && f.platform === c.platform)).filter((f): f is (typeof found)[number] => Boolean(f));
  put(
    "src/cli/runner/helpers/commandIndex.ts",
    [
      "export interface CommandIndexEntry {",
      "  name: string",
      "  platform: string",
      "  module: string",
      "  exportName: string",
      "}",
      "",
      "export const COMMAND_INDEX: CommandIndexEntry[] = [",
      ...ordered.map((f) => `  { name: ${JSON.stringify(f.name)}, platform: ${JSON.stringify(f.platform)}, module: ${JSON.stringify(f.module)}, exportName: ${JSON.stringify(f.exportName)} },`),
      "]",
      "",
    ].join("\n"),
  );
}

{
  const agentsMd = readFileSync(join(root, "AGENTS.md"), "utf8").replace(/\r\n/g, "\n");
  const allTools = [...toolsFromCommands(COMMANDS, { shell: true, full: true }), ...toolsFromFlows(savedFlows(), { shell: true, full: true })];
  const useCases = listUseCases(allTools.map((t) => t.name));
  const full = withUseCases(allTools, useCases);
  for (const u of useCases) if (!u.tools.length) problems.push(`docs/useCases/${u.id}.md names no log tool: each step names the tool it calls`);
  const flowNames = new Set(toolsFromFlows(savedFlows(), { shell: true }).map((t) => t.name));
  const topicOfTool = new Map(commandTools(COMMANDS).map((e) => [e.tool, guideOfCommand(e.command)]));
  const rulesOf = (tool: { description: string }) => ((tool.description.split("\n").at(-1) ?? "").match(/rules ([\d, ]+)/)?.[1] ?? "").split(",").map((n) => Number(n.trim())).filter(Boolean);
  for (const tool of full) if (!flowNames.has(tool.name) && !topicOfTool.get(tool.name)) problems.push(`MCP tool ${tool.name} has no guide: add its command to GUIDE_TOPICS (src/mcp/server/helpers/guides.ts)`);
  const guideDir = join(root, "docs/guides");
  mkdirSync(guideDir, { recursive: true });
  for (const [topic, about] of Object.entries(GUIDE_TOPICS)) {
    const tools = full.filter((t) => (about.flows && flowNames.has(t.name)) || topicOfTool.get(t.name) === topic);
    const names = new Set(tools.map((t) => t.name));
    const theirs = useCases.filter((u) => u.tools.some((name) => names.has(name)));
    const useCaseRows = (list: typeof useCases) => ["| Use case | What it is | How the owner asks for it |", "|---|---|---|", ...list.map((u) => `| \`${GUIDE_TOOL}({ useCase: "${u.id}" })\` | ${u.title} | ${u.asks || "see the page"} |`)];
    const extra =
      topic === CORE_GUIDE
        ? [
            "## Use cases: the work the owner asks for, tool by tool",
            "",
            "This is how the owner works. Each use case is something the owner asks for again and again, written as its steps in order, each step naming its tool and what counts as done. When the owner asks for work a use case covers, read that use case and follow it step by step instead of improvising. Work no use case covers yet, done for the owner more than once, gets a page of its own in docs/useCases/<platform>/.",
            "",
            ...useCaseRows(useCases),
            "",
            "## Rule one: if we don't know, we do this",
            "",
            agentsSection(agentsMd, "Rule one"),
            "",
            "## The core rules, in full",
            "",
            CORE_PRINCIPLES,
            "",
            "## Which guide for which work",
            "",
            `Each tool's description names its guide. Load it with \`${GUIDE_TOOL}({ topic })\` before first using that tool.`,
            "",
            "| Topic | What it covers |",
            "|---|---|",
            ...Object.entries(GUIDE_TOPICS).filter(([t]) => t !== CORE_GUIDE).map(([t, g]) => `| \`${t}\` | ${g.about} |`),
            "",
            "## How a run reports back",
            "",
            `- With a shell (Claude Code, Codex): ${longRunLine({ shell: true })}`,
            `- Without one (claude.ai, Duet): ${longRunLine({ shell: false })}`,
            "- Every result also says where every open browser is (`browsers`), the call that resolves its known page state (`next`: make it, don't stop, rule 54) and what only matt can clear (`needsMatt`).",
            "- A refusal names its error code; the `errors` tool says what each one means and what to do.",
          ]
        : theirs.length
          ? ["## Use cases these tools are part of", "", "When the owner asks for one of these, follow its page step by step.", "", ...useCaseRows(theirs)]
          : [];
    const rules = topic === CORE_GUIDE ? [...new Set([...CORE_PRINCIPLES.matchAll(/rules? ([\d, -]+)/g)].flatMap((m) => m[1].split(",").flatMap((part) => { const [a, b] = part.trim().split("-").map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; })))].filter(Boolean) : [];
    put(`docs/guides/${topic}.md`, renderGuide({ topic, tools, commands: COMMANDS, flows: savedFlows(), agentsMd, rulesOf, rules, extra }));
  }
  for (const file of readdirSync(guideDir)) {
    if (!file.endsWith(".md") || GUIDE_TOPICS[file.slice(0, -3)]) continue;
    if (check) problems.push(`docs/guides/${file} is no longer a guide topic: run \`bun run docs:build\``);
    else {
      rmSync(join(guideDir, file));
      wrote.push(`removed docs/guides/${file}`);
    }
  }
}

const readme = readFileSync(join(root, "README.md"), "utf8").replace(/\r\n/g, "\n");
put("README.md", withSurface(readme, renderSurface(entries, flows, all)));

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
  const declared = [...readFileSync(index, "utf8").matchAll(/Command: Command = \{\s*usage: \w+,\s*(?:platform: "(\w+)",\s*)?name: "(\w+)"/g)].map((m) => ({ platform: m[1], name: m[2] }));
  const names = declared.map((d) => d.name);
  const owned = COMMANDS.filter((c) => declared.some((d) => d.name === c.name && (!d.platform || d.platform === c.platform)));
  const keys = new Set(owned.map((c) => commandKey(c)));
  const usage = new Set(entries.filter((e) => keys.has(e.key)).flatMap((e) => flagsOf(e.usage.join("\n")).map((f) => f.name)));
  const parsed = new Set<string>();
  for (const command of owned) if (command.input) inputFlagNames(command.input).forEach((f) => parsed.add(f));
  for (const file of filesUnder(join(cliDir, dir))) {
    for (const m of readFileSync(file, "utf8").matchAll(/parseArgs\([^,]+,\s*\{([^}]*)\}\)/g)) {
      const spec = m[1];
      for (const key of ["boolean", "valued"]) strings(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`).exec(spec)?.[1]).forEach((f) => parsed.add(f));
    }
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/takePairs\([^,]+,\s*"(\w+)"\)/g)) parsed.add(m[1]);
    for (const m of text.matchAll(/=== "--(\w+)"/g)) parsed.add(m[1]);
  }
  const global = new Set(GLOBAL_FLAGS.map((f) => f.name));
  for (const f of parsed) if (!usage.has(f) && !global.has(f)) problems.push(`src/cli/${dir}: parses --${f}, but no usage of ${names.join(", ")} names it`);
  for (const f of usage) if (!parsed.has(f) && !global.has(f)) problems.push(`src/cli/${dir}: the usage of ${names.join(", ")} names --${f}, but nothing parses it`);
}

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

for (const command of COMMANDS) {
  if (!command.input) continue;
  const entry = entries.find((e) => e.key === commandKey(command));
  for (const form of command.input.forms) {
    const head = `${entry?.words ?? command.name}${form.words.length ? ` ${form.words.join(" ")}` : ""}`;
    if (!entry?.usage.some((line) => line === `log ${head}` || line.startsWith(`log ${head} `) || (form.words[0] === "list" && line.startsWith(`log ${entry.words} [list]`)))) problems.push(`log ${command.name}: its input form "${form.words.join(" ") || "(no words)"}" has no usage line starting \`log ${head}\` (rule 56)`);
  }
  for (const flag of command.input.forms.flatMap((f) => f.flags)) if (!flag.global && !entry?.flags.some((f) => f.name === flag.name)) problems.push(`log ${command.name}: its input has --${flag.name}, but its usage doesn't name it (rule 56)`);
}

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

for (const e of entries) {
  for (const line of e.usage) {
    const words = /^log\s+(\S+)(?:\s+(\S+))?/.exec(line);
    if (!words) continue;
    const [, first, second] = words;
    const named = first === e.name ? null : second === e.name ? first : undefined;
    if (named === undefined) continue;
    if (e.platform === "any" && named !== null) problems.push(`log ${e.name} works on any platform, but "${line.slice(0, 80)}" puts ${named} in front of it (rule 63)`);
    if (e.platform !== "any" && named === null) problems.push(`log ${e.name} acts on one platform, but "${line.slice(0, 80)}" doesn't start with it: every form is log ${isPlatform(e.platform) ? e.platform : "<platform>"} ${e.name} … (rule 63)`);
    if (isPlatform(e.platform) && named !== null && named !== e.platform) problems.push(`log ${e.name} is ${e.platform}'s, but "${line.slice(0, 80)}" starts with ${named} (rule 63)`);
    if (e.platform === "byArgument" && named !== null && named !== "<platform>" && !isPlatform(named)) problems.push(`log ${e.name}: "${line.slice(0, 80)}" starts with ${named}, which isn't a platform (rule 63)`);
  }
}

const contextType = readFileSync(join(root, "src", "cli", "runner", "types.ts"), "utf8");
const cliRoot = join(root, "src", "cli");
for (const dir of readdirSync(cliRoot)) {
  const index = join(cliRoot, dir, "index.ts");
  if (!existsSync(index)) continue;
  const seams = new Set([...readFileSync(index, "utf8").matchAll(/context\.(direct\w+)/g)].map((m) => m[1]));
  for (const seam of seams) {
    const declared = Object.entries(DIRECT_ROUTES).find(([, r]) => r.seam === seam);
    if (!declared) problems.push(`src/cli/${dir}: calls context.${seam}, a direct-API route DIRECT_ROUTES doesn't declare: the MCP text and README wouldn't say so (src/directApi/engine)`);
  }
}
for (const [name, route] of Object.entries(DIRECT_ROUTES)) {
  const dir = route.platform === "facebook" ? name : route.platform;
  const index = join(cliRoot, dir, "index.ts");
  if (!existsSync(index) || !readFileSync(index, "utf8").includes(`context.${route.seam}`)) problems.push(`DIRECT_ROUTES.${name} says it runs on the direct-API engine through context.${route.seam}, but src/cli/${dir}/index.ts never calls it`);
  if (!new RegExp(`\\b${route.seam}\\??:`).test(contextType)) problems.push(`DIRECT_ROUTES.${name}: context.${route.seam} isn't on CommandContext (src/cli/runner/types.ts)`);
  const entry = entries.find((e) => e.key === name);
  if (entry && !entry.usage.some((line) => /direct-API engine/.test(line))) problems.push(`log ${name} runs on the direct-API engine first, but its usage never says so: name "the direct-API engine" in it`);
  if (entry && /in (its|the account's) open browser/.test(entry.summary) && !/direct-API/.test(entry.summary)) problems.push(`log ${name}'s summary says it runs in the open browser only, but DIRECT_ROUTES runs it on the direct-API engine first`);
}

if (problems.length) {
  console.error(`The docs are out of step with the code (rule 56):\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(check ? `docs: README and ${all.length} diagrams match the code (${entries.length} commands, ${flows.length} flows, every flag in its usage).` : wrote.length ? `wrote ${wrote.join(", ")}` : "docs: already up to date");
