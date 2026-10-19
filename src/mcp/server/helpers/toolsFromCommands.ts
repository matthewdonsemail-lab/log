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
        ...(command.name === "connect" ? ["Runs --noPrompt: saved cookies that work end it at once; otherwise it signs in by itself from Twenty's email, password and 2FA secret (rule 21), and anything it can't handle waits for matt in the visible window (up to --wait seconds, default 600). Progress streams to ~/.logCli/mcp/<day>.log."] : []),
        ...(command.name === "inspect" ? ["`start` keeps the browser open until `do stop` (or 30 idle minutes): run it in a terminal. `do <action>` sends one step to that open session and returns its snapshot (element refs), requests and rea reading. click/type/press act on Facebook: --live, only when matt asked."] : []),
        ...(command.name === "profile" ? ["Without --live it only reads the profile and lists its controls in the run's profileFound.txt. --live uploads socialAccounts.profilePhoto and coverPhoto in one run (rule 28): only when matt asked."] : []),
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
