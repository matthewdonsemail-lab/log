import { serviceHookCommand } from "../../contextLayer/service/client.ts";
import { CONTEXT_PORT } from "../../contextLayer/service/types.ts";
import { HARNESS_TABLE_START, withHarnessTable } from "../harness/client.ts";
import type { AgentHook, HookEvent, HookFile } from "./types.ts";

export const HARNESS_README = "docs/harnesses/README.md";

export type { AgentHook, HookEvent, HookFile, HookHost } from "./types.ts";

export const MCP_SERVER_NAME = "log";

export const TOOL_MATCHER = `Bash|PowerShell|Monitor|mcp__${MCP_SERVER_NAME}__.*`;

export const SHELL_MATCHER = "Bash|PowerShell|Monitor";

const PAGE_STATE = "scripts/hooks/pageState.ts";
const LIVE_LOGS = "scripts/hooks/liveLogs.ts";
const STORAGE = "scripts/hooks/storage.ts";
const ENGINES = "scripts/hooks/engines.ts";
const INBOX = "scripts/hooks/inbox.ts";
const KNOWLEDGE = "scripts/hooks/knowledge.ts";
const QUEUE = "scripts/hooks/queue.ts";
const X_LIVE = "scripts/hooks/xLive.ts";
const CHAT_NAMES = "scripts/hooks/chatNames.ts";
const USE_CASES = "scripts/hooks/useCases.ts";
export const EVENT_SCRIPT = "scripts/hooks/event.ts";

export const AGENT_HOOKS: readonly AgentHook[] = [
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: PAGE_STATE, timeout: 20, why: "where every open browser is, the moment a session starts or comes back from compaction" },
  { event: "UserPromptSubmit", script: PAGE_STATE, timeout: 20, why: "where every open browser is, with each of the owner's prompts" },
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: STORAGE, timeout: 30, why: "~/.logCli/runs over 2 GB or the disk nearly full: said with `log runs prune` before AdsPower refuses to start" },
  { event: "UserPromptSubmit", script: STORAGE, timeout: 30, why: "the same storage check with each of the owner's prompts (measured at most every 15 minutes)" },
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: ENGINES, timeout: 10, why: "which commands run on the direct-API engine (from DIRECT_ROUTES) and each account's session state and governor use, so a session coming back from compaction knows the engines; and, loudly, when the log MCP server runs older code than the checkout, and which code files have uncommitted local changes (rule 163)" },
  { event: "UserPromptSubmit", script: ENGINES, timeout: 10, why: "the same engine line with the owner's prompt, only when an account's session state, its governor use or the MCP server's freshness changed" },
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: KNOWLEDGE, timeout: 10, why: "the knowledge base is there and how to search it and save to it, with how many chunks Redis holds, so a session looks things up before it guesses" },
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: INBOX, timeout: 15, why: "anyone who wrote to a signed-in account's inbox since the last look (every platform's inbox, incl. X Chat, read in the background every 4 to 8 minutes, and what each account's live watcher pushed: X Chat's socket, Discord's gateway, Slack's websocket in every workspace, rule 123), said loudly so a reply is never missed; and, from each X account's local inbox store with no network, who wrote last and is waiting on a reply" },
  { event: "UserPromptSubmit", script: INBOX, timeout: 15, why: "the same inbox check with each of the owner's prompts: a poll starts when one is due, and new messages from the last poll are put in front of the agent" },
  { event: "PostToolUse", matcher: TOOL_MATCHER, script: INBOX, timeout: 15, why: "the same inbox check after a log tool or shell call, so a reply that lands mid-task is said at once" },
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: QUEUE, timeout: 10, why: "what every account's queue did since the last look (held, sent, cooling off, stopped), so a queue is never running out of the agent's sight (rule 109)" },
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: USE_CASES, timeout: 10, why: "the play this session loaded, read from its own transcript, put back with the step it reached when the session comes back from compaction or resumes, and the context layer service started (rule 158)" },
  { event: "UserPromptSubmit", script: USE_CASES, service: "/hook", timeout: 10, why: "the play the owner's prompt asks for, matched against every use case's own \"How the owner asks for it\" phrases and title, named with getGuide to load it before anything is done (rule 158)" },
  { event: "UserPromptSubmit", script: QUEUE, timeout: 10, why: "the same queue events with each of the owner's prompts" },
  { event: "PostToolUse", matcher: TOOL_MATCHER, script: QUEUE, timeout: 10, why: "the same queue events after a log tool or shell call, so a held item or a cool-off is acted on at once" },
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: X_LIVE, timeout: 10, why: "what X's own client shows on each X account right now (its unread notifications, DMs and X Chat, read through the account's one session the way x.com polls it), and every new like, retweet, reply, quote, mention or follow since this Claude session last looked (rule 109)" },
  { event: "UserPromptSubmit", script: X_LIVE, timeout: 10, why: "the same X live state with each of the owner's prompts, only what is new for this session" },
  { event: "PostToolUse", matcher: TOOL_MATCHER, script: X_LIVE, timeout: 10, why: "the same X live state after a log tool or shell call, so a reply on a post is answered mid-task" },
  { event: "PreToolUse", matcher: `mcp__${MCP_SERVER_NAME}__(discord|slack|instagram).*`, script: CHAT_NAMES, timeout: 10, why: "a Discord, Slack or Instagram call that names its chat by a bare id is refused and told to pass the name (a person, a group, or \"<server> #<channel>\"), so the owner sees where every call goes (rule 154)" },
  { event: "PreToolUse", matcher: SHELL_MATCHER, script: LIVE_LOGS, timeout: 10, why: "a log-cli run that would hide its lines (piped through tail or head) is refused before it starts; a long one off a Monitor is told to start one (rule 26); any log action run by hand from a shell is refused and pointed at its MCP tool (rule 163)" },
  { event: "PostToolUse", matcher: TOOL_MATCHER, script: PAGE_STATE, timeout: 20, why: "a browser landed on a known state (checkpoint, captcha, prompt) or a step failed: its resolver, at once" },
  { event: "Stop", script: PAGE_STATE, timeout: 20, why: "the turn does not end while a browser sits on a state log-cli can resolve (rule 35)" },
];

export type CommandHost = "claudeCode" | "codex";

export function hookCommand(host: CommandHost, script: string, service?: string): string {
  const bun = host === "claudeCode" ? `bun "$CLAUDE_PROJECT_DIR/${script}"` : `bun "$(git rev-parse --show-toplevel)/${script}" --host ${host}`;
  return service ? serviceHookCommand(host === "claudeCode" ? service : `${service}?host=${host}`, bun) : bun;
}

export const HOOK_SERVICE_URL = `http://127.0.0.1:${CONTEXT_PORT}/hooks`;

const SERVED_EVENTS: readonly HookEvent[] = ["UserPromptSubmit", "PostToolUse", "Stop"];

const REFUSING: readonly string[] = [CHAT_NAMES, LIVE_LOGS];

function execHook(script: string, timeout: number, extra: string[] = []): Record<string, unknown> {
  return { type: "command", command: "bun", args: [`\${CLAUDE_PROJECT_DIR}/${script}`, ...extra], timeout };
}

export function joinedMatcher(hooks: readonly AgentHook[]): string | undefined {
  if (hooks.some((h) => !h.matcher)) return undefined;
  return [...new Set(hooks.flatMap((h) => (h.matcher as string).split("|")))].join("|");
}

export function claudeCodeHooks(hooks: readonly AgentHook[]): Record<string, unknown[]> {
  const out: Record<string, unknown[]> = {};
  const byEvent = new Map<HookEvent, AgentHook[]>();
  for (const hook of hooks) byEvent.set(hook.event, [...(byEvent.get(hook.event) ?? []), hook]);
  for (const [event, list] of byEvent) {
    const refusing = list.filter((h) => REFUSING.includes(h.script));
    const rest = list.filter((h) => !REFUSING.includes(h.script));
    for (const hook of refusing) (out[event] ??= []).push({ ...(hook.matcher ? { matcher: hook.matcher } : {}), hooks: [execHook(hook.script, hook.timeout)] });
    if (!rest.length) continue;
    const matcher = joinedMatcher(rest);
    const timeout = Math.max(...rest.map((h) => h.timeout));
    const handler = SERVED_EVENTS.includes(event) ? { type: "http", url: `${HOOK_SERVICE_URL}/${event}`, timeout } : execHook(EVENT_SCRIPT, timeout, [event]);
    (out[event] ??= []).push({ ...(matcher ? { matcher } : {}), hooks: [handler] });
  }
  return out;
}

export function hooksFor(host: CommandHost, hooks: readonly AgentHook[] = AGENT_HOOKS): Record<string, unknown[]> {
  if (host === "claudeCode") return claudeCodeHooks(hooks);
  const out: Record<string, unknown[]> = {};
  for (const hook of hooks) {
    const group = { ...(hook.matcher ? { matcher: hook.matcher } : {}), hooks: [{ type: "command", command: hookCommand(host, hook.script, hook.service), timeout: hook.timeout }] };
    (out[hook.event] ??= []).push(group);
  }
  return out;
}

const CURSOR_EVENTS: Readonly<Partial<Record<HookEvent, string>>> = { SessionStart: "sessionStart", PostToolUse: "postToolUse" };

export function cursorHooks(hooks: readonly AgentHook[] = AGENT_HOOKS): Record<string, unknown> {
  const out: Record<string, unknown[]> = {};
  for (const [event, name] of Object.entries(CURSOR_EVENTS) as [HookEvent, string][]) {
    const answering = hooks.filter((h) => h.event === event && !REFUSING.includes(h.script));
    if (answering.length) out[name] = [{ command: `bun ${EVENT_SCRIPT} ${event} --host cursor` }];
  }
  return { version: 1, hooks: out };
}

export const ANTIGRAVITY_SCRIPT = "scripts/hooks/antigravity.ts";

const ANTIGRAVITY_EVENTS: readonly [HookEvent, string][] = [
  ["SessionStart", "SessionStart"],
  ["UserPromptSubmit", "PreInvocation"],
  ["PreToolUse", "PreToolUse"],
  ["PostToolUse", "PostToolUse"],
  ["Stop", "Stop"],
];

const ANTIGRAVITY_TOOLS = `run_command|mcp__${MCP_SERVER_NAME}__.*`;

export function antigravityHooks(hooks: readonly AgentHook[] = AGENT_HOOKS): Record<string, unknown> {
  const out: Record<string, unknown[]> = {};
  for (const [event, name] of ANTIGRAVITY_EVENTS) {
    if (!hooks.some((h) => h.event === event)) continue;
    const tool = event === "PreToolUse" || event === "PostToolUse";
    out[name] = [{ ...(tool ? { matcher: ANTIGRAVITY_TOOLS } : {}), hooks: [{ type: "command", command: `bun ${ANTIGRAVITY_SCRIPT} ${name}`, timeout: 30 }] }];
  }
  return { "log-hooks": out };
}

export const HERMES_PLUGIN_NAME = "logHooks";

export const HERMES_PLUGIN_DIR = "hermesPlugin/native";

export function hermesPluginYaml(version: string): string {
  return [
    `name: ${HERMES_PLUGIN_NAME}`,
    `version: ${version}`,
    `description: "log's hooks for Hermes. Before each model call, pre_llm_call puts the play the prompt asks for, pending inbox messages and browser states in front of the model. Written from src/agentHooks/registry (bun run check:agentHooks --write)."`,
    "provides_hooks:",
    "  - pre_llm_call",
    "",
  ].join("\n");
}

function parsedOrNull(text: string | null): Record<string, unknown> | null {
  if (text === null) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const jsonText = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

function hooksKeyFile(path: string, wanted: Record<string, unknown[]>, header: Record<string, unknown> = {}): HookFile {
  return {
    path,
    format: "json",
    same: (current) => JSON.stringify(parsedOrNull(current)?.hooks ?? null) === JSON.stringify(wanted),
    wanted: (current) => jsonText({ ...header, ...(parsedOrNull(current) ?? {}), hooks: wanted }),
  };
}

function wholeFile(path: string, wanted: Record<string, unknown>): HookFile {
  return { path, format: "json", same: (current) => JSON.stringify(parsedOrNull(current)) === JSON.stringify(wanted), wanted: () => jsonText(wanted) };
}

export function hookFiles(hooks: readonly AgentHook[] = AGENT_HOOKS, hermesVersion = "0.2.0"): HookFile[] {
  const yaml = hermesPluginYaml(hermesVersion);
  return [
    hooksKeyFile(".claude/settings.json", hooksFor("claudeCode", hooks)),
    hooksKeyFile(".codex/hooks.json", hooksFor("codex", hooks), { description: "log-cli's agent hooks, written from src/agentHooks/registry (bun run check:agentHooks --write)." }),
    wholeFile(".cursor/hooks.json", cursorHooks(hooks)),
    wholeFile(".agents/hooks.json", antigravityHooks(hooks)),
    { path: `${HERMES_PLUGIN_DIR}/plugin.yaml`, format: "text", same: (current) => (current ?? "").replace(/\r\n/g, "\n") === yaml, wanted: () => yaml },
    {
      path: HARNESS_README,
      format: "text",
      same: (current) => current !== null && current.includes(HARNESS_TABLE_START) && withHarnessTable(current.replace(/\r\n/g, "\n")) === current.replace(/\r\n/g, "\n"),
      wanted: (current) => withHarnessTable((current ?? "").replace(/\r\n/g, "\n")),
    },
  ];
}

export function toolIsHooked(tool: string, hooks: readonly AgentHook[] = AGENT_HOOKS): boolean {
  return hooks.some((h) => h.event === "PostToolUse" && h.matcher !== undefined && new RegExp(`^(?:${h.matcher})$`).test(`mcp__${MCP_SERVER_NAME}__${tool}`));
}
