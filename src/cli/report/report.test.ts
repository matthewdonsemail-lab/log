import { afterEach, describe, expect, test } from "bun:test";
import { ProfileMissingError } from "../../inbox/profiles/index.ts";
import type { IdentityProfileView } from "../../inbox/profiles/index.ts";
import { SendersNoDataError } from "../../inbox/senders/index.ts";
import type { SendersOptions, SendersReport } from "../../inbox/senders/index.ts";
import { REPORT_SOURCE_NAMES } from "../../mcp/apps/report/index.ts";
import type { CommandResult } from "../runner/types.ts";
import { REPORT_INPUT, reportCommand, reportDeps } from "./index.ts";

const saved = { ...reportDeps };
const quiet = { out: () => {}, err: () => {} } as never;
const run = (argv: string[]): Promise<CommandResult> => Promise.resolve(reportCommand.run(quiet, argv));

const SENDERS: SendersReport = { source: "dmsBySender", platform: "discord", readFrom: "log.db", account: null, accounts: ["fakeGuild"], since: null, messages: 3, people: 1, senders: [{ handle: "fakeOne", name: "Fake One", account: "fakeGuild", count: 3, firstAt: "2026-11-01T10:00:00Z", lastAt: "2026-11-02T10:00:00Z", activity: [1, 2], lastMessage: "hi" }], byDay: [] };
const PROFILE: IdentityProfileView = { source: "identityProfile", readFrom: "log.db", platform: "twitter", userId: "9001", handle: "fakeBird", name: "Fake Bird", bio: "builds small tools", followerCount: 1234, verified: false, extra: {}, avatar: null, fetchedAt: "2026-11-14T10:00:00Z", firstSeenAt: null, lastSeenAt: null };

afterEach(() => Object.assign(reportDeps, saved));

describe("log report data offers every REPORT_SOURCES source", () => {
  test("the source flag lists the registry, so the CLI and the report tool offer the same sources", () => {
    expect(REPORT_INPUT.forms[0].flags.find((flag) => flag.name === "source")?.values).toEqual(REPORT_SOURCE_NAMES);
  });

  test("dmsBySender reads the platform named, with the options given", async () => {
    let asked: [string, SendersOptions] | null = null;
    reportDeps.readPlatformSenders = (platform, options) => ((asked = [platform, options]), SENDERS);
    const json = await run(["data", "--source", "dmsBySender", "--platform", "discord", "--account", "fakeGuild", "--limit", "5", "--json"]);
    expect(json.code).toBe(0);
    expect(JSON.parse(String(json.stdout))).toEqual(SENDERS);
    expect(asked).toEqual(["discord", { account: "fakeGuild", since: null, limit: 5 }] as never);
    const text = await run(["data", "--source", "dmsBySender", "--platform", "discord"]);
    expect(text.stdout).toContain("dmsBySender");
    expect(text.stdout).toContain("Fake One (@fakeOne): 3 messages");
  });

  test("identityProfile reads one stored profile by handle", async () => {
    reportDeps.readProfile = (query) => ({ ...PROFILE, handle: query.handle ?? null });
    const text = await run(["data", "--source", "identityProfile", "--platform", "twitter", "--handle", "fakeBird"]);
    expect(text.code).toBe(0);
    expect(text.stdout).toContain("Fake Bird on twitter (@fakeBird, 1234 followers)");
  });

  test("a field the source doesn't take and the refusals of the readers carry their catalog codes", async () => {
    expect((await run(["data", "--source", "twitterDmsBySender", "--platform", "discord"])).error).toBe("reportFieldInvalid");
    expect((await run(["data", "--source", "dmsBySender"])).error).toBe("reportFieldInvalid");
    expect((await run(["data", "--source", "identityProfile", "--platform", "twitter"])).error).toBe("reportFieldInvalid");
    reportDeps.readPlatformSenders = (platform) => {
      throw new SendersNoDataError(platform);
    };
    expect((await run(["data", "--source", "dmsBySender", "--platform", "slack"])).error).toBe("reportSourceNoData");
    reportDeps.readProfile = (query) => {
      throw new ProfileMissingError(query);
    };
    expect((await run(["data", "--source", "identityProfile", "--platform", "twitter", "--userId", "1"])).error).toBe("identityProfileMissing");
    expect((await run(["data", "--source", "madeUp"])).error).toBe("inputInvalid");
  });
});
