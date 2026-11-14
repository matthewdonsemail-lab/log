import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HARNESS_CAPABILITIES, HARNESSES, HOOK_HOSTS, SCRATCH_ACCOUNT } from "./types.ts";
import type { Harness, HarnessCapability, HarnessId, HookBody, HookHost } from "./types.ts";

export function harnessOf(id: HarnessId): Harness {
  const found = HARNESSES.find((h) => h.id === id);
  if (!found) throw new Error(`no harness ${id}`);
  return found;
}

export function isHookHost(value: unknown): value is HookHost {
  return typeof value === "string" && (HOOK_HOSTS as readonly string[]).includes(value);
}

export function hookHostOf(argv: readonly string[], fallback: HookHost = "claudeCode"): HookHost {
  const at = argv.indexOf("--host");
  const value = at >= 0 ? argv[at + 1] : undefined;
  return isHookHost(value) ? value : fallback;
}

export function positionalOf(argv: readonly string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--host") {
      i++;
      continue;
    }
    out.push(argv[i]);
  }
  return out;
}

export function clipContext(text: string, host: HookHost): string {
  const limit = harnessOf(host).contextLimit;
  if (limit === null || text.length <= limit) return text;
  const note = `\n[log cut this context at ${limit} characters, the limit for ${harnessOf(host).label}; the rest is in getGuide and the tool results]`;
  return `${text.slice(0, Math.max(0, limit - note.length))}${note}`;
}

export function contextOf(body: HookBody | null | undefined): string {
  const specific = body?.hookSpecificOutput as { additionalContext?: unknown } | undefined;
  return typeof specific?.additionalContext === "string" ? specific.additionalContext : "";
}

export function hostBody(host: HookHost, event: string, body: HookBody | null | undefined): HookBody | null {
  if (!body) return null;
  const context = contextOf(body);
  const clipped = context ? clipContext(context, host) : "";
  if (host === "cursor") return clipped ? { additional_context: clipped } : null;
  if (host === "hermes") return clipped ? { context: clipped } : null;
  if (!context) return body;
  return { ...body, hookSpecificOutput: { ...(body.hookSpecificOutput as HookBody), hookEventName: event, additionalContext: clipped } };
}

export function contextOutput(event: string, text: string, host: HookHost): string {
  if (!text) return "";
  const body = hostBody(host, event, { hookSpecificOutput: { hookEventName: event, additionalContext: text } });
  return body ? JSON.stringify(body) : "";
}

export function harnessesWith(capability: HarnessCapability): Harness[] {
  return HARNESSES.filter((h) => h.capabilities[capability] === "yes");
}

const CAPABILITY_LABELS: Readonly<Record<HarnessCapability, string>> = {
  promptHook: "Prompt hook",
  sessionStartHook: "Session-start hook",
  toolHooks: "Tool hooks",
  mcpApps: "Draws MCP Apps",
  serverInstructions: "Server instructions",
  skills: "Skills",
  elicitation: "URL elicitation",
};

const ROUTER_LABELS: Readonly<Record<Harness["router"], string>> = {
  promptHook: "the prompt hook",
  preLlmCall: "the `pre_llm_call` hook (native plugin)",
  ask: "`getGuide({ ask })`",
};

export function harnessTable(): string {
  const head = ["Harness", ...HARNESS_CAPABILITIES.map((c) => CAPABILITY_LABELS[c]), "Prompt router", "Hook text limit", "Connects to", "Hooks from"];
  const rows = HARNESSES.map((h) => [
    `[${h.label}](${h.doc})`,
    ...HARNESS_CAPABILITIES.map((c) => h.capabilities[c]),
    ROUTER_LABELS[h.router],
    h.contextLimit === null ? "no hooks" : `${h.contextLimit.toLocaleString("en-US")} characters`,
    h.connects === "both" ? "hosted or local" : h.connects,
    h.hookFile ? `\`${h.hookFile}\`` : "none",
  ]);
  return [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

export function scratchHookEnv(dir: string, base: Record<string, string | undefined> = process.env): Record<string, string | undefined> {
  const twitter = join(dir, "twitter");
  mkdirSync(join(twitter, SCRATCH_ACCOUNT), { recursive: true });
  writeFileSync(join(twitter, SCRATCH_ACCOUNT, "session.json"), JSON.stringify({ sessionState: "loggedIn" }));
  return {
    ...base,
    LOG_DB: join(dir, "log.db"),
    LOG_INBOX_STATE: join(dir, "inbox"),
    LOG_HOOK_MEMORY: join(dir, "memory.json"),
    LOG_CONTEXT_LAYER: join(dir, "contextLayer"),
    LOG_QUEUES_DIR: join(dir, "queues"),
    LOG_TWITTER_STATE: twitter,
    LOG_PLATFORM_STATE: join(dir, "platforms"),
    LOG_FBK_STATE: join(dir, "fbk"),
    LOG_CONTEXT_SERVICE: "off",
    LOG_INBOX_POLL: "off",
  };
}

export function watcherLogsIn(dir: string): string[] {
  const found: string[] = [];
  const walk = (at: string) => {
    if (!existsSync(at)) return;
    for (const entry of readdirSync(at, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(join(at, entry.name));
      else if (entry.name === "watch.log") found.push(join(at, entry.name));
    }
  };
  walk(join(dir, "inbox"));
  return found;
}

export const HARNESS_TABLE_START = "<!-- harnessTable: written from src/agentHooks/harness (bun run check:agentHooks --write) -->";

export const HARNESS_TABLE_END = "<!-- /harnessTable -->";

export function withHarnessTable(text: string): string {
  const block = `${HARNESS_TABLE_START}\n${harnessTable()}\n${HARNESS_TABLE_END}`;
  const start = text.indexOf(HARNESS_TABLE_START);
  const end = text.indexOf(HARNESS_TABLE_END);
  if (start < 0 || end < start) return text;
  return `${text.slice(0, start)}${block}${text.slice(end + HARNESS_TABLE_END.length)}`;
}
