/**
 * Rules 15-17: one device per account, the pinned locale, the launch
 * self-check. The TypeScript half is tested directly; the Python half
 * (python/deviceProfile.py, python/proxyGate.py) through its pure functions,
 * run in `LOG_PYTHON` with no browser and no network.
 */
import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { deviceSummary, hasStoredDevice, toDeviceProfile } from "./index.ts";

const pythonDir = join(import.meta.dir, "..", "..", "..", "python");

/** Runs `code` with python/ on sys.path; it must print one JSON value. */
function py(code: string): unknown {
  const script = `import sys, json\nsys.path.insert(0, ${JSON.stringify(pythonDir)})\n${code}`;
  const run = spawnSync(process.env.LOG_PYTHON || "python", ["-I", "-c", script], { encoding: "utf8" });
  if (run.status !== 0) throw new Error(run.stderr);
  return JSON.parse(run.stdout.trim().split("\n").at(-1)!);
}

const PROFILE = {
  version: 1,
  createdAt: "2026-10-18T10:00:00+00:00",
  os: "windows",
  camoufoxVersion: "0.5.5",
  browserVersion: "152.0.4-beta.30",
  config: { "navigator.userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0", "screen.width": 1600, "screen.height": 900, "canvas:seed": 7 },
  firefoxUserPrefs: { "webgl.force-enabled": true },
  geolocation: { latitude: 53.28, longitude: -9.06, accuracy: 420, source: "geoLite2City" },
  home: { city: "Galway", country: "IE", timezone: "Europe/Dublin" },
};

describe("the stored device (TypeScript)", () => {
  test("reads a stored profile, object or JSON string, and rejects anything else", () => {
    expect(toDeviceProfile(PROFILE)).toEqual(PROFILE as never);
    expect(toDeviceProfile(JSON.stringify(PROFILE))).toEqual(PROFILE as never);
    for (const bad of [null, "", "{", {}, { ...PROFILE, os: "macos" }, { ...PROFILE, version: 2 }, { ...PROFILE, geolocation: { latitude: 1 } }]) {
      expect(toDeviceProfile(bad)).toBeNull();
    }
  });

  test("something stored but unreadable counts as stored (never silently replaced)", () => {
    expect(hasStoredDevice(null)).toBe(false);
    expect(hasStoredDevice({})).toBe(false);
    expect(hasStoredDevice({ junk: true })).toBe(true);
  });

  test("the summary names the device without its seeds or config", () => {
    const line = deviceSummary(toDeviceProfile(PROFILE));
    expect(line).toContain("1600x900");
    expect(line).not.toContain("seed");
    expect(deviceSummary(null)).toContain("first launch");
  });
});

describe("python/deviceProfile.py (pure parts)", () => {
  test("per-launch keys are never stored; the rest of the config is", () => {
    const out = py(`import deviceProfile as d
print(json.dumps(d.strip_per_launch({"timezone": "x", "webrtc:ipv4": "1.2.3.4", "geolocation:latitude": 1, "locale:language": "en",
  "humanize": True, "humanize:maxTime": 1.5, "showcursor": True, "addons": ["p"], "canvas:seed": 5, "navigator.userAgent": "ua", "fonts": ["Arial"]})))`);
    expect(out).toEqual({ "canvas:seed": 5, "navigator.userAgent": "ua", fonts: ["Arial"] });
  });

  test("the pinned locale has no script key (with it Intl falls back to plain 'en')", () => {
    expect(py(`import deviceProfile as d\nprint(json.dumps(d.locale_config("en-IE", ["en-IE", "en"])))`)).toEqual({
      "locale:language": "en",
      "locale:region": "IE",
      "locale:all": "en-IE, en",
    });
  });

  test("a launch replays the stored device and sets this launch's values", () => {
    const out = py(`import deviceProfile as d
profile = ${JSON.stringify(JSON.stringify(PROFILE))}
p = json.loads(profile)
run = {"locale": "en-IE", "languages": ["en-IE", "en"]}
c = d.launch_config(p, run, "109.78.211.66", "Europe/Dublin", {"headless": False, "humanize": 1.5, "showcursor": True}, "156")
print(json.dumps(c))`) as Record<string, unknown>;
    expect(out["canvas:seed"]).toBe(7);
    expect(out["screen.width"]).toBe(1600);
    expect(out["navigator.userAgent"]).toBe("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0");
    expect(out).toMatchObject({
      timezone: "Europe/Dublin",
      "webrtc:ipv4": "109.78.211.66",
      "locale:language": "en",
      "locale:region": "IE",
      "geolocation:latitude": 53.28,
      "geolocation:accuracy": 420,
      humanize: true,
      "humanize:maxTime": 1.5,
      showcursor: true,
    });
  });

  test("prefs: the UI locale is this launch's pinned locale, HTTP/3 and DoH are off, nothing per-launch is replayed", () => {
    const out = py(`import deviceProfile as d
p = {"firefoxUserPrefs": {"webgl.force-enabled": True, "intl.locale.requested": "en-US", "network.dns.disableIPv6": False}}
print(json.dumps([d.launch_prefs(p, {"locale": "en-IE"}, "86.41.85.43"), d.launch_prefs(p, {"locale": "en-GB"}, "2001:db8::1")]))`) as Record<string, unknown>[];
    expect(out[0]).toEqual({
      "webgl.force-enabled": true,
      "network.http.http3.enable": false,
      "network.trr.mode": 5,
      "intl.locale.requested": "en-IE",
      "network.dns.disableIPv6": true,
    });
    expect(out[1]["intl.locale.requested"]).toBe("en-GB");
    expect(out[1]["network.dns.disableIPv6"]).toBeUndefined();
  });

  test("the browser gets only system environment variables: no keys, no CAMOU_ overrides, no TZ", () => {
    const out = py(`import deviceProfile as d
print(json.dumps(d.safe_env({"SYSTEMROOT": "C:/Windows", "TEMP": "t", "TWENTY_API_KEY": "k", "2CAPTCHA_API_KEY": "k", "CAMOU_CONFIG_1": "{}", "TZ": "Asia/Bangkok", "LANG": "vi_VN"})))`);
    expect(out).toEqual({ SYSTEMROOT: "C:/Windows", TEMP: "t" });
  });

  test("geolocation is near the city, never its centroid, with a believable accuracy", () => {
    const out = py(`import deviceProfile as d, random, math
r = random.Random(1)
pts = [d.pinned_geolocation(53.2702, -9.0503, r) for _ in range(200)]
print(json.dumps({"minAcc": min(p["accuracy"] for p in pts), "maxAcc": max(p["accuracy"] for p in pts),
  "minKm": min(math.hypot((p["latitude"]-53.2702)*111.32, (p["longitude"]+9.0503)*111.32*math.cos(math.radians(53.27))) for p in pts),
  "maxKm": max(math.hypot((p["latitude"]-53.2702)*111.32, (p["longitude"]+9.0503)*111.32*math.cos(math.radians(53.27))) for p in pts)}))`) as Record<string, number>;
    expect(out.minAcc).toBeGreaterThanOrEqual(20);
    expect(out.maxAcc).toBeLessThanOrEqual(1500);
    expect(out.minKm).toBeGreaterThan(0.1);
    expect(out.maxKm).toBeLessThan(2);
  });

  test("a profile that stores per-launch keys, or isn't windows, is refused", () => {
    const out = py(`import deviceProfile as d
p = json.loads(${JSON.stringify(JSON.stringify(PROFILE))})
res = []
for bad in ({**p, "os": "macos"}, {**p, "config": {**p["config"], "timezone": "Asia/Bangkok"}}, {**p, "geolocation": {}}):
    try:
        d.check_profile(bad); res.append("accepted")
    except d.ProfileError:
        res.append("refused")
d.check_profile(p)
print(json.dumps(res))`);
    expect(out).toEqual(["refused", "refused", "refused"]);
  });
});

describe("python/proxyGate.py (pure parts)", () => {
  const WANT = { timezone: "Europe/Dublin", locale: "en-IE", languages: ["en-IE", "en"], exitIp: "109.78.211.66" };
  const realm = { timeZone: "Europe/Dublin", intlLocale: "en-IE", numberLocale: "en-IE", language: "en-IE", languages: ["en-IE", "en"], offset: -60 };
  const verdict = (observed: unknown) => py(`import proxyGate as g\nprint(json.dumps(g.compare(json.loads(${JSON.stringify(JSON.stringify(observed))}), json.loads(${JSON.stringify(JSON.stringify(WANT))}))))`);

  test("the self-check passes only when page and worker match what was pinned", () => {
    expect(verdict({ ip: WANT.exitIp, page: realm, worker: realm })).toBeNull();
  });

  test("each mismatch refuses with its own code", () => {
    const cases: [unknown, string][] = [
      [{ ip: WANT.exitIp, page: { ...realm, timeZone: "Asia/Bangkok", offset: -420 }, worker: realm }, "browserTimezoneMismatch"],
      [{ ip: WANT.exitIp, page: realm, worker: { ...realm, timeZone: "Asia/Ho_Chi_Minh" } }, "browserTimezoneMismatch"],
      [{ ip: WANT.exitIp, page: { ...realm, intlLocale: "en" }, worker: realm }, "browserLocaleMismatch"],
      [{ ip: WANT.exitIp, page: realm, worker: { ...realm, language: "en-US" } }, "browserLocaleMismatch"],
      [{ ip: WANT.exitIp, page: { ...realm, languages: ["ga-IE", "ga"] }, worker: realm }, "browserLocaleMismatch"],
      [{ ip: "116.105.162.81", page: realm, worker: realm }, "browserExitIpMismatch"],
      [{ ip: null, page: realm, worker: realm }, "selfCheckFailed"],
      [{ ip: WANT.exitIp, page: realm, worker: { error: "the worker did not answer in 5s" } }, "selfCheckFailed"],
    ];
    for (const [observed, code] of cases) expect((verdict(observed) as string[])[0]).toBe(code);
  });

  test("callers can't add launch options, and can't ask for headless", () => {
    const out = py(`import proxyGate as g
res = []
for kw in ({"locale": "vi-VN"}, {"config": {"timezone": "Asia/Bangkok"}}, {"env": {}}, {"block_webrtc": True}, {"persistent_context": True}, {"headless": True}):
    try:
        g.apply(kw, {"headless": False, "humanize": 1.5, "showcursor": True}); res.append("allowed")
    except g.GateError as e:
        res.append(e.code)
print(json.dumps(res))`);
    expect(out).toEqual(Array(6).fill("unguardedLaunch"));
  });

  test("2Captcha gets the account's own proxy in its format, or nothing", () => {
    const out = py(`import proxyGate as g
res = [g.twocaptcha_proxy()]
g._armed["proxy"] = {"server": "http://eu.proxy.2captcha.com:2334", "username": "U7e9-zone-custom", "password": "u7e9", "country": "IE"}
res.append(g.twocaptcha_proxy())
g._armed["proxy"] = {"server": "socks5://gw:1080", "country": "IE"}
res.append(g.twocaptcha_proxy())
print(json.dumps(res))`);
    expect(out).toEqual([null, { type: "HTTP", uri: "U7e9-zone-custom:u7e9@eu.proxy.2captcha.com:2334" }, { type: "SOCKS5", uri: "gw:1080" }]);
  });

  test("the proxy password and username prefix never leave in a failure", () => {
    const out = py(`import errorCodes as e
e.register_secret("u7e9secret")
print(json.dumps([e.failure("crashed", "launch failed for http://u7e9secret-zone-custom:u7e9secret@eu.proxy.2captcha.com:2334")["detail"]]))`) as string[];
    expect(out[0]).not.toContain("u7e9secret");
    expect(out[0]).toContain("***-zone-custom:***@eu.proxy.2captcha.com:2334");
  });

  test("an IP echo's text is read as an IP and nothing else", () => {
    expect(py(`import proxyGate as g\nprint(json.dumps([g._ip_from_text("109.78.211.66\\n"), g._ip_from_text("<html>"), g._ip_from_text("")]))`)).toEqual([
      "109.78.211.66",
      null,
      null,
    ]);
  });
});
