import type { Command } from "../../../cli/runner/types.ts";
import type { LogTool } from "../types.ts";
import { TERMINAL_ONLY, TOOL_RESULT_SCHEMA } from "../types.ts";
import { rulesLine } from "./agentRules.ts";

/** The tools whose calls run long (a browser, Facebook, rea): their calls are watched with a Monitor (rule 26). */
export const LONG_RUNNING = new Set(["inspect", "join", "read", "poll", "connect", "publish", "profile", "scan", "status", "watch", "warmup", "host", "flow", "capture", "doctor", "campaign"]);

/** How the command is written, the platform first (rule 63): `facebook connect`, `<platform> warmup`, `inspect`. Pure. */
export const commandWords = (command: Command): string =>
  command.platform === "facebook" ? `facebook ${command.name}` : command.platform === "byArgument" ? `<platform> ${command.name}` : command.name;

/** One tool per CLI command, minus the terminal-only ones. Pure. */
export function toolsFromCommands(commands: Command[]): LogTool[] {
  return commands
    .filter((command) => !(command.name in TERMINAL_ONLY))
    .map((command) => ({
      name: command.name,
      description: [
        `log ${commandWords(command)}${command.args ? ` ${command.args}` : ""}`,
        command.summary,
        // Every subcommand and flag, the same text the terminal shows and the README lists (rule 56).
        command.usage,
        ...(command.name === "connect" ? ["Runs --noPrompt: saved cookies that work end it at once; otherwise it signs in by itself from Twenty's email, password and 2FA secret (rule 21), and anything it can't handle waits for matt in the visible window (up to --wait seconds, default 600). Progress streams to ~/.logCli/mcp/<day>.log."] : []),
        ...(command.name === "inspect" ? ["Open the account's browser from here with `start --account <a> --detach`: it runs as its own process and returns once the gate and self-check passed (plain `start` stays running: a terminal only). The browser stays open until `do stop` (or 30 idle minutes). `do <action>` sends one step to that open session and returns its snapshot (element refs), requests and rea reading. click/type/press act on Facebook: --live, only when matt asked."] : []),
        ...(command.name === "join"
          ? [
              "Needs the account's browser open first: inspect start --account <a> --detach. Then, in order:",
              "1. join group --account <a> --group <url|id> : reads the group page (Facebook's viewer_join_state from the page itself), clicks nothing. Run again later to check pending → accepted.",
              "2. join group … --live (confirmLive) : presses Join; the questions, rules and join path go to agencyGroups.joinSubmission.options.",
              "3. join group … --answer --set 1=<option label or text> --set 2=… --agree : the answers (the Clack stepper needs a terminal; --set is the same over MCP). Saved to Twenty, not sent.",
              "4. join group … --fill (dry run), then --fill --live --submit (confirmLive) : the answers into the group's dialog, Submit confirmed by Facebook (QUESTIONNAIRE_COMPLETED). --show reads the row at any time.",
            ]
          : []),
        ...(command.name === "profile" ? ["Without --live it only reads the profile and lists its controls in the run's profileFound.txt. --live uploads socialAccounts.profilePhoto and coverPhoto in one run (rule 28): only when matt asked."] : []),
        "Pass the arguments after the command name in `args`, e.g. [\"--json\"]. `--live` also needs confirmLive: true; `--bypass` (outside the account's hours) needs confirmBypass: true, both only when matt asked.",
        ...(LONG_RUNNING.has(command.name) ? [`Runs for seconds to minutes: start a Monitor on \`tail -f ~/.logCli/mcp/<day>.log\` before calling, so matt watches it live (rule 26).`] : []),
        rulesLine(command.name),
      ].join("\n"),
      inputSchema: {
        type: "object",
        properties: {
          args: { type: "array", items: { type: "string" }, description: command.platform === "byArgument" ? `Arguments for \`log <platform> ${command.name}\`, the platform first (e.g. ["facebook", "reel"])` : `Arguments for \`log ${commandWords(command)}\`` },
          confirmLive: { type: "boolean", description: "Set true only when matt asked for this live run (posts on Facebook)" },
          confirmBypass: { type: "boolean", description: "Set true only when matt asked for a run outside the account's local waking hours (--bypass, rule 20)" },
        },
        additionalProperties: false,
      },
      outputSchema: TOOL_RESULT_SCHEMA,
    }));
}
