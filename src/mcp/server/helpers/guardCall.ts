import { argvOfInput, isPlatform, PLATFORMS } from "../../../cli/runner/helpers/index.ts";
import type { Command } from "../../../cli/runner/types.ts";
import type { GuardResult, LogToolInput } from "../types.ts";
import { NO_PROMPT, TERMINAL_ONLY } from "../types.ts";
import { LIVE_SUFFIX } from "./toolAnnotations.ts";
import { argsLiveFlags, commandTools } from "./toolsFromCommands.ts";

export function commandLine(command: Command, args: string[]): string[] {
  if (command.platform === "facebook") return [PLATFORMS[0], command.name, ...args];
  if (command.platform === "byArgument" && isPlatform(args[0])) return [args[0], command.name, ...args.slice(1)];
  return [command.name, ...args];
}

const LIVE_REFUSAL = (name: string) => `${name} acts on Facebook. Only run it when matt asked, and pass confirmLive: true (AGENTS.md rule 10).`;
const BYPASS_REFUSAL = (name: string) => `${name} with bypass runs outside the account's local waking hours (rule 18). Only when matt asked for it, and pass confirmBypass: true (AGENTS.md rule 20). The proxy gate, self-check and launch budget still apply.`;

const flagName = (arg: string) => (arg.startsWith("--") ? arg.slice(2).split("=")[0] : null);

export function guardCall(name: string, input: LogToolInput | undefined, commands: Command[]): GuardResult {
  if (name in TERMINAL_ONLY) return { ok: false, message: `log ${name} is not a tool: it ${TERMINAL_ONLY[name]}` };
  const entry = commandTools(commands).find((t) => t.tool === name);
  if (!entry) return { ok: false, message: `Unknown tool: ${name}` };
  const { command, form, live } = entry;
  if (live && input?.confirmLive !== true) return { ok: false, message: LIVE_REFUSAL(name) };
  if (form) {
    const { confirmLive: _, confirmBypass, ...fields } = input ?? {};
    if ("args" in fields) return { ok: false, message: `${name} takes named fields, not args: ${[...form.positionals, ...form.flags].map((s) => s.name).join(", ") || "none"}` };
    for (const forced of entry.forced) if (fields[forced] === true) delete fields[forced];
    const liveField = live ? undefined : command.input?.forms.flatMap((f) => f.flags).find((f) => f.live && f.name in fields && !form.flags.includes(f));
    if (liveField) return { ok: false, message: `${name} never acts on Facebook: ${liveField.name} is \`${name}${LIVE_SUFFIX}\`, only when matt asked (rule 8)` };
    const built = argvOfInput(form, fields);
    if (!built.ok) return { ok: false, message: `${name}: ${built.message}` };
    if (live && !entry.forced.length && !built.live) return { ok: false, message: `${name} is for live runs: set ${form.flags.filter((f) => f.live).map((f) => f.name).join(" or ")}, or call \`${name.slice(0, -LIVE_SUFFIX.length)}\`` };
    if (built.bypass && confirmBypass !== true) return { ok: false, message: BYPASS_REFUSAL(name) };
    return { ok: true, argv: commandLine(command, [...built.argv, ...entry.forced.map((f) => `--${f}`)]) };
  }
  const args = input?.args ?? [];
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== "string")) return { ok: false, message: "args must be an array of strings" };
  const liveFlags = argsLiveFlags(command);
  const given = args.map(flagName).filter((f): f is string => f !== null && liveFlags.includes(f));
  if (!live && given.length) return { ok: false, message: `${name} never acts on Facebook: --${given[0]} is \`${name}${LIVE_SUFFIX}\`, only when matt asked (rule 8)` };
  if (!live && args.some((arg) => arg === "--live" || arg.startsWith("--live="))) return { ok: false, message: LIVE_REFUSAL(`log ${name} --live`) };
  if (live && !given.length) return { ok: false, message: `${name} is for live runs: pass ${liveFlags.map((f) => `--${f}`).join(" or ")} in args, or call \`${command.name}\`` };
  const bypass = args.some((arg) => arg === "--bypass" || arg.startsWith("--bypass="));
  if (bypass && input?.confirmBypass !== true) return { ok: false, message: BYPASS_REFUSAL(`log ${name} --bypass`) };
  const noPrompt = NO_PROMPT[command.name];
  const withFlag = noPrompt && !args.includes(noPrompt) ? [...args, noPrompt] : args;
  return { ok: true, argv: commandLine(command, withFlag) };
}
