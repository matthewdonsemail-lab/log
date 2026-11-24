import { harnessOffLine, harnessOffState, setHarnessOff } from "../../agentHooks/harness/off/client.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput, CommandResult, FlagSpec } from "../runner/types.ts";

export const HARNESS_USAGE = [
  "Usage: log harness off --by <who> [--json]",
  "       log harness on --by <who> [--json]",
  "       log harness status [--json]",
  "off stops log's prompt hooks, per-session pushes, refusing command hooks and log tools in every harness until harness on. Nothing is deleted and no config file or plugin is changed. on restores them. status says which state is in force and who set it.",
].join("\n");

const BY: FlagSpec = { name: "by", kind: "string", required: true, description: "Who asked for this change" };

export const HARNESS_INPUT: CommandInput = {
  forms: [
    { words: ["off"], effect: "write", summary: "Turn off log's harness hooks, pushes and tools until harness on", positionals: [], flags: [BY, JSON_FLAG] },
    { words: ["on"], effect: "write", summary: "Turn log's harness hooks, pushes and tools back on", positionals: [], flags: [BY, JSON_FLAG] },
    { words: ["status"], effect: "read", summary: "Show whether log is on or off in this harness", positionals: [], flags: [JSON_FLAG] },
  ],
};

export const harnessCommand: Command = {
  usage: HARNESS_USAGE,
  platform: "any",
  name: "harness",
  effect: "write",
  input: HARNESS_INPUT,
  summary: "Turn log's hooks, pushes and tools off or on from inside a harness session",
  args: "off|on|status [--by <who>] [--json]",
  async run(_context, argv): Promise<CommandResult> {
    const parsed = parseArgs(argv, parserSpecOf(HARNESS_INPUT));
    if (!parsed.ok) return refuseInput("harness", parsed.error, HARNESS_USAGE);
    const [sub] = parsed.positionals;
    if (sub !== "off" && sub !== "on" && sub !== "status") return refuseInput("harness", `expected off, on or status, got ${sub ?? "nothing"}`, HARNESS_USAGE);
    const json = parsed.flags["json"] === true;
    if (sub === "status") {
      const state = harnessOffState();
      if (json) return { code: 0, stdout: JSON.stringify({ off: state !== null, state }, null, 2) };
      return { code: 0, stdout: harnessOffLine(state) };
    }
    const by = parsed.flags["by"];
    if (typeof by !== "string" || !by.trim()) return refuseInput("harness", "--by <who> is needed for off and on", HARNESS_USAGE);
    const state = setHarnessOff(sub === "off", by.trim());
    if (json) return { code: 0, stdout: JSON.stringify({ off: state !== null, state }, null, 2) };
    return { code: 0, stdout: harnessOffLine(state) };
  },
};
