import { AGENT_HOOKS } from "../../agentHooks/registry/index.ts";
import type { AgentHook } from "../../agentHooks/registry/index.ts";
import { GLOBAL_FLAGS, sessionHooks } from "../catalog/index.ts";
import type { CommandEntry, Flag, FlowEntry } from "../catalog/index.ts";
import type { Diagram } from "../diagrams/index.ts";
import { engineLine } from "../../directApi/engine/index.ts";

export const SURFACE_START = "<!-- surface:start · written by `bun run docs:build` from the code. Not edited by hand. -->";
export const SURFACE_END = "<!-- surface:end -->";

const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

const BROWSER_TEXT: Record<CommandEntry["browser"], string> = { accountBrowser: "the account's", camoufoxOnly: "Camoufox only", none: "none" };

const ENGINE_TEXT: Record<CommandEntry["engine"], string> = { directApiFirst: "direct API first", directApiOnly: "direct API only", browser: "browser", none: "none" };

const platformText = (p: CommandEntry["platform"]) => (p === "any" ? "any (none)" : p === "byArgument" ? "`<platform>` first" : `\`${p}\` first`);

const anchorOf = (words: string) => `log-${words}`.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/ /g, "-");

const flagText = (f: Flag) => `\`--${f.name}${f.value ? ` <${f.value}>` : ""}\``;

function diagramBlock(d: Diagram): string[] {
  return [`### ${d.title}`, "", d.about, "", "```mermaid", d.mermaid, "```", "", `Source: [\`docs/diagrams/${d.name}.mmd\`](docs/diagrams/${d.name}.mmd).`, ""];
}

function hookRow(h: AgentHook): string {
  return `| ${h.event} | ${h.matcher ? `\`${cell(h.matcher)}\`` : "every turn"} | [\`${h.script}\`](${h.script}) | ${cell(h.why)} |`;
}

export function renderSurface(entries: readonly CommandEntry[], flows: readonly FlowEntry[], diagrams: readonly Diagram[], hooks: readonly AgentHook[] = AGENT_HOOKS): string {
  const byName = new Map(diagrams.map((d) => [d.name, d]));
  const pick = (name: string) => byName.get(name);
  const out: string[] = [
    SURFACE_START,
    "## Commands, MCP tools and hooks",
    "",
    "log-cli is browser-agnostic: each account's browser is a driver (AdsPower first, Camoufox kept, more browser providers to come), and every driver opens through the same gates.",
    "It is platform-agnostic too: Facebook (Marketplace and groups) is the first platform. A command that acts on one platform names it first, `log <platform> <command> …` (`log facebook connect`, `log facebook warmup reel`), in every form; one that works on any platform takes none (the Platform column, rule 63).",
    "Every command is a CLI command (`bun bin/log.ts [<platform>] <command>`) and, unless it only works in a terminal, an MCP tool named for the command on the `log` server (a Facebook tool runs `log facebook <command>`).",
    "The same hooks fire whether it runs from a shell or over MCP, and both write the same live log, `~/.logCli/mcp/<day>.log`.",
    "This section and `docs/diagrams/*.mmd` are generated from the code (`COMMANDS`, `AGENT_HOOKS`, `PAGE_STATES`, the saved flows) by `bun run docs:build`.",
    "`bun run check:docs` (lefthook pre-commit and pre-push) refuses a commit where they differ (rule 56).",
    "",
  ];
  const browsers = pick("browsers");
  if (browsers) {
    const on = (kind: CommandEntry["browser"]) => entries.filter((e) => e.browser === kind).map((e) => `\`${e.name}\``).join(", ");
    out.push(
      ...diagramBlock(browsers),
      `- **The account's browser, through the driver:** ${on("accountBrowser")}. They run on whichever browser the account uses: AdsPower when it has a linked profile (\`socialAccounts.adsPowerProfileId\`), Camoufox otherwise, or what \`socialAccounts.browserDriver\` says.`,
      `- **Camoufox only, not on the driver yet:** ${on("camoufoxOnly")}. They launch Camoufox themselves (facebook-camofox-client's worker, or the publish, connect and profile sessions), so on an AdsPower account they don't open its AdsPower profile. Moving one onto the driver is moving it into \`OPENER_ACTIONS\` (\`src/browser/run\`).`,
      `- **No browser:** ${on("none")}.`,
      "",
      "Each browser's capabilities, built or not: [`docs/browsers.md`](docs/browsers.md) (generated, `bun run check:browsers`). AdsPower's setup: [`docs/adsPower.md`](docs/adsPower.md).",
      "",
    );
  }
  const direct = entries.filter((e) => e.engine === "directApiFirst" || e.engine === "directApiOnly");
  out.push(
    "### Engines: the direct API first, the browser behind it",
    "",
    "A command on the direct-API engine calls the platform's internal API with the account's saved session, paced by its own governor, and opens no browser: Facebook through fbk (`vendor/fbk`) and the account's proxy, X through twikit (`vendor/twikit`) directly (rule 80). Which engine runs each command is code (`DIRECT_ROUTES` and `commandEngine` in `src/directApi/engine`), and this section, the Engine column and every MCP tool's description are generated from it.",
    "",
    ...direct.map((e) => `- \`log ${e.words}\`: ${engineLine(e.name) ?? ""}`),
    "",
  );
  const surface = pick("surface");
  if (surface) out.push(...diagramBlock(surface));

  out.push(
    "### Every command",
    "",
    `Every command also takes ${GLOBAL_FLAGS.map(flagText).join(", ")} (this run's proxy speed limit, rule 33). \`--live\` acts on Facebook and over MCP needs \`confirmLive: true\`; \`--bypass\` needs \`confirmBypass: true\` (rules 8, 10, 20).`,
    "",
    "| Command | What it does | Platform | Flags | Engine | Browser | MCP tool | Hooks: shell · MCP | Live log | Rules |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  );
  for (const e of entries) {
    const tool = e.tool ? e.tool.split(", ").map((t) => `\`${t}\``).join(", ") : `terminal only: ${cell(e.terminalOnly ?? "")}`;
    const hooksText = `${e.hooks.cli.join(", ") || "none"} · ${e.tool ? e.hooks.mcp.join(", ") || "none" : "n/a"}`;
    out.push(`| [\`log ${e.words}\`](#${anchorOf(e.words)}) | ${cell(e.summary)} | ${platformText(e.platform)} | ${e.flags.map(flagText).join(" ") || "none"} | ${ENGINE_TEXT[e.engine]} | ${BROWSER_TEXT[e.browser]} | ${tool} | ${hooksText} | ${e.longRunning ? "yes: watch it" : "no"} | ${e.rules.join(", ")} |`);
  }
  out.push("");

  if (flows.length) {
    out.push("### Saved flows: MCP tools of their own (rule 31)", "", "| MCP tool | Runs | What it does | Params | Steps |", "| --- | --- | --- | --- | --- |");
    for (const f of flows) out.push(`| \`${f.tool}\`, \`${f.tool}Live\` | \`log flow run ${f.name}\` | ${cell(f.summary)} | ${f.params.map((p) => `\`${p}\``).join(", ") || "none"} | ${cell(f.steps.join(" → "))} |`);
    out.push("");
  }
  const commands = pick("commands");
  if (commands) out.push(...diagramBlock(commands));

  out.push(
    "### The hooks (rule 55)",
    "",
    "One list (`src/agentHooks/registry`) writes Claude Code's `.claude/settings.json` and Codex's `.codex/hooks.json`. How to add one: `skills/agentHooks/SKILL.md`.",
    "",
    "| Event | Matcher | Script | What it does |",
    "| --- | --- | --- | --- |",
    ...hooks.map(hookRow),
    "",
    `Around every turn, whatever is called: ${sessionHooks(hooks).map((h) => h.event).join(", ")}.`,
    "",
  );
  const hooksD = pick("hooks");
  if (hooksD) out.push(...diagramBlock(hooksD));
  const states = pick("pageStates");
  if (states) out.push(...diagramBlock(states));

  out.push("### Each command's usage", "");
  for (const e of entries) {
    out.push(`#### log ${e.words}`, "", e.summary + (e.tool ? (e.typed ? ` MCP tools: ${e.tool.split(", ").map((t) => `\`${t}\``).join(", ")}, one per form, with named fields.` : ` MCP tool: \`${e.tool}\` (\`args\` takes the same arguments).`) : ` Terminal only: ${e.terminalOnly}`), "", "```text", ...e.usage, "```", "");
  }
  out.push(SURFACE_END);
  return out.join("\n");
}

export function withSurface(readme: string, section: string): string {
  const start = readme.indexOf("<!-- surface:start");
  const end = readme.indexOf(SURFACE_END);
  if (start !== -1 && end !== -1) return readme.slice(0, start) + section + readme.slice(end + SURFACE_END.length);
  const anchor = readme.indexOf("\n## Twenty");
  if (anchor === -1) return `${readme.trimEnd()}\n\n${section}\n`;
  return `${readme.slice(0, anchor)}\n${section}\n${readme.slice(anchor)}`;
}
