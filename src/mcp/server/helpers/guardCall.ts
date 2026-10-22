import { argvOfInput, isPlatform, PLATFORMS } from "../../../cli/runner/helpers/index.ts";
import type { Command } from "../../../cli/runner/types.ts";
import type { GuardResult, LogToolInput } from "../types.ts";
import { NO_PROMPT, TERMINAL_ONLY } from "../types.ts";
import { commandTools } from "./toolsFromCommands.ts";

export function commandLine(command: Command, args: string[]): string[] {
  if (command.platform === "facebook") return [PLATFORMS[0], command.name, ...args];
  if (command.platform === "byArgument" && isPlatform(args[0])) return [args[0], command.name, ...args.slice(1)];
  return [command.name, ...args];
}

const LIVE_REFUSAL = (name: string) => `${name} with live acts on Facebook. Only run it when matt asked, and pass confirmLive: true (AGENTS.md rule 10).`;
const BYPASS_REFUSAL = (name: string) => `${name} with bypass runs outside the account's local waking hours (rule 18). Only when matt asked for it, and pass confirmBypass: true (AGENTS.md rule 20). The proxy gate, self-check and launch budget still apply.`;

export function guardCall(name: string, input: LogToolInput | undefined, commands: Command[]): GuardResult {
  if (name in TERMINAL_ONLY) return { ok: false, message: `log ${name} is not a tool: it ${TERMINAL_ONLY[name]}` };
  const entry = commandTools(commands).find((t) => t.tool === name);
  if (!entry) return { ok: false, message: `Unknown tool: ${name}` };
  const { command, form } = entry;
  if (form) {
    const { confirmLive, confirmBypass, ...fields } = input ?? {};
    if ("args" in fields) return { ok: false, message: `${name} takes named fields, not args: ${[...form.positionals, ...form.flags].map((s) => s.name).join(", ") || "none"}` };
    const built = argvOfInput(form, fields);
    if (!built.ok) return { ok: false, message: `${name}: ${built.message}` };
    if (built.live && confirmLive !== true) return { ok: false, message: LIVE_REFUSAL(name) };
    if (built.bypass && confirmBypass !== true) return { ok: false, message: BYPASS_REFUSAL(name) };
    return { ok: true, argv: commandLine(command, built.argv) };
  }
  const args = input?.args ?? [];
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== "string")) return { ok: false, message: "args must be an array of strings" };
  const live = args.some((arg) => arg === "--live" || arg.startsWith("--live="));
  if (live && input?.confirmLive !== true) return { ok: false, message: LIVE_REFUSAL(`log ${name} --live`) };
  const bypass = args.some((arg) => arg === "--bypass" || arg.startsWith("--bypass="));
  if (bypass && input?.confirmBypass !== true) return { ok: false, message: BYPASS_REFUSAL(`log ${name} --bypass`) };
  const noPrompt = NO_PROMPT[name];
  const withFlag = noPrompt && !args.includes(noPrompt) ? [...args, noPrompt] : args;
  return { ok: true, argv: commandLine(command, withFlag) };
}
