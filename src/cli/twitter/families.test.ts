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
    expect(r.err).toMatch(/state +cooling/);
    expect(readFileSync(f.queue.replace(/\.json$/, ".log"), "utf8")).toContain("random run done: 2 replies sent, 1 skipped");
    expect(existsSync(f.queue.replace(/\.json$/, ".lock"))).toBe(false);
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
