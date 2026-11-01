import { isPlatform } from "../../cli/runner/helpers/platforms.ts";
import { LONG_RUNNING } from "../../mcp/server/helpers/toolsFromCommands.ts";
import { TERMINAL_ONLY } from "../../mcp/server/types.ts";

export interface LiveLogVerdict {
  deny: string | null;
  context: string | null;
}

const FROM_CHECKOUT = /^\s*(?:\(\s*)?(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*(?:&\s*)?["']?(?:\S*[\\/])?(?:bun|node|tsx)(?:\.exe)?["']?\s+(?:run\s+)?["']?(?:\S*[\\/])?bin[\\/]log\.ts["']?\s+([A-Za-z]+)(?:\s+([A-Za-z]+))?/;
const INSTALLED = /^\s*(?:\(\s*)?(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*(?:\S*[\\/])?log(?:\.exe)?\s+([A-Za-z]+)(?:\s+([A-Za-z]+))?/;

export function logCommandOf(command: string): string | null {
  const parts = command.replace(/'[^'\n]*'|"(?:[^"\\\n]|\\.)*"/g, (quoted) => (/\s/.test(quoted) ? "''" : quoted)).split(/;|&&|\|\||\||\n/);
  const match = parts.map((part) => FROM_CHECKOUT.exec(part) ?? INSTALLED.exec(part)).find((m) => m !== null);
  if (!match) return null;
  return isPlatform(match[1]) && match[2] ? match[2] : match[1];
}

function logPipelines(command: string): string[] {
  return command.split(/;|&&|\|\||\n/).filter((part) => logCommandOf(part) !== null);
}

export function buffersOutput(command: string): boolean {
  return logPipelines(command).some((p) => /\|\s*(?:tail|head)\b(?![^|]*\s-f\b)/.test(p) || /\|\s*Select-Object\s+-(?:First|Last)\b/i.test(p));
}

export function handRunDenial(name: string): string | null {
  if (name in TERMINAL_ONLY) return null;
  return `log ${name} was run by hand from a shell. Every log action goes through the log MCP tools, never a hand-run \`log …\` or \`bun bin/log.ts …\` command (rule 106: matt, "you're not allowed hand-rolled commands, it always has to be through the MCP"). Call its mcp__log__ tool instead (getGuide names it); if the MCP server is stale, say so to matt rather than working around it. Only the terminal-only prompts (${Object.keys(TERMINAL_ONLY).join(", ")}) are run in a terminal, by matt.`;
}

export function liveLogVerdict(tool: string, command: string, runInBackground = false): LiveLogVerdict {
  const name = logCommandOf(command);
  if (!name) return { deny: null, context: null };
  const handRun = handRunDenial(name);
  if (handRun) return { deny: handRun, context: null };
  if (buffersOutput(command)) {
    return {
      deny: `log ${name} piped through tail/head shows nothing until it ends (rule 26: matt sees every line as it happens). Run it with \`2>&1 | tee <runFolder>/<name>.log\` and no tail/head, under Monitor, or start a Monitor on \`tail -f ~/.logCli/mcp/<day>.log\` (every log run writes there).`,
      context: null,
    };
  }
  if (tool !== "Monitor" && (runInBackground || LONG_RUNNING.has(name))) {
    return { deny: null, context: `log ${name} runs for seconds to minutes: matt watches it live (rule 26). If no Monitor is on \`tail -f ~/.logCli/mcp/<day>.log\` (UTC day), start one, and say what each stage means as it comes in.` };
  }
  return { deny: null, context: null };
}
