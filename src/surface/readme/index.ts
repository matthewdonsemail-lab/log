/**
 * The README's generated section (rule 56): every command with its flags, its
 * MCP tool and the hooks that fire on it, the saved flows, the hooks, and the
 * diagrams, between `<!-- surface:start -->` and `<!-- surface:end -->`.
 * `bun run docs:build` writes it; `bun run check:docs` refuses a README that
 * differs from it. Pure.
 */
import { AGENT_HOOKS } from "../../agentHooks/registry/index.ts";
import type { AgentHook } from "../../agentHooks/registry/index.ts";
import { GLOBAL_FLAGS, sessionHooks } from "../catalog/index.ts";
import type { CommandEntry, Flag, FlowEntry } from "../catalog/index.ts";
import type { Diagram } from "../diagrams/index.ts";

export const SURFACE_START = "<!-- surface:start · written by `bun run docs:build` from the code. Not edited by hand. -->";
export const SURFACE_END = "<!-- surface:end -->";

/** Text safe in a Markdown table cell. Pure. */
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

const flagText = (f: Flag) => `\`--${f.name}${f.value ? ` <${f.value}>` : ""}\``;

/** The diagram in the README and where its source lives. Pure. */
function diagramBlock(d: Diagram): string[] {
  return [`### ${d.title}`, "", d.about, "", "```mermaid", d.mermaid, "```", "", `Source: [\`docs/diagrams/${d.name}.mmd\`](docs/diagrams/${d.name}.mmd).`, ""];
}

function hookRow(h: AgentHook): string {
  return `| ${h.event} | ${h.matcher ? `\`${cell(h.matcher)}\`` : "every turn"} | [\`${h.script}\`](${h.script}) | ${cell(h.why)} |`;
}

/** The generated section, markers included. Pure. */
export function renderSurface(entries: readonly CommandEntry[], flows: readonly FlowEntry[], diagrams: readonly Diagram[], hooks: readonly AgentHook[] = AGENT_HOOKS): string {
  const byName = new Map(diagrams.map((d) => [d.name, d]));
  const pick = (name: string) => byName.get(name);
  const out: string[] = [
    SURFACE_START,
    "## Commands, MCP tools and hooks",
    "",
    "Every command is a CLI command (`bun bin/log.ts <command>`) and, unless it only works in a terminal, an MCP tool of the same name on the `log` server.",
    "The same hooks fire whether it runs from a shell or over MCP, and both write the same live log, `~/.logCli/mcp/<day>.log`.",
    "This section and `docs/diagrams/*.mmd` are generated from the code (`COMMANDS`, `AGENT_HOOKS`, `PAGE_STATES`, the saved flows) by `bun run docs:build`.",
    "`bun run check:docs` (lefthook pre-commit and pre-push) refuses a commit where they differ (rule 56).",
    "",
  ];
  const surface = pick("surface");
  if (surface) out.push(...diagramBlock(surface));

  out.push(
    "### Every command",
    "",
    `Every command also takes ${GLOBAL_FLAGS.map(flagText).join(", ")} (this run's proxy speed limit, rule 33). \`--live\` acts on Facebook and over MCP needs \`confirmLive: true\`; \`--bypass\` needs \`confirmBypass: true\` (rules 8, 10, 20).`,
    "",
    "| Command | What it does | Flags | MCP tool | Hooks: shell · MCP | Live log | Rules |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  );
  for (const e of entries) {
    const tool = e.tool ? `\`${e.tool}\`` : `terminal only: ${cell(e.terminalOnly ?? "")}`;
    const hooksText = `${e.hooks.cli.join(", ") || "none"} · ${e.tool ? e.hooks.mcp.join(", ") || "none" : "n/a"}`;
    out.push(`| [\`log ${e.name}\`](#log-${e.name.toLowerCase()}) | ${cell(e.summary)} | ${e.flags.map(flagText).join(" ") || "none"} | ${tool} | ${hooksText} | ${e.longRunning ? "yes: watch it" : "no"} | ${e.rules.join(", ")} |`);
  }
  out.push("");

  if (flows.length) {
    out.push("### Saved flows: MCP tools of their own (rule 31)", "", "| MCP tool | Runs | What it does | Params | Steps |", "| --- | --- | --- | --- | --- |");
    for (const f of flows) out.push(`| \`${f.tool}\` | \`log flow run ${f.name}\` | ${cell(f.summary)} | ${f.params.map((p) => `\`${p}\``).join(", ") || "none"} | ${cell(f.steps.join(" → "))} |`);
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
    out.push(`#### log ${e.name}`, "", e.summary + (e.tool ? ` MCP tool: \`${e.tool}\` (\`args\` takes the same arguments).` : ` Terminal only: ${e.terminalOnly}`), "", "```text", ...e.usage, "```", "");
  }
  out.push(SURFACE_END);
  return out.join("\n");
}

/** `readme` with its generated section replaced, or inserted before `## Twenty` the first time. Pure. */
export function withSurface(readme: string, section: string): string {
  const start = readme.indexOf("<!-- surface:start");
  const end = readme.indexOf(SURFACE_END);
  if (start !== -1 && end !== -1) return readme.slice(0, start) + section + readme.slice(end + SURFACE_END.length);
  const anchor = readme.indexOf("\n## Twenty");
  if (anchor === -1) return `${readme.trimEnd()}\n\n${section}\n`;
  return `${readme.slice(0, anchor)}\n${section}\n${readme.slice(anchor)}`;
}
