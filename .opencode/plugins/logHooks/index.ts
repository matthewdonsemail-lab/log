import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { ensureHookServer, HOOK_PORT, postHook, runCommandHook, serviceLogPath } from "./client";
import { hostToolName, isLogTool, isShellHookName, runsInBackground, shellCommandOf } from "./helpers/names";
import { writeTranscript } from "./helpers/transcript";
import type { OpenCodeEvent, PluginContext, SessionHookEvent, ToolHookEvent } from "./types";

const CHAT_NAME_TOOL = /^mcp__log__(discord|slack|instagram)/;

const STOP_REPEAT_MS = 5 * 60 * 1000;

const STOP_QUIET_MS = 2000;

const STOP_EVENTS = new Set(["session.idle", "session.execution.succeeded", "session.execution.failed", "session.execution.interrupted"]);

const START_KEY = "log.hooks.start";

const LIVE_KEY = "log.hooks.live";

const MAX_CONTEXT = 20000;

function repoOf(ctx: PluginContext): string {
  const beside = join(import.meta.dir, "..", "..", "..");
  if (existsSync(join(beside, "scripts", "hooks", "event.ts"))) return beside;
  return ctx.location.project?.directory ?? ctx.location.directory;
}

function pick(value: unknown, depth = 0): string {
  if (!value || typeof value !== "object" || depth > 3) return "";
  const record = value as Record<string, unknown>;
  for (const key of ["sessionID", "sessionId", "session_id"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate) return candidate;
  }
  const id = record.id;
  if (typeof id === "string" && id.startsWith("ses")) return id;
  for (const key of ["data", "properties", "session", "info"]) {
    const candidate = pick(record[key], depth + 1);
    if (candidate) return candidate;
  }
  return "";
}

function clipped(text: string): string {
  return text.length > MAX_CONTEXT ? `${text.slice(0, MAX_CONTEXT)}\n[log hooks: context cut at ${MAX_CONTEXT} characters]` : text;
}

function codeModeTool(input: Record<string, unknown> | undefined): string {
  const code = typeof input?.code === "string" ? input.code : "";
  const match = /tools\.(?:log|mcp__log__)\.([A-Za-z0-9_]+)/.exec(code);
  return match ? `mcp__log__${match[1]}` : "";
}

function codeModeArgs(input: Record<string, unknown> | undefined): Record<string, string> {
  const code = typeof input?.code === "string" ? input.code : "";
  const args: Record<string, string> = {};
  for (const key of ["chat", "channel", "with"]) {
    const match = new RegExp(`${key}\\s*:\\s*"([^"]*)"`).exec(code);
    if (match?.[1]) args[key] = match[1];
  }
  return args;
}

function withContext(result: unknown, text: string): Record<string, unknown> {
  const record = result && typeof result === "object" ? (result as Record<string, unknown>) : {};
  for (const key of ["output", "content", "text"]) {
    const existing = record[key];
    if (typeof existing === "string") return { ...record, [key]: `${existing}\n\n${text}` };
  }
  return { ...record, output: text };
}

const GLOBAL_PLUGIN_DIR = join(homedir(), ".config", "opencode", "plugins", "logHooks");

const IS_GLOBAL_COPY = import.meta.dir === GLOBAL_PLUGIN_DIR;

export default {
  id: IS_GLOBAL_COPY ? "logHooksGlobal" : "logHooks",
  async setup(ctx: PluginContext) {
    if (IS_GLOBAL_COPY && existsSync(join(ctx.location.directory, ".opencode", "plugins", "logHooks", "index.ts"))) return;
    const repo = repoOf(ctx);
    const carried = new Map<string, string>();
    const callTools = new Map<string, string>();
    const stopBlocked = new Map<string, { reason: string; at: number }>();
    const lastStopAt = new Map<string, number>();
    const started = new Set<string>();

    const inject = async (sessionID: string, key: string, text: string): Promise<boolean> => {
      try {
        if (!ctx.session.instructions) return false;
        await ctx.session.instructions.entry.put({ sessionID, key, value: clipped(text) });
        return true;
      } catch {
        return false;
      }
    };

    const deliver = async (sessionID: string, text: string): Promise<boolean> => {
      if (await inject(sessionID, LIVE_KEY, text)) return true;
      carried.set(sessionID, text);
      return false;
    };

    const transcriptFor = async (sessionID: string): Promise<string> => {
      try {
        const messages = ctx.session.context ? await ctx.session.context({ sessionID }) : [];
        return writeTranscript(sessionID, messages as never);
      } catch {
        return "";
      }
    };

    const sessionStart = async (sessionID: string, source: string): Promise<string | undefined> => {
      const transcript_path = await transcriptFor(sessionID);
      const answer = await postHook("SessionStart", { session_id: sessionID, source, transcript_path, cwd: repo });
      return answer.context;
    };

    const up = await ensureHookServer(repo);
    if (!up) {
      console.warn(
        `[logHooks] the log hook server is not answering on 127.0.0.1:${HOOK_PORT}. Hooks add nothing until it starts; check ${serviceLogPath()}. Nothing is blocked.`,
      );
    }

    await ctx.session.hook("prompt", async (event: SessionHookEvent) => {
      const prompt = String(event.prompt?.text ?? "");
      if (!prompt.trim()) return;
      if (!started.has(event.sessionID)) {
        started.add(event.sessionID);
        const resumed = await sessionStart(event.sessionID, "resume");
        if (resumed && !(await inject(event.sessionID, START_KEY, resumed))) carried.set(event.sessionID, resumed);
      }
      const answer = await postHook("UserPromptSubmit", { session_id: event.sessionID, prompt, transcript_path: "", cwd: repo });
      const before = carried.get(event.sessionID);
      carried.delete(event.sessionID);
      const extra = [before, answer.context].filter(Boolean).join("\n\n");
      if (!extra) return;
      if (await inject(event.sessionID, LIVE_KEY, extra)) return;
      if (event.prompt) event.prompt.text = `${prompt}\n\n${clipped(extra)}`;
    });

    await ctx.tool.hook("execute.before", async (event: ToolHookEvent) => {
      const input = (event.input ?? {}) as Record<string, unknown>;
      const codeTool = codeModeTool(input);
      const name = codeTool || hostToolName(String(event.tool ?? ""));
      const callID = String(event.callID ?? "");
      if (callID) callTools.set(callID, name);
      if (CHAT_NAME_TOOL.test(name)) {
        const verdict = await runCommandHook("chatNames.ts", repo, {
          hook_event_name: "PreToolUse",
          session_id: event.sessionID,
          tool_name: name,
          tool_input: codeTool ? codeModeArgs(input) : input,
          cwd: repo,
        });
        if (verdict.deny) throw new Error(verdict.deny);
        if (verdict.context) carried.set(event.sessionID, verdict.context);
        return;
      }
      if (!isShellHookName(name)) return;
      const command = shellCommandOf(input);
      if (!command) return;
      const verdict = await runCommandHook("liveLogs.ts", repo, {
        hook_event_name: "PreToolUse",
        session_id: event.sessionID,
        tool_name: name,
        tool_input: { command, run_in_background: runsInBackground(input) },
        cwd: repo,
      });
      if (verdict.deny) throw new Error(verdict.deny);
      if (verdict.context) carried.set(event.sessionID, verdict.context);
    });

    await ctx.tool.hook("execute.after", async (event: ToolHookEvent) => {
      const input = (event.input ?? {}) as Record<string, unknown>;
      const callID = String(event.callID ?? "");
      const name = codeModeTool(input) || (String(event.tool ?? "") ? hostToolName(String(event.tool)) : (callTools.get(callID) ?? ""));
      if (callID) callTools.delete(callID);
      if (!name || !(isLogTool(name) || isShellHookName(name))) return;
      const failed = event.status === "error";
      const error = event.error?.message ?? event.error ?? "";
      const answer = await postHook("PostToolUse", {
        session_id: event.sessionID,
        tool_name: name,
        tool_input: input,
        tool_response: failed ? { error: String(error) } : {},
        cwd: repo,
      });
      if (failed || !answer.context) return;
      if (await inject(event.sessionID, LIVE_KEY, answer.context)) return;
      event.result = withContext(event.result, clipped(answer.context));
    });

    const controller = new AbortController();

    const onEvent = async (event: OpenCodeEvent): Promise<void> => {
      const sessionID = pick(event);
      if (!sessionID) return;
      if (event.type === "session.created" || event.type === "session.compaction.started") {
        const source = event.type === "session.created" ? "startup" : "compact";
        if (source === "startup") {
          const info = ctx.session.get ? await ctx.session.get({ sessionID }).catch(() => undefined) : undefined;
          if (info?.parentID) return;
        }
        started.add(sessionID);
        const context = await sessionStart(sessionID, source);
        if (!context) return;
        if (!(await inject(sessionID, START_KEY, context))) carried.set(sessionID, context);
        return;
      }
      if (STOP_EVENTS.has(event.type)) {
        const since = lastStopAt.get(sessionID) ?? 0;
        if (Date.now() - since < STOP_QUIET_MS) return;
        lastStopAt.set(sessionID, Date.now());
        const answer = await postHook("Stop", { session_id: sessionID, stop_hook_active: false, cwd: repo });
        if (answer.decision !== "block" || !answer.reason) return;
        const last = stopBlocked.get(sessionID);
        if (last && last.reason === answer.reason && Date.now() - last.at < STOP_REPEAT_MS) return;
        stopBlocked.set(sessionID, { reason: answer.reason, at: Date.now() });
        await ctx.session.synthetic?.({ sessionID, text: clipped(answer.reason) }).catch(() => undefined);
        return;
      }
      if (event.type === "session.deleted") {
        carried.delete(sessionID);
        stopBlocked.delete(sessionID);
        lastStopAt.delete(sessionID);
        started.delete(sessionID);
      }
    };

    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
          await onEvent(event).catch(() => undefined);
        }
      } catch {}
    })();

    return () => {
      controller.abort();
      carried.clear();
      callTools.clear();
      stopBlocked.clear();
      lastStopAt.clear();
      started.clear();
    };
  },
};
