import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { countryOfLocation } from "../../camofox/proxy/index.ts";
import type { WorkerClient, WorkerRequest } from "../../camofox/worker/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

async function run(argv: string[], reply: (request: WorkerRequest) => unknown, twenty = marketplaceFixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const requests: WorkerRequest[] = [];
  const proxyFiles: unknown[] = [];
  const worker = (async (request: WorkerRequest) => {
    requests.push(request);
    if (request.proxy_path) proxyFiles.push(JSON.parse(readFileSync(request.proxy_path, "utf8")));
    return reply(request);
  }) as WorkerClient;
  const code = await runCli(argv, { worker, twenty, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n"), requests, proxyFiles, twenty };
}

describe("countryOfLocation", () => {
  test("reads the last part, and refuses to guess", () => {
    expect(countryOfLocation("Galway, Ireland")).toBe("IE");
    expect(countryOfLocation("Salthill, Galway, Ireland")).toBe("IE");
    expect(countryOfLocation("Manchester, UK")).toBe("GB");
    expect(countryOfLocation("Austin, TX, United States")).toBe("US");
    expect(countryOfLocation("Galway")).toBeNull();
    expect(countryOfLocation("Galway, Atlantis")).toBeNull();
  });
});

describe("log proxy check", () => {
  test("checks the Twenty proxy without a browser, and records the exit in Twenty", async () => {
    const { code, out, requests, proxyFiles, twenty } = await run(["proxy", "check", "--account", "galwayOne"], () => ({
      ok: true,
      exitIp: "203.0.113.7",
      exitCountry: "IE",
      country: "IE",
    }));
    expect(code).toBe(0);
    expect(out).toContain("in Ireland, matching the account");
    expect(out).not.toContain("secretPass");
    expect(requests[0]).toMatchObject({ action: "proxy.check" });
    expect(proxyFiles[0]).toMatchObject({ server: "http://203.0.113.7:8080", country: "IE" });
    const account = twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!;
    expect(account).toMatchObject({ proxyExitIp: "203.0.113.7", proxyExitCountry: "IE" });
    expect(account.proxyCheckedAt).toBeTruthy();
  });

  test("a mismatch is refused and still recorded", async () => {
    const { code, err, twenty } = await run(["proxy", "check", "--account", "galwayOne"], () => ({
      ok: false,
      code: "proxyCountryMismatch",
      detail: "exit IP 116.105.162.81 is in VN, the account is IE",
    }));
    expect(code).toBe(1);
    expect(err).toContain("proxyCountryMismatch");
    expect(twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")).toMatchObject({ proxyExitIp: "116.105.162.81", proxyExitCountry: "VN" });
  });

  test("works for any status (it opens no browser), never without a proxy", async () => {
    expect((await run(["proxy", "check", "--account", "banned"], () => ({ ok: true, exitIp: "1", exitCountry: "IE", country: "IE" }))).code).toBe(0);
    const none = await run(["proxy", "check", "--account", "noProxy"], () => ({ ok: true }));
    expect(none.err).toContain("noProxy");
    expect(none.requests).toHaveLength(0);
  });

  test("needs check and an account", async () => {
    expect((await run(["proxy"], () => ({}))).code).toBe(1);
    expect((await run(["proxy", "wat", "--account", "galwayOne"], () => ({}))).code).toBe(1);
    expect((await run(["proxy", "check"], () => ({}))).code).toBe(1);
  });
});

describe("log proxy assign (2Captcha, fetch stubbed)", () => {
  const realFetch = globalThis.fetch;
  const env = { key: process.env["2CAPTCHA_API_KEY"], password: process.env["2CAPTCHA_PROXY_PASSWORD"] };
  function stub2Captcha() {
    process.env["2CAPTCHA_API_KEY"] = "testKey";
    process.env["2CAPTCHA_PROXY_PASSWORD"] = "testPass";
    globalThis.fetch = (async (url: string | URL | Request) => {
      const u = String(url);
      if (u.startsWith("https://api.2captcha.com/proxy?")) return new Response(JSON.stringify({ status: "OK", data: { username: "u7etest", status: 1 } }));
      if (u.includes("/regions/search/galway")) return new Response(JSON.stringify([{ city: "galway", region: "connacht", countryCode: "ie" }]));
      if (u.includes("/regions/search/")) return new Response(JSON.stringify([]));
      throw new Error(`unexpected fetch ${u}`);
    }) as typeof fetch;
  }
  function restore() {
    globalThis.fetch = realFetch;
    for (const [name, value] of [["2CAPTCHA_API_KEY", env.key], ["2CAPTCHA_PROXY_PASSWORD", env.password]] as const) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }

  test("builds a Galway proxy, checks it exits in Ireland, then saves it to Twenty", async () => {
    stub2Captcha();
    try {
      const { code, out, proxyFiles, twenty } = await run(["proxy", "assign", "--account", "noProxy"], () => ({ ok: true, exitIp: "203.0.113.9", exitCountry: "IE", country: "IE" }));
      expect(code).toBe(0);
      expect(out).toContain("in Ireland (galway, connacht, Ireland). Saved to Twenty.");
      expect(out).not.toContain("testPass");
      // The username's account part is the 2Captcha password: never printed either.
      expect(out).not.toContain("u7etest");
      expect(out).toContain("***-zone-custom-region-ie");
      expect(proxyFiles[0]).toMatchObject({ server: "http://eu.proxy.2captcha.com:2334", password: "testPass", country: "IE" });
      const saved = String(twenty.rows.socialAccounts.find((r) => r.id === "noProxy")!.proxy);
      expect(saved).toContain("u7etest-zone-custom-region-ie-st-connacht-city-galway-session-");
      expect(saved).toContain("sessTime-120");
    } finally {
      restore();
    }
  });

  test("a proxy that exits in the wrong country is never saved", async () => {
    stub2Captcha();
    try {
      const { code, out, twenty } = await run(["proxy", "assign", "--account", "noProxy"], () => ({ ok: false, code: "proxyCountryMismatch", detail: "exit IP 1.2.3.4 is in GB, the account is IE" }));
      expect(code).toBe(1);
      expect(out).toContain("not saved");
      expect(twenty.rows.socialAccounts.find((r) => r.id === "noProxy")!.proxy).toBeNull();
    } finally {
      restore();
    }
  });

  test("a city 2Captcha doesn't have is refused, unless --anyCity", async () => {
    stub2Captcha();
    try {
      const twenty = marketplaceFixture();
      await twenty.update("socialAccounts", "noProxy", { homeCity: "Nowhereville" });
      const refused = await run(["proxy", "assign", "--account", "noProxy"], () => ({ ok: true, exitIp: "1", exitCountry: "IE", country: "IE" }), twenty);
      expect(refused.out).toContain("twoCaptchaNoPlace");
      const anywhere = await run(["proxy", "assign", "--account", "noProxy", "--anyCity"], () => ({ ok: true, exitIp: "1", exitCountry: "IE", country: "IE" }), twenty);
      expect(anywhere.code).toBe(0);
      expect(String(twenty.rows.socialAccounts.find((r) => r.id === "noProxy")!.proxy)).toContain("-region-ie-session-");
    } finally {
      restore();
    }
  });

  test("--missing gives a proxy to every FACEBOOK account without one", async () => {
    stub2Captcha();
    try {
      const { out } = await run(["proxy", "assign", "--missing"], () => ({ ok: true, exitIp: "1", exitCountry: "IE", country: "IE" }));
      expect(out).toContain("noProxy:");
      expect(out.split("\n")).toHaveLength(1);
    } finally {
      restore();
    }
  });

  test("without the proxy password it stops and says where to put it", async () => {
    const saved = process.env["2CAPTCHA_PROXY_PASSWORD"];
    process.env["2CAPTCHA_PROXY_PASSWORD"] = "";
    try {
      const { code, err } = await run(["proxy", "assign", "--account", "noProxy"], () => ({}));
      expect(code).toBe(1);
      expect(err).toContain("twoCaptchaNotConfigured");
      expect(err).toContain("2CAPTCHA_PROXY_PASSWORD");
    } finally {
      if (saved === undefined) delete process.env["2CAPTCHA_PROXY_PASSWORD"];
      else process.env["2CAPTCHA_PROXY_PASSWORD"] = saved;
    }
  });
});
