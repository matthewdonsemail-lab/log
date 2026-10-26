import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { TwitterEngineRun, TwitterEngineSpec, TwitterSessionAnswer } from "../../twitter/account/session/index.ts";
import { fingerprint, loadQueue } from "../../twitter/queue/plan/index.ts";
import type { Queue } from "../../twitter/queue/plan/index.ts";
import { runCli } from "../runner/index.ts";

const POST_A = "https://x.com/alice/status/1900000000000000001";
const POST_B = "https://x.com/bob/status/1900000000000000002";
const POST_C = "https://x.com/carol/status/1900000000000000003";

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "xTwo", accountName: "xTwo", platform: "TWITTER", cookies: { auth_token: "a".repeat(40), ct0: "b".repeat(40) }, proxy: null });
  return twenty;
}

type Script = (spec: TwitterEngineSpec) => TwitterSessionAnswer;

function harness(script: Script = () => ({ ok: false, code: "notExpected" }), start = Date.parse("2026-10-26T01:00:00Z")) {
  const twenty = fixture();
  const calls: TwitterEngineSpec[] = [];
  let clock = start;
  const out: string[] = [];
  const err: string[] = [];
  const run = async (argv: string[]) => {
    out.length = 0;
    err.length = 0;
    const code = await runCli(argv, {
      twenty,
      out: (l) => out.push(l),
      err: (l) => err.push(l),
      now: () => new Date(clock),
      sleep: async (ms) => {
        clock += ms;
      },
      directTwitter: (_account, spec): TwitterEngineRun => {
        calls.push(spec);
        return { answer: { loginState: "loggedIn", ...script(spec) }, refreshed: null };
      },
    });
    return { code, out: out.join("\n"), err: err.join("\n") };
  };
  return { run, calls, twenty, clockAt: () => clock };
}

describe("log twitter follows", () => {
  test("reads each handle once on the direct-API engine and sends nothing", async () => {
    const h = harness(() => ({ ok: true, screenName: "xtwo", checked: [{ handle: "alice", followsYou: true, youFollow: false }, { handle: "bob", followsYou: false, youFollow: true }] }));
    const r = await h.run(["twitter", "follows", "--account", "xTwo", "--handles", "@alice, bob,alice"]);
    expect(r.code).toBe(0);
    expect(h.calls).toEqual([{ action: "follows", handles: ["alice", "bob"] }]);
    expect(r.out).toContain("@alice: follows you, you don't follow them");
    expect(r.out).toContain("@bob: doesn't follow you, you follow them");
  });
});

describe("log twitter followers", () => {
  test("reads the account's own followers once on the direct-API engine and sends nothing", async () => {
    const h = harness(() => ({ ok: true, complete: true, followers: [{ userId: "1", handle: "alice", name: "Alice", bio: "builds agents", location: "Lisbon", followers: 120, following: 80, posts: 900, canDm: true, protected: false }] }));
    const r = await h.run(["twitter", "followers", "--account", "xTwo", "--limit", "50"]);
    expect(r.code).toBe(0);
    expect(h.calls).toEqual([{ action: "followers", limit: 50 }]);
    expect(r.out).toContain("1 followers read (all of them)");
    expect(r.out).toContain("@alice · 120 followers · Lisbon");
    expect((await h.run(["twitter", "followers", "--account", "xTwo", "--limit", "0"])).err).toContain("limitInvalid");
    expect(h.calls).toHaveLength(1);
  });
});

describe("log twitter dms", () => {
  const thread = (id: string, handle: string, lastFromMe: boolean, text: string) => ({ conversationId: id, box: "inbox" as const, type: "oneToOne" as const, with: [{ userId: id, handle }], lastAt: "2026-10-25T10:00:00Z", lastFromMe, lastText: text, unread: !lastFromMe, messagesLoaded: 1 });

  test("reads the inbox once on the direct-API engine and --waiting keeps who is waiting on a reply", async () => {
    const h = harness(() => ({ ok: true, screenName: "xtwo", waitingOnYou: 1, threads: [thread("1-2", "alice", false, "are you free"), thread("3-2", "bob", true, "talk soon")] }));
    const all = await h.run(["twitter", "dms", "--account", "xTwo"]);
    expect(all.code).toBe(0);
    expect(h.calls).toEqual([{ action: "inbox", limit: 20 }]);
    expect(all.out).toContain("@alice · 2026-10-25T10:00:00Z · unread, waiting on you");
    expect(all.out).toContain("@bob");
    const waiting = await h.run(["twitter", "dms", "--account", "xTwo", "--waiting", "--limit", "5"]);
    expect(waiting.out).toContain("1 conversation waiting on a reply");
    expect(waiting.out).not.toContain("@bob");
    expect(h.calls[1]).toEqual({ action: "inbox", limit: 5 });
  });

  test("--conversation reads one thread, and bad input is refused before X is called", async () => {
    const h = harness(() => ({ ok: true, conversationId: "1-2", messages: [{ id: "9", conversationId: "1-2", time: "2026-10-25T10:00:00Z", senderId: "1", text: "hey", fromMe: false, from: "alice" }] }));
    const r = await h.run(["twitter", "dms", "--account", "xTwo", "--conversation", "1-2"]);
    expect(r.out).toContain("@alice: hey");
    expect(h.calls).toEqual([{ action: "inbox", limit: 20, conversationId: "1-2" }]);
    expect((await h.run(["twitter", "dms", "--account", "xTwo", "--limit", "0"])).err).toContain("limitInvalid");
    expect((await h.run(["twitter", "dms", "--account", "xTwo", "--conversation", "alice"])).err).toContain("conversationInvalid");
    expect(h.calls).toHaveLength(1);
  });
});

describe("log twitter reply, quote, like, dm", () => {
  test("without --live it is a dry run: checked, X not contacted", async () => {
    const h = harness();
    const r = await h.run(["twitter", "reply", "--account", "xTwo", "--tweet", POST_A, "--text", "love this one"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("dry run: xTwo would reply to");
    expect(h.calls).toEqual([]);
  });

  test("--live needs who approved it, and the style and target are checked before X is called", async () => {
    const h = harness();
    expect((await h.run(["twitter", "reply", "--account", "xTwo", "--tweet", POST_A, "--text", "love this", "--live"])).err).toContain("notApproved");
    expect((await h.run(["twitter", "quote", "--account", "xTwo", "--tweet", POST_A, "--text", "Love this.", "--approvedBy", "matt", "--live"])).err).toContain("styleFailed");
    expect((await h.run(["twitter", "like", "--account", "xTwo", "--tweet", "https://example.com/1", "--approvedBy", "matt", "--live"])).err).toContain("tweetUrlInvalid");
    expect((await h.run(["twitter", "dm", "--account", "xTwo", "--userId", "bob", "--text", "hey", "--approvedBy", "matt", "--live"])).err).toContain("userIdInvalid");
    expect(h.calls).toEqual([]);
  });

  test("--live sends once with the approver, and X's answer decides", async () => {
    const h = harness((spec) => (spec.action === "reply" ? { ok: true, event: "sent", tweetId: "777" } : { ok: false, event: "dropped", code: "xSentNothing", detail: "x created no tweet" }));
    const sent = await h.run(["twitter", "reply", "--account", "xTwo", "--tweet", POST_A, "--text", "love this one", "--approvedBy", "matt", "--live"]);
    expect(sent.code).toBe(0);
    expect(sent.out).toContain("posted https://x.com/xTwo/status/777");
    expect(h.calls[0]).toEqual({ action: "reply", live: true, approvedBy: "matt", tweetUrl: POST_A, text: "love this one" });
    const dropped = await h.run(["twitter", "quote", "--account", "xTwo", "--tweet", POST_A, "--text", "yes", "--approvedBy", "matt", "--live", "--json"]);
    expect(dropped.code).toBe(1);
    expect(JSON.parse(dropped.out)).toMatchObject({ event: "dropped", code: "xSentNothing", approvedBy: "matt" });
  });

  test("--force asks the engine to go past the governor, only when given, and says what it went past", async () => {
    const h = harness(() => ({ ok: true, event: "sent", tweetId: "778", forcedPast: "cooldown active for 660s" }));
    const forced = await h.run(["twitter", "reply", "--account", "xTwo", "--tweet", POST_A, "--text", "love this one", "--approvedBy", "matt", "--force", "--live"]);
    expect(forced.code).toBe(0);
    expect(h.calls[0]).toEqual({ action: "reply", live: true, approvedBy: "matt", tweetUrl: POST_A, text: "love this one", force: true });
    expect(forced.out).toContain("Forced past the governor: cooldown active for 660s");
    await h.run(["twitter", "reply", "--account", "xTwo", "--tweet", POST_A, "--text", "love this one", "--approvedBy", "matt", "--live"]);
    expect(h.calls[1].force).toBeUndefined();
  });

  test("a dead session goes back to Twenty", async () => {
    const h = harness(() => ({ ok: false, event: "sessionDead", code: "sessionDead", loginState: "loggedOut", detail: "401" }));
    const r = await h.run(["twitter", "like", "--account", "xTwo", "--tweet", POST_A, "--approvedBy", "matt", "--live"]);
    expect(r.code).toBe(1);
    expect(h.twenty.rows.socialAccounts!.find((a) => a.accountName === "xTwo")!.sessionState).toBe("loggedOut");
  });
});

function queueFiles() {
  const dir = mkdtempSync(join(tmpdir(), "twitterQueue"));
  const targets = join(dir, "targets.json");
  const lines = join(dir, "lines.json");
  writeFileSync(targets, JSON.stringify({ items: [{ handle: "alice", tweet_url: POST_A, post_text: "a" }, { handle: "bob", post_url: POST_B }, { handle: "carol", tweet_url: POST_C }] }));
  writeFileSync(lines, JSON.stringify({ messages: ["love this one", "so good", "this is the way", "so good"] }));
  return { dir, targets, lines, queue: join(dir, "queue.json") };
}

async function builtAndPlanned(h: ReturnType<typeof harness>) {
  const f = queueFiles();
  expect((await h.run(["twitter", "queue", "build", "--targets", f.targets, "--variations", f.lines, "--out", f.queue, "--account", "xTwo"])).code).toBe(0);
  expect((await h.run(["twitter", "queue", "check", f.queue])).code).toBe(0);
  expect((await h.run(["twitter", "queue", "approve", f.queue, "--by", "matt"])).code).toBe(0);
  expect((await h.run(["twitter", "queue", "plan", f.queue, "--window", "30m", "--minGap", "60"])).code).toBe(0);
  return f;
}

describe("log twitter queue", () => {
  test("build pairs each target with a unique line; an edit after approve voids it", async () => {
    const h = harness();
    const f = queueFiles();
    const built = await h.run(["twitter", "queue", "build", "--targets", f.targets, "--variations", f.lines, "--out", f.queue, "--account", "@xTwo"]);
    expect(built.out).toContain("3 reply items from 3 lines");
    const queue = loadQueue(f.queue);
    expect(queue.account).toBe("xTwo");
    expect(new Set(queue.items.map((i) => i.text)).size).toBe(3);
    expect(queue.items.map((i) => i.tweetUrl)).toEqual([POST_A, POST_B, POST_C]);
    expect((await h.run(["twitter", "queue", "build", "--targets", f.targets, "--variations", f.lines, "--out", f.queue, "--account", "xTwo"])).err).toContain("never overwritten");
    await h.run(["twitter", "queue", "approve", f.queue, "--by", "matt"]);
    const edited = JSON.parse(readFileSync(f.queue, "utf8")) as Queue;
    edited.items[0].text = "something else";
    writeFileSync(f.queue, JSON.stringify(edited));
    await h.run(["twitter", "queue", "plan", f.queue, "--window", "30m"]);
    expect((await h.run(["twitter", "queue", "run", f.queue, "--live"])).err).toContain("queueNotApproved");
    expect(h.calls).toEqual([]);
  });

  test("check names every item that breaks the house style", async () => {
    const h = harness();
    const f = queueFiles();
    writeFileSync(f.lines, JSON.stringify(["Love this.", "so good", "fine"]));
    await h.run(["twitter", "queue", "build", "--targets", f.targets, "--variations", f.lines, "--out", f.queue, "--account", "xTwo", "--seed", "3"]);
    const r = await h.run(["twitter", "queue", "check", f.queue]);
    expect(r.code).toBe(1);
    expect(r.out).toContain("1 failed");
    expect(r.out).toContain("styleFailed");
  });

  test("run without --live lists what it would send; X is not contacted", async () => {
    const h = harness();
    const f = await builtAndPlanned(h);
    const r = await h.run(["twitter", "queue", "run", f.queue]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("dry run: @xTwo, approved by matt, 3 events would fire");
    expect(h.calls).toEqual([]);
  });

  test("run --live walks the machine: sent, gone, a throttle cools off and is retried once at the end", async () => {
    let bobTries = 0;
    const h = harness((spec) => {
      if (spec.tweetUrl === POST_B && spec.action === "reply") return { ok: false, event: "gone", code: "TweetNotAvailable", detail: "(385)" };
      if (spec.tweetUrl === POST_C && bobTries++ === 0) return { ok: false, event: "dropped", code: "xSentNothing", detail: "x created no tweet" };
      return { ok: true, event: "sent", tweetId: String(500 + h.calls.length) };
    });
    const f = await builtAndPlanned(h);
    const r = await h.run(["twitter", "queue", "run", f.queue, "--live"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("finished");
    const queue = loadQueue(f.queue);
    expect(queue.items.map((i) => i.status)).toEqual(["sent", "gone", "sent"]);
    expect(h.calls.filter((c) => c.tweetUrl === POST_C)).toHaveLength(2);
    expect(h.calls.every((c) => c.live === true && c.approvedBy === "matt")).toBe(true);
    expect(r.err).toContain("cool-off 1 of 5");
    expect(r.err).toMatch(/trying again at \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC/);
    expect(r.err).toMatch(/state +cooling/);
    expect(readFileSync(f.queue.replace(/\.json$/, ".log"), "utf8")).toContain("random run done: 2 replies sent, 1 skipped");
    expect(existsSync(f.queue.replace(/\.json$/, ".lock"))).toBe(false);
  });

  test("one 344 is a short wait and X is asked again; only three in a row is a day, and each line says what X answered and when", async () => {
    const h = harness(() => ({ ok: false, event: "dailyLimit", code: "CouldNotTweet", detail: "(344) You have reached your daily limit" }));
    const f = await builtAndPlanned(h);
    const start = h.clockAt();
    await h.run(["twitter", "queue", "run", f.queue, "--live"]);
    const lines = readFileSync(f.queue.replace(/\.json$/, ".log"), "utf8").split("\n").filter((l) => l.includes("[cooling]"));
    expect(lines[0]).toMatch(/x answered at \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC: CouldNotTweet: \(344\)/);
    expect(lines[0]).toContain("a short wait, then x is asked again");
    expect(lines[1]).toContain("a short wait");
    expect(lines[2]).toContain("x said its daily limit 3 times in a row, so a day");
    const firstBack = /trying again at (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) UTC/.exec(lines[0])![1];
    expect(Date.parse(`${firstBack.replace(" ", "T")}:00Z`) - start).toBeLessThan(3600_000);
  });

  test("a dead session halts the run with exit 5 and the rest stays pending", async () => {
    const h = harness(() => ({ ok: false, event: "sessionDead", code: "sessionDead", loginState: "loggedOut", detail: "X answered HTTP 401" }));
    const f = await builtAndPlanned(h);
    const r = await h.run(["twitter", "queue", "run", f.queue, "--live"]);
    expect(r.code).toBe(5);
    expect(r.out).toContain("halted");
    expect(h.calls).toHaveLength(1);
    expect(loadQueue(f.queue).items.filter((i) => i.status === "pending")).toHaveLength(3);
  });

  test("plan honours --minGap as given on the command line, and refuses one that isn't a whole number", async () => {
    const h = harness();
    const f = queueFiles();
    await h.run(["twitter", "queue", "build", "--targets", f.targets, "--variations", f.lines, "--out", f.queue, "--account", "xTwo"]);
    const planned = await h.run(["twitter", "queue", "plan", f.queue, "--window", "60m", "--minGap", "600"]);
    expect(planned.out).toContain("at least 600s apart");
    const times = loadQueue(f.queue).randomRun!.events.map((e) => Date.parse(e.at)).sort((a, b) => a - b);
    for (let i = 1; i < times.length; i++) expect(times[i] - times[i - 1]).toBeGreaterThanOrEqual(600_000);
    expect((await h.run(["twitter", "queue", "plan", f.queue, "--window", "60m", "--minGap", "ten"])).err).toContain("--minGap is a whole number");
  });

  test("a target that carries its own text keeps it, and the rest draw from the variations", async () => {
    const h = harness();
    const f = queueFiles();
    writeFileSync(f.targets, JSON.stringify({ items: [{ handle: "alice", tweet_url: POST_A, text: "jaja alice line" }, { handle: "bob", tweet_url: POST_B }, { handle: "carol", tweet_url: POST_C, text: "jaja carol line" }] }));
    writeFileSync(f.lines, JSON.stringify(["jaja alice line", "only line left"]));
    expect((await h.run(["twitter", "queue", "build", "--targets", f.targets, "--variations", f.lines, "--out", f.queue, "--account", "xTwo"])).code).toBe(0);
    expect(loadQueue(f.queue).items.map((i) => i.text)).toEqual(["jaja alice line", "only line left", "jaja carol line"]);
    const own = join(f.dir, "own.json");
    const ownQueue = join(f.dir, "ownQueue.json");
    writeFileSync(own, JSON.stringify([{ handle: "alice", tweet_url: POST_A, text: "jaja alice line" }]));
    expect((await h.run(["twitter", "queue", "build", "--targets", own, "--out", ownQueue, "--account", "xTwo"])).code).toBe(0);
  });

  test("a cancel stops a run while it waits, sending nothing more", async () => {
    let cancel = false;
    const twenty = fixture();
    const sent: TwitterEngineSpec[] = [];
    let clock = Date.parse("2026-10-26T01:00:00Z");
    const ctx = {
      twenty,
      out: () => {},
      err: () => {},
      now: () => new Date(clock),
      sleep: async (ms: number) => {
        clock += ms;
        cancel = true;
      },
      cancelled: () => cancel,
      directTwitter: (_a: unknown, spec: TwitterEngineSpec): TwitterEngineRun => {
        sent.push(spec);
        return { answer: { ok: true, event: "sent", tweetId: "1" }, refreshed: null };
      },
    };
    const f = queueFiles();
    for (const argv of [["build", "--targets", f.targets, "--variations", f.lines, "--out", f.queue, "--account", "xTwo"], ["approve", f.queue, "--by", "matt"], ["plan", f.queue, "--window", "30m", "--start", "2026-10-26T01:10:00Z"]]) await runCli(["twitter", "queue", ...argv], ctx as never);
    const code = await runCli(["twitter", "queue", "run", f.queue, "--live"], ctx as never);
    expect(code).toBe(5);
    expect(sent).toEqual([]);
    expect(readFileSync(f.queue.replace(/\.json$/, ".log"), "utf8")).toContain("cancelled while waiting");
  });

  test("nudge is refused with no run going", async () => {
    const h = harness();
    const f = await builtAndPlanned(h);
    expect((await h.run(["twitter", "queue", "nudge", f.queue])).err).toContain("queueBusy");
  });

  test("the fingerprint is the one the controller's Python computes, so an approved controller queue stays approved", () => {
    const queue = { account: "xTwo", items: [{ n: 1, action: "reply" as const, tweetUrl: POST_A, text: "love this — ok", status: "pending" as const }, { n: 2, action: "dm" as const, userId: "42", text: "hey \"you\"", status: "pending" as const }] };
    const script = `import hashlib,json,sys;q=json.loads(sys.stdin.read());rows=[[i["n"],i["action"],i.get("tweet_url") if i["action"] in ("reply","quote") else i.get("user_id"),i["text"]] for i in q["items"]];print(hashlib.sha256(json.dumps([q["account"],rows],ensure_ascii=False).encode()).hexdigest())`;
    const controllerShape = { account: queue.account, items: [{ n: 1, action: "reply", tweet_url: POST_A, text: "love this — ok" }, { n: 2, action: "dm", user_id: "42", text: 'hey "you"' }] };
    const python = spawnSync(process.env.LOG_PYTHON || "python", ["-c", script], { input: JSON.stringify(controllerShape), encoding: "utf8", env: { ...process.env, PYTHONUTF8: "1" } });
    if (python.status !== 0) return;
    expect(fingerprint(queue)).toBe(python.stdout.trim());
  });
});
