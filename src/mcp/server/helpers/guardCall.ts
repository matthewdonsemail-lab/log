import type { Command } from "../../../cli/runner/types.ts";
import type { GuardResult, LogToolInput } from "../types.ts";
import { NO_PROMPT, TERMINAL_ONLY } from "../types.ts";

/** Whether a tool call may run, and the argv it runs with. Pure. */
export function guardCall(name: string, input: LogToolInput | undefined, commands: Command[]): GuardResult {
  if (name in TERMINAL_ONLY) return { ok: false, message: `log ${name} is not a tool: it ${TERMINAL_ONLY[name]}` };
  if (!commands.some((command) => command.name === name)) return { ok: false, message: `Unknown tool: ${name}` };
  const args = input?.args ?? [];
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== "string")) return { ok: false, message: "args must be an array of strings" };
  const live = args.some((arg) => arg === "--live" || arg.startsWith("--live="));
  if (live && input?.confirmLive !== true) {
    return { ok: false, message: `log ${name} --live posts on Facebook. Only run it when matt asked, and pass confirmLive: true (AGENTS.md rule 10).` };
  }
  const noPrompt = NO_PROMPT[name];
  return { ok: true, argv: noPrompt && !args.includes(noPrompt) ? [name, ...args, noPrompt] : [name, ...args] };
}
