import { formToolName, inputSchemaOf } from "../../../cli/runner/helpers/commandInput.ts";
import type { Command, InputForm } from "../../../cli/runner/types.ts";
import type { LogTool } from "../types.ts";
import { TERMINAL_ONLY, TOOL_RESULT_SCHEMA } from "../types.ts";
import { rulesLine } from "./agentRules.ts";

export const LONG_RUNNING = new Set(["inspect", "join", "read", "poll", "check", "connect", "publish", "profile", "scan", "status", "watch", "warmup", "host", "flow", "capture", "doctor", "campaign"]);

export const commandWords = (command: Command): string =>
  command.platform === "facebook" ? `facebook ${command.name}` : command.platform === "byArgument" ? `<platform> ${command.name}` : command.name;

export interface CommandTool {
  tool: string;
  command: Command;
  form: InputForm | null;
}

export function commandTools(commands: readonly Command[]): CommandTool[] {
  return commands
    .filter((command) => !(command.name in TERMINAL_ONLY))
    .flatMap((command): CommandTool[] => (command.input ? command.input.forms.map((form) => ({ tool: formToolName(command, form), command, form })) : [{ tool: command.name, command, form: null }]));
}

const CONFIRM_LIVE = { type: "boolean", description: "Set true only when matt asked for this live run (it acts on Facebook)" };
const CONFIRM_BYPASS = { type: "boolean", description: "Set true only when matt asked for a run outside the account's local waking hours (rule 20)" };

function formUsage(command: Command, form: InputForm): string[] {
  const lines = command.usage.split("\n").map((line) => line.replace(/^\s*Usage:\s*/, "").trim()).filter(Boolean);
  const head = `${commandWords(command)}${form.words.length ? ` ${form.words.join(" ")}` : ""}`;
  const otherWords = new Set((command.input?.forms ?? []).flatMap((f) => (f === form ? [] : f.words.slice(0, 1))));
  const own = lines.filter((line) => (line === `log ${head}` || line.startsWith(`log ${head} `)) && !otherWords.has(line.slice(`log ${head} `.length).split(" ")[0]));
  const notes = lines.filter((line) => !line.startsWith("log "));
  return [...(own.length ? own : lines.filter((line) => line.startsWith("log "))), ...notes];
}

const NOTES: Readonly<Record<string, string[]>> = {
  connect: ["Runs --noPrompt: saved cookies that work end it at once; otherwise it signs in by itself from Twenty's email, password and 2FA secret (rule 21), and anything it can't handle waits for matt in the visible window (up to --wait seconds, default 600). Progress streams to ~/.logCli/mcp/<day>.log."],
  inspectStart: ["Opens the account's browser as its own process (detach: true) and returns once the gate and self-check passed. It stays open until `inspectDo` with action stop (or 30 idle minutes)."],
  inspectDo: ["Sends one step to the open session and returns its snapshot (element refs), requests and rea reading. Steps that act on Facebook need live: only when matt asked."],
  join: [
    "Needs the account's browser open first: inspectStart { account, detach: true }. Then, in order:",
    "1. join group --account <a> --group <url|id> : reads the group page (Facebook's viewer_join_state from the page itself), clicks nothing. Run again later to check pending → accepted.",
    "2. join group … --live (confirmLive) : presses Join; the questions, rules and join path go to agencyGroups.joinSubmission.options.",
    "3. join group … --answer --set 1=<option label or text> --set 2=… --agree : the answers (the Clack stepper needs a terminal; --set is the same over MCP). Saved to Twenty, not sent.",
    "4. join group … --fill (dry run), then --fill --live --submit (confirmLive) : the answers into the group's dialog, Submit confirmed by Facebook (QUESTIONNAIRE_COMPLETED). --show reads the row at any time.",
  ],
  profile: ["Without --live it only reads the profile and lists its controls in the run's profileFound.txt. --live uploads socialAccounts.profilePhoto and coverPhoto in one run (rule 28): only when matt asked."],
};

function typedTool(entry: CommandTool, form: InputForm): LogTool {
  const { command } = entry;
  const { properties, required } = inputSchemaOf(form);
  const live = form.flags.some((f) => f.live);
  const bypass = form.flags.some((f) => f.bypass);
  return {
    name: entry.tool,
    description: [
      `${form.summary}.`,
      command.summary,
      ...formUsage(command, form),
      ...(NOTES[entry.tool] ?? []),
      `Fill the named fields; each value goes through whole.${live ? " `live` also needs confirmLive: true, only when matt asked." : ""}${bypass ? " `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked." : ""}`,
      ...(LONG_RUNNING.has(command.name) ? ["Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26)."] : []),
      rulesLine(command.name),
    ].join("\n"),
    inputSchema: {
      type: "object",
      properties: { ...properties, ...(live ? { confirmLive: CONFIRM_LIVE } : {}), ...(bypass ? { confirmBypass: CONFIRM_BYPASS } : {}) },
      ...(required.length ? { required } : {}),
      additionalProperties: false,
    },
    outputSchema: TOOL_RESULT_SCHEMA,
  };
}

function argsTool(command: Command): LogTool {
  return {
    name: command.name,
    description: [
      `log ${commandWords(command)}${command.args ? ` ${command.args}` : ""}`,
      command.summary,
      command.usage,
      ...(NOTES[command.name] ?? []),
      "Pass the arguments after the command name in `args`, e.g. [\"--json\"]. `--live` also needs confirmLive: true; `--bypass` (outside the account's hours) needs confirmBypass: true, both only when matt asked.",
      ...(LONG_RUNNING.has(command.name) ? [`Runs for seconds to minutes: start a Monitor on \`tail -f ~/.logCli/mcp/<day>.log\` before calling, so matt watches it live (rule 26).`] : []),
      rulesLine(command.name),
    ].join("\n"),
    inputSchema: {
      type: "object",
      properties: {
        args: { type: "array", items: { type: "string" }, description: command.platform === "byArgument" ? `Arguments for \`log <platform> ${command.name}\`, the platform first (e.g. ["facebook", "reel"])` : `Arguments for \`log ${commandWords(command)}\`` },
        confirmLive: CONFIRM_LIVE,
        confirmBypass: CONFIRM_BYPASS,
      },
      additionalProperties: false,
    },
    outputSchema: TOOL_RESULT_SCHEMA,
  };
}

export function toolsFromCommands(commands: readonly Command[]): LogTool[] {
  return commandTools(commands).map((entry) => (entry.form ? typedTool(entry, entry.form) : argsTool(entry.command)));
}
