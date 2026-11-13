import { createTregClient, endpointOf, paramsOf, shownCommand, callArgs, trimAnswer, trimOf } from "../../extensions/treg/index.ts";
import type { TregClient, TregRun } from "../../extensions/treg/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../runner/types.ts";

export const TREG_USAGE = [
  "Usage: log treg search \"<what you want done>\" [--limit <n>] [--json]   (treg's catalog, found by the job: each endpoint's id, what it does and its price)",
  "       log treg get <endpointId> [--json]   (one endpoint in full: its price, its params and a call that works)",
  "       log treg call <endpointId> [--params '<json object>'] [--path <path>] [--method <GET|POST>] [--data '<body>'] [--await] [--maxItems <n>] [--fields <a,b>] [--where <key=value>] [--raw] [--approvedBy <who>] [--live] [--json]   (calls it through treg, the key injected server-side: a free endpoint runs; a priced one is a dry run that says its price unless --live with --approvedBy; the answer drops treg's raw copy unless --raw, and --maxItems, --fields and --where trim every list in it)",
  "treg is an extension (docs/extensions/treg.md): every lookup comes from an external source through it (rule 53), and nothing that costs money runs unless matt asked (rule 41). It runs the treg CLI on this machine (TREG_BIN moves it); treg's balance is in log balance.",
].join("\n");

const APPROVED_BY: FlagSpec = { name: "approvedBy", kind: "string", description: "Who approved spending on a priced endpoint: needed with --live (rule 41)" };

export const TREG_INPUT: CommandInput = {
  forms: [
    {
      words: ["search"],
      summary: "Find a treg endpoint by what you want done: each one's id, what it does and its price",
      positionals: [{ name: "query", kind: "rest", required: true, description: "The job in plain words, e.g. x user tweets, web search, tiktok comments" }],
      flags: [{ name: "limit", kind: "string", description: "How many, default 10, at most 100" }, JSON_FLAG],
    },
    {
      words: ["get"],
      summary: "One treg endpoint in full: its price, its params and a call that works",
      positionals: [{ name: "id", kind: "string", required: true, description: "The endpoint id from search, e.g. tinyfish.web.search" }],
      flags: [JSON_FLAG],
    },
    {
      words: ["call"],
      effect: "spend",
      summary: "Call a treg endpoint, the key injected server-side: a free one runs, a priced one is a dry run saying its price unless live with approvedBy",
      positionals: [{ name: "id", kind: "string", required: true, description: "The endpoint id from search or get" }],
      flags: [
        { name: "params", kind: "string", description: "The query params as a JSON object, e.g. {\"query\":\"kick streamer managers\",\"domain_type\":\"web\"}; a list is sent comma-separated" },
        { name: "path", kind: "string", description: "The path, when the endpoint takes one" },
        { name: "method", kind: "string", description: "The HTTP method, when it isn't the endpoint's own" },
        { name: "data", kind: "string", description: "The request body, for a POST" },
        { name: "await", kind: "boolean", description: "Wait for an async endpoint to finish" },
        { name: "maxItems", kind: "string", description: "Keep at most this many rows in each list of the answer (after --where)" },
        { name: "fields", kind: "string", description: "Keep only these keys in each row of the answer's lists, comma-separated, e.g. id,text,createdUtc" },
        { name: "where", kind: "string", description: "Keep only rows whose key equals the value, comma-separated, e.g. isReply=false" },
        { name: "raw", kind: "boolean", description: "Keep treg's raw provider copy in the answer (dropped by default, it repeats output)" },
        APPROVED_BY,
        { name: "live", kind: "boolean", live: true, description: "Spend on a priced endpoint, only when matt asked (rule 41); a free one runs without it" },
        JSON_FLAG,
      ],
    },
  ],
};

export const tregDeps: { client: () => TregClient } = { client: () => createTregClient() };

const SUBS = ["search", "get", "call"] as const;

function failed(sub: string, run: TregRun) {
  return { code: 1, stderr: `log treg ${sub}: tregFailed (exit ${run.code}): ${(run.stderr || run.stdout).trim().slice(-1500) || "treg gave no reason"}` };
}

function asJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const tregCommand: Command = {
  usage: TREG_USAGE,
  platform: "any",
  name: "treg",
  effect: "read",
  input: TREG_INPUT,
  summary: "The treg extension: find an endpoint by the job, read it, and call it with the key injected server-side (free ones run, priced ones only when the owner asked)",
  args: "search \"<job>\"|get <id>|call <id> [--params <json>] [--approvedBy <who>] [--live] [--json]",
  async run(context, argv) {
    const sub = SUBS.find((s) => s === argv[0]);
    if (!sub) return { code: 1, stderr: `log treg: say search, get or call\n${TREG_USAGE}` };
    const form = TREG_INPUT.forms[SUBS.indexOf(sub)];
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...form, words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log treg ${sub}: ${parsed.error}\n${TREG_USAGE}` };
    const json = parsed.flags["json"] === true;
    const client = tregDeps.client();
    if (sub === "search") {
      const limit = parsed.flags["limit"] === undefined ? 10 : Number(parsed.flags["limit"]);
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) return { code: 1, stderr: `log treg search: --limit is a whole number from 1 to 100\n${TREG_USAGE}` };
      const query = parsed.positionals.join(" ").trim();
      const run = await client.search(query, limit);
      if (!run.ok) return failed(sub, run);
      return { code: 0, stdout: json ? JSON.stringify({ query, results: run.stdout }, null, 2) : `treg catalog for "${query}" (each id goes to log treg get, then log treg call):\n${run.stdout.trim()}` };
    }
    const id = String(parsed.positionals[0] ?? "").trim();
    if (!id) return { code: 1, stderr: `log treg ${sub}: say which endpoint\n${TREG_USAGE}` };
    if (sub === "get") {
      const got = await client.get(id);
      if (!got.ok) return failed("get", got);
      const endpoint = endpointOf(id, got.stdout);
      return { code: 0, stdout: json ? JSON.stringify({ endpoint: { ...endpoint, text: undefined }, detail: got.stdout }, null, 2) : got.stdout.trim() };
    }
    const params = paramsOf(parsed.flags["params"]);
    if (!params.ok) return { code: 1, stderr: `log treg call: tregParamsInvalid: ${params.error}` };
    const input = {
      id,
      params: params.params,
      ...(typeof parsed.flags["path"] === "string" ? { path: parsed.flags["path"] } : {}),
      ...(typeof parsed.flags["method"] === "string" ? { method: parsed.flags["method"] } : {}),
      ...(typeof parsed.flags["data"] === "string" ? { data: parsed.flags["data"] } : {}),
      wait: parsed.flags["await"] === true,
    };
    const trimmed = trimOf(parsed.flags);
    if (!trimmed.ok) return { code: 1, stderr: `log treg call: tregTrimInvalid: ${trimmed.error}` };
    const shown = shownCommand(callArgs(input));
    const live = parsed.flags["live"] === true;
    const approvedBy = typeof parsed.flags["approvedBy"] === "string" ? parsed.flags["approvedBy"].trim() : "";
    const answerOf = (run: { stdout: string }, endpointId: string, price: string) => {
      const parsedAnswer = asJson(run.stdout);
      const answer = typeof parsedAnswer === "string" ? parsedAnswer : trimAnswer(parsedAnswer, trimmed.trim);
      return { code: 0, stdout: json ? JSON.stringify({ endpoint: endpointId, price, answer }, null, 2) : typeof answer === "string" ? answer.trim() : JSON.stringify(answer, null, 2) };
    };
    if (live && approvedBy) {
      context.err(`treg: calling ${id} (approved by ${approvedBy}; its price is read at the same time)`);
      const [got, run] = await Promise.all([client.get(id), client.call(input)]);
      const endpoint = got.ok ? endpointOf(id, got.stdout) : null;
      const price = endpoint ? (endpoint.free ? "free" : endpoint.price ?? "unknown") : "unknown (the price read failed)";
      context.err(`treg: ${id} costs ${price}`);
      if (!run.ok) return failed(sub, run);
      return answerOf(run, endpoint?.id ?? id, price);
    }
    const got = await client.get(id);
    if (!got.ok) return failed("get", got);
    const endpoint = endpointOf(id, got.stdout);
    const price = endpoint.price ?? "unknown";
    if (!endpoint.free && !live) {
      return { code: 0, stdout: json ? JSON.stringify({ dryRun: true, endpoint: endpoint.id, price, command: shown }, null, 2) : `log treg call: dry run, nothing called or spent. ${endpoint.id} costs ${price}; with --live and --approvedBy it runs: ${shown}` };
    }
    if (!endpoint.free && !approvedBy) return { code: 1, stderr: `log treg call: notApproved: ${endpoint.id} costs ${price}, so it needs the name of who approved the spend (--approvedBy, rule 41)` };
    context.err(`treg: calling ${endpoint.id} (${price})`);
    const run = await client.call({ ...input, id: endpoint.id });
    if (!run.ok) return failed(sub, run);
    return answerOf(run, endpoint.id, price);
  },
};
