import type { Command } from "../../../cli/runner/types.ts";
import type { LogTool } from "../types.ts";
import { TERMINAL_ONLY } from "../types.ts";

/** One tool per CLI command, minus the terminal-only ones. Pure. */
export function toolsFromCommands(commands: Command[]): LogTool[] {
  return commands
    .filter((command) => !(command.name in TERMINAL_ONLY))
    .map((command) => ({
      name: command.name,
      description: [
        `log ${command.name}${command.args ? ` ${command.args}` : ""}`,
        command.summary,
        ...(command.name === "connect" ? ["Runs --noPrompt: saved cookies that work end it at once; otherwise matt signs in in the visible Camoufox window (up to --wait seconds, default 600)."] : []),
        "Pass the arguments after the command name in `args`, e.g. [\"--json\"]. `--live` also needs confirmLive: true.",
      ].join("\n"),
      inputSchema: {
        type: "object",
        properties: {
          args: { type: "array", items: { type: "string" }, description: `Arguments for \`log ${command.name}\`` },
          confirmLive: { type: "boolean", description: "Set true only when matt asked for this live run (posts on Facebook)" },
        },
        additionalProperties: false,
      },
    }));
}
