import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { transform } from "sucrase";
import { profileFrom } from "../../../inbox/profiles/index.ts";
import type { IdentityProfileView, ProfileQuery } from "../../../inbox/profiles/index.ts";
import { rememberProfiles } from "../../../inbox/store/index.ts";
import type { SendersReport } from "../../../inbox/senders/index.ts";
import { SendersNoDataError } from "../../../inbox/senders/index.ts";
import { putBlob, twitterFollowerProfile } from "../../../storage/platform/index.ts";
import { migrate } from "../../../storage/schema/client.ts";
import { fileURLToPath } from "node:url";
import { loadViewServer, reportInputSchema, runReport } from "./client.ts";
import { REPORT_SOURCE_NAMES } from "./index.ts";

const SENDERS: SendersReport = { source: "dmsBySender", platform: "discord", readFrom: "log.db", account: null, accounts: ["fakeGuild"], since: null, messages: 3, people: 1, senders: [{ handle: "fakeOne", name: "Fake One", account: "fakeGuild", count: 3, firstAt: "2026-11-01T10:00:00Z", lastAt: "2026-11-02T10:00:00Z", activity: [1, 2], lastMessage: "hi" }], byDay: [{ day: "2026-11-01", count: 1 }, { day: "2026-11-02", count: 2 }] };

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

function storedProfiles(): Database {
  const handle = new Database(":memory:");
  migrate(handle);
  rememberProfiles("twitter", "fakeAccount", [twitterFollowerProfile({ userId: "9001", handle: "fakeBird", name: "Fake Bird", bio: "builds small tools", location: "Somewhere", followers: 1234, following: 5, posts: 6, canDm: true, protected: false })], new Date("2026-11-14T10:00:00Z"), handle);
  const avatar = putBlob(handle, "avatar", PNG);
  rememberProfiles("twitter", "fakeAccount", [{ userId: "9001", handle: null, displayName: null, fields: { avatarHash: avatar } }], new Date("2026-11-14T11:00:00Z"), handle);
  return handle;
}

type Factory = (require: (name: string) => unknown, module: { exports: Record<string, unknown> }, exports: Record<string, unknown>) => void;
const RUN = fileURLToPath(new URL("./view/run.ts", import.meta.url));
const run = (await import(RUN)) as { moduleRequire: (name: unknown) => unknown; viewFromModule: (factory: Factory) => unknown };
const { compileView, starterCode } = await loadViewServer();
const { moduleRequire, viewFromModule } = run;

const text = (answer: { content: unknown }) => (answer.content as { text: string }[])[0].text;

describe("report data sources are a registry, dispatched on source", () => {
  test("the registry lists every source and the tool schema offers each one", () => {
    expect(REPORT_SOURCE_NAMES).toEqual(["twitterDmsBySender", "dmsBySender", "identityProfile"]);
    const schema = JSON.stringify(reportInputSchema());
    for (const name of REPORT_SOURCE_NAMES) expect(schema).toContain(name);
  });

  test("each source goes to its own reader, and only to it", async () => {
    const calls: string[] = [];
    const deps = {
      readSenders: () => (calls.push("x"), { ...SENDERS, source: "twitterDmsBySender" as const }),
      readPlatformSenders: (platform: string) => (calls.push(`chat:${platform}`), SENDERS),
      readProfile: (q: ProfileQuery) => (calls.push(`profile:${q.platform}:${q.handle}`), profileFrom(storedProfiles(), q)),
    };
    await runReport({ title: "a", data: { dms: { source: "twitterDmsBySender" } } }, false, deps);
    await runReport({ title: "b", data: { chats: { source: "dmsBySender", platform: "discord", since: "7d" } } }, false, deps);
    await runReport({ title: "c", data: { person: { source: "identityProfile", platform: "twitter", handle: "fakeBird" } } }, false, deps);
    expect(calls).toEqual(["x", "chat:discord", "profile:twitter:fakeBird"]);
  });

  test("a platform with no chats in log.db is refused with a code, not drawn as an empty X result", async () => {
    const answer = await runReport({ title: "LinkedIn DMs", data: { dms: { source: "dmsBySender", platform: "linkedin" } } }, false, { readPlatformSenders: (platform) => { throw new SendersNoDataError(platform); } });
    expect(answer.isError).toBe(true);
    expect(text(answer)).toMatch(/^reportSourceNoData: /);
    expect(text(answer)).toContain("linkedin");
  });

  test("an unknown source, or a profile asked for by both id and handle, is a field refusal", async () => {
    expect(text(await runReport({ title: "x", data: { a: { source: "nope" } } }, false))).toMatch(/^reportFieldInvalid: /);
    expect(text(await runReport({ title: "x", data: { a: { source: "identityProfile", platform: "twitter", userId: "1", handle: "b" } } }, false, { readProfile: () => { throw new Error("not reached"); } }))).toMatch(/^reportFieldInvalid: .*userId or handle/);
  });
});

describe("identityProfile draws one person from the stored row", () => {
  test("it renders from log.db with zero engine calls", async () => {
    const handle = storedProfiles();
    let engineCalls = 0;
    const answer = await runReport({ title: "Who is this", data: { person: { source: "identityProfile", platform: "twitter", handle: "@FakeBird" } } }, false, {
      readSenders: () => (engineCalls++, SENDERS),
      readPlatformSenders: () => (engineCalls++, SENDERS),
      readProfile: (q) => profileFrom(handle, q),
    });
    expect(engineCalls).toBe(0);
    expect(answer.isError).toBeUndefined();
    const person = (answer.structuredContent as { data: { person: IdentityProfileView } }).data.person;
    expect(person).toMatchObject({ source: "identityProfile", platform: "twitter", userId: "9001", handle: "fakeBird", name: "Fake Bird", bio: "builds small tools", followerCount: 1234, extra: { location: "Somewhere", canDm: true } });
    expect(person.avatar).toBe(`data:image/png;base64,${Buffer.from(PNG).toString("base64")}`);
    expect(text(answer)).toContain("Fake Bird @fakeBird on twitter");
    expect(text(answer)).toContain("builds small tools");
    const drawn = await runReport({ title: "Who is this", data: { person: { source: "identityProfile", platform: "twitter", userId: "9001" } } }, false, { readProfile: (q) => profileFrom(handle, q) });
    expect((drawn.structuredContent as { compiled: string }).compiled).toContain("Profile kept");
  });

  test("a person with no stored profile is refused with identityProfileMissing", async () => {
    const handle = storedProfiles();
    const answer = await runReport({ title: "x", data: { person: { source: "identityProfile", platform: "twitter", handle: "nobodyHere" } } }, false, { readProfile: (q) => profileFrom(handle, q) });
    expect(text(answer)).toMatch(/^identityProfileMissing: /);
  });
});

describe("a view can't reach a module through import", () => {
  test("a static import from outside log and react is refused at compile time", () => {
    for (const code of ['import fs from "node:fs";\nexport default function App() { return null }', 'import "node:fs";\nexport default function App() { return null }']) {
      const compiled = compileView(code);
      expect(compiled.ok).toBe(false);
    }
  });

  test("a dynamic import() is refused at compile time, whatever it names", () => {
    for (const code of ['export default function App() { import("node:fs"); return null }', 'export default async function App() { const m = "node:" + "fs"; await import(m); return null }', 'export default function App() { import("log"); return null }', 'export default function App() { eval("import(\'node:fs\')"); return null }']) {
      const compiled = compileView(code);
      expect(compiled.ok).toBe(false);
      if (!compiled.ok) expect(compiled.error).toMatch(/^viewImportRefused: /);
    }
    expect(compileView('import { Page } from "log";\nexport default function App() { return <Page title="ok" /> }').ok).toBe(true);
  });

  test("a dynamic import that reaches the runtime anyway throws when it is called", async () => {
    const compiled = transform('export default async function App() { return await import("node:fs") }', { transforms: ["jsx", "imports"], jsxRuntime: "automatic", production: true, filePath: "App.jsx" }).code;
    const View = viewFromModule(new Function("require", "module", "exports", compiled) as Factory) as unknown as () => Promise<unknown>;
    await expect(View()).rejects.toThrow(/viewImportRefused/);
    expect(() => moduleRequire("node:fs")).toThrow(/viewImportRefused/);
    expect(() => moduleRequire("constructor")).toThrow(/viewImportRefused/);
    expect(moduleRequire("log")).toBeDefined();
  });

  test("the starters still compile", () => {
    for (const name of ["twitterDms", "blocks", "person"]) expect(compileView(starterCode(name)).ok).toBe(true);
  });
});
