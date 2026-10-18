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
    expect((await run(["proxy", "set", "--account", "galwayOne"], () => ({}))).code).toBe(1);
    expect((await run(["proxy", "check"], () => ({}))).code).toBe(1);
  });
});
