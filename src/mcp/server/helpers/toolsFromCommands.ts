import { formToolName, inputSchemaOf } from "../../../cli/runner/helpers/commandInput.ts";
import { commandKey, isPlatform, platformLabel, toolBaseName } from "../../../cli/runner/helpers/platforms.ts";
import type { Command, InputForm, ToolEffect } from "../../../cli/runner/types.ts";
import type { LogTool } from "../types.ts";
import { TERMINAL_ONLY, TOOL_RESULT_SCHEMA } from "../types.ts";
import { rulesLine } from "./agentRules.ts";
import { guideLine, guideOfCommand } from "./guides.ts";
import { annotationsOf, LIVE_SUFFIX, titleOf } from "./toolAnnotations.ts";

export const LONG_RUNNING = new Set(["inspect", "join", "read", "poll", "check", "connect", "publish", "profile", "scan", "status", "watch", "warmup", "host", "flow", "capture", "doctor", "campaign", "queue"]);

export const commandWords = (command: Command): string =>
  isPlatform(command.platform) ? `${command.platform} ${command.name}` : command.platform === "byArgument" ? `<platform> ${command.name}` : command.name;

export interface CommandTool {
  tool: string;
  command: Command;
  form: InputForm | null;
  live: boolean;
  forced: string[];
  effect: ToolEffect;
}

export const ARGS_LIVE_FLAGS = ["live", "likes"] as const;

export function argsLiveFlags(command: Command): string[] {
  return ARGS_LIVE_FLAGS.filter((flag) => new RegExp(`--${flag}\\b`).test(command.usage));
}

function formTools(command: Command, form: InputForm): CommandTool[] {
  const tool = formToolName(command, form);
  const effect = form.effect ?? command.effect;
  const liveFlags = form.flags.filter((f) => f.live);
  const plain: InputForm = { ...form, flags: form.flags.filter((f) => !f.live) };
  const tools: CommandTool[] = [{ tool, command, form: plain, live: false, forced: [], effect }];
  if (liveFlags.length === 1) tools.push({ tool: `${tool}${LIVE_SUFFIX}`, command, form: plain, live: true, forced: [liveFlags[0].name], effect });
  if (liveFlags.length > 1) tools.push({ tool: `${tool}${LIVE_SUFFIX}`, command, form, live: true, forced: [], effect });
  return tools;
}

export function commandTools(commands: readonly Command[]): CommandTool[] {
  return commands
    .filter((command) => !(command.name in TERMINAL_ONLY))
    .flatMap((command): CommandTool[] => {
      if (command.input) return command.input.forms.flatMap((form) => formTools(command, form));
      const plain: CommandTool = { tool: toolBaseName(command), command, form: null, live: false, forced: [], effect: command.effect };
      return argsLiveFlags(command).length ? [plain, { ...plain, tool: `${toolBaseName(command)}${LIVE_SUFFIX}`, live: true }] : [plain];
    });
}

export interface ToolOptions {
  full?: boolean;
  shell?: boolean;
}

export const SHELL_CLIENTS = /claude-code|codex/i;

export function hasShell(clientName: string | undefined): boolean {
  return clientName === undefined || SHELL_CLIENTS.test(clientName);
}

export function longRunLine(options: ToolOptions, minutes = "seconds to minutes"): string {
  return options.shell === false
    ? `Runs for ${minutes}: every line it streams comes back in the result's \`progress\` (with its time), and the result says where every open browser is (\`browsers\`, \`next\`, \`needsMatt\`) (rules 26, 54). A run that outlasts the call's wait (\`waitMs\`, default 20 s, at most 50 s) comes back as a job (\`exit\` -1, \`job.id\`): follow it with \`jobStatus\` { jobId, afterLine }, stop it at its next browser step with \`jobCancel\`.`
    : `Runs for ${minutes}: start a Monitor on \`tail -f ~/.logCli/mcp/<day>.log\` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (\`waitMs\`, default 20 s, at most 50 s) comes back as a job (\`exit\` -1, \`job.id\`): follow it with \`jobStatus\` { jobId, afterLine }, stop it at its next browser step with \`jobCancel\`.`;
}

export const WAIT_MS = { type: "integer", description: "How long this call waits for the run, in ms (default 20000, at most 50000). A run still going then comes back as a job: follow it with jobStatus" };

const CONFIRM_LIVE = (place: string) => ({ type: "boolean", description: `Set true only when matt asked for this live run (it acts on ${place})` });
const CONFIRM_BYPASS = { type: "boolean", description: "Set true only when matt asked for a run outside the account's local waking hours (rule 20)" };

function formUsage(command: Command, form: InputForm): string[] {
  const lines = command.usage.split("\n").map((line) => line.replace(/^\s*Usage:\s*/, "").trim()).filter(Boolean);
  const head = `${commandWords(command)}${form.words.length ? ` ${form.words.join(" ")}` : ""}`;
  const otherWords = new Set((command.input?.forms ?? []).flatMap((f) => (f === form ? [] : f.words.slice(0, 1))));
  const own = lines.filter((line) => (line === `log ${head}` || line.startsWith(`log ${head} `)) && !otherWords.has(line.slice(`log ${head} `.length).split(" ")[0]));
  const notes = lines.filter((line) => !line.startsWith("log "));
  return [...(own.length ? own : lines.filter((line) => line.startsWith("log "))), ...notes];
}

export const NOTES: Readonly<Record<string, string[]>> = {
  connect: ["Runs --noPrompt: saved cookies that work end it at once; otherwise it signs in by itself from Twenty's email, password and 2FA secret (rule 21), and anything it can't handle waits for matt in the visible window (up to --wait seconds, default 600). Progress streams to ~/.logCli/mcp/<day>.log."],
  inspectStart: ["Opens the account's browser as its own process (detach: true) and returns once the gate and self-check passed. It stays open until `inspectDo` with action stop (or 30 idle minutes)."],
  inspectDo: ["Sends one step to the open session and returns its snapshot (element refs), requests and rea reading. Steps that act on Facebook (click, type, press, solve, signIn, code, pin…) are `inspectDoLive`."],
  inspectDoLive: ["Sends one step that acts on Facebook to the open session and returns its snapshot (element refs), requests and rea reading."],
  join: [
    "Needs the account's browser open first: inspectStart { account, detach: true }. Then, in order:",
    "1. join group --account <a> --group <url|id> : reads the group page (Facebook's viewer_join_state from the page itself), clicks nothing. Run again later to check pending → accepted.",
    "2. joinLive: join group … --live (confirmLive) : presses Join; the questions, rules and join path go to agencyGroups.joinSubmission.options.",
    "3. join group … --answer --set 1=<option label or text> --set 2=… --agree : the answers (the Clack stepper needs a terminal; --set is the same over MCP). Saved to Twenty, not sent.",
    "4. join group … --fill (dry run), then joinLive: --fill --live --submit (confirmLive) : the answers into the group's dialog, Submit confirmed by Facebook (QUESTIONNAIRE_COMPLETED). --show reads the row at any time.",
  ],
  profile: ["Without --live it only reads the profile and lists its controls in the run's profileFound.txt. profileLive with --live uploads socialAccounts.profilePhoto and coverPhoto in one run (rule 28): only when matt asked."],
};

function guideLines(command: Command): string[] {
  const topic = guideOfCommand(command);
  return topic ? [guideLine(topic)] : [];
}

function usageHeads(usage: string): string[] {
  return usage.split("\n").map((line) => line.replace(/^\s*Usage:\s*/, "").trim()).filter((line) => line.startsWith("log "));
}

const LIVE_LINE = (place: string) => `Live on ${place}: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).`;

function typedTool(entry: CommandTool, form: InputForm, options: ToolOptions): LogTool {
  const { command } = entry;
  const { properties, required } = inputSchemaOf(form);
  const bypass = form.flags.some((f) => f.bypass);
  const title = titleOf(form.summary, entry.live, platformLabel(command));
  return {
    name: entry.tool,
    title,
    description: [
      `${form.summary}.`,
      ...(entry.live ? [LIVE_LINE(platformLabel(command))] : []),
      command.summary,
      ...(options.full ? formUsage(command, form) : formUsage(command, form).filter((line) => line.startsWith("log "))),
      ...(NOTES[entry.tool] ?? []),
      `Fill the named fields; each value goes through whole.${bypass ? " `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked." : ""}${!entry.live && entry.command.input?.forms.some((f) => f.words.join() === form.words.join() && f.flags.some((flag) => flag.live)) ? ` What acts on ${platformLabel(command)} is \`${entry.tool}${LIVE_SUFFIX}\`.` : ""}`,
      ...(LONG_RUNNING.has(command.name) ? [longRunLine(options)] : []),
      ...guideLines(command),
      rulesLine(commandKey(command)),
    ].join("\n"),
    annotations: annotationsOf(entry.effect, entry.live, title),
    inputSchema: {
      type: "object",
      properties: { ...properties, ...(entry.live ? { confirmLive: CONFIRM_LIVE(platformLabel(command)) } : {}), ...(bypass ? { confirmBypass: CONFIRM_BYPASS } : {}), ...(LONG_RUNNING.has(command.name) ? { waitMs: WAIT_MS } : {}) },
      ...(required.length || entry.live ? { required: [...required, ...(entry.live ? ["confirmLive"] : [])] } : {}),
      additionalProperties: false,
    },
    outputSchema: TOOL_RESULT_SCHEMA,
  };
}

function argsTool(entry: CommandTool, options: ToolOptions): LogTool {
  const { command } = entry;
  const liveFlags = argsLiveFlags(command).map((f) => `--${f}`).join(" or ");
  const title = titleOf(command.summary, entry.live, platformLabel(command));
  return {
    name: entry.tool,
    title,
    description: [
      `log ${commandWords(command)}${command.args ? ` ${command.args}` : ""}`,
      ...(entry.live ? [LIVE_LINE(platformLabel(command))] : []),
      command.summary,
      ...(options.full ? [command.usage] : usageHeads(command.usage)),
      ...(NOTES[command.name] ?? []),
      entry.live
        ? `Pass the arguments after the command name in \`args\`, with ${liveFlags}. \`--bypass\` (outside the account's hours) needs confirmBypass: true, only when matt asked.`
        : `Pass the arguments after the command name in \`args\`, e.g. ["--json"].${liveFlags ? ` It never takes ${liveFlags}: that is \`${command.name}${LIVE_SUFFIX}\`.` : ""} \`--bypass\` (outside the account's hours) needs confirmBypass: true, only when matt asked.`,
      ...(LONG_RUNNING.has(command.name) ? [longRunLine(options)] : []),
      ...guideLines(command),
      rulesLine(commandKey(command)),
    ].join("\n"),
    annotations: annotationsOf(entry.effect, entry.live, title),
    inputSchema: {
      type: "object",
      properties: {
        args: { type: "array", items: { type: "string" }, description: command.platform === "byArgument" ? `Arguments for \`log <platform> ${command.name}\`, the platform first (e.g. ["facebook", "reel"])` : `Arguments for \`log ${commandWords(command)}\`` },
        ...(entry.live ? { confirmLive: CONFIRM_LIVE(platformLabel(command)) } : {}),
        confirmBypass: CONFIRM_BYPASS,
        ...(LONG_RUNNING.has(command.name) ? { waitMs: WAIT_MS } : {}),
      },
      ...(entry.live ? { required: ["args", "confirmLive"] } : {}),
      additionalProperties: false,
    },
    outputSchema: TOOL_RESULT_SCHEMA,
  };
}

export function toolsFromCommands(commands: readonly Command[], options: ToolOptions = {}): LogTool[] {
  return commandTools(commands).map((entry) => (entry.form ? typedTool(entry, entry.form, options) : argsTool(entry, options)));
}
