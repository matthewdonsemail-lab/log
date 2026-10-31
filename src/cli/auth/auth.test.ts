import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isValidExchange, runExchangeServer } from "../../auth/exchange/index.ts";
import { buildAuthorizeUrl, codeChallengeForVerifier, isTokenExpired, loadSessionHome, maskSecret } from "../../auth/session/index.ts";
import { runCli } from "../runner/index.ts";
import { authDeps } from "./index.ts";

const real = { ...authDeps };
let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "logCliAuth"));
  authDeps.dir = dir;
});
afterEach(() => {
  Object.assign(authDeps, real);
  rmSync(dir, { recursive: true, force: true });
});

function fakeBlaster(validTokens = new Set(["tokenGood123456"])) {
  authDeps.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/login")) return new Response('<meta name="blaster-web">');
    if (url.endsWith("/api/auth/me")) {
      const auth = new Headers(init?.headers).get("Authorization") ?? "";
      return validTokens.has(auth.replace("Bearer ", ""))
        ? Response.json({ username: "matt@rheos.app", scope: "api" })
        : new Response("no", { status: 401 });
    }
    if (url.endsWith("/api/auth/refresh")) {
      validTokens.add("tokenRotated12345");
      return Response.json({ tokens: { accessToken: "tokenRotated12345", refreshToken: "refresh2", expiresIn: 3600 } });
    }
    return new Response("?", { status: 404 });
  }) as typeof fetch;
}

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("session helpers", () => {
  test("PKCE challenge is base64url SHA-256 (RFC 7636 example)", async () => {
    expect(await codeChallengeForVerifier("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  test("tokens are masked, expiry has 60s of skew, the authorize URL carries the handoff", () => {
    expect(maskSecret("abcdefghijklmnop")).toBe("abcd…mnop");
    expect(isTokenExpired(0, 120, 59_000)).toBe(false);
    expect(isTokenExpired(0, 120, 61_000)).toBe(true);
    const url = new URL(buildAuthorizeUrl("https://blaster.listeningkit.com", "s", "c", "http://127.0.0.1:5000/exchange"));
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("exchange")).toBe("http://127.0.0.1:5000/exchange");
  });
});

describe("loopback exchange", () => {
  test("accepts only a POST that echoes this run's state and challenge", async () => {
    expect(isValidExchange({ state: "s", code_challenge: "c", access_token: "t" }, "s", "c")).toBe(true);
    expect(isValidExchange({ state: "x", code_challenge: "c", access_token: "t" }, "s", "c")).toBe(false);

    const server = runExchangeServer({ state: "s", challenge: "c", timeoutMs: 5_000 });
    const base = await server.url;
    const bad = await fetch(`${base}/exchange`, { method: "POST", body: JSON.stringify({ state: "nope", code_challenge: "c", access_token: "t" }) });
    expect(bad.status).toBe(400);
    const good = await fetch(`${base}/exchange`, {
      method: "POST",
      body: JSON.stringify({ state: "s", code_challenge: "c", access_token: "tokenGood123456", refresh_token: "r", expires_in: 3600 }),
    });
    expect(good.status).toBe(200);
    const result = await server.result;
    expect(result.ok && result.session.accessToken).toBe("tokenGood123456");
  });

  test("times out when the browser never posts", async () => {
    const server = runExchangeServer({ state: "s", challenge: "c", timeoutMs: 10 });
    await server.url;
    expect(await server.result).toEqual({ ok: false, error: "timedOut" });
  });
});

describe("log login / whoami / logout", () => {
  test("browser login: the web app posts tokens to the loopback, the session is validated and stored", async () => {
    fakeBlaster();
    authDeps.openBrowser = (authorize) => {
      const url = new URL(authorize);
      void fetch(url.searchParams.get("exchange")!, {
        method: "POST",
        body: JSON.stringify({
          state: url.searchParams.get("state"),
          code_challenge: url.searchParams.get("code_challenge"),
          access_token: "tokenGood123456",
          refresh_token: "refresh1",
          expires_in: 3600,
        }),
      });
      return true;
    };
    const { code, out, err } = await run(["login", "--apiUrl", "https://api.test"]);
    expect(code).toBe(0);
    expect(err).toContain("Opening browser:");
    expect(out).toContain("Signed in as matt@rheos.app");
    expect(out).not.toContain("tokenGood123456");
    const stored = loadSessionHome(dir).sessions["https://api.test"];
    expect(stored.accessToken).toBe("tokenGood123456");
    expect(readFileSync(join(dir, "config.json"), "utf8")).toContain("https://api.test");
  });

  test("paste login, whoami, logout", async () => {
    fakeBlaster();
    expect((await run(["login", "--token", "tokenGood123456", "--apiUrl", "https://api.test"])).code).toBe(0);
    const who = await run(["whoami", "--json"]);
    expect(JSON.parse(who.out)).toMatchObject({ ok: true, username: "matt@rheos.app", masked: "toke…3456" });
    expect((await run(["logout"])).out).toContain("Signed out of https://api.test");
    expect((await run(["whoami"])).err).toContain("not signed in");
  });

  test("whoami refreshes a rejected token once and stores the rotated one", async () => {
    fakeBlaster();
    expect((await run(["login", "--token", "tokenGood123456", "--apiUrl", "https://api.test"])).code).toBe(0);
    const home = loadSessionHome(dir);
    home.sessions["https://api.test"].accessToken = "tokenRevoked0000";
    home.sessions["https://api.test"].refreshToken = "refresh1";
    const { saveSessionRecord } = await import("../../auth/session/index.ts");
    saveSessionRecord(home.sessions["https://api.test"], {}, dir);
    expect((await run(["whoami"])).code).toBe(0);
    expect(loadSessionHome(dir).sessions["https://api.test"].accessToken).toBe("tokenRotated12345");
  });

  test("rejects bad tokens, bad URLs, and a web URL that isn't blaster", async () => {
    fakeBlaster();
    expect((await run(["login", "--token", "wrong", "--apiUrl", "https://api.test"])).err).toContain("rejected");
    expect((await run(["login", "--webUrl", "ftp://x"])).code).toBe(1);
    authDeps.fetch = (async () => new Response("<html>someone else</html>")) as unknown as typeof fetch;
    expect((await run(["login", "--webUrl", "http://localhost:3000", "--apiUrl", "https://api.test"])).err).toContain("not serving blaster");
  });
});
