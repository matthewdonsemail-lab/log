import { AGENT_HOOKS } from "../../agentHooks/registry/index.ts";
import type { AgentHook } from "../../agentHooks/registry/index.ts";
import { BROWSER_DRIVERS } from "../../browser/driver/types.ts";
import { PAGE_STATES } from "../../browser/flow/helpers/pageState.ts";
import { PLATFORM_LABELS, PLATFORM_SITES, PLATFORMS } from "../../cli/runner/helpers/platforms.ts";
import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import { DIRECT_ROUTES } from "../../directApi/engine/index.ts";
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

export const shown = (e: CommandEntry) => e.words;

const names = (list: readonly CommandEntry[]) => list.map(shown).join(", ");

export const countOf = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function platformLibraries(platform: string): string[] {
  return [...new Set(Object.values(DIRECT_ROUTES).filter((r) => r.platform === platform).map((r) => r.library))];
}

export function directLibraries(): string[] {
  return [...new Set(Object.values(DIRECT_ROUTES).map((r) => r.library))];
}

const proxyText = (p: Platform) => (PLATFORM_SITES[p].proxy === "required" ? "its proxy in the account's home country (rule 12)" : "no proxy: this machine's own exit, the profile's timezone follows it (rule 84)");

const isDirect = (e: CommandEntry) => e.engine === "directApiFirst" || e.engine === "directApiOnly";

export function platformsDiagram(entries: readonly CommandEntry[]): Diagram {
  const anyBrowser = entries.filter((e) => e.platform === "any" && e.browser === "accountBrowser");
  const anyNone = entries.filter((e) => e.platform === "any" && e.browser === "none");
  const lines = [
    "flowchart LR",
    `  twenty[("Twenty socialAccounts: one row per account, its platform, session and proxy")]`,
    `  api["The platform's internal API: its own answer decides (rule 73)"]`,
    `  drivers["The account's browser: AdsPower or Camoufox, through the driver (The browser layer)"]`,
  ];
  for (const p of PLATFORMS) {
    const own = entries.filter((e) => e.platform === p || (e.platform === "byArgument" && p === PLATFORMS[0]));
    lines.push(`  p_${p}["${label(`${PLATFORM_LABELS[p]} (${PLATFORM_SITES[p].twenty}): ${countOf(entries.filter((e) => e.platform === p).length, "command")} of its own`)}"]`, `  twenty --> p_${p}`);
    for (const lib of platformLibraries(p)) {
      lines.push(`  p_${p} -->|"${label(`direct API: ${names(own.filter(isDirect))}`)}"| e_${lib}["${label(`${lib} (vendor/${lib}): the saved session, a governor per account`)}"]`, `  e_${lib} --> api`);
    }
    if (PLATFORM_SITES[p].browser) {
      const via = own.filter((e) => e.browser !== "none" && e.engine !== "directApiOnly");
      lines.push(`  p_${p} -->|"${label(via.length ? `browser: ${names(via)}` : "browser: the any-platform commands")}"| b_${p}["${label(`${PLATFORM_LABELS[p]}'s browser path: ${proxyText(p)}`)}"]`, `  b_${p} --> drivers`);
    } else lines.push(`  p_${p} -.->|"no browser path (rule 80)"| nob_${p}["${label(`${PLATFORM_LABELS[p]} runs on its direct API only`)}"]`);
  }
  lines.push(`  anyB["${label(`Any platform with a browser path: ${names(anyBrowser)}`)}"]`, ...PLATFORMS.filter((p) => PLATFORM_SITES[p].browser).map((p) => `  anyB --> b_${p}`));
  lines.push(`  anyN["${label(`Any platform, no browser: ${names(anyNone)}`)}"]`, "  anyN -.-> twenty");
  lines.push(`  newP["log new platform name: one more platform, wired whole (rule 83)"] -.-> twenty`, "  drivers --> api");
  return {
    name: "platforms",
    title: "The platforms",
    about: "log-cli is platform-agnostic: each platform is a row in `PLATFORMS` and `PLATFORM_SITES` (`src/cli/runner/helpers/platforms.ts`), with its direct-API client from `DIRECT_ROUTES` (`src/directApi/engine`) and its browser path, with or without a proxy. A new one is made by `log new platform <name>` (rule 83).",
    mermaid: lines.join("\n"),
  };
}

export function surfaceDiagram(entries: readonly CommandEntry[], hooks: readonly AgentHook[] = AGENT_HOOKS): Diagram {
  const pre = hooks.filter((h) => h.event === "PreToolUse");
  const post = hooks.filter((h) => h.event === "PostToolUse");
  const turn = hooks.filter((h) => h.event !== "PreToolUse" && h.event !== "PostToolUse");
  const tools = entries.reduce((n, e) => n + (e.tool ? e.tool.split(", ").length : 0), 0);
  const lines = [
    "flowchart LR",
    `  agent["Agent (Claude Code, Codex)"]`,
    `  matt["matt, in a terminal"]`,
    `  shell["Bash / PowerShell / Monitor"]`,
    `  mcp["MCP server log: ${tools} command tools + saved flows"]`,
    `  bin["bin/log.ts"]`,
    `  runCli["runCli: ${entries.length} commands (COMMANDS)"]`,
    `  live[("~/.logCli/mcp/day.log: the live log")]`,
    `  engine{"commandEngine: DIRECT_ROUTES"}`,
    `  direct["${label(`Direct-API engine: ${directLibraries().join(", ")} (vendor/), the account's saved session, a governor per account`)}"]`,
    `  browser["The account's browser (one per day, rule 35)"]`,
    `  api["The platform's internal API: its answer decides (rule 73)"]`,
    `  twenty[("Twenty: socialAccounts.sessionState, refreshed cookies")]`,
    "  agent --> shell",
    "  matt --> bin",
    "  shell --> bin",
    "  agent -->|mcp__log__tool| mcp",
    "  bin --> runCli",
    "  mcp -->|runToolCall| runCli",
    "  runCli --> engine",
    "  engine -->|direct API| direct",
    "  engine -->|browser| browser",
    "  direct --> api",
    "  browser --> api",
    "  direct --> twenty",
    "  bin -->|cli:command lines| live",
    "  mcp -->|tool lines| live",
    "  live -.->|tail -f, under Monitor| agent",
    ...pre.map((h, i) => `  pre${i}{{"PreToolUse: ${label(scriptName(h))}"}} -.->|before| shell`),
    ...post.map((h, i) => `  post${i}{{"PostToolUse: ${label(scriptName(h))}"}} -.->|after| agent`),
    ...turn.map((h, i) => `  turn${i}{{"${h.event}: ${label(scriptName(h))}"}} -.-> agent`),
    "  browser -.->|each step's snapshot| post0",
  ];
  return { name: "surface", title: "How a call reaches log-cli", about: "From a shell or over MCP, both run the same commands through `runCli`, write the same live log, and pass through the same hooks. `commandEngine` sends each command to the platform's direct API or to the account's browser.", mermaid: lines.join("\n") };
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
    else if (s.needsNothing) lines.push(`  ${s.id} -->|"nothing to resolve"| next${s.id}(["carry on"])`);
    else lines.push(`  ${s.id} -->|"${label(resolverStep(s.resolve))}"| next${s.id}(["next state"])`);
  }
  return { name: "pageStates", title: "Known page states (rule 54)", about: "From `PAGE_STATES` (`src/browser/flow/helpers/pageState.ts`), first match wins. The hooks report each with its resolver; only a person's state stops the account.", mermaid: lines.join("\n") };
}

const GROUPS: readonly { id: string; title: string; of: (e: CommandEntry) => boolean }[] = [
  { id: "any", title: "Any platform", of: (e) => e.platform === "any" },
  { id: "byArgument", title: "Platform named first", of: (e) => e.platform === "byArgument" },
  ...PLATFORMS.map((p) => ({ id: p, title: PLATFORM_LABELS[p], of: (e: CommandEntry) => e.platform === p })),
];

export function commandsDiagram(entries: readonly CommandEntry[], flows: readonly FlowEntry[]): Diagram {
  const lines = ["flowchart TB", `  cli["log (CLI)"]`, `  mcp["MCP server log"]`, `  live[("live log")]`, `  terminal["terminal only"]`];
  for (const g of GROUPS) {
    const members = entries.filter(g.of);
    if (!members.length) continue;
    lines.push(`  subgraph g_${g.id}["${label(g.title)}"]`, ...members.map((e) => `    c_${e.key}["${label((PLATFORMS as readonly string[]).includes(g.id) ? e.name : shown(e))}"]`), "  end");
  }
  for (const e of entries) {
    lines.push(`  cli --> c_${e.key}`);
    if (e.tool) lines.push(`  mcp --> c_${e.key}`);
    else lines.push(`  c_${e.key} -.- terminal`);
    if (e.longRunning) lines.push(`  c_${e.key} --> live`);
  }
  for (const f of flows) {
    lines.push(`  f_${f.name}["${f.tool}: flow run ${f.name}"]`);
    lines.push(`  mcp --> f_${f.name}`, `  f_${f.name} --> c_flow`);
  }
  return { name: "commands", title: "Every command, CLI and MCP", about: "Each command is a CLI command and, unless terminal-only, an MCP tool; the long-running ones write the live log. Grouped by platform: a platform's command is `log <platform> <command>` (rule 63). Saved flows are MCP tools that run `log flow run`.", mermaid: lines.join("\n") };
}

export function browsersDiagram(entries: readonly CommandEntry[]): Diagram {
  const on = (kind: CommandEntry["browser"]) => names(entries.filter((e) => e.browser === kind));
  const proxied = PLATFORMS.filter((p) => PLATFORM_SITES[p].browser && PLATFORM_SITES[p].proxy === "required").map((p) => PLATFORM_LABELS[p]);
  const open = PLATFORMS.filter((p) => PLATFORM_SITES[p].browser && PLATFORM_SITES[p].proxy === "none").map((p) => PLATFORM_LABELS[p]);
  const without = PLATFORMS.filter((p) => !PLATFORM_SITES[p].browser).map((p) => PLATFORM_LABELS[p]);
  const lines = [
    "flowchart LR",
    `  twenty["Twenty socialAccounts: platform, browserDriver, adsPowerProfileId"]`,
    `  pick{"driverNameOf"}`,
    `  gates["${label(`Every driver: the proxy gate (${proxied.join(", ")}: a proxy in the home country, rule 12. ${open.join(", ")}: no proxy, rule 84), self-check, HAR, human mouse (rules 17, 22, 32)`)}"]`,
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
    ...(without.length ? [`  nobrowser["${label(`No browser path: ${without.join(", ")} (direct API only, rule 80)`)}"] -.-x pick`] : []),
  ];
  return { name: "browsers", title: "The browser layer", about: "log-cli is browser-agnostic: each account's browser is a driver picked from Twenty, AdsPower first, and every driver opens through the same gates. Whether the gate needs a proxy is the platform's (`PLATFORM_SITES`). From `BROWSER_DRIVERS` (`src/browser/driver`) and `commandBrowser` (`src/browser/run`).", mermaid: lines.join("\n") };
}

export function diagrams(entries: readonly CommandEntry[], flows: readonly FlowEntry[]): Diagram[] {
  return [platformsDiagram(entries), browsersDiagram(entries), surfaceDiagram(entries), commandsDiagram(entries, flows), hooksDiagram(), pageStatesDiagram()];
}
