import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { applyPlan, planNewPlatform } from "../../scaffold/platform/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

const REPO = join(import.meta.dir, "..", "..", "..");

export const NEW_USAGE = [
  "Usage: log new platform <name> [--label <shown name>] [--twentyPlatform <ENUM>] [--library <vendor/folder>] [--sessionCookies <a,b>] [--cookieDomain <.site.com>] [--apply] [--json]",
  "Makes a new platform for log-cli: its account session on the shared platformKit, `log <name> session check` with its MCP tool, a direct-API engine in python/<name>Api on the shared Python kit, and docs/platforms/<name>. The repo is wired by editing each file through its syntax tree (PLATFORMS, PLATFORM_LABELS, COMMANDS, createContext, CommandContext, DIRECT_ROUTES, COMMAND_RULES), and every edit is checked to have landed before anything is written.",
  "Without --apply it lists what it would write and change, and writes nothing. Nothing is overwritten: an existing platform or file is refused. It says what Twenty is missing (the socialAccounts.platform option) but never changes Twenty. Then fill in the engine's actions and add the platform's families as commands (rule 83).",
].join("\n");

export const NEW_INPUT: CommandInput = {
  forms: [
    {
      words: ["platform"],
      effect: "write",
      summary: "Make a new platform's session, command, MCP tool, engine and docs, wired through the syntax tree",
      positionals: [{ name: "name", kind: "string", required: true, description: "The platform's name, camelCase (reddit, blueSky)" }],
      flags: [
        { name: "label", kind: "string", description: "How it is shown (default: the name capitalised)" },
        { name: "twentyPlatform", kind: "string", description: "Its socialAccounts.platform value in Twenty (default: the name in capitals)" },
        { name: "library", kind: "string", description: "Its vendored client's folder, vendor/<folder>" },
        { name: "sessionCookies", kind: "string", description: "The cookies a logged-in session must have, comma-separated" },
        { name: "cookieDomain", kind: "string", description: "The domain refreshed cookies are saved under (default .<name>.com)" },
        { name: "apply", kind: "boolean", description: "Write it (without it, only list what it would do)" },
        JSON_FLAG,
      ],
    },
  ],
};

export const newCommand: Command = {
  usage: NEW_USAGE,
  platform: "any",
  name: "new",
  effect: "write",
  input: NEW_INPUT,
  summary: "Make a new platform (session, command, MCP tool, engine, docs), wired into the repo through its syntax tree",
  args: "platform <name> [--library <vendor/folder>] [--apply]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(NEW_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log new: ${parsed.error}\n${NEW_USAGE}` };
    const [what, name, ...rest] = parsed.positionals;
    if (what !== "platform" || !name || rest.length) return { code: 1, stderr: `log new: give platform <name>\n${NEW_USAGE}` };
    const str = (flag: string) => (typeof parsed.flags[flag] === "string" ? (parsed.flags[flag] as string) : undefined);
    let plan;
    try {
      plan = planNewPlatform(REPO, { name, label: str("label"), twentyPlatform: str("twentyPlatform"), library: str("library"), cookieDomain: str("cookieDomain"), sessionCookies: str("sessionCookies")?.split(",").map((c) => c.trim()).filter(Boolean) });
    } catch (error) {
      return { code: 1, stderr: `log new platform: ${error instanceof Error ? error.message : String(error)}` };
    }
    const apply = parsed.flags["apply"] === true;
    const listed = [...plan.files.map((f) => `write ${f.path}`), ...plan.edits.map((e) => `edit ${e.path}: ${e.what}`)];
    if (!apply) {
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ apply: false, names: plan.names, files: plan.files.map((f) => f.path), edits: plan.edits.map((e) => ({ path: e.path, what: e.what })), notes: plan.notes }, null, 2) };
      return { code: 0, stdout: [`log new platform ${name}: would make ${plan.names.label} (log ${name} session check, MCP ${name}SessionCheck). Nothing written; --apply does it:`, ...listed.map((l) => `  ${l}`), ...plan.notes.map((n) => `note: ${n}`)].join("\n") };
    }
    let done: string[];
    try {
      done = applyPlan(REPO, plan);
    } catch (error) {
      return { code: 1, stderr: `log new platform: ${error instanceof Error ? error.message : String(error)} (nothing written)` };
    }
    for (const line of done) context.err(line);
    context.err("bun run docs:build: the README, the diagrams and every MCP tool's description");
    const docs = spawnSync("bun", ["scripts/docs/buildDocs.ts"], { cwd: REPO, encoding: "utf8" });
    const docsLine = docs.status === 0 ? (docs.stdout.trim().split("\n").pop() ?? "docs built") : `docs:build failed: ${(docs.stderr || docs.stdout).slice(-300)}`;
    const next = [`Next: bun run check, then fill in python/${name}Api/engine.py's ping and add ${plan.names.label}'s families as commands (docs/platforms/${name}/README.md).`];
    if (parsed.flags["json"]) return { code: docs.status === 0 ? 0 : 1, stdout: JSON.stringify({ apply: true, names: plan.names, done, docs: docsLine, notes: plan.notes, next }, null, 2) };
    return { code: docs.status === 0 ? 0 : 1, stdout: [`log new platform ${name}: made ${plan.names.label}.`, ...done.map((l) => `  ${l}`), `  ${docsLine}`, ...plan.notes.map((n) => `note: ${n}`), ...next].join("\n") };
  },
};
