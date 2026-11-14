import { describe, expect, test } from "bun:test";
import { issueSignInLink, redeemSignInLink } from "./client.ts";
import { SIGN_IN_LINK_MS } from "./types.ts";
import type { SignInLinkRow, SignInLinkStore } from "./types.ts";

function memoryStore(): SignInLinkStore & { rows: Map<string, SignInLinkRow> } {
  const rows = new Map<string, SignInLinkRow>();
  return {
    rows,
    put: (key, row) => void rows.set(key, row),
    read: (key) => rows.get(key) ?? null,
    take(key) {
      const row = rows.get(key) ?? null;
      rows.delete(key);
      return row;
    },
  };
}

const TARGET = { accountId: "local:discord:fakeGuild", account: "fakeGuild", platform: "discord" as const };
const TOKEN = "t".repeat(43);

describe("a sign-in link grants nothing by itself and works once", () => {
  test("the URL is the console page with an opaque token: no account, platform or secret in it", () => {
    const store = memoryStore();
    const link = issueSignInLink(TARGET, "u1", "https://console.example", { store, token: () => TOKEN, now: () => new Date("2026-11-14T10:00:00Z") });
    expect(link.url).toBe(`https://console.example/console/connections?signIn=${TOKEN}`);
    expect(link.expiresAt).toBe("2026-11-14T10:10:00.000Z");
    expect([...store.rows.keys()][0]).not.toBe(TOKEN);
  });

  test("only the person it was made for opens it, and a wrong person does not use it up", () => {
    const store = memoryStore();
    issueSignInLink(TARGET, "u1", "https://console.example", { store, token: () => TOKEN });
    expect(() => redeemSignInLink(TOKEN, "u2", { store })).toThrow("signInLinkNotYours");
    expect(() => redeemSignInLink(TOKEN, undefined, { store })).toThrow("signInLinkInvalid");
    expect(redeemSignInLink(TOKEN, "u1", { store })).toEqual(TARGET);
    expect(() => redeemSignInLink(TOKEN, "u1", { store })).toThrow("signInLinkInvalid");
  });

  test("it expires ten minutes after it was made", () => {
    const store = memoryStore();
    const made = new Date("2026-11-14T10:00:00Z");
    issueSignInLink(TARGET, "u1", "https://console.example", { store, token: () => TOKEN, now: () => made });
    expect(() => redeemSignInLink(TOKEN, "u1", { store, now: () => new Date(made.getTime() + SIGN_IN_LINK_MS) })).toThrow("signInLinkInvalid");
  });

  test("a malformed token and an unknown one are both invalid", () => {
    const store = memoryStore();
    expect(() => redeemSignInLink("short", "u1", { store })).toThrow("signInLinkInvalid");
    expect(() => redeemSignInLink(TOKEN, "u1", { store })).toThrow("signInLinkInvalid");
  });
});
