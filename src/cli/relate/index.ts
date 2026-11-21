import { join } from "node:path";
import { buildGraph, pointerOf, eventsThrough, queryGraph, refreshGraph, relateContext, verifyGraph, graphDir } from "../../relate/graph/index.ts";
import type { GraphCounts, NetworkGraphCounts } from "../../relate/graph/index.ts";
import { MACHINE_VIEWS, relateMachine } from "../../relate/machine/index.ts";
import type { MachineView } from "../../relate/machine/index.ts";
import { defaultDbPath, openDatabase } from "../../storage/schema/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const RELATE_USAGE = [
  "Usage: log relate build [--json]",
  "       log relate status [--json]",
  "       log relate verify [--json]",
  "       log relate ask \"<text>\" [--json]",
  "       log relate query \"<cypher>\" [--json]",
  "       log relate machine [--person|--to <handle>] [--view <view>] [--json]",
].join("\n");

export const RELATE_INPUT: CommandInput = {
  forms: [
    { words: ["build"], effect: "write", summary: "Project log.db into a new Relate graph and make it current (local only)", positionals: [], flags: [JSON_FLAG] },
    { words: ["status"], summary: "The current Relate graph and how far behind log.db it is", positionals: [], flags: [JSON_FLAG] },
    { words: ["verify"], summary: "Check every Relate graph count against log.db", positionals: [], flags: [JSON_FLAG] },
    { words: ["ask"], summary: "Show the connected context (chats, engagement, shared groups, who could introduce, same orbit) for the people a text names", positionals: [{ name: "text", kind: "string", required: true, description: "A prompt or note naming people, e.g. \"reply to @someone\"" }], flags: [JSON_FLAG] },
    {
      words: ["machine"],
      summary: "Draw relationships as a state machine: one person, the route to someone, or the network",
      positionals: [],
      flags: [
        { name: "person", kind: "string", description: "Who: where you stand and the next move" },
        { name: "to", kind: "string", description: "Who: the route to them through people you know" },
        { name: "view", kind: "enum", values: MACHINE_VIEWS, description: "person, route or network" },
        JSON_FLAG,
      ],
    },
    { words: ["query"], summary: "Run a read-only Cypher query on the current Relate graph (at most 100 rows)", positionals: [{ name: "cypher", kind: "string", required: true, description: "The Cypher to run, e.g. MATCH (i:Identity)-[:ENGAGED]->(p:Post) RETURN i.handle, p.text LIMIT 5" }], flags: [JSON_FLAG] },
  ],
};

const countsLine = (c: GraphCounts, n?: NetworkGraphCounts): string => `${c.accounts} accounts, ${c.identities} people, ${c.rooms} rooms, ${c.servers} servers, ${c.posts} posts, ${c.persons} linked persons, ${c.memberOf} memberships, ${c.said} said, ${c.repliedTo} replied, ${c.mentioned} mentioned, ${c.engaged} engaged${n?.leaders ? `; network: ${n.leaders} leaders, ${n.communities} communities, ${n.inCircleOf} in circles, ${n.networkMentioned} mentioned, ${n.follows} follows` : ""}`;

const REPO = join(import.meta.dir, "..", "..", "..");

export const relateCommand: Command = {
  usage: RELATE_USAGE,
  platform: "any",
  name: "relate",
  effect: "read",
  input: RELATE_INPUT,
  summary: "The Relate graph of the owner's people, rooms and network, from log.db",
  args: "build|status|verify|ask <text>|query <cypher>|machine [--json]",
  run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(RELATE_INPUT));
    if (!parsed.ok) return refuseInput("relate", parsed.error, RELATE_USAGE);
    const [sub, ...rest] = parsed.positionals;
    const json = parsed.flags["json"] === true;
    const dbPath = defaultDbPath();
    if (sub === "build") {
      context.err(`log relate build: projecting ${dbPath} into a new graph under ${graphDir(dbPath)}`);
      const pointer = buildGraph(dbPath);
      if (json) return { code: 0, stdout: JSON.stringify(pointer, null, 2) };
      return { code: 0, stdout: `log relate build: ${countsLine(pointer.counts, pointer.networkCounts)}, through event ${pointer.throughSeq}, in ${pointer.ms} ms.\n  ${pointer.file}` };
    }
    if (sub === "status") {
      const handle = openDatabase(dbPath);
      const pointer = pointerOf(dbPath, handle);
      const through = eventsThrough(handle);
      const building = pointer ? false : refreshGraph(REPO, dbPath);
      if (json) return { code: 0, stdout: JSON.stringify({ pointer, eventsThrough: through, behind: pointer ? through - pointer.throughSeq : null, building }, null, 2) };
      if (!pointer && building) return { code: 1, stdout: `log relate status: no graph for this log.db yet, so a build of its ${through} events has started in the background; ask again in a few seconds.` };
      if (!pointer) return { code: 1, stdout: "log relate status: no graph for this log.db yet. `log relate build` makes one." };
      return { code: 0, stdout: `log relate status: ${pointer.file}\n  built ${pointer.builtAt} through event ${pointer.throughSeq} (log.db is at ${through}, ${through - pointer.throughSeq} behind)\n  ${countsLine(pointer.counts, pointer.networkCounts)}` };
    }
    if (sub === "verify") {
      const result = verifyGraph(dbPath);
      if (json) return { code: result.ok ? 0 : 1, stdout: JSON.stringify(result, null, 2) };
      if (!result.pointer) return { code: 1, stdout: "log relate verify: no graph for this log.db yet. `log relate build` makes one." };
      if (result.behind > 0) return { code: 1, stdout: `log relate verify: the graph is ${result.behind} events behind log.db, so its counts can't match yet. \`log relate build\` catches it up.` };
      const all: [string, number, number][] = [...(Object.keys(result.expected) as (keyof GraphCounts)[]).map((k): [string, number, number] => [k, result.expected[k], result.found[k]]), ...(result.network ? (Object.keys(result.network.expected) as (keyof NetworkGraphCounts)[]).map((k): [string, number, number] => [k, result.network!.expected[k], result.network!.found[k]]) : [])];
      const lines = all.map(([k, e, f]) => `  ${k.padEnd(11)} log.db ${String(e).padStart(6)}  graph ${String(f).padStart(6)}  ${result.differs.includes(k) ? "DIFFERS" : "same"}`);
      return { code: result.ok ? 0 : 1, stdout: [result.ok ? "log relate verify: the graph holds exactly what log.db derives." : `log relate verify: >>> DIFFERS: ${result.differs.join(", ")}. \`log relate build\` replaces it.`, ...lines].join("\n") };
    }
    if (sub === "ask" && rest.length === 1) {
      const answer = relateContext(rest[0], dbPath);
      if (json) return { code: 0, stdout: JSON.stringify(answer, null, 2) };
      if (answer.outcome === "noGraph") return { code: 1, stdout: "log relate ask: no graph for this log.db yet. `log relate build` makes one." };
      if (answer.outcome === "graphUnreadable") return { code: 1, stdout: `log relate ask: ${answer.detail ?? "graphUnreadable"}. \`log relate build\` writes a fresh one.` };
      return { code: 0, stdout: answer.text || "log relate ask: that text names nobody the graph knows." };
    }
    if (sub === "query" && rest.length === 1) {
      const result = queryGraph(rest[0], {}, dbPath);
      if (json) return { code: 0, stdout: JSON.stringify({ rows: result.rows, truncated: result.truncated, throughSeq: result.pointer.throughSeq }, null, 2) };
      return { code: 0, stdout: [...result.rows.map((r) => JSON.stringify(r)), result.truncated ? "(more rows: the first 100 are shown)" : `(${result.rows.length} rows, graph through event ${result.pointer.throughSeq})`].join("\n") };
    }
    if (sub === "machine" && rest.length === 0) {
      const flag = (name: string) => (typeof parsed.flags[name] === "string" ? (parsed.flags[name] as string) : undefined);
      const answer = relateMachine({ view: flag("view") as MachineView | undefined, person: flag("person"), to: flag("to") }, dbPath);
      if (!answer.ok) return refuse("relate machine", answer.code, answer.problem);
      if (json) return { code: 0, stdout: JSON.stringify({ block: answer.block, text: answer.text, throughSeq: answer.throughSeq }, null, 2) };
      return { code: 0, stdout: answer.text };
    }
    return refuseInput("relate", 'say build, status, verify, ask "<text>", query "<cypher>" or machine', RELATE_USAGE);
  },
};
