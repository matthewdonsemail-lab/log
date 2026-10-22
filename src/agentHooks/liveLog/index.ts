/**
 * What the live-logs hook says before a shell command runs (rules 26, 55).
 * matt watches every run as it happens: a log-cli command piped through `tail`
 * or `head` (or PowerShell's `Select-Object -First/-Last`) holds every line
 * back until the end, so it is refused before it starts. A long command (one
 * of the MCP's LONG_RUNNING tools) run off a Monitor gets a reminder to watch
 * the live log. Pure, so it is tested without an agent.
 */
import { isPlatform } from "../../cli/runner/helpers/platforms.ts";
import { LONG_RUNNING } from "../../mcp/server/helpers/toolsFromCommands.ts";

export interface LiveLogVerdict {
  /** Refuse the call, with the reason the agent reads. */
  deny: string | null;
  /** Context for the agent when the call goes ahead. */
  context: string | null;
}

/** The log-cli command a shell line runs (`bun bin/log.ts facebook warmup …` → "warmup", the platform first, rule 63), or null. Pure. */
export function logCommandOf(command: string): string | null {
  const match = /\bbin[\\/]log\.ts["']?\s+([A-Za-z]+)(?:\s+([A-Za-z]+))?/.exec(command);
  if (!match) return null;
  return isPlatform(match[1]) && match[2] ? match[2] : match[1];
}

/** The pipelines in a shell line (split on `;`, `&&`, `||` and newlines) that run log-cli. Pure. */
function logPipelines(command: string): string[] {
  return command.split(/;|&&|\|\||\n/).filter((part) => logCommandOf(part) !== null);
}

/**
 * A log-cli pipeline that buffers its output until the command ends: `| tail` / `| head` (not `tail -f`),
 * `| Select-Object -First|-Last`. Only the log run's own pipeline counts, not a later command on the line. Pure.
 */
export function buffersOutput(command: string): boolean {
  return logPipelines(command).some((p) => /\|\s*(?:tail|head)\b(?![^|]*\s-f\b)/.test(p) || /\|\s*Select-Object\s+-(?:First|Last)\b/i.test(p));
}

/** The verdict for one tool call. Pure. */
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
