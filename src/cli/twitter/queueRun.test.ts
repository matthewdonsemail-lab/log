import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { TwitterEngineRun, TwitterEngineSpec, TwitterSessionAnswer } from "../../twitter/account/session/index.ts";
import { approveQueue, buildQueue, loadQueue, pidAlive } from "../../twitter/queue/plan/index.ts";
import type { EventKind, Queue, QueueAction } from "../../twitter/queue/plan/index.ts";
import { queueLockHolder, queueLogLines, takeQueueLock } from "../../twitter/queue/store/index.ts";
import { runCli } from "../runner/index.ts";
import type { CommandContext } from "../runner/types.ts";
import { gateDeps } from "./helpers/voice.ts";
import { EXPECTED } from "./queueRunExpected.ts";

const START = Date.parse("2026-11-14T10:00:00Z");

const at = (seconds: number) => new Date(START + seconds * 1000).toISOString();

const offset = (iso: string) => (Date.parse(iso) - START) / 1000;

const HANDLES = ["fakeBird", "fakeFinch", "fakeWren"];

const REPLIES = ["nice one", "love this", "so good"];

const DMS = ["yo the new tool is up", "yo made a free tool", "yo the tool is live"];

const DEAD_PID = 4_194_301;

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "xQueue", accountName: "xQueue", platform: "TWITTER", cookies: { auth_token: "a".repeat(40), ct0: "b".repeat(40) }, proxy: null });
  return twenty;
}

function queueFile(dir: string, action: QueueAction, count: number, events: { n: number; kind: EventKind; s: number }[], minGap: number): string {
  const targets = HANDLES.slice(0, count).map((handle, i) => (action === "dm" ? { handle, userId: String(4300 + i), text: DMS[i] } : { handle, tweetUrl: `https://x.com/${handle}/status/19000000000000001${i}`, text: REPLIES[i] }));
  const built: Queue = buildQueue({ account: "xQueue", action, targets, lines: [], sources: [], seed: 1, now: new Date(START) });
  built.randomRun = { planned: at(0), window: "1h", minGap, events: events.map((e) => ({ n: e.n, kind: e.kind, at: at(e.s) })) };
  const path = join(dir, `${action}Queue.json`);
  writeFileSync(path, JSON.stringify(approveQueue(built, "fakeOwner", new Date(START)), null, 1));
  return path;
}

const ok = (spec: TwitterEngineSpec): TwitterSessionAnswer => (spec.action === "like" ? { ok: true, event: "sent", liked: true } : spec.action === "dm" ? { ok: true, event: "sent", conversationId: `${spec.userId}-1`, messageId: "m1" } : { ok: true, event: "sent", tweetId: `88${String(spec.tweetUrl).slice(-1)}` });

interface Hooks {
  answer?: (call: number, spec: TwitterEngineSpec) => TwitterSessionAnswer;
  cancelled?: (clock: number) => boolean;
  onSleep?: (clock: number, sleeps: number) => Promise<void>;
}

const world = { clock: START, lines: [] as string[], words: 0 };

const t = () => `+${(world.clock - START) / 1000}s`;

async function cli(argv: string[], hooks: Hooks = {}) {
  const out: string[] = [];
  const err: string[] = [];
  let calls = 0;
  let sleeps = 0;
  const context: Partial<CommandContext> = {
    twenty: fixture(),
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    now: () => new Date(world.clock),
    sleep: async (ms) => {
      sleeps += 1;
      world.clock += ms;
      await hooks.onSleep?.(world.clock, sleeps);
    },
    cancelled: hooks.cancelled ? () => hooks.cancelled!(world.clock) : undefined,
    directTwitter: (_account, spec): TwitterEngineRun => {
      calls += 1;
      const { action, tweetUrl, userId, text, live, approvedBy, force } = spec as TwitterEngineSpec & { force?: boolean };
      world.lines.push(`${t()} engine ${JSON.stringify({ action, tweetUrl, userId, text, live, approvedBy, force })}`);
      return { answer: { loginState: "loggedIn", ...(hooks.answer ?? ((_c, s) => ok(s)))(calls, spec) }, refreshed: null };
    },
  };
  const code = await runCli(argv, context as CommandContext);
  const kept = err.filter((l) => !/^\d{2}:\d{2}:\d{2} {2}/.test(l));
  world.lines.push(`exit ${code}`, ...out.map((l) => `out ${l}`), ...kept.map((l) => `err ${l}`));
  return code;
}

function state(path: string) {
  const queue = loadQueue(path);
  return {
    items: queue.items.map(({ n, status, text, sentId, sentUrl, result, attemptedAt, likedAt, heldFor }) => ({ n, status, text, sentId, sentUrl, result, attemptedAt, likedAt, heldFor })),
    events: (queue.randomRun?.events ?? []).map((e) => `${e.n}${e.kind[0]}@${offset(e.at)}${e.done ? `:done@${offset(e.done)}` : ""}${e.skipped ? `:${e.skipped}` : ""}`),
    approvedBy: queue.approval?.by ?? null,
    lock: queueLockHolder(path, pidAlive),
    log: queueLogLines(path),
  };
}

const randomValues = crypto.getRandomValues.bind(crypto);
const savedGate = gateDeps.gate;
const savedInbox = process.env.LOG_INBOX_STATE;
const savedDb = process.env.LOG_DB;
let root = "";
let dir = "";

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "queueRun"));
});

afterAll(() => {
  try {
    rmSync(root, { recursive: true, force: true });
  } catch {}
});

beforeEach(() => {
  dir = mkdtempSync(join(root, "q"));
  process.env.LOG_INBOX_STATE = root;
  delete process.env.LOG_DB;
  world.clock = START;
  world.lines = [];
  world.words = 0;
  crypto.getRandomValues = (<T extends ArrayBufferView | null>(array: T): T => {
    const words = array as unknown as Uint32Array;
    for (let i = 0; i < words.length; i++) words[i] = (Math.imul(++world.words, 2654435761) >>> 0) ^ 0x5bd1e995;
    return array;
  }) as typeof crypto.getRandomValues;
});

afterEach(() => {
  crypto.getRandomValues = randomValues;
  gateDeps.gate = savedGate;
  process.env.LOG_INBOX_STATE = savedInbox;
  if (savedDb === undefined) delete process.env.LOG_DB;
  else process.env.LOG_DB = savedDb;
});

const run = (path: string, ...flags: string[]) => ["twitter", "queue", "run", path, "--live", ...flags];

async function check(name: string, path: string) {
  const got = JSON.parse(JSON.stringify({ lines: world.lines, state: state(path) }).split(JSON.stringify(join(dir, "x")).slice(1, -2)).join("<dir>/").split(`pid ${process.ppid}`).join("pid <pid>").split(`"lock":${process.ppid}`).join(`"lock":"<pid>"`));
  expect(EXPECTED[name]).toBeDefined();
  expect(got).toEqual(EXPECTED[name] as never);
}

describe("log twitter queue run --live, recorded end to end on a stubbed engine and a fake clock", () => {
  test("fullRun", async () => {
    const path = queueFile(dir, "reply", 2, [{ n: 1, kind: "reply", s: 10 }, { n: 1, kind: "like", s: 40 }, { n: 2, kind: "reply", s: 70 }], 20);
    await cli(run(path));
    await check("fullRun", path);
  });

  test("dmRun", async () => {
    const path = queueFile(dir, "dm", 2, [{ n: 1, kind: "reply", s: 10 }, { n: 2, kind: "reply", s: 40 }], 20);
    await cli(run(path, "--json"));
    await check("dmRun", path);
  });

  test("forced", async () => {
    const path = queueFile(dir, "reply", 1, [{ n: 1, kind: "reply", s: 10 }], 20);
    await cli(run(path, "--force"));
    await check("forced", path);
  });

  test("governorRefusal", async () => {
    const path = queueFile(dir, "reply", 3, [{ n: 1, kind: "reply", s: 10 }, { n: 2, kind: "reply", s: 40 }, { n: 3, kind: "reply", s: 70 }], 20);
    await cli(run(path), { answer: (c, s) => (c === 2 ? { ok: false, code: "governorBlocked", detail: "cooldown active for 660s" } : ok(s)) });
    await check("governorRefusal", path);
  });

  test("platformRefusal", async () => {
    const path = queueFile(dir, "reply", 2, [{ n: 1, kind: "reply", s: 10 }, { n: 2, kind: "reply", s: 40 }], 20);
    await cli(run(path), { answer: () => ({ ok: false, code: "rateLimited", event: "throttled", detail: "status: 429, Rate limit exceeded" }) });
    await check("platformRefusal", path);
  });

  test("crashThenResume", async () => {
    const path = queueFile(dir, "reply", 3, [{ n: 1, kind: "reply", s: 10 }, { n: 2, kind: "reply", s: 40 }, { n: 3, kind: "reply", s: 70 }], 20);
    await cli(run(path), {
      answer: (c, s) => {
        if (c === 2) throw new Error("socket closed");
        return ok(s);
      },
    });
    world.lines.push(`lock ${queueLockHolder(path, pidAlive)}`);
    await cli(run(path));
    await check("crashThenResume", path);
  });

  test("diedThenResume", async () => {
    const path = queueFile(dir, "reply", 2, [{ n: 1, kind: "reply", s: 10 }, { n: 2, kind: "reply", s: 40 }], 20);
    await cli(run(path), { cancelled: () => false, answer: (c, s) => (c === 1 ? ok(s) : ok(s)), onSleep: async (clock) => {
      if (clock >= START + 20_000) throw new Error("the process died");
    } });
    takeQueueLock(path, DEAD_PID, () => true);
    world.lines.push(`lock ${queueLockHolder(path, () => true)}`);
    await cli(run(path));
    await check("diedThenResume", path);
  });

  test("lockBusy", async () => {
    const path = queueFile(dir, "reply", 1, [{ n: 1, kind: "reply", s: 10 }], 20);
    takeQueueLock(path, process.ppid, pidAlive);
    await cli(run(path));
    world.lines.push(`lock ${queueLockHolder(path, pidAlive) === process.ppid}`);
    await check("lockBusy", path);
  });

  test("cancelMidWaitThenResume", async () => {
    const path = queueFile(dir, "reply", 3, [{ n: 1, kind: "reply", s: 10 }, { n: 2, kind: "reply", s: 40 }, { n: 3, kind: "reply", s: 70 }], 20);
    await cli(run(path), { cancelled: (clock) => clock >= START + 25_000 });
    await cli(run(path), { cancelled: () => false });
    await check("cancelMidWaitThenResume", path);
  });

  test("cancelMidSend", async () => {
    const path = queueFile(dir, "reply", 2, [{ n: 1, kind: "reply", s: 10 }, { n: 2, kind: "reply", s: 40 }], 20);
    let sends = 0;
    await cli(run(path), { cancelled: () => sends >= 1, answer: (_c, s) => ((sends += 1), ok(s)) });
    await check("cancelMidSend", path);
  });

  test("nudgeAndAddWhileRunning", async () => {
    const path = queueFile(dir, "reply", 2, [{ n: 1, kind: "reply", s: 10 }, { n: 2, kind: "reply", s: 600 }], 30);
    const targets = join(dir, "more.json");
    writeFileSync(targets, JSON.stringify([{ handle: "fakeWren", tweet_url: "https://x.com/fakeWren/status/1900000000000000555", text: "added while it runs" }]));
    await cli(run(path), {
      cancelled: () => false,
      onSleep: async (_clock, sleeps) => {
        if (sleeps === 4) await cli(["twitter", "queue", "add", path, "--targets", targets, "--by", "fakeOwner", "--window", "10m"]);
        if (sleeps === 9) await cli(["twitter", "queue", "nudge", path, "--replies", "1"]);
      },
    });
    await check("nudgeAndAddWhileRunning", path);
  });

  test("keepOpen", async () => {
    const path = queueFile(dir, "reply", 1, [{ n: 1, kind: "reply", s: 10 }], 30);
    const targets = join(dir, "more.json");
    writeFileSync(targets, JSON.stringify([{ handle: "fakeWren", tweet_url: "https://x.com/fakeWren/status/1900000000000000555", text: "kept open for this" }]));
    let sends = 0;
    await cli(run(path, "--keepOpen"), {
      cancelled: () => sends >= 2,
      answer: (_c, s) => ((sends += 1), ok(s)),
      onSleep: async (_clock, sleeps) => {
        if (sleeps === 5) await cli(["twitter", "queue", "add", path, "--targets", targets, "--by", "fakeOwner", "--window", "5m"]);
      },
    });
    await check("keepOpen", path);
  });

  test("heldThenEditThenRun", async () => {
    const path = queueFile(dir, "dm", 2, [{ n: 1, kind: "reply", s: 10 }, { n: 2, kind: "reply", s: 40 }], 20);
    gateDeps.gate = async (_context, send) => (send.to.includes("fakeBird") ? { ok: false, refused: `>>> VOICE GATE FAILED for ${send.to}\n  - it reads like a template` } : { ok: true, line: `voice gate: passed for ${send.to} (test)` });
    await cli(run(path));
    gateDeps.gate = async (_context, send) => ({ ok: true, line: `voice gate: passed for ${send.to} (test)` });
    await cli(["twitter", "queue", "edit", path, "--n", "1", "--text", "saw your post on the tool made you a copy", "--by", "fakeOwner", "--window", "30m"]);
    await cli(run(path));
    await check("heldThenEditThenRun", path);
  });

  test("dryRun", async () => {
    const path = queueFile(dir, "reply", 2, [{ n: 1, kind: "reply", s: 10 }, { n: 2, kind: "reply", s: 40 }], 20);
    await cli(["twitter", "queue", "run", path]);
    await check("dryRun", path);
  });
});
