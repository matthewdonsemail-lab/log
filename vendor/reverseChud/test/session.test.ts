import { describe, expect, test } from "bun:test";

import {
  createRedditSession,
  DEFAULT_REDDIT_BROWSER_OS,
  DEFAULT_REDDIT_BROWSER_PROFILE,
  normalizeRedditProxy,
} from "../src/index";

describe("Reddit session", () => {
  test("uses the observed Windows Chrome identity by default", async () => {
    expect(DEFAULT_REDDIT_BROWSER_PROFILE).toBe("chrome_140");
    expect(DEFAULT_REDDIT_BROWSER_OS).toBe("windows");

    const session = await createRedditSession();
    expect(session.closed).toBeFalse();
    await session.close();
    expect(session.closed).toBeTrue();
  });

  test("rejects invalid request timeouts", () => {
    expect(() => createRedditSession({ timeoutMs: 0 })).toThrow(
      "timeout must be a positive finite number",
    );
  });

  test("normalizes URL and curl-style proxy inputs", () => {
    expect(normalizeRedditProxy("user:pass@proxy.example:8000")).toBe(
      "http://user:pass@proxy.example:8000/",
    );
    expect(
      normalizeRedditProxy(new URL("socks5h://proxy.example:1080")),
    ).toBe("socks5h://proxy.example:1080");
    expect(() => normalizeRedditProxy(" ")).toThrow("cannot be empty");
    expect(() => normalizeRedditProxy("ftp://proxy.example:21")).toThrow(
      "must use HTTP",
    );
    expect(() => normalizeRedditProxy("http://proxy.example/path")).toThrow(
      "cannot contain a path",
    );
  });
});
