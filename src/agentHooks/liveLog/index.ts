import { COMMAND_INDEX } from "../../cli/runner/helpers/commandIndex.ts";
import type { CommandIndexEntry } from "../../cli/runner/helpers/commandIndex.ts";
import { isPlatform } from "../../cli/runner/helpers/platforms.ts";

export interface LiveLogVerdict {
  deny: string | null;
  context: string | null;
}

const FROM_CHECKOUT = /^\s*(?:\(\s*)?(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*(?:&\s*)?["']?(?:\S*[\\/])?(?:bun|node|tsx)(?:\.exe)?["']?\s+(?:run\s+)?["']?(?:\S*[\\/])?bin[\\/]log\.ts["']?\s+([A-Za-z]+)(?:\s+([A-Za-z]+))?/;
const INSTALLED = /^\s*(?:\(\s*)?(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*(?:\S*[\\/])?log(?:\.exe)?\s+([A-Za-z]+)(?:\s+([A-Za-z]+))?/;

export interface LogWords {
  platform: string | null;
  name: string;
}

export function logWordsOf(command: string): LogWords | null {
  const parts = command.replace(/'[^'\n]*'|"(?:[^"\\\n]|\\.)*"/g, (quoted) => (/\s/.test(quoted) ? "''" : quoted)).split(/;|&&|\|\||\||\n/);
  const match = parts.map((part) => FROM_CHECKOUT.exec(part) ?? INSTALLED.exec(part)).find((m) => m !== null);
  if (!match) return null;
  return isPlatform(match[1]) && match[2] ? { platform: match[1], name: match[2] } : { platform: null, name: match[1] };
}

export function logCommandOf(command: string): string | null {
  return logWordsOf(command)?.name ?? null;
}

export function indexEntryOf(words: LogWords, index: readonly CommandIndexEntry[] = COMMAND_INDEX): CommandIndexEntry | null {
  const named = index.filter((entry) => entry.name === words.name);
  return (words.platform ? named.find((entry) => entry.platform === words.platform) : undefined) ?? named.find((entry) => !isPlatform(entry.platform)) ?? named[0] ?? null;
}

const terminalLabel = (entry: CommandIndexEntry): string => (isPlatform(entry.platform) ? `${entry.platform} ${entry.name}` : entry.name);

function logPipelines(command: string): string[] {
  return command.split(/;|&&|\|\||\n/).filter((part) => logCommandOf(part) !== null);
}

export function buffersOutput(command: string): boolean {
  return logPipelines(command).some((p) => /\|\s*(?:tail|head)\b(?![^|]*\s-f\b)/.test(p) || /\|\s*Select-Object\s+-(?:First|Last)\b/i.test(p));
}

export function handRunDenial(name: string, entry: CommandIndexEntry | null = indexEntryOf({ platform: null, name })): string | null {
  if (entry?.terminalOnly) return null;
  return `log ${name} was run by hand from a shell. Every log action goes through the log MCP tools, never a hand-run \`log …\` or \`bun bin/log.ts …\` command (rule 163). Its mcp__log__ tool runs it (getGuide names it); a stale MCP server is reported to the owner, never worked around. Only the terminal-only prompts (${COMMAND_INDEX.filter((e) => e.terminalOnly).map(terminalLabel).join(", ")}) are run in a terminal, by the owner.`;
}

export function liveLogVerdict(tool: string, command: string, runInBackground = false): LiveLogVerdict {
  const words = logWordsOf(command);
  if (!words) return { deny: null, context: null };
  const { name } = words;
  const entry = indexEntryOf(words);
  const handRun = handRunDenial(name, entry);
  if (handRun) return { deny: handRun, context: null };
  if (buffersOutput(command)) {
    return {
      deny: `log ${name} piped through tail/head shows nothing until it ends (rule 26: the owner sees every line as it happens). Run it with \`2>&1 | tee <runFolder>/<name>.log\` and no tail/head, under Monitor, or start a Monitor on \`tail -f ~/.logCli/mcp/<day>.log\` (every log run writes there).`,
      context: null,
    };
  }
  if (tool !== "Monitor" && (runInBackground || entry?.longRunning === true)) {
    return { deny: null, context: `log ${name} runs for seconds to minutes: the owner watches it live (rule 26). If no Monitor is on \`tail -f ~/.logCli/mcp/<day>.log\` (UTC day), start one, and say what each stage means as it comes in.` };
  }
  return { deny: null, context: null };
}
