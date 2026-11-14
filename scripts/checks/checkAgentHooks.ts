import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { contextOf, harnessOf, HOOK_HOSTS, scratchHookEnv, watcherLogsIn } from "../../src/agentHooks/harness/index.ts";
import { AGENT_HOOKS, ANTIGRAVITY_SCRIPT, EVENT_SCRIPT, hookFiles, MCP_SERVER_NAME, toolIsHooked } from "../../src/agentHooks/registry/index.ts";
import type { HookEvent, HookHost } from "../../src/agentHooks/registry/index.ts";
import { PAGE_STATES, RESOLVE_CALLS } from "../../src/browser/flow/helpers/pageState.ts";
import { commandKey, isPlatform } from "../../src/cli/runner/helpers/index.ts";
import { COMMANDS } from "../../src/cli/runner/index.ts";
import { commandTools, toolsFromCommands } from "../../src/mcp/server/helpers/toolsFromCommands.ts";
import { toolsFromFlows } from "../../src/mcp/server/helpers/toolsFromFlows.ts";
import { savedFlows } from "../../src/mcp/server/index.ts";

const root = join(import.meta.dir, "..", "..");

const PROBE_PROMPT = "check my x notifications";
const PROBE_PLAY = "twitter/notifications";

interface AdapterProbe {
  host: HookHost;
  script: string;
  argv: string[];
  input: Record<string, unknown>;
  check: (body: Record<string, unknown> | null) => string | null;
}

const routed = (text: unknown, host: HookHost) => {
  if (typeof text !== "string" || !text.includes(PROBE_PLAY)) return `the prompt "${PROBE_PROMPT}" did not reach the word router with the context service off (no ${PROBE_PLAY} in ${JSON.stringify(text ?? null).slice(0, 160)})`;
  const limit = harnessOf(host).contextLimit;
  return limit !== null && text.length > limit ? `its context is ${text.length} characters, over ${harnessOf(host).label}'s ${limit}` : null;
};

const ADAPTER_PROBES: readonly AdapterProbe[] = [
  { host: "claudeCode", script: "scripts/hooks/useCases.ts", argv: [], input: { hook_event_name: "UserPromptSubmit", prompt: PROBE_PROMPT }, check: (b) => routed(contextOf(b), "claudeCode") },
  { host: "codex", script: "scripts/hooks/useCases.ts", argv: ["--host", "codex"], input: { hook_event_name: "UserPromptSubmit", prompt: PROBE_PROMPT }, check: (b) => routed(contextOf(b), "codex") },
  { host: "hermes", script: EVENT_SCRIPT, argv: ["UserPromptSubmit", "--host", "hermes"], input: { hook_event_name: "UserPromptSubmit", prompt: PROBE_PROMPT, session_id: "probe" }, check: (b) => (b && Object.keys(b).join() === "context" ? routed(b.context, "hermes") : `answered ${JSON.stringify(b)?.slice(0, 160)}, not { context }`) },
  { host: "cursor", script: EVENT_SCRIPT, argv: ["SessionStart", "--host", "cursor"], input: { session_id: "probe", is_background_agent: false }, check: (b) => (b === null || (Object.keys(b).join() === "additional_context" && typeof b.additional_context === "string" && b.additional_context.length <= (harnessOf("cursor").contextLimit ?? 0)) ? null : `answered ${JSON.stringify(b).slice(0, 160)}, not { additional_context } within the limit`) },
  { host: "antigravity", script: ANTIGRAVITY_SCRIPT, argv: ["PreInvocation"], input: { lastUserInput: PROBE_PROMPT }, check: (b) => (Array.isArray(b?.injectSteps) ? routed((b.injectSteps as { ephemeralMessage?: string }[])[0]?.ephemeralMessage, "antigravity") : `answered ${JSON.stringify(b)?.slice(0, 160)}, not { injectSteps }`) },
];
const write = process.argv.includes("--write");
const problems: string[] = [];

const hermesVersion = (JSON.parse(readFileSync(join(root, "hermesPlugin", "plugin.json"), "utf8")) as { version: string }).version;
for (const file of hookFiles(AGENT_HOOKS, hermesVersion)) {
  const path = join(root, file.path);
  const current = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (file.same(current)) continue;
  if (write) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.wanted(current));
    console.log(`wrote ${file.path}`);
  } else problems.push(`${file.path}: its hooks differ from src/agentHooks/registry. Run \`bun run check:agentHooks --write\`.`);
}
for (const host of HOOK_HOSTS) if (!harnessOf(host).hookFile || !existsSync(join(root, harnessOf(host).hookFile as string))) problems.push(`hook host ${host} has no hook file in the repo (src/agentHooks/harness HARNESSES hookFile)`);

const scratch = mkdtempSync(join(tmpdir(), "agentHooks-"));
const scratchEnv = scratchHookEnv(scratch);
try {
  const samples: Record<HookEvent, Record<string, unknown>> = {
    SessionStart: { hook_event_name: "SessionStart", source: "startup" },
    UserPromptSubmit: { hook_event_name: "UserPromptSubmit", prompt: "check" },
    PreToolUse: { hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: { command: "log facebook warmup feed run | tail -5" } },
    PostToolUse: { hook_event_name: "PostToolUse", tool_name: "Bash", tool_input: { command: "echo" } },
    Stop: { hook_event_name: "Stop", stop_hook_active: false },
  };
  for (const hook of AGENT_HOOKS) {
    const script = join(root, hook.script);
    if (!existsSync(script)) {
      problems.push(`${hook.script} (${hook.event}) doesn't exist`);
      continue;
    }
    const run = spawnSync("bun", [script], { windowsHide: true, input: JSON.stringify(samples[hook.event]), encoding: "utf8", timeout: hook.timeout * 1000, env: scratchEnv });
    const out = (run.stdout ?? "").trim();
    if (run.status === 2 && (hook.event === "PreToolUse" || hook.event === "Stop") && run.stderr.trim()) continue;
    if (run.status !== 0) {
      problems.push(`${hook.script} (${hook.event}) exited ${run.status}: ${(run.stderr ?? "").trim().slice(0, 300)}`);
      continue;
    }
    if (out) {
      try {
        JSON.parse(out);
      } catch {
        problems.push(`${hook.script} (${hook.event}) printed something that isn't JSON (Codex refuses plain text): ${out.slice(0, 120)}`);
      }
    }
  }
  const liveLogs = AGENT_HOOKS.find((h) => h.event === "PreToolUse" && (h.matcher ?? "").includes("Bash"));
  if (liveLogs) {
    const run = spawnSync("bun", [join(root, liveLogs.script)], { windowsHide: true, input: JSON.stringify(samples.PreToolUse), encoding: "utf8", env: scratchEnv });
    if (run.status !== 2) problems.push(`${liveLogs.script} let a log run piped through tail through (exit ${run.status}): it must refuse it (rule 26)`);
  }
  for (const probe of ADAPTER_PROBES) {
    const run = spawnSync("bun", [join(root, probe.script), ...probe.argv], { windowsHide: true, input: JSON.stringify(probe.input), encoding: "utf8", timeout: 30_000, env: scratchEnv });
    const out = (run.stdout ?? "").trim();
    let body: Record<string, unknown> | null = null;
    try {
      body = out ? (JSON.parse(out) as Record<string, unknown>) : null;
    } catch {}
    const problem = run.status !== 0 ? `exited ${run.status}: ${(run.stderr ?? "").trim().slice(0, 300)}` : probe.check(body);
    if (problem) problems.push(`the ${probe.host} adapter (${probe.script} ${probe.argv.join(" ")}): ${problem}`);
  }
  const started = watcherLogsIn(scratch);
  if (existsSync(join(scratch, "contextLayer", "service.log"))) problems.push("a hook started the context service with LOG_CONTEXT_SERVICE=off: the check runs every hook on its own scratch state, with nothing left running");
  if (started.length) problems.push(`a hook started a watcher with LOG_INBOX_POLL=off (${started.join(", ")}): the check must never start one`);
} finally {
  try {
    rmSync(scratch, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {}
}

const commandNames = new Set(COMMANDS.map((c) => c.name));
const tools = [...toolsFromCommands(COMMANDS), ...toolsFromFlows(savedFlows())];
const commandsWithTools = new Set(commandTools(COMMANDS).map((t) => t.command));
for (const command of COMMANDS) if (!commandsWithTools.has(command) && !command.terminalOnly) problems.push(`log ${command.name} (${commandKey(command)}) has no MCP tool and isn't terminal-only (its command's terminalOnly, with why)`);
for (const tool of tools) if (!toolIsHooked(tool.name)) problems.push(`MCP tool ${tool.name} isn't matched by the PostToolUse hook (mcp__${MCP_SERVER_NAME}__${tool.name})`);
for (const command of COMMANDS.filter((c) => c.longRunning)) {
  for (const entry of commandTools(COMMANDS).filter((t) => t.command === command)) {
    const tool = tools.find((t) => t.name === entry.tool);
    if (tool && !tool.description.includes("~/.logCli/mcp/<day>.log")) problems.push(`MCP tool ${entry.tool} runs long but its description doesn't point at the live log (rule 26)`);
  }
}
const mcpJson = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8")) as { mcpServers?: Record<string, unknown> };
if (!mcpJson.mcpServers?.[MCP_SERVER_NAME]) problems.push(`.mcp.json has no "${MCP_SERVER_NAME}" server: the hooks match mcp__${MCP_SERVER_NAME}__*`);
const serverSource = readFileSync(join(root, "src/mcp/server/index.ts"), "utf8");
if (!serverSource.includes(`name: "${MCP_SERVER_NAME}"`)) problems.push(`src/mcp/server/index.ts doesn't name its server "${MCP_SERVER_NAME}"`);

for (const [id, call] of Object.entries(RESOLVE_CALLS)) {
  if (!PAGE_STATES.some((state) => state.id === id)) problems.push(`RESOLVE_CALLS names "${id}", which isn't a page state`);
  const sample = call({ account: "a", text: "- generic [ref=e1]: Continue\n- generic [ref=e2]: Update\n- generic [ref=e3]: Dismiss", messengerPin: true });
  if (sample && !tools.some((t) => t.name === sample.tool)) problems.push(`page state ${id} resolves with the tool ${sample.tool}, which isn't an MCP tool`);
}
for (const state of PAGE_STATES) if (!(state.id in RESOLVE_CALLS)) problems.push(`page state ${state.id} has no resolver call in RESOLVE_CALLS (src/browser/flow/helpers/pageState.ts): every result's next comes from it (rule 54)`);

for (const state of PAGE_STATES) {
  for (const match of state.resolve.matchAll(/`log ([a-zA-Z]+)(?: ([a-zA-Z]+))?/g)) {
    const name = isPlatform(match[1]) && match[2] ? match[2] : match[1];
    if (!commandNames.has(name)) problems.push(`page state ${state.id} resolves with \`log ${match[1]}${match[2] ? ` ${match[2]}` : ""}\`, which isn't a command`);
  }
}

if (problems.length) {
  console.error(`Agent hooks, CLI and MCP are out of step (rule 55):\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`agentHooks: ${AGENT_HOOKS.length} hooks on ${HOOK_HOSTS.length} hook hosts (${ADAPTER_PROBES.length} adapters run on scratch state), ${commandNames.size} commands, ${tools.length} MCP tools hooked, ${PAGE_STATES.length} page states resolvable by real commands.`);
