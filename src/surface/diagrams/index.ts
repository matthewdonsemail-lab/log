/**
 * The Mermaid diagrams of log-cli's surface (rule 56), generated from the
 * catalog, the hook registry and the page states, so they change when the
 * code does. Each is written to `docs/diagrams/<name>.mmd` and shown in the
 * README. Pure.
 */
import { AGENT_HOOKS } from "../../agentHooks/registry/index.ts";
import type { AgentHook } from "../../agentHooks/registry/index.ts";
import { PAGE_STATES } from "../../browser/flow/helpers/pageState.ts";
import type { CommandEntry, FlowEntry } from "../catalog/index.ts";

/** One diagram: its file name under `docs/diagrams/`, a title, what it shows, and its Mermaid source. */
export interface Diagram {
  name: string;
  title: string;
  about: string;
  mermaid: string;
}

/** A label Mermaid can hold in quotes. Pure. */
export function label(text: string): string {
  return text.replace(/"/g, "#quot;").replace(/[<>]/g, (c) => (c === "<" ? "#lt;" : "#gt;"));
}

const scriptName = (hook: AgentHook) => hook.script.split("/").pop() ?? hook.script;

/** How a call reaches log-cli, from a shell or over MCP, and where the hooks and the live log sit. Pure. */
export function surfaceDiagram(entries: readonly CommandEntry[], hooks: readonly AgentHook[] = AGENT_HOOKS): Diagram {
  const pre = hooks.filter((h) => h.event === "PreToolUse");
  const post = hooks.filter((h) => h.event === "PostToolUse");
  const turn = hooks.filter((h) => h.event !== "PreToolUse" && h.event !== "PostToolUse");
  const tools = entries.filter((e) => e.tool).length;
  const lines = [
    "flowchart LR",
    `  agent["Agent (Claude Code, Codex)"]`,
    `  matt["matt, in a terminal"]`,
    `  shell["Bash / PowerShell / Monitor"]`,
    `  mcp["MCP server log: ${tools} command tools + saved flows"]`,
    `  bin["bin/log.ts"]`,
    `  runCli["runCli: ${entries.length} commands (COMMANDS)"]`,
    `  live[("~/.logCli/mcp/day.log: the live log")]`,
    `  browser["The account's browser (one per day, rule 35)"]`,
    "  agent --> shell",
    "  matt --> bin",
    "  shell --> bin",
    "  agent -->|mcp__log__tool| mcp",
    "  bin --> runCli",
    "  mcp -->|runToolCall| runCli",
    "  runCli --> browser",
    "  bin -->|cli:command lines| live",
    "  mcp -->|tool lines| live",
    "  live -.->|tail -f, under Monitor| agent",
    ...pre.map((h, i) => `  pre${i}{{"PreToolUse: ${label(scriptName(h))}"}} -.->|before| shell`),
    ...post.map((h, i) => `  post${i}{{"PostToolUse: ${label(scriptName(h))}"}} -.->|after| agent`),
    ...turn.map((h, i) => `  turn${i}{{"${h.event}: ${label(scriptName(h))}"}} -.-> agent`),
    "  browser -.->|each step's snapshot| post0",
  ];
  return { name: "surface", title: "How a call reaches log-cli", about: "From a shell or over MCP, both run the same commands through `runCli`, write the same live log, and pass through the same hooks.", mermaid: lines.join("\n") };
}

/** One agent turn and where each hook fires, with what it does. Pure. */
export function hooksDiagram(hooks: readonly AgentHook[] = AGENT_HOOKS): Diagram {
  const by = (event: string) => hooks.filter((h) => h.event === event);
  const note = (event: string) => by(event).map((h) => `  Note over Hook: ${label(h.why)}`);
  const lines = [
    "sequenceDiagram",
    "  participant matt",
    "  participant Agent",
    "  participant Hook as log-cli hooks",
    "  participant Tool as Bash / PowerShell / Monitor / mcp__log__*",
    "  Agent->>Hook: SessionStart",
    ...note("SessionStart"),
    "  matt->>Agent: a prompt",
    "  Agent->>Hook: UserPromptSubmit",
    ...note("UserPromptSubmit"),
    "  loop each tool call",
    "    Agent->>Hook: PreToolUse",
    ...note("PreToolUse").map((l) => `  ${l}`),
    "    alt a log run piped through tail/head",
    "      Hook-->>Agent: refused (exit 2), run it live",
    "    else",
    "      Agent->>Tool: the call",
    "      Tool-->>Agent: its result",
    "      Agent->>Hook: PostToolUse",
    ...note("PostToolUse").map((l) => `  ${l}`),
    "    end",
    "  end",
    "  Agent->>Hook: Stop",
    ...note("Stop"),
    "  alt a browser sits on a state log-cli clears",
    "    Hook-->>Agent: decision block, with the state's resolver",
    "  else nothing to clear, or a person's state",
    "    Agent-->>matt: the answer",
    "  end",
  ];
  return { name: "hooks", title: "The hooks in one turn", about: "Written from `AGENT_HOOKS` (`src/agentHooks/registry`); the same list gives Claude Code's `.claude/settings.json` and Codex's `.codex/hooks.json`.", mermaid: lines.join("\n") };
}

/** A resolver's step, short enough for an edge: up to its first explanation (` (`, `: `, `, then`). Pure. */
export function resolverStep(resolve: string): string {
  const plain = resolve.replace(/`/g, "");
  const cut = [" (", ": ", ", then"].map((s) => plain.indexOf(s)).filter((i) => i > 0);
  return cut.length ? plain.slice(0, Math.min(...cut)) : plain;
}

/** Every known page state and what clears it: log-cli itself, or a person. Pure. */
export function pageStatesDiagram(): Diagram {
  const lines = ["flowchart LR", `  page["A step lands on a page"]`, `  person["Stop the account, tell matt"]`];
  for (const s of PAGE_STATES) {
    lines.push(`  ${s.id}["${label(s.id)}: ${label(s.what)}"]`);
    lines.push(`  page --> ${s.id}`);
    if (s.person) lines.push(`  ${s.id} --> person`);
    else lines.push(`  ${s.id} -->|"${label(resolverStep(s.resolve))}"| next${s.id}(["next state"])`);
  }
  return { name: "pageStates", title: "Known page states (rule 54)", about: "From `PAGE_STATES` (`src/browser/flow/helpers/pageState.ts`), first match wins. The hooks report each with its resolver; only a person's state stops the account.", mermaid: lines.join("\n") };
}

/** Every command by how it is reached: an MCP tool, watched on the live log, or terminal-only; and the saved flows. Pure. */
export function commandsDiagram(entries: readonly CommandEntry[], flows: readonly FlowEntry[]): Diagram {
  const lines = ["flowchart TB", `  cli["log (CLI)"]`, `  mcp["MCP server log"]`, `  live[("live log")]`, `  terminal["terminal only"]`];
  for (const e of entries) {
    lines.push(`  c_${e.name}["${e.name}"]`);
    lines.push(`  cli --> c_${e.name}`);
    if (e.tool) lines.push(`  mcp --> c_${e.name}`);
    else lines.push(`  c_${e.name} -.- terminal`);
    if (e.longRunning) lines.push(`  c_${e.name} --> live`);
  }
  for (const f of flows) {
    lines.push(`  f_${f.name}["${f.tool}: flow run ${f.name}"]`);
    lines.push(`  mcp --> f_${f.name}`, `  f_${f.name} --> c_flow`);
  }
  return { name: "commands", title: "Every command, CLI and MCP", about: "Each command is a CLI command and, unless terminal-only, an MCP tool of the same name; the long-running ones write the live log. Saved flows are MCP tools that run `log flow run`.", mermaid: lines.join("\n") };
}

/** Every diagram, in the README's order. Pure. */
export function diagrams(entries: readonly CommandEntry[], flows: readonly FlowEntry[]): Diagram[] {
  return [surfaceDiagram(entries), commandsDiagram(entries, flows), hooksDiagram(), pageStatesDiagram()];
}
