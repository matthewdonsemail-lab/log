import type { Command } from "../../cli/runner/types.ts";
import { rulesLine } from "../server/helpers/agentRules.ts";
import { guideLine } from "../server/helpers/guides.ts";
import { annotationsOf } from "../server/helpers/toolAnnotations.ts";
import { TOOL_RESULT_SCHEMA } from "../server/types.ts";
import type { LogTool, LogToolInput } from "../server/types.ts";
import { catalogOf, didYouMean, entryById, helpLines, renderGet, renderSearch, renderUnknownId, searchCatalog } from "./helpers/index.ts";
import { CALL_TOOL, CATALOG_GUIDE, GET_TOOL, SEARCH_LIMIT, SEARCH_LIMIT_MAX, SEARCH_TOOL } from "./types.ts";
import type { CallRefusal, CallTarget, CatalogEntry } from "./types.ts";

export * from "./helpers/index.ts";
export * from "./types.ts";

const cache = new WeakMap<readonly Command[], CatalogEntry[]>();

export function catalog(commands: readonly Command[]): CatalogEntry[] {
  const held = cache.get(commands);
  if (held) return held;
  const built = catalogOf(commands);
  cache.set(commands, built);
  return built;
}

export function isCatalogTool(name: string): boolean {
  return name === SEARCH_TOOL || name === GET_TOOL || name === CALL_TOOL;
}

function tail(tool: string): string[] {
  return [guideLine(CATALOG_GUIDE), rulesLine(tool)];
}

export function catalogTools(): LogTool[] {
  return [
    {
      name: SEARCH_TOOL,
      title: "Find a log command by what you want to do",
      description: [
        "Find the log command for a job, in plain words (\"send a dm on x\", \"read a facebook group's members\"). Answers a verdict (strong: these do it; closest: they do most of it; none: nothing does, with the near misses and the words they missed) and each command's id, summary and whether it acts.",
        `Then ${GET_TOOL} the id for its inputs and a call that works, and ${CALL_TOOL} it.`,
        ...tail(SEARCH_TOOL),
      ].join("\n"),
      annotations: annotationsOf("read", false, "Find a log command by what you want to do"),
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "The job, in plain words; a platform name narrows it (x, facebook, discord…)" },
          limit: { type: "integer", description: `How many to list (default ${SEARCH_LIMIT}, at most ${SEARCH_LIMIT_MAX})` },
        },
        required: ["query"],
        additionalProperties: false,
      },
      outputSchema: TOOL_RESULT_SCHEMA,
    },
    {
      name: GET_TOOL,
      title: "One log command: its inputs and a call that works",
      description: [
        "One command by its id: what it does, whether it acts (and how to run it live), its inputs (required first, with type and note), a ready logCall line, the same in the CLI, its guide and its rules.",
        ...tail(GET_TOOL),
      ].join("\n"),
      annotations: annotationsOf("read", false, "One log command: its inputs and a call that works"),
      inputSchema: {
        type: "object",
        properties: { id: { type: "string", description: `The command's id from ${SEARCH_TOOL}, e.g. "twitter.dm"` } },
        required: ["id"],
        additionalProperties: false,
      },
      outputSchema: TOOL_RESULT_SCHEMA,
    },
    {
      name: CALL_TOOL,
      title: "Run a log command by its id",
      description: [
        `Run a command by its id with its inputs, exactly as ${GET_TOOL} lists them. It goes through the same checks as the command's own tool: an unknown input is refused by name with the ones it takes, and nothing runs.`,
        "Read-only unless live: true, which needs confirmLive: true and only when the owner asked for this live run (rule 8). Outside an account's hours only with confirmBypass: true, when the owner asked (rule 35). A long run comes back as a job past waitMs: follow it with jobStatus.",
        ...tail(CALL_TOOL),
      ].join("\n"),
      annotations: annotationsOf("write", true, "Run a log command by its id"),
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: `The command's id from ${SEARCH_TOOL} or ${GET_TOOL}` },
          inputs: { type: "object", description: `The command's inputs by name, as ${GET_TOOL} lists them` },
          live: { type: "boolean", description: "Run the live form that acts on the platform; only when the owner asked" },
          confirmLive: { type: "boolean", description: "Set true only when the owner asked for this live run" },
          confirmBypass: { type: "boolean", description: "Set true only when the owner asked for a run outside the account's local waking hours (rule 20)" },
          waitMs: { type: "integer", description: "How long this call waits for a long run, in ms (default 20000, at most 50000); past it the run comes back as a job" },
        },
        required: ["id"],
        additionalProperties: false,
      },
      outputSchema: TOOL_RESULT_SCHEMA,
    },
  ];
}

export function searchAnswer(entries: readonly CatalogEntry[], input: LogToolInput | undefined): { text: string; json: unknown; ok: boolean } {
  const query = typeof input?.query === "string" ? input.query.trim() : "";
  if (!query) return { ok: false, text: [`${SEARCH_TOOL}: query is needed, in plain words`, ...helpLines([`${SEARCH_TOOL} {"query":"send a dm on x"}`])].join("\n"), json: null };
  const asked = typeof input?.limit === "number" && Number.isInteger(input.limit) ? input.limit : SEARCH_LIMIT;
  const result = searchCatalog(entries, query, Math.min(Math.max(1, asked), SEARCH_LIMIT_MAX));
  const row = (h: (typeof result.hits)[number]) => ({ id: h.entry.id, summary: h.entry.summary, live: Boolean(h.entry.liveTool), terminalOnly: Boolean(h.entry.terminalOnly), matched: h.matched, missed: h.missed });
  return { ok: true, text: renderSearch(result), json: { query, verdict: result.verdict, results: result.hits.map(row), near: result.near.map(row) } };
}

export function getAnswer(entries: readonly CatalogEntry[], input: LogToolInput | undefined): { text: string; json: unknown; ok: boolean } {
  const id = typeof input?.id === "string" ? input.id : "";
  const entry = id ? entryById(entries, id) : null;
  if (!entry) return { ok: false, text: renderUnknownId(id, didYouMean(entries, id)), json: { unknownId: id, didYouMean: didYouMean(entries, id) } };
  return { ok: true, text: renderGet(entry), json: { id: entry.id, summary: entry.summary, live: Boolean(entry.liveTool), inputs: entry.inputs, liveInputs: entry.liveInputs, guide: entry.guide } };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function resolveCall(entries: readonly CatalogEntry[], input: LogToolInput | undefined): CallTarget | CallRefusal {
  const id = typeof input?.id === "string" ? input.id : "";
  const entry = id ? entryById(entries, id) : null;
  if (!entry) return { ok: false, message: renderUnknownId(id, didYouMean(entries, id)) };
  if (entry.terminalOnly) return { ok: false, message: `${CALL_TOOL}: ${entry.id} is not a tool: it ${entry.terminalOnly} Nothing was run.` };
  const given = input?.inputs ?? {};
  if (!isObject(given)) return { ok: false, message: `${CALL_TOOL}: inputs must be an object of the command's inputs by name; nothing was run.\n${helpLines([`${GET_TOOL} {"id":"${entry.id}"}`]).join("\n")}` };
  const live = input?.live === true;
  if (live && !entry.liveTool) return { ok: false, message: `${CALL_TOOL}: ${entry.id} has no live run, it never acts on the platform; call it without live. Nothing was run.` };
  const accepted = [...entry.inputs, ...(live ? entry.liveInputs : [])].map((i) => i.name);
  const unknown = Object.keys(given).filter((name) => !accepted.includes(name));
  if (unknown.length) {
    const liveOnly = unknown.filter((name) => entry.liveInputs.some((i) => i.name === name));
    const why = liveOnly.length && !live ? `${liveOnly.join(", ")} ${liveOnly.length === 1 ? "is" : "are"} only for the live run (live: true with confirmLive: true, only when matt asked)` : `${entry.id} takes ${accepted.join(", ") || "no inputs"}`;
    return { ok: false, message: `${CALL_TOOL}: unknownInput ${unknown.join(", ")}: ${why}. Nothing was run.\n${helpLines([`${GET_TOOL} {"id":"${entry.id}"}`]).join("\n")}` };
  }
  const passed: Record<string, unknown> = { ...given };
  for (const name of ["confirmLive", "confirmBypass", "waitMs"] as const) if (input?.[name] !== undefined) passed[name] = input[name];
  return { ok: true, entry, tool: live ? entry.liveTool! : entry.tool, input: passed };
}
