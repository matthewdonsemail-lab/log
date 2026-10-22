import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const python = join(import.meta.dir, "..", "..", "..", "python");
const pyFiles = (readdirSync(python, { recursive: true }) as string[]).filter((f) => f.endsWith(".py"));
const read = (name: string) => readFileSync(join(python, pyFiles.find((f) => f.split(/[\\/]/).pop() === name) ?? name), "utf8");

describe("Camoufox always launches visible", () => {
  test("visibleBrowser.py forces headed, humanize and the cursor, through the gate", () => {
    const text = read("visibleBrowser.py");
    expect(text).toContain('VISIBLE_LAUNCH: dict[str, Any] = {"headless": False, "humanize": HUMANIZE_MAX_SECONDS, "showcursor": True}');
    expect(text).toContain("return proxyGate.apply(kwargs, visible)");
    expect(text).toContain("HUMANIZE_HOP_SECONDS = 0.02");
    expect(text).not.toContain('"humanize": False');
    expect(text).not.toContain("def visible_kwargs");
  });

  test("the gate builds headless=False, humanize and showcursor into every launch", () => {
    const device = read("deviceProfile.py");
    expect(device).toContain('config["humanize"] = True');
    expect(device).toContain('config["humanize:maxTime"] = visible["humanize"]');
    expect(device).toContain('config["showcursor"] = bool(visible["showcursor"])');
    expect(read("proxyGate.py")).toContain('and "headless" in kwargs and kwargs["headless"] is False');
  });

  test("publishSession.py launches only through launch_kwargs", () => {
    const text = read("publishSession.py");
    expect(text).toContain("Camoufox(**launch_kwargs(");
    expect(text.match(/Camoufox\(/g)?.length).toBe(1);
  });

  test("logWorker.py forces it before facebook-camofox-client launches anything, package names too", () => {
    const text = read("logWorker.py");
    expect(text.indexOf("force_visible()")).toBeGreaterThan(-1);
    expect(text.indexOf("force_visible()")).toBeLessThan(text.indexOf("asyncio.run("));
    expect(read("visibleBrowser.py")).toContain('(camoufox, "AsyncCamoufox"), (camoufox, "Camoufox")');
  });

  test("nothing can ask for headless", () => {
    for (const name of pyFiles) {
      const text = readFileSync(join(python, name), "utf8");
      expect(/headless\s*=\s*True|get\("headless"/.test(text), name).toBe(false);
    }
  });
});

describe("no browser without the account's proxy (rule 12)", () => {
  test("there is no exception: not for signing in, not for a dry run", () => {
    expect(read("logWorker.py")).toContain('proxyGate.arm(request.get("proxy_path"), request.get("device_path"), request.get("capture_dir"))');
    expect(read("publishSession.py")).toContain('proxyGate.arm(config.get("proxyPath"), config.get("devicePath"), str(Path(receipt) / "camoufox") if receipt else None)');
    for (const name of ["logWorker.py", "publishSession.py", "proxyGate.py"]) expect(read(name)).not.toMatch(/allow_no_proxy|allowNoProxy/);
  });

  test("the gate checks the exit country and launches only what it built", () => {
    const gate = read("proxyGate.py");
    expect(gate).toContain('raise GateError("noProxy"');
    expect(gate).toContain('raise GateError("captureMissing"');
    expect(gate).toContain("_force_capture(kwargs)");
    expect(gate).toContain('raise GateError("proxyCountryMismatch"');
    expect(gate).toContain('return {"from_options": options}');
    expect(gate).toContain('ALLOWED_CALLER_KEYS = frozenset({"headless", "humanize", "geoip", "proxy"})');
  });

  test("Playwright's launch, persistent launch and new_context are all guarded", () => {
    const gate = read("proxyGate.py");
    expect(gate).toContain("BrowserType.launch = launch");
    expect(gate).toContain("BrowserType.launch_persistent_context = launch_persistent_context");
    expect(gate).toContain("Browser.new_context = new_context");
    expect(gate).toMatch(/async def launch_persistent_context[\s\S]*?_force_context\(kwargs\)[\s\S]*?await _checked\(context, None\)/);
  });

  test("every context gets the exit IP's timezone, never this machine's, then the self-check", () => {
    const gate = read("proxyGate.py");
    expect(gate).toContain('kwargs["timezoneId"] = _armed["timezone"]');
    expect(gate).toContain('raise GateError("proxyCountryMismatch", f"exit IP {ip} has no known timezone")');
    expect(gate).toMatch(/async def new_context[\s\S]*?_force_context\(kwargs\)[\s\S]*?await _checked\(context, self\)/);
  });

  test("no ungated launcher is left in the repo's scratch either", () => {
    let names: string[] = [];
    try {
      names = readdirSync(join(python, "..", ".scratch"));
    } catch {
      names = [];
    }
    expect(names).not.toContain("dbgCondition.py");
  });
});
