import { describe, expect, test } from "bun:test";
import { DISCORD_PLATFORM } from "../../discord/account/session/index.ts";
import type { TwentyClient } from "../../twenty/graphql/index.ts";
import { findPlatformAccount } from "./index.ts";

const rows = [{ id: "fakeRow1", platform: "SLACK", accountName: "fakeBird", name: "fakeBird" }];

const twenty = {
  list: async (_object: string, filter: Record<string, { eq: string }>) => rows.filter((row) => Object.entries(filter).every(([key, value]) => (row as Record<string, string>)[key] === value.eq)),
} as unknown as TwentyClient;

describe("an account named on the wrong platform", () => {
  test("answers accountPlatformMismatch with where it was found", async () => {
    await expect(findPlatformAccount(twenty, DISCORD_PLATFORM, "fakeBird")).rejects.toMatchObject({ code: "accountPlatformMismatch", message: expect.stringContaining("slack") });
  });

  test("an account kept nowhere is still accountNotFound", async () => {
    await expect(findPlatformAccount(twenty, DISCORD_PLATFORM, "fakeNobody")).rejects.toMatchObject({ code: "accountNotFound" });
  });
});
