import { isPlatform } from "../../../cli/runner/helpers/platforms.ts";
import { currentToolName } from "../../server/helpers/toolAliases.ts";
import type { Command, FlagSpec, InputForm, PositionalSpec } from "../../../cli/runner/types.ts";
import { FLOWS_GUIDE, guideOfCommand } from "../../server/helpers/guides.ts";
import { flowTool } from "../../server/helpers/toolsFromFlows.ts";
import { flowPlatform } from "../../../browser/flow/index.ts";
import type { FlowDefinition } from "../../../browser/flow/index.ts";
import { argsLiveFlags, commandTools } from "../../server/helpers/toolsFromCommands.ts";
import type { CommandTool } from "../../server/helpers/toolsFromCommands.ts";
import { isLongRunning } from "../../../platformKit/gates/helpers/commandGates.ts";
import type { CatalogEntry, CatalogInput, InputType } from "../types.ts";

const TYPE_OF: Readonly<Record<string, InputType>> = { string: "string", integer: "integer", number: "number", boolean: "boolean", booleanValue: "boolean", enum: "enum", pairs: "pairs", rest: "list", list: "list" };

function inputOf(spec: FlagSpec | PositionalSpec, positional: boolean): CatalogInput {
  return { name: spec.name, type: TYPE_OF[spec.kind] ?? "string", required: Boolean(spec.required), note: spec.description, values: spec.values ?? [], positional };
}

function inputsOfForm(form: InputForm): CatalogInput[] {
  const all = [...form.positionals.map((p) => inputOf(p, true)), ...form.flags.map((f) => inputOf(f, false))];
  return [...all.filter((i) => i.required), ...all.filter((i) => !i.required)];
}

function argsInput(command: Command, live: boolean): CatalogInput {
  const liveFlags = argsLiveFlags(command).map((f) => `--${f}`).join(" or ");
  const what = command.platform === "byArgument" ? `the words after \`log <platform> ${command.name}\`, the platform first` : `the words after \`log ${commandWordsOf(command)}\``;
  return { name: "args", type: "list", required: live, note: `${what}${liveFlags ? `; ${liveFlags} only with live: true` : ""}`, values: [], positional: true };
}

export function commandWordsOf(command: Command): string {
  return isPlatform(command.platform) ? `${command.platform} ${command.name}` : command.name;
}

export function catalogIdOf(command: Command, form: InputForm | null): string {
  const head = isPlatform(command.platform) ? [command.platform, command.name] : [command.name];
  return [...head, ...(form?.words ?? [])].join(".");
}

function usageLines(command: Command, form: InputForm | null): string[] {
  const lines = command.usage.split("\n").map((line) => line.replace(/^\s*Usage:\s*/, "").trim()).filter((line) => line.startsWith("log "));
  if (!form || !form.words.length) return lines;
  const head = `log ${commandWordsOf(command)} ${form.words.join(" ")}`;
  const own = lines.filter((line) => line === head || line.startsWith(`${head} `));
  return own.length ? own : lines;
}

function entryOf(plain: CommandTool, live: CommandTool | undefined): CatalogEntry {
  const { command, form } = plain;
  const liveForm = live?.form ?? null;
  const inputs = form ? inputsOfForm(form) : [argsInput(command, false)];
  const liveInputs = live ? (liveForm ? inputsOfForm(liveForm).filter((i) => !inputs.some((p) => p.name === i.name)) : []) : [];
  return {
    id: catalogIdOf(command, form),
    tool: plain.tool,
    liveTool: live?.tool ?? null,
    command,
    form,
    platform: String(command.platform),
    summary: form?.summary ?? command.summary,
    usage: usageLines(command, form),
    effect: plain.effect,
    inputs,
    liveInputs,
    bypass: form ? form.flags.some((f) => f.bypass) : /--bypass\b/.test(command.usage),
    longRunning: isLongRunning(command),
    guide: guideOfCommand(command),
    terminalOnly: null,
  };
}

function terminalEntries(commands: readonly Command[]): CatalogEntry[] {
  return commands
    .filter((command) => command.terminalOnly)
    .flatMap((command) =>
      (command.input?.forms ?? [null]).map((form): CatalogEntry => ({
        id: catalogIdOf(command, form),
        tool: "",
        liveTool: null,
        command,
        form,
        platform: String(command.platform),
        summary: form?.summary ?? command.summary,
        usage: usageLines(command, form),
        effect: command.effect,
        inputs: form ? inputsOfForm(form) : [],
        liveInputs: [],
        bypass: false,
        longRunning: false,
        guide: guideOfCommand(command),
        terminalOnly: command.terminalOnly ?? null,
      })),
    );
}

export function catalogOf(commands: readonly Command[]): CatalogEntry[] {
  const tools = commandTools(commands);
  const callable = tools
    .filter((t) => !t.live)
    .map((plain) => entryOf(plain, tools.find((t) => t.live && t.command === plain.command && t.form?.words.join(" ") === plain.form?.words.join(" "))));
  return [...callable, ...terminalEntries(commands)];
}

export function flowEntries(commands: readonly Command[], flows: readonly FlowDefinition[]): CatalogEntry[] {
  const command = commands.find((c) => c.name === "flow" && c.input);
  const form = command?.input?.forms.find((f) => f.words.join(" ") === "run") ?? null;
  if (!command || !form) return [];
  return flows.map((flow): CatalogEntry => {
    const platform = flowPlatform(flow);
    const params = flow.params.map((p): CatalogInput => ({ name: p.name, type: "string", required: true, note: `${p.description}${p.kind === "file" ? " (a URL or a local path)" : ""}`, values: [], positional: false }));
    const own = (name: string) => form.flags.find((f) => f.name === name);
    const optional = ["bypass", "now", "proxyMs"].flatMap((name) => (own(name) ? [inputOf(own(name)!, false)] : []));
    return {
      id: [...(platform ? [platform] : []), "flow", flow.name].join("."),
      tool: flowTool(flow),
      liveTool: flowTool(flow, true),
      command,
      form: null,
      platform: platform ?? "any",
      summary: flow.summary,
      usage: [`log flow run ${flow.name} --account <a> ${flow.params.map((p) => `--set ${p.name}=…`).join(" ")}`.trimEnd()],
      effect: "read",
      inputs: [{ name: "account", type: "string", required: true, note: "The account it runs on", values: [], positional: false }, ...params, ...optional],
      liveInputs: [],
      bypass: true,
      longRunning: true,
      guide: FLOWS_GUIDE,
      terminalOnly: null,
      recorded: true,
    };
  });
}

export function entryById(entries: readonly CatalogEntry[], id: string): CatalogEntry | null {
  const wanted = currentToolName(id.trim());
  return entries.find((e) => e.id === wanted) ?? entries.find((e) => (e.tool && e.tool === wanted) || e.liveTool === wanted) ?? entries.find((e) => e.id.toLowerCase() === wanted.toLowerCase()) ?? null;
}
