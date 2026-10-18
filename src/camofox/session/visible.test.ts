/**
 * AGENTS.md rule 11: Camoufox is never headless, humanize is on, and the
 * cursor is shown. Both Python processes launch through visibleBrowser.py;
 * these tests fail if anything starts a browser another way.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const python = join(import.meta.dir, "..", "..", "..", "python");
const read = (name: string) => readFileSync(join(python, name), "utf8");

describe("Camoufox always launches visible", () => {
  test("visibleBrowser.py forces headed, humanize and the cursor", () => {
    const text = read("visibleBrowser.py");
    expect(text).toContain('VISIBLE_LAUNCH: dict[str, Any] = {"headless": False, "humanize": HUMANIZE_MAX_SECONDS}');
    expect(text).toContain('config["showcursor"] = True');
    expect(text).toContain("return {**kwargs, **VISIBLE_LAUNCH, \"config\": config}");
  });

  test("publishSession.py launches only through launch_kwargs (proxy gate, then visible)", () => {
    expect(read("visibleBrowser.py")).toContain("return visible_kwargs(proxyGate.apply(kwargs))");
    const text = read("publishSession.py");
    expect(text).toContain("Camoufox(**launch_kwargs(");
    expect(text.match(/Camoufox\(/g)?.length).toBe(1);
  });

  test("logWorker.py forces it before facebook-camofox-client launches anything", () => {
    const text = read("logWorker.py");
    expect(text.indexOf("force_visible()")).toBeGreaterThan(-1);
    expect(text.indexOf("force_visible()")).toBeLessThan(text.indexOf("asyncio.run("));
  });

  test("nothing can ask for headless", () => {
    for (const name of readdirSync(python).filter((f) => f.endsWith(".py"))) {
      const text = read(name);
      expect(/headless\s*=\s*True|get\("headless"/.test(text), name).toBe(false);
    }
  });
});

describe("no browser without the account's proxy (rule 12)", () => {
  test("there is no exception: not for signing in, not for a dry run", () => {
    expect(read("logWorker.py")).toContain('proxyGate.arm(request.get("proxy_path"))');
    expect(read("publishSession.py")).toContain('proxyGate.arm(config.get("proxyPath"))');
    for (const name of ["logWorker.py", "publishSession.py", "proxyGate.py"]) expect(read(name)).not.toMatch(/allow_no_proxy|allowNoProxy/);
  });

  test("the gate checks the exit country and pins geoip to the exit IP", () => {
    const gate = read("proxyGate.py");
    expect(gate).toContain('raise GateError("noProxy"');
    expect(gate).toContain('raise GateError("proxyCountryMismatch"');
    expect(gate).toContain('return {**kwargs, "proxy": playwright_proxy(proxy), "geoip": checked_exit["exitIp"]}');
  });

  test("every context gets the exit IP's timezone, never this machine's", () => {
    const gate = read("proxyGate.py");
    expect(gate).toContain("force_timezone()");
    expect(gate).toContain('kwargs["timezoneId"] = _armed["timezone"]');
    expect(gate).toContain('raise GateError("proxyCountryMismatch", f"exit IP {ip} has no known timezone")');
  });
});
