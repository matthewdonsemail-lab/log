import { AGENT_HOOKS } from "../../agentHooks/registry/index.ts";
import type { AgentHook } from "../../agentHooks/registry/index.ts";
import { BROWSER_DRIVERS } from "../../browser/driver/types.ts";
import { PAGE_STATES } from "../../browser/flow/helpers/pageState.ts";
import type { CommandEntry, FlowEntry } from "../catalog/index.ts";

export interface Diagram {
  name: string;
  title: string;
  about: string;
  mermaid: string;
}

export function label(text: string): string {
  return text.replace(/;/g, "#59;").replace(/"/g, "#quot;").replace(/[<>]/g, (c) => (c === "<" ? "#lt;" : "#gt;"));
}

const scriptName = (hook: AgentHook) => hook.script.split("/").pop() ?? hook.script;

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

export function resolverStep(resolve: string): string {
  const plain = resolve.replace(/`/g, "");
  const cut = [" (", ": ", ", then"].map((s) => plain.indexOf(s)).filter((i) => i > 0);
  return cut.length ? plain.slice(0, Math.min(...cut)) : plain;
}

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

export function browsersDiagram(entries: readonly CommandEntry[]): Diagram {
  const on = (kind: CommandEntry["browser"]) => entries.filter((e) => e.browser === kind).map((e) => e.name).join(", ");
  const lines = [
    "flowchart LR",
    `  twenty["Twenty socialAccounts: browserDriver, adsPowerProfileId"]`,
    `  pick{"driverNameOf"}`,
    `  gates["Every driver: proxy gate, self-check, HAR, human mouse (rules 12, 17, 22, 32)"]`,
    `  session["One Playwright context: python/browser/browserDriver.py"]`,
    "  twenty --> pick",
    ...BROWSER_DRIVERS.map((d) => `  pick -->|"${label(d === "adsPower" ? "a linked profile, or browserDriver adsPower" : "browserDriver camoufox, or no profile")}"| d_${d}["${label(d)}"]`),
    ...BROWSER_DRIVERS.map((d) => `  d_${d} --> gates`),
    `  more["Next browser provider: one more driver (src/browser/name), rule 44"] -.-> gates`,
    "  gates --> session",
    `  account["On the account's browser: ${label(on("accountBrowser"))}"]`,
    `  camoufox["Camoufox only, not on the driver yet: ${label(on("camoufoxOnly"))}"]`,
    "  session --> account",
    `  camoufox -.->|"launches Camoufox itself"| d_camoufox`,
  ];
  return { name: "browsers", title: "The browser layer", about: "log-cli is browser-agnostic: each account's browser is a driver picked from Twenty, AdsPower first, and every driver opens through the same gates. From `BROWSER_DRIVERS` (`src/browser/driver`) and `commandBrowser` (`src/browser/run`).", mermaid: lines.join("\n") };
}

export function diagrams(entries: readonly CommandEntry[], flows: readonly FlowEntry[]): Diagram[] {
  return [browsersDiagram(entries), surfaceDiagram(entries), commandsDiagram(entries, flows), hooksDiagram(), pageStatesDiagram()];
}
