import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun, PlatformEngineSpec } from "../../platformKit/session/index.ts";
import type { TwitterEngineRun, TwitterEngineSpec, TwitterSessionAnswer } from "../../twitter/account/session/index.ts";
import type { InboxMessage } from "../../inbox/watch/index.ts";
import { discordDeps } from "../discord/index.ts";
import { slackDeps } from "../slack/index.ts";
import { twitterSendDeps } from "../twitter/helpers/send.ts";
import { gateDeps } from "../twitter/helpers/voice.ts";
import { runCli } from "./index.ts";
import type { CommandContext } from "./types.ts";

const POST = "https://x.com/fakeBird/status/1900000000000000009";

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push(
    { id: "xActs", accountName: "xActs", platform: "TWITTER", cookies: { auth_token: "a".repeat(40), ct0: "b".repeat(40) }, proxy: null },
    { id: "discordActs", accountName: "discordActs", platform: "DISCORD", cookies: [], storageOrigins: [{ origin: "https://discord.com", localStorage: [{ name: "token", value: JSON.stringify("x".repeat(30)) }] }], proxy: null } as never,
    { id: "slackActs", accountName: "slackActs", platform: "SLACK", cookies: { d: "x".repeat(20) }, proxy: null } as never,
    { id: "instagramActs", accountName: "instagramActs", platform: "INSTAGRAM", cookies: { sessionid: "x".repeat(20), ds_user_id: "x".repeat(20), csrftoken: "x".repeat(20) }, proxy: null } as never,
  );
  return twenty;
}

type Engine<Spec, Run> = (spec: Spec) => Run;

async function cli(argv: string[], engines: { twitter?: Engine<TwitterEngineSpec, TwitterSessionAnswer>; discord?: Engine<PlatformEngineSpec, PlatformEngineRun["answer"]>; slack?: Engine<PlatformEngineSpec, PlatformEngineRun["answer"]>; instagram?: Engine<PlatformEngineSpec, PlatformEngineRun["answer"]> }) {
  const out: string[] = [];
  const err: string[] = [];
  const calls: Record<string, unknown>[] = [];
  const answer = <Spec extends object, A>(engine: Engine<Spec, A> | undefined, spec: Spec): A => {
    calls.push({ ...spec } as Record<string, unknown>);
    if (!engine) throw new Error("no engine expected");
    return engine(spec);
  };
  const context: Partial<CommandContext> = {
    twenty: fixture(),
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    sleep: async () => {},
    directTwitter: (_account, spec): TwitterEngineRun => ({ answer: { loginState: "loggedIn", ...answer(engines.twitter, spec) }, refreshed: null }),
    directDiscord: (_account, spec) => ({ answer: answer(engines.discord, spec), refreshed: null }),
    directSlack: (_account, spec) => ({ answer: answer(engines.slack, spec), refreshed: null }),
    directInstagram: (_account, spec) => ({ answer: answer(engines.instagram, spec), refreshed: null }),
  };
  const code = await runCli(argv, context as CommandContext);
  return { code, out: out.join("\n"), err: err.join("\n"), calls };
}

const boom = (): never => {
  throw new Error("socket closed");
};

const heardOf = (platform: string, account: string, conversationId: string): InboxMessage => ({ platform, account, conversationId, with: "fakeBird", text: "wait what", at: "2026-11-14T10:00:20.000Z", box: "dm", seenAt: "2026-11-14T10:00:20.500Z" });

const savedGate = gateDeps.gate;
const savedTwitter = { ...twitterSendDeps };
const savedDiscord = { ...discordDeps };
const savedSlack = { ...slackDeps };

beforeEach(() => {
  twitterSendDeps.profiles = () => ({});
  twitterSendDeps.incoming = () => [];
  discordDeps.profiles = () => ({});
  discordDeps.wait = async () => {};
  discordDeps.incoming = () => [];
  slackDeps.profiles = () => ({});
  slackDeps.wait = async () => {};
  slackDeps.incoming = () => [];
});

afterEach(() => {
  gateDeps.gate = savedGate;
  Object.assign(twitterSendDeps, savedTwitter);
  Object.assign(discordDeps, savedDiscord);
  Object.assign(slackDeps, savedSlack);
});

const refusingGate = () => {
  gateDeps.gate = async (_context, send) => ({ ok: false, refused: `>>> VOICE GATE FAILED for ${send.to}` });
};

describe("X writes run through the shared action machine", () => {
  const forms: [string, string[]][] = [
    ["reply", ["--tweet", POST, "--text", "love this one"]],
    ["quote", ["--tweet", POST, "--text", "love this one"]],
    ["like", ["--tweet", POST]],
    ["repost", ["--tweet", POST]],
    ["follow", ["--userId", "4200"]],
    ["post", ["--text", "one in 173"]],
  ];

  test("each one acts once with its approver and X's answer decides", async () => {
    for (const [action, flags] of forms) {
      const sent = await cli(["twitter", action, "--account", "xActs", ...flags, "--approvedBy", "fakeOwner", "--live"], { twitter: () => ({ ok: true, event: "sent", tweetId: "777", liked: true, reposted: true, followed: true, userId: "4200" }) });
      expect(sent.code).toBe(0);
      expect(sent.calls).toHaveLength(1);
      expect(sent.calls[0]).toMatchObject({ action, live: true, approvedBy: "fakeOwner" });
      const refused = await cli(["twitter", action, "--account", "xActs", ...flags, "--approvedBy", "fakeOwner", "--live"], { twitter: () => ({ ok: false, event: "throttled", code: "rateLimited", detail: "429" }) });
      expect(refused.code).toBe(1);
      expect(refused.out).toContain("throttled");
      expect(refused.calls).toHaveLength(1);
    }
  });

  test("an engine that throws is uncertain: said once as a crash, never retried", async () => {
    for (const [action, flags] of forms) {
      const r = await cli(["twitter", action, "--account", "xActs", ...flags, "--approvedBy", "fakeOwner", "--live"], { twitter: boom });
      expect(r.code).toBe(2);
      expect(r.err).toContain("crashed");
      expect(r.calls).toHaveLength(1);
    }
  });

  test("a refusal before the machine sends nothing", async () => {
    const r = await cli(["twitter", "reply", "--account", "xActs", "--tweet", POST, "--text", "Love this.", "--approvedBy", "fakeOwner", "--live"], { twitter: () => ({ ok: true, event: "sent", tweetId: "1" }) });
    expect(r.err).toContain("styleFailed");
    expect(r.calls).toEqual([]);
  });

  test("list create and add act once each, and a throw is a crash said once", async () => {
    const lists = { ok: true, lists: [{ id: "900", name: "fakeList", mode: "Private", memberCount: 0, description: "" }] };
    const made = await cli(["twitter", "list", "create", "--account", "xActs", "--name", "newList", "--approvedBy", "fakeOwner", "--live"], { twitter: (spec) => (spec.action === "lists" ? lists : { ok: true, list: { id: "901", name: "newList" } }) as TwitterSessionAnswer });
    expect(made.code).toBe(0);
    expect(made.out).toContain('made the list "newList"');
    expect(made.calls.map((c) => c.action)).toEqual(["lists", "listCreate"]);
    const added = await cli(["twitter", "list", "add", "--account", "xActs", "--list", "fakeList", "--userId", "4200", "--approvedBy", "fakeOwner", "--live"], { twitter: (spec) => (spec.action === "lists" ? lists : { ok: false, code: "listRefused", detail: "no" }) as TwitterSessionAnswer });
    expect(added.code).toBe(1);
    expect(added.out).toContain("listRefused");
    expect(added.calls.map((c) => c.action)).toEqual(["lists", "listAdd"]);
    const thrown = await cli(["twitter", "list", "add", "--account", "xActs", "--list", "fakeList", "--userId", "4200", "--approvedBy", "fakeOwner", "--live"], { twitter: (spec) => (spec.action === "lists" ? (lists as TwitterSessionAnswer) : boom()) });
    expect(thrown.code).toBe(2);
    expect(thrown.calls.map((c) => c.action)).toEqual(["lists", "listAdd"]);
  });
});

describe("text sends run through the shared action machine: gate, parts, release", () => {
  const sends = {
    twitter: { argv: (chat: string, text: string) => ["twitter", "dm", "--account", "xActs", "--userId", chat, "--text", text, "--approvedBy", "fakeOwner", "--live"], ok: () => ({ ok: true, event: "sent", conversationId: "4201-1" }) },
    discord: { argv: (chat: string, text: string) => ["discord", "send", "--account", "discordActs", "--channel", chat, "--text", text, "--approvedBy", "fakeOwner", "--live"], ok: () => ({ ok: true, event: "sent", messageId: "1", timestamp: "t" }) },
    slack: { argv: (chat: string, text: string) => ["slack", "send", "--account", "slackActs", "--chat", chat, "--text", text, "--approvedBy", "fakeOwner", "--live"], ok: () => ({ ok: true, sent: [{ ts: "1.1" }] }) },
    instagram: { argv: (chat: string, text: string) => ["instagram", "send", "--account", "instagramActs", "--with", chat, "--text", text, "--approvedBy", "fakeOwner", "--live"], ok: () => ({ ok: true, sent: [{ id: "t1", kind: "text", text: "one" }, { id: "t2", kind: "text", text: "two" }] }) },
  } as const;
  const chats = { twitter: ["4201", "4202", "4203", "4204"], discord: ["1000000000000000101", "1000000000000000102", "1000000000000000103", "1000000000000000104"], slack: ["D0ACTS0001", "D0ACTS0002", "D0ACTS0003", "D0ACTS0004"], instagram: ["fakeBirdA", "fakeBirdB", "fakeBirdC", "fakeBirdD"] };

  for (const platform of ["twitter", "discord", "slack", "instagram"] as const) {
    const send = sends[platform];
    const engines = (engine: () => Record<string, unknown>) => ({ [platform]: engine }) as never;

    test(`${platform}: the happy path sends every part and exits 0`, async () => {
      const r = await cli(send.argv(chats[platform][0], "one\ntwo"), engines(send.ok));
      expect(r.code).toBe(0);
      expect(r.calls).toHaveLength(platform === "instagram" ? 1 : 2);
      expect(r.calls.every((c) => c.live === true && c.approvedBy === "fakeOwner")).toBe(true);
    });

    test(`${platform}: a refused gate sends nothing`, async () => {
      refusingGate();
      const r = await cli(send.argv(chats[platform][1], "one\ntwo"), engines(send.ok));
      expect(r.code).toBe(1);
      expect(r.err).toContain("voiceGateFailed");
      expect(r.calls).toEqual([]);
    });

    test(`${platform}: an engine throw is uncertain, said once, and the claim is released`, async () => {
      const thrown = await cli(send.argv(chats[platform][2], "one\ntwo"), engines(boom));
      expect(thrown.code).toBe(2);
      expect(thrown.err).toContain("crashed");
      expect(thrown.calls).toHaveLength(1);
      const again = await cli(send.argv(chats[platform][2], "one\ntwo"), engines(send.ok));
      expect(again.err).not.toContain("chatClaimedElsewhere");
      expect(again.code).toBe(0);
    });

    test(`${platform}: someone writing between parts stops the rest`, async () => {
      const chat = chats[platform][3];
      if (platform === "twitter") twitterSendDeps.incoming = (account, userId) => [heardOf("twitter", account, `${userId}-1`)];
      if (platform === "discord") discordDeps.incoming = (account, channel) => [heardOf("discord", account, channel)];
      if (platform === "slack") slackDeps.incoming = (account, id) => [heardOf("slack", account, id)];
      const engine = platform === "instagram" ? () => ({ ok: true, sent: [{ id: "t1", kind: "text", text: "one" }], interrupted: [heardOf("instagram", "instagramActs", chat)], held: ["two", "three"] }) : send.ok;
      const r = await cli(send.argv(chat, "one\ntwo\nthree"), engines(engine));
      expect(r.code).toBe(1);
      expect(r.calls).toHaveLength(1);
      expect(r.out).toContain(">>> INTERRUPTED");
      expect(r.out).toContain("not sent: two");
      expect(r.out).toContain("not sent: three");
    });
  }
});

describe("discord delete runs through the shared action machine", () => {
  const argv = ["discord", "delete", "--account", "discordActs", "--channel", "1000000000000000201", "--message", "1566872902840619151,1566872961531777095", "--approvedBy", "fakeOwner", "--live"];

  test("each id is deleted once and Discord's answer decides", async () => {
    const r = await cli(argv, { discord: (spec) => ({ ok: true, event: "deleted", messageId: spec.message }) });
    expect(r.code).toBe(0);
    expect(r.calls.map((c) => c.message)).toEqual(["1566872902840619151", "1566872961531777095"]);
    expect(r.out).toContain("deleted 2 message(s)");
  });

  test("an engine throw mid-run is a crash said once, and nothing after it is deleted", async () => {
    let n = 0;
    const r = await cli(argv, { discord: (spec) => (n++ ? boom() : { ok: true, event: "deleted", messageId: spec.message }) });
    expect(r.code).toBe(2);
    expect(r.err).toContain("crashed");
    expect(r.calls).toHaveLength(2);
  });
});
