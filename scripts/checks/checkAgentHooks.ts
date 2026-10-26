import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AGENT_HOOKS, hooksFor, MCP_SERVER_NAME, toolIsHooked } from "../../src/agentHooks/registry/index.ts";
import type { HookEvent, HookHost } from "../../src/agentHooks/registry/index.ts";
import { PAGE_STATES, RESOLVE_CALLS } from "../../src/browser/flow/helpers/pageState.ts";
import { isPlatform } from "../../src/cli/runner/helpers/index.ts";
import { COMMANDS } from "../../src/cli/runner/index.ts";
import { commandTools, LONG_RUNNING, toolsFromCommands } from "../../src/mcp/server/helpers/toolsFromCommands.ts";
import { toolsFromFlows } from "../../src/mcp/server/helpers/toolsFromFlows.ts";
import { savedFlows } from "../../src/mcp/server/index.ts";
import { TERMINAL_ONLY } from "../../src/mcp/server/types.ts";

const root = join(import.meta.dir, "..", "..");
const write = process.argv.includes("--write");
const problems: string[] = [];

const HOST_FILES: Record<HookHost, string> = { claudeCode: ".claude/settings.json", codex: ".codex/hooks.json" };
for (const [host, file] of Object.entries(HOST_FILES) as [HookHost, string][]) {
  const path = join(root, file);
  const current = existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>) : {};
  const wanted = hooksFor(host);
  if (JSON.stringify(current.hooks ?? null) === JSON.stringify(wanted)) continue;
  if (write) {
    const next = host === "codex" ? { description: "log-cli's agent hooks, written from src/agentHooks/registry (bun run check:agentHooks --write).", ...current, hooks: wanted } : { ...current, hooks: wanted };
    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
    console.log(`wrote ${file}`);
  } else problems.push(`${file}: its hooks differ from src/agentHooks/registry. Run \`bun run check:agentHooks --write\`.`);
}

const scratch = mkdtempSync(join(tmpdir(), "agentHooks-"));
try {
  const samples: Record<HookEvent, Record<string, unknown>> = {
    SessionStart: { hook_event_name: "SessionStart", source: "startup" },
    UserPromptSubmit: { hook_event_name: "UserPromptSubmit", prompt: "check" },
    PreToolUse: { hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: { command: "bun bin/log.ts facebook warmup feed run | tail -5" } },
    PostToolUse: { hook_event_name: "PostToolUse", tool_name: "Bash", tool_input: { command: "echo" } },
    Stop: { hook_event_name: "Stop", stop_hook_active: false },
  };
  for (const hook of AGENT_HOOKS) {
    const script = join(root, hook.script);
    if (!existsSync(script)) {
      problems.push(`${hook.script} (${hook.event}) doesn't exist`);
      continue;
    }
    const run = spawnSync("bun", [script], { input: JSON.stringify(samples[hook.event]), encoding: "utf8", timeout: hook.timeout * 1000, env: { ...process.env, LOG_HOOK_MEMORY: join(scratch, "memory.json"), LOG_INBOX_STATE: join(scratch, "inbox"), LOG_INBOX_POLL: "off" } });
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
  const liveLogs = AGENT_HOOKS.find((h) => h.event === "PreToolUse");
  if (liveLogs) {
    const run = spawnSync("bun", [join(root, liveLogs.script)], { input: JSON.stringify(samples.PreToolUse), encoding: "utf8" });
    if (run.status !== 2) problems.push(`${liveLogs.script} let a log run piped through tail through (exit ${run.status}): it must refuse it (rule 26)`);
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

const commandNames = new Set(COMMANDS.map((c) => c.name));
const tools = [...toolsFromCommands(COMMANDS), ...toolsFromFlows(savedFlows())];
const commandsWithTools = new Set(commandTools(COMMANDS).map((t) => t.command.name));
for (const name of commandNames) if (!commandsWithTools.has(name) && !TERMINAL_ONLY[name]) problems.push(`log ${name} has no MCP tool and isn't terminal-only (src/mcp/server/types.ts TERMINAL_ONLY, with why)`);
for (const name of Object.keys(TERMINAL_ONLY)) if (!commandNames.has(name)) problems.push(`TERMINAL_ONLY names "${name}", which isn't a command`);
for (const tool of tools) if (!toolIsHooked(tool.name)) problems.push(`MCP tool ${tool.name} isn't matched by the PostToolUse hook (mcp__${MCP_SERVER_NAME}__${tool.name})`);
for (const name of LONG_RUNNING) {
  if (!commandNames.has(name)) problems.push(`LONG_RUNNING names "${name}", which isn't a command`);
  for (const entry of commandTools(COMMANDS).filter((t) => t.command.name === name)) {
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
console.log(`agentHooks: ${AGENT_HOOKS.length} hooks on both hosts, ${commandNames.size} commands, ${tools.length} MCP tools hooked, ${PAGE_STATES.length} page states resolvable by real commands.`);
