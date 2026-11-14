import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun, PlatformEngineSpec } from "../../platformKit/session/index.ts";
import { runCli } from "../runner/index.ts";

const CHANNEL = "1434928149904228392";
const MESSAGE = "1566872902840619151";

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "discordOne", accountName: "discordOne", platform: "DISCORD", cookies: [], storageOrigins: [{ origin: "https://discord.com", localStorage: [{ name: "token", value: JSON.stringify("x".repeat(30)) }] }], proxy: null } as never);
  return twenty;
}

async function run(argv: string[], answer: PlatformEngineRun["answer"] = { ok: false, code: "notExpected" }) {
  const out: string[] = [];
  const err: string[] = [];
  const specs: PlatformEngineSpec[] = [];
  const code = await runCli(argv, {
    twenty: fixture(),
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    directDiscord: (_account, spec) => {
      specs.push(spec);
      return { answer, refreshed: null };
    },
  });
  return { code, out: out.join("\n"), err: err.join("\n"), specs };
}

describe("log discord react (rule 140)", () => {
  test("without --live it is a dry run and the engine is never called", async () => {
    const r = await run(["discord", "react", "--account", "discordOne", "--channel", CHANNEL, "--message", MESSAGE, "--emoji", "😂"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("would react 😂 to message");
    expect(r.specs).toEqual([]);
  });

  test("--live needs --approvedBy, and an empty emoji is refused, calling nothing", async () => {
    const noApproval = await run(["discord", "react", "--account", "discordOne", "--channel", CHANNEL, "--message", MESSAGE, "--emoji", "fire", "--live"]);
    expect(noApproval.code).toBe(1);
    expect(noApproval.err + noApproval.out).toContain("notApproved");
    const empty = await run(["discord", "react", "--account", "discordOne", "--channel", CHANNEL, "--message", MESSAGE, "--emoji", " "]);
    expect(empty.err + empty.out).toContain("reactInvalid");
    expect([...noApproval.specs, ...empty.specs]).toEqual([]);
  });

  test("--live reacts through the engine with the channel, message and emoji, and --remove takes it off", async () => {
    const sent = await run(["discord", "react", "--account", "discordOne", "--channel", CHANNEL, "--message", MESSAGE, "--emoji", "fire", "--approvedBy", "matt", "--live"], { ok: true, event: "sent", loginState: "loggedIn" });
    expect(sent.code).toBe(0);
    expect(sent.out).toContain("reacted fire to message");
    expect(sent.specs).toEqual([{ action: "react", channel: CHANNEL, message: MESSAGE, emoji: "fire", remove: false, live: true, approvedBy: "matt" }]);
    const removed = await run(["discord", "react", "--account", "discordOne", "--channel", CHANNEL, "--message", MESSAGE, "--emoji", "fire", "--remove", "--approvedBy", "matt", "--live"], { ok: true, event: "sent", loginState: "loggedIn" });
    expect(removed.specs[0]?.remove).toBe(true);
  });

  test("a refusal is said with its code and nothing is retried", async () => {
    const r = await run(["discord", "react", "--account", "discordOne", "--channel", CHANNEL, "--message", MESSAGE, "--emoji", "fire", "--approvedBy", "matt", "--live"], { ok: false, code: "reactRefused", detail: "Discord refused it" });
    expect(r.code).toBe(1);
    expect(r.out).toContain("reactRefused");
    expect(r.specs.length).toBe(1);
  });

  test("it runs through the shared action machine: an engine that throws is a crash said once, never retried", async () => {
    const sent = await run(["discord", "react", "--account", "discordOne", "--channel", CHANNEL, "--message", MESSAGE, "--emoji", "fire", "--approvedBy", "matt", "--live"], { ok: true, event: "sent", loginState: "loggedIn" });
    expect(sent.err).toContain("on the direct-API engine, approved by matt");
    let calls = 0;
    const err: string[] = [];
    const code = await runCli(["discord", "react", "--account", "discordOne", "--channel", CHANNEL, "--message", MESSAGE, "--emoji", "fire", "--approvedBy", "matt", "--live"], {
      twenty: fixture(),
      out: () => {},
      err: (l) => err.push(l),
      directDiscord: () => {
        calls += 1;
        throw new Error("socket closed");
      },
    });
    expect(code).toBe(2);
    expect(err.join("\n")).toContain("crashed");
    expect(calls).toBe(1);
  });
});

const python = process.env.LOG_PYTHON || "python";
const root = join(import.meta.dir, "..", "..", "..", "python");

function py(script: string): unknown {
  const out = spawnSync(python, ["-c", `import sys, json; sys.path.insert(0, ${JSON.stringify(root)})\n${script}`], { encoding: "utf8", env: { ...process.env, PYTHONUTF8: "1" } });
  if (out.status !== 0) throw new Error(out.stderr);
  return JSON.parse(out.stdout);
}

describe("an emoji or its name works on every platform", () => {
  test("names become emoji, emoji become Slack names, and an unknown one gives nothing", () => {
    const got = py(`from platformKit import reactions as r
print(json.dumps([r.unicode_of("joy"), r.unicode_of(":fire:"), r.unicode_of("😂"), r.unicode_of("nope"), r.slack_name_of("😂"), r.slack_name_of(":eyes:"), r.slack_name_of("❤️"), r.slack_name_of("🦄")]))`);
    expect(got).toEqual(["😂", "🔥", "😂", null, "joy", "eyes", "heart", null]);
  });

  test("the Slack and Instagram engines refuse a reaction missing its message or emoji before calling the platform", () => {
    const got = py(`import asyncio
from slackApi import engine as slack
print(json.dumps([asyncio.run(slack.react({"chat": "D1", "ts": "", "emoji": "joy"}, {}))["code"], asyncio.run(slack.react({"chat": "D1", "ts": "1.2", "emoji": "🦄"}, {}))["code"], "react" in slack.WRITES]))`);
    expect(got).toEqual(["reactInvalid", "reactInvalid", true]);
  });
});
