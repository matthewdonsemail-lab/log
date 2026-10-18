import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { countryOfLocation, maskProxy, validateProxy } from "../../camofox/proxy/index.ts";
import type { WorkerClient, WorkerRequest } from "../../camofox/worker/index.ts";
import { runCli } from "../runner/index.ts";

const root = mkdtempSync(join(tmpdir(), "logCliProxy"));
const saved = process.env.LOG_PROXY_DIR;
beforeAll(() => {
  process.env.LOG_PROXY_DIR = join(root, "proxies");
});
afterAll(() => {
  if (saved === undefined) delete process.env.LOG_PROXY_DIR;
  else process.env.LOG_PROXY_DIR = saved;
});

async function run(argv: string[], reply: (request: WorkerRequest) => unknown = () => ({ ok: false, code: "crashed" })) {
  const out: string[] = [];
  const err: string[] = [];
  const requests: WorkerRequest[] = [];
  const worker = (async (request: WorkerRequest) => {
    requests.push(request);
    return reply(request);
  }) as WorkerClient;
  const code = await runCli(argv, { worker, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n"), requests };
}

describe("proxy helpers", () => {
  test("countryOfLocation reads the last part, and refuses to guess", () => {
    expect(countryOfLocation("Galway, Ireland")).toBe("IE");
    expect(countryOfLocation("Salthill, Galway, Ireland")).toBe("IE");
    expect(countryOfLocation("Manchester, UK")).toBe("GB");
    expect(countryOfLocation("Austin, TX, United States")).toBe("US");
    expect(countryOfLocation("Galway")).toBeNull();
    expect(countryOfLocation("Galway, Atlantis")).toBeNull();
  });

  test("validateProxy wants scheme://host:port and an ISO country", () => {
    expect(validateProxy({ server: "http://1.2.3.4:8080", country: "IE" })).toEqual([]);
    expect(validateProxy({ server: "socks5://p.example.com:1080", username: "u", password: "p", country: "GB" })).toEqual([]);
    expect(validateProxy({ server: "1.2.3.4:8080", country: "IE" })).toHaveLength(1);
    expect(validateProxy({ server: "http://u:p@1.2.3.4:8080", country: "IE" })).toHaveLength(1);
    expect(validateProxy({ server: "http://1.2.3.4:8080", country: "ireland" })).toHaveLength(1);
    expect(validateProxy(null)).toHaveLength(1);
  });

  test("maskProxy never shows the password", () => {
    expect(maskProxy({ server: "http://h:1", username: "u", password: "secret", country: "IE" }).password).not.toContain("secret");
  });
});

describe("log proxy", () => {
  test("set validates, saves; show masks the password", async () => {
    const bad = join(root, "bad.json");
    writeFileSync(bad, JSON.stringify({ server: "nope", country: "IE" }));
    expect((await run(["proxy", "set", "--account", "fbPacer", "--file", bad])).err).toContain("proxyMalformed");

    const good = join(root, "good.json");
    writeFileSync(good, JSON.stringify({ server: "http://203.0.113.7:8080", username: "u", password: "hunter2", country: "IE" }));
    const set = await run(["proxy", "set", "--account", "fbPacer", "--file", good]);
    expect(set.code).toBe(0);
    expect(set.out).toContain("Ireland");
    const saved = join(root, "proxies", "fbPacer.json");
    expect(existsSync(saved)).toBe(true);
    expect(JSON.parse(readFileSync(saved, "utf8")).password).toBe("hunter2");

    const show = await run(["proxy", "show", "--account", "fbPacer"]);
    expect(show.out).toContain("203.0.113.7");
    expect(show.out).not.toContain("hunter2");
  });

  test("check asks the worker with the file path, and explains a refusal", async () => {
    const ok = await run(["proxy", "check", "--account", "fbPacer"], () => ({ ok: true, exitIp: "203.0.113.7", exitCountry: "IE", country: "IE" }));
    expect(ok.code).toBe(0);
    expect(ok.out).toContain("is in Ireland");
    expect(ok.requests[0]).toMatchObject({ action: "proxy.check", proxy_path: join(root, "proxies", "fbPacer.json") });

    const abroad = await run(["proxy", "check", "--account", "fbPacer"], () => ({ ok: false, code: "proxyCountryMismatch", detail: "exit IP is in VN" }));
    expect(abroad.code).toBe(1);
    expect(abroad.err).toContain("proxyCountryMismatch");

    const none = await run(["proxy", "check", "--account", "fbGalwayRubbish"]);
    expect(none.err).toContain("noProxy");
    expect(none.requests).toHaveLength(0);
  });

  test("needs an action and a known account", async () => {
    expect((await run(["proxy"])).code).toBe(1);
    expect((await run(["proxy", "show", "--account", "nobody"])).code).toBe(1);
  });
});
