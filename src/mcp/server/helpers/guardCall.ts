import { isPlatform, PLATFORMS } from "../../../cli/runner/helpers/index.ts";
import type { Command } from "../../../cli/runner/types.ts";
import type { GuardResult, LogToolInput } from "../types.ts";
import { NO_PROMPT, TERMINAL_ONLY } from "../types.ts";

/**
 * The tool's call as a command line, the platform first (rule 63): a Facebook-only tool runs `facebook <name> …`;
 * the warm-up's `args` start with its platform, which moves in front of the name. Pure.
 */
export function commandLine(command: Command, args: string[]): string[] {
  if (command.platform === "facebook") return [PLATFORMS[0], command.name, ...args];
  if (command.platform === "byArgument" && isPlatform(args[0])) return [args[0], command.name, ...args.slice(1)];
  return [command.name, ...args];
}

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
  const bypass = args.some((arg) => arg === "--bypass" || arg.startsWith("--bypass="));
  if (bypass && input?.confirmBypass !== true) {
    return { ok: false, message: `log ${name} --bypass runs outside the account's local waking hours (rule 18). Only when matt asked for it, and pass confirmBypass: true (AGENTS.md rule 20). The proxy gate, self-check and launch budget still apply.` };
  }
  const noPrompt = NO_PROMPT[name];
  const withFlag = noPrompt && !args.includes(noPrompt) ? [...args, noPrompt] : args;
  return { ok: true, argv: commandLine(commands.find((command) => command.name === name)!, withFlag) };
}
