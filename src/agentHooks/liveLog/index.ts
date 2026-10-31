import { isPlatform } from "../../cli/runner/helpers/platforms.ts";
import { LONG_RUNNING } from "../../mcp/server/helpers/toolsFromCommands.ts";

export interface LiveLogVerdict {
  deny: string | null;
  context: string | null;
}

export function logCommandOf(command: string): string | null {
  const match = /\bbin[\\/]log\.ts["']?\s+([A-Za-z]+)(?:\s+([A-Za-z]+))?/.exec(command);
  if (!match) return null;
  return isPlatform(match[1]) && match[2] ? match[2] : match[1];
}

function logPipelines(command: string): string[] {
  return command.split(/;|&&|\|\||\n/).filter((part) => logCommandOf(part) !== null);
}

export function buffersOutput(command: string): boolean {
  return logPipelines(command).some((p) => /\|\s*(?:tail|head)\b(?![^|]*\s-f\b)/.test(p) || /\|\s*Select-Object\s+-(?:First|Last)\b/i.test(p));
}

export function liveLogVerdict(tool: string, command: string, runInBackground = false): LiveLogVerdict {
  const name = logCommandOf(command);
  if (!name) return { deny: null, context: null };
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
