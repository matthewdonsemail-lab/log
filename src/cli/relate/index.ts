import { join } from "node:path";
import { buildGraph, GraphOwned, GraphReadOnly, pointerOf, eventsThrough, queryGraph, rebuildThroughOwner, relateContext, verifyGraph, graphDir } from "../../relate/graph/index.ts";
import { ensureGraphOwner, graphOwnerAlive, graphOwnerStatus, OWNER_BATCH_MS, OWNER_START_WAIT_MS, startGraphOwner, stopGraphOwner } from "../../relate/owner/index.ts";
import type { GraphPointer } from "../../relate/graph/index.ts";
import type { GraphCounts, NetworkGraphCounts } from "../../relate/graph/index.ts";
import { MACHINE_FORMS, MACHINE_PLATFORMS, MACHINE_VIEWS, machineGenuiBlock, relateMachine } from "../../relate/machine/index.ts";
import type { MachinePlatform, MachineView } from "../../relate/machine/index.ts";
import { defaultDbPath, openDatabase } from "../../storage/schema/index.ts";
import { tickLine } from "../../indexPass/helpers/tick.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf, refuse, refuseInput } from "../runner/helpers/index.ts";
import { PLATFORMS } from "../runner/helpers/platforms.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const RELATE_USAGE = [
  "Usage: log relate build [--json]",
  "       log relate status [--owner start|stop] [--json]",
  "       log relate verify [--json]",
  "       log relate ask \"<text>\" [--json]",
  "       log relate query \"<cypher>\" [--platform <p>] [--json]",
  "       log relate machine [--person|--to <h>] [--view|--platform|--form <v>] [--state <s>] [--cursor <n>] [--quiet] [--limit <n>] [--json]",
  "       log relate owner status|start|stop [--json]",
  "The graph is a projection of log.db; a build can be redone (docs/relateGraph.md).",
].join("\n");

export const RELATE_INPUT: CommandInput = {
  forms: [
    { words: ["build"], effect: "write", summary: "Project log.db into a new current Relate graph (local only)", positionals: [], flags: [JSON_FLAG] },
    { words: ["status"], summary: "The Relate graph and how far it lags log.db", positionals: [], flags: [{ name: "owner", kind: "string", description: "start or stop the graph owner" }, JSON_FLAG] },
    { words: ["verify"], summary: "Check every Relate graph count against log.db", positionals: [], flags: [JSON_FLAG] },
    { words: ["ask"], summary: "The connected context (chats, engagement, groups, introducers, orbit) of the people a text names", positionals: [{ name: "text", kind: "string", required: true, description: "A prompt or note naming people, e.g. \"reply to @someone\"" }], flags: [JSON_FLAG] },
    {
      words: ["machine"],
      summary: "A relationship state machine: one person, the route to someone, or the network",
      positionals: [],
      flags: [
        { name: "person", kind: "string", description: "Who: where you stand and the next move" },
        { name: "to", kind: "string", description: "Who: the route to them through people you know" },
        { name: "view", kind: "enum", values: MACHINE_VIEWS, description: "person, route or network" },
        { name: "platform", kind: "enum", values: MACHINE_PLATFORMS, description: "Only this platform's accounts" },
        { name: "state", kind: "string", description: "Network view: only this state's cell, for the next page of people" },
        { name: "cursor", kind: "integer", min: 0, description: "Network view: how many people of this state to skip, for the next page" },
        { name: "quiet", kind: "boolean", description: "Network view: the ones gone quiet for 14 days or more" },
        { name: "limit", kind: "integer", min: 1, max: 12, description: "Network view: how many people per cell, default 6" },
        { name: "form", kind: "enum", values: MACHINE_FORMS, description: "genui: the block to pass to show_blocks" },
        JSON_FLAG,
      ],
    },
    { words: ["query"], summary: "A read-only Cypher query on the Relate graph (at most 100 rows)", positionals: [{ name: "cypher", kind: "string", required: true, description: "The Cypher to run, e.g. MATCH (i:Identity)-[:ENGAGED]->(p:Post) RETURN i.handle, p.text LIMIT 5" }], flags: [{ name: "platform", kind: "enum", values: PLATFORMS, description: "Sets $platform" }, JSON_FLAG] },
  ],
};

const countsLine = (c: GraphCounts, n?: NetworkGraphCounts): string => `${c.accounts} accounts, ${c.identities} people, ${c.rooms} rooms, ${c.servers} servers, ${c.posts} posts, ${c.persons} linked persons, ${c.memberOf} memberships, ${c.said} said, ${c.repliedTo} replied, ${c.mentioned} mentioned, ${c.engaged} engaged${n?.leaders ? `; network: ${n.leaders} leaders, ${n.communities} communities, ${n.inCircleOf} in circles, ${n.networkMentioned} mentioned, ${n.follows} follows` : ""}`;

const REPO = join(import.meta.dir, "..", "..", "..");

function ownerLine(owner: Awaited<ReturnType<typeof graphOwnerStatus>>): string {
  if (owner.live) return `graph owner: pid ${owner.live.pid}, generation ${owner.live.generation}, through event ${owner.live.throughSeq} of ${owner.live.head} (${owner.live.behind} events behind), ${owner.live.batches} batches since ${owner.live.startedAt}, polling every ${OWNER_BATCH_MS} ms${owner.live.rebuilding ? ", rebuilding on a snapshot" : ""}${owner.live.pass ? `, ${tickLine(owner.live.pass)}` : ""}`;
  if (owner.alive && owner.row) return `graph owner: pid ${owner.row.pid} is ${owner.row.status} (generation ${owner.row.generation})`;
  return `graph owner: not running, so readers use the last graph file (${owner.pointer ? owner.head - owner.pointer.throughSeq : owner.head} events behind); the next prompt or \`log relate owner start\` starts it`;
}

export const relateCommand: Command = {
  usage: RELATE_USAGE,
  platform: "any",
  name: "relate",
  effect: "read",
  input: RELATE_INPUT,
  summary: "The Relate graph of the owner's people, rooms and network",
  args: "build|status|verify|ask <text>|query <cypher> [--platform <p>]|machine|owner status|start|stop [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(RELATE_INPUT));
    if (!parsed.ok) return refuseInput("relate", parsed.error, RELATE_USAGE);
    const [sub, ...rest] = parsed.positionals;
    const json = parsed.flags["json"] === true;
    const dbPath = defaultDbPath();
    if (sub === "build") {
      const owned = Boolean(graphOwnerAlive(dbPath));
      context.err(owned ? "log relate build: asking the graph owner to rebuild on a snapshot and swap" : `log relate build: projecting ${dbPath} into a new graph under ${graphDir(dbPath)}`);
      let pointer: GraphPointer | null;
      try {
        pointer = owned ? await rebuildThroughOwner(dbPath) : buildGraph(dbPath);
      } catch (error) {
        if (error instanceof GraphOwned) return refuseInput("relate", error.message, RELATE_USAGE);
        throw error;
      }
      if (!pointer) pointer = buildGraph(dbPath);
      if (json) return { code: 0, stdout: JSON.stringify(pointer, null, 2) };
      return { code: 0, stdout: `log relate build: ${countsLine(pointer.counts, pointer.networkCounts)}, through event ${pointer.throughSeq}, in ${pointer.ms} ms.\n  ${pointer.file}` };
    }
    const ownerAction = sub === "owner" && rest.length === 1 ? rest[0] : sub === "status" && typeof parsed.flags["owner"] === "string" ? String(parsed.flags["owner"]) : null;
    if (ownerAction !== null && !["status", "start", "stop"].includes(ownerAction)) return refuseInput("relate", `--owner is start or stop, not ${ownerAction}`, RELATE_USAGE);
    if (ownerAction) {
      if (ownerAction === "stop") {
        const done = await stopGraphOwner(dbPath);
        if (json) return { code: 0, stdout: JSON.stringify(done, null, 2) };
        return { code: 0, stdout: `log relate owner stop: ${done.pid ? `pid ${done.pid}: ` : ""}${done.how}.` };
      }
      if (ownerAction === "start") {
        const outcome = ensureGraphOwner(REPO, dbPath, startGraphOwner, { ...process.env, LOG_GRAPH_OWNER: "on" });
        const until = Date.now() + OWNER_START_WAIT_MS;
        let owner = await graphOwnerStatus(dbPath);
        while (!owner.live && Date.now() < until) {
          await Bun.sleep(500);
          owner = await graphOwnerStatus(dbPath);
        }
        if (json) return { code: owner.live ? 0 : 1, stdout: JSON.stringify({ outcome, owner: owner.live }, null, 2) };
        return { code: owner.live ? 0 : 1, stdout: `log relate owner start: ${outcome === "alive" ? "already running" : "started"}; ${ownerLine(owner)}` };
      }
      const owner = await graphOwnerStatus(dbPath);
      if (json) return { code: 0, stdout: JSON.stringify(owner, null, 2) };
      return { code: 0, stdout: `log relate owner status: ${ownerLine(owner)}` };
    }
    if (sub === "status") {
      const handle = openDatabase(dbPath);
      const pointer = pointerOf(dbPath, handle);
      const owner = await graphOwnerStatus(dbPath);
      const through = owner.live?.throughSeq ?? pointer?.throughSeq ?? 0;
      const head = eventsThrough(handle);
      const building = pointer ? false : ensureGraphOwner(REPO, dbPath) === "started";
      const behind = pointer || owner.live ? head - through : null;
      if (json) return { code: 0, stdout: JSON.stringify({ pointer, eventsThrough: head, throughSeq: through, behind, building, owner: owner.live ?? (owner.row ? { pid: owner.row.pid, generation: owner.row.generation, status: owner.row.status, heartbeat: owner.row.heartbeat, alive: owner.alive } : null) }, null, 2) };
      if (!pointer && building) return { code: 1, stdout: `log relate status: no graph for this log.db yet, so the graph owner started and is building one from its ${head} events; ask again in a few seconds.` };
      if (!pointer) return { code: 1, stdout: "log relate status: no graph for this log.db yet. `log relate build` makes one." };
      const how = pointer.mode === "applied" ? `last batch applied ${pointer.applied ?? 0} events in ${pointer.ms} ms` : `full build in ${pointer.ms} ms`;
      return { code: 0, stdout: `log relate status: ${pointer.file}\n  ${how}, ${pointer.builtAt}, through event ${through} (log.db is at ${head}, ${head - through} events behind)\n  ${ownerLine(owner)}\n  ${countsLine(pointer.counts, pointer.networkCounts)}` };
    }
    if (sub === "verify") {
      const result = await verifyGraph(dbPath);
      if (json) return { code: result.ok ? 0 : 1, stdout: JSON.stringify(result, null, 2) };
      if (!result.pointer) return { code: 1, stdout: "log relate verify: no graph for this log.db yet. `log relate build` makes one." };
      if (result.behind > 0) return { code: 1, stdout: `log relate verify: the graph is ${result.behind} events behind log.db, so its counts can't match yet; the graph owner is applying them.` };
      const all: [string, number, number][] = [...(Object.keys(result.expected) as (keyof GraphCounts)[]).map((k): [string, number, number] => [k, result.expected[k], result.found[k]]), ...(result.network ? (Object.keys(result.network.expected) as (keyof NetworkGraphCounts)[]).map((k): [string, number, number] => [k, result.network!.expected[k], result.network!.found[k]]) : [])];
      const lines = all.map(([k, e, f]) => `  ${k.padEnd(11)} log.db ${String(e).padStart(6)}  graph ${String(f).padStart(6)}  ${result.differs.includes(k) ? "DIFFERS" : "same"}`);
      return { code: result.ok ? 0 : 1, stdout: [result.ok ? "log relate verify: the graph holds exactly what log.db derives." : `log relate verify: >>> DIFFERS: ${result.differs.join(", ")}. \`log relate build\` replaces it.`, ...lines].join("\n") };
    }
    if (sub === "ask" && rest.length === 1) {
      const answer = await relateContext(rest[0], dbPath);
      if (json) return { code: 0, stdout: JSON.stringify(answer, null, 2) };
      if (answer.outcome === "noGraph") return { code: 1, stdout: "log relate ask: no graph for this log.db yet. `log relate build` makes one." };
      if (answer.outcome === "graphUnreadable") return { code: 1, stdout: `log relate ask: ${answer.detail ?? "graphUnreadable"}. \`log relate owner status\` shows who holds it.` };
      return { code: 0, stdout: answer.text || "log relate ask: that text names nobody the graph knows." };
    }
    if (sub === "query" && rest.length === 1) {
      let result;
      try {
        result = await queryGraph(rest[0], typeof parsed.flags["platform"] === "string" ? { platform: String(parsed.flags["platform"]) } : {}, dbPath);
      } catch (error) {
        if (error instanceof GraphReadOnly || /graphReadOnly/.test(String(error))) return refuseInput("relate", error instanceof Error ? error.message : String(error), RELATE_USAGE);
        throw error;
      }
      if (json) return { code: 0, stdout: JSON.stringify({ rows: result.rows, truncated: result.truncated, throughSeq: result.throughSeq, served: result.served }, null, 2) };
      return { code: 0, stdout: [...result.rows.map((r) => JSON.stringify(r)), result.truncated ? "(more rows: the first 100 are shown)" : `(${result.rows.length} rows, graph through event ${result.throughSeq}${result.served === "file" ? ", read from the last graph file because the graph owner is not running" : ""})`].join("\n") };
    }
    if (sub === "machine" && rest.length === 0) {
      const flag = (name: string) => (typeof parsed.flags[name] === "string" ? (parsed.flags[name] as string) : undefined);
      const answer = await relateMachine({ view: flag("view") as MachineView | undefined, person: flag("person"), to: flag("to"), platform: flag("platform") as MachinePlatform | undefined, ...(flag("state") ? { state: flag("state") } : {}), ...(numberOf(parsed, "cursor") !== null ? { cursor: numberOf(parsed, "cursor")! } : {}), ...(parsed.flags["quiet"] === true ? { quiet: true } : {}), ...(numberOf(parsed, "limit") ? { limit: numberOf(parsed, "limit")! } : {}) }, dbPath);
      if (!answer.ok) return refuse("relate machine", answer.code, answer.problem);
      const block = flag("form") === "genui" ? machineGenuiBlock(answer.block) : answer.block;
      if (json) return { code: 0, stdout: JSON.stringify({ block, text: answer.text, throughSeq: answer.throughSeq }, null, 2) };
      if (flag("form") === "genui") return { code: 0, stdout: JSON.stringify(block) };
      return { code: 0, stdout: answer.text };
    }
    return refuseInput("relate", 'say build, status, verify, ask "<text>", query "<cypher>", machine or owner status|start|stop', RELATE_USAGE);
  },
};
