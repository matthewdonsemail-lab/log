import { describe, expect, test } from "bun:test";

import { RedditSessionState } from "../src";

const OPTIONS = {
  username: "example_user",
  origin: "https://www.reddit.com/",
} as const;

describe("RedditSessionState", () => {
  test("normalizes a Cookie header without corrupting equals signs", () => {
    const state = RedditSessionState.from(
      "reddit_session=user%2Ctime%2Csignature==; csrf_token=csrf",
      OPTIONS,
    );

    expect(state.cookies).toEqual([
      { name: "csrf_token", value: "csrf" },
      { name: "reddit_session", value: "user%2Ctime%2Csignature==" },
    ]);
    expect(state.toCookieHeader()).toBe(
      "csrf_token=csrf; reddit_session=user%2Ctime%2Csignature==",
    );
  });

  test("normalizes browser-export JSON and removes expired cookies", () => {
    const futureSeconds = Math.floor(Date.now() / 1_000) + 3_600;
    const state = RedditSessionState.from(
      JSON.stringify([
        {
          name: "reddit_session",
          value: "authenticated",
          domain: ".reddit.com",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "Lax",
          expirationDate: futureSeconds,
        },
        {
          name: "expired",
          value: "ignored",
          expires: 1,
        },
      ]),
      OPTIONS,
    );

    expect(state.cookies).toEqual([
      {
        name: "reddit_session",
        value: "authenticated",
        domain: ".reddit.com",
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        expiresAtMs: futureSeconds * 1_000,
      },
    ]);
  });

  test("normalizes Firefox Cookie Quick Manager exports", () => {
    const state = RedditSessionState.fromJSON(
      JSON.stringify([
        {
          "Host raw": "https://.reddit.com/",
          "Name raw": "reddit_session",
          "Path raw": "/",
          "Content raw": "authenticated",
          "Expires raw": "0",
          "Send for raw": "true",
          "HTTP only raw": "true",
          "SameSite raw": "no_restriction",
          "This domain only raw": "false",
        },
      ]),
      OPTIONS,
    );

    expect(state.cookies).toEqual([
      {
        name: "reddit_session",
        value: "authenticated",
        domain: ".reddit.com",
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "none",
      },
    ]);
  });

  test("round-trips the versioned SDK snapshot", () => {
    const original = RedditSessionState.fromCookies(
      { reddit_session: "authenticated", csrf_token: "csrf" },
      OPTIONS,
    );
    const restored = RedditSessionState.fromJSON(JSON.stringify(original));

    expect(restored.toJSON()).toEqual(original.toJSON());
    expect(restored.version).toBe(1);
  });

  test("requires identity metadata for raw cookie inputs", () => {
    expect(() =>
      RedditSessionState.fromCookies({ reddit_session: "authenticated" }, {}),
    ).toThrow("username is required");
    expect(() =>
      RedditSessionState.fromJSON(
        JSON.stringify({ version: 2, cookies: [] }),
        OPTIONS,
      ),
    ).toThrow("Unsupported Reddit session version");
  });
});
