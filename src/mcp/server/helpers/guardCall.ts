import { argvOfInput, isPlatform, platformLabel, toolBaseName } from "../../../cli/runner/helpers/index.ts";
import type { Command } from "../../../cli/runner/types.ts";
import type { GuardResult, LogToolInput } from "../types.ts";
import { NO_PROMPT, TERMINAL_ONLY } from "../types.ts";
import { LIVE_SUFFIX } from "./toolAnnotations.ts";
import { argsLiveFlags, commandTools, legacyArgsTool } from "./toolsFromCommands.ts";
import type { CommandTool } from "./toolsFromCommands.ts";
import { currentToolName } from "./toolAliases.ts";

export function commandLine(command: Command, args: string[]): string[] {
  if (isPlatform(command.platform)) return [command.platform, command.name, ...args];
  if (command.platform === "byArgument" && isPlatform(args[0])) return [args[0], command.name, ...args.slice(1)];
  return [command.name, ...args];
}

const LIVE_REFUSAL = (name: string, place: string) => `${name} acts on ${place}. Only run it when the owner asked, and pass confirmLive: true (AGENTS.md rule 8).`;
const BYPASS_REFUSAL = (name: string) => `${name} with bypass runs outside the account's local waking hours. Only when the owner asked for it, and pass confirmBypass: true (AGENTS.md rule 86). The proxy gate, self-check and launch budget still apply.`;

const flagName = (arg: string) => (arg.startsWith("--") ? arg.slice(2).split("=")[0] : null);

const refusal = (code: string, message: string): GuardResult => ({ ok: false, code, message });

const withNoPrompt = (command: Command, argv: string[]): string[] => {
  const noPrompt = NO_PROMPT[command.name];
  return noPrompt && !argv.includes(noPrompt) ? [...argv, noPrompt] : argv;
};

function argsCall(name: string, entry: Pick<CommandTool, "command" | "live">, input: LogToolInput | undefined): GuardResult {
  const { command, live } = entry;
  const args = input?.args ?? [];
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== "string")) return refusal("inputInvalid", "args must be an array of strings");
  const liveFlags = argsLiveFlags(command);
  const given = args.map(flagName).filter((f): f is string => f !== null && liveFlags.includes(f));
  if (!live && given.length) return refusal("inputInvalid", `${name} never acts on ${platformLabel(command)}: --${given[0]} is \`${name}${LIVE_SUFFIX}\`, only when the owner asked (rule 8)`);
  if (!live && args.some((arg) => arg === "--live" || arg.startsWith("--live="))) return refusal("liveNotConfirmed", LIVE_REFUSAL(`log ${name} --live`, platformLabel(command)));
  if (live && !given.length) return refusal("inputInvalid", `${name} is for live runs: pass ${liveFlags.map((f) => `--${f}`).join(" or ")} in args, or call \`${toolBaseName(command)}\``);
  const bypass = args.some((arg) => arg === "--bypass" || arg.startsWith("--bypass="));
  if (bypass && input?.confirmBypass !== true) return refusal("bypassNotConfirmed", BYPASS_REFUSAL(`log ${name} --bypass`));
  return { ok: true, argv: commandLine(command, withNoPrompt(command, args)) };
}

function namedTools(command: Command, commands: Command[]): string[] {
  return commandTools(commands).filter((t) => t.command === command).map((t) => t.tool);
}

export function guardCall(called: string, input: LogToolInput | undefined, commands: Command[]): GuardResult {
  const name = currentToolName(called);
  if (name in TERMINAL_ONLY) return refusal("terminalOnly", `log ${name} is not a tool: it ${TERMINAL_ONLY[name]}`);
  const entry = commandTools(commands).find((t) => t.tool === name);
  const legacy = legacyArgsTool(name, commands);
  if (legacy && (!entry || (input !== undefined && "args" in input))) {
    if (legacy.live && input?.confirmLive !== true) return refusal("liveNotConfirmed", LIVE_REFUSAL(name, platformLabel(legacy.command)));
    const built = argsCall(name, legacy, input);
    if (!built.ok) return built;
    return { ...built, note: `\`${name}\` takes named fields now, one tool per form: ${namedTools(legacy.command, commands).map((t) => `\`${t}\``).join(", ")}. \`args\` works for one release.` };
  }
  if (!entry) return refusal("toolUnknown", `Unknown tool: ${name}`);
  const { command, form, live } = entry;
  if (live && input?.confirmLive !== true) return refusal("liveNotConfirmed", LIVE_REFUSAL(name, platformLabel(command)));
  if (!form) return argsCall(name, entry, input);
  const { confirmLive: _, confirmBypass, ...fields } = input ?? {};
  if ("args" in fields) return refusal("inputInvalid", `${name} takes named fields, not args: ${[...form.positionals, ...form.flags].map((s) => s.name).join(", ") || "none"}`);
  for (const forced of entry.forced) if (fields[forced] === true) delete fields[forced];
  const liveField = live ? undefined : command.input?.forms.flatMap((f) => f.flags).find((f) => f.live && f.name in fields && !form.flags.includes(f));
  if (liveField) return refusal("inputInvalid", `${name} never acts on ${platformLabel(command)}: ${liveField.name} is \`${name}${LIVE_SUFFIX}\`, only when the owner asked (rule 8)`);
  const built = argvOfInput(form, fields, { live });
  if (!built.ok) return refusal("inputInvalid", `${name}: ${built.message}`);
  if (live && !entry.forced.length && !built.live) return refusal("inputInvalid", `${name} is for live runs: set ${form.flags.filter((f) => f.live).map((f) => f.name).join(" or ")}, or call \`${name.slice(0, -LIVE_SUFFIX.length)}\``);
  if (built.bypass && confirmBypass !== true) return refusal("bypassNotConfirmed", BYPASS_REFUSAL(name));
  return { ok: true, argv: commandLine(command, withNoPrompt(command, [...built.argv, ...entry.forced.map((f) => `--${f}`)])) };
}
