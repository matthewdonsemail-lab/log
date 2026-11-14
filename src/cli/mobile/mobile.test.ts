import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAndroidDriver } from "../../mobile/android/index.ts";
import type { AdbClient, AdbDevice } from "../../mobile/android/index.ts";
import { createAppleDriver } from "../../mobile/apple/index.ts";
import type { MobileDeviceRecord, MobileRegistry } from "../../mobile/device/index.ts";
import { createMemoryTwenty } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

const SERIAL = "127.0.0.1:21503";
const FOREGROUND = "com.snapchat.android/com.snap.identity.loginsignup.ui.LoginSignupActivity";

class FakeAdb implements AdbClient {
  connected: AdbDevice[] = [{ serial: SERIAL, state: "device", model: "ASUS_Z01QD", product: "ASUS_Z01QD", transportId: "3" }];
  calls: { serial: string; command: string[] }[] = [];
  tcpdump = true;
  connects: string[] = [];

  async devices(): Promise<AdbDevice[]> {
    return this.connected;
  }

  async connect(serial: string): Promise<boolean> {
    this.connects.push(serial);
    if (!/^(\S+):(\d+)$/.test(serial)) return false;
    this.connected = [...this.connected, { serial, state: "device", model: "SM_A528B", product: "a52sxq", transportId: "9" }];
    return true;
  }

  async shell(serial: string, command: string[]): Promise<string> {
    this.calls.push({ serial, command });
    const joined = command.join(" ");
    if (joined === "getprop ro.product.model") return "ASUS_Z01QD";
    if (joined === "getprop ro.build.version.release") return "9";
    if (joined === "dumpsys activity activities") return `    mResumedActivity: ActivityRecord{c62b7a8 u0 ${FOREGROUND} t42}`;
    if (joined === "dumpsys battery") return "  level: 87";
    if (joined === "which tcpdump") return this.tcpdump ? "/system/xbin/tcpdump" : "";
    if (joined === "which timeout") return "/system/bin/timeout";
    if (joined.startsWith("tcpdump")) return "12:00:00.000000 IP 10.0.2.16.4432 > 104.18.7.1.443: Flags [S]";
    if (joined.startsWith("uiautomator dump")) return "UI hierchary dumped to: /sdcard/window.xml";
    return "";
  }

  async execOut(serial: string, command: string[]): Promise<Uint8Array> {
    this.calls.push({ serial, command });
    const joined = command.join(" ");
    if (joined.startsWith("screencap")) return new Uint8Array([137, 80, 78, 71]);
    if (joined.startsWith("cat")) return new TextEncoder().encode("<hierarchy><node text=\"Snapchat\"/></hierarchy>");
    return new Uint8Array();
  }
}

function twenty() {
  return createMemoryTwenty({
    socialAccounts: [
      { id: "snapOne", accountName: "snapOne", name: "snapOne", platform: "SNAPCHAT", accountStatus: "ACTIVE" },
      { id: "snapTwo", accountName: "snapTwo", name: "snapTwo", platform: "SNAPCHAT", accountStatus: "ACTIVE" },
      { id: "snapGone", accountName: "snapGone", name: "snapGone", platform: "SNAPCHAT", accountStatus: "DEACTIVATED" },
    ],
  });
}

async function run(argv: string[], options: { adb?: FakeAdb; records?: MobileDeviceRecord[]; runs?: string } = {}) {
  const adb = options.adb ?? new FakeAdb();
  const records = [...(options.records ?? [])];
  const registry: MobileRegistry = {
    path: join(runsDir(options.runs), "mobileDevices.json"),
    read: () => [...records],
    write: (next) => {
      records.splice(0, records.length, ...next);
    },
  };
  const out: string[] = [];
  const err: string[] = [];
  const before = process.env.LOG_MOBILE_RUNS;
  if (options.runs) process.env.LOG_MOBILE_RUNS = options.runs;
  try {
    const code = await runCli(argv, {
      twenty: twenty(),
      mobile: { registry, drivers: [createAndroidDriver(adb), createAppleDriver()] },
      out: (line) => out.push(line),
      err: (line) => err.push(line),
      now: () => new Date("2026-11-14T10:00:00.000Z"),
      sleep: async () => {},
    });
    return { code, out: out.join("\n"), err: err.join("\n"), records, adb };
  } finally {
    if (before === undefined) delete process.env.LOG_MOBILE_RUNS;
    else process.env.LOG_MOBILE_RUNS = before;
  }
}

function runsDir(runs?: string): string {
  return runs ?? mkdtempSync(join(tmpdir(), "logMobile"));
}

describe("the route", () => {
  test("the operating system comes first, then the platform, then the command", async () => {
    const done = await run(["mobile", "android", "snapchat", "devices"]);
    expect(done.code).toBe(0);
    expect(done.out).toContain("1 phone(s) connected");
    expect(done.out).toContain(SERIAL);
  });

  test("an unknown operating system is refused", async () => {
    const done = await run(["mobile", "windows", "snapchat", "devices"]);
    expect(done.code).toBe(1);
    expect(done.err).toContain("windows is not an operating system log knows");
  });

  test("a platform that is not wired is refused", async () => {
    const done = await run(["mobile", "android", "instagram", "devices"]);
    expect(done.code).toBe(1);
    expect(done.err).toContain("instagram is not wired yet");
  });

  test("a missing or unknown command is refused", async () => {
    const missing = await run(["mobile", "android", "snapchat"]);
    expect(missing.code).toBe(1);
    expect(missing.err).toContain("the route is log mobile");
    const unknown = await run(["mobile", "android", "snapchat", "fly"]);
    expect(unknown.code).toBe(1);
    expect(unknown.err).toContain("pick one of devices, attach, state, open, inspect");
  });

  test("the apple route has the same shape and says it is not wired", async () => {
    const done = await run(["mobile", "apple", "snapchat", "devices"]);
    expect(done.code).toBe(1);
    expect(done.err).toContain("appleDeviceNotWired");
  });
});

describe("the phones", () => {
  test("a phone that is offline or unauthorized is said so", async () => {
    const adb = new FakeAdb();
    adb.connected = [{ serial: "emulator-5554", state: "offline", model: null, product: null, transportId: null }];
    const done = await run(["mobile", "android", "snapchat", "devices"], { adb });
    expect(done.code).toBe(0);
    expect(done.out).toContain("offline");
    expect(done.out).toContain("emulator-5554");
  });
});

describe("one phone per account", () => {
  test("a phone is attached to one account and kept", async () => {
    const done = await run(["mobile", "android", "snapchat", "attach", "--account", "snapOne", "--serial", SERIAL, "--network", "us grid one"]);
    expect(done.code).toBe(0);
    expect(done.out).toContain("snapOne now runs on " + SERIAL);
    expect(done.records).toHaveLength(1);
    expect(done.records[0]).toMatchObject({ os: "android", serial: SERIAL, accountName: "snapOne", platform: "snapchat", network: "us grid one" });
  });

  test("the same account cannot take a second phone", async () => {
    const adb = new FakeAdb();
    adb.connected = [...adb.connected, { serial: "emulator-5554", state: "device", model: "Pixel", product: "Pixel", transportId: "4" }];
    const done = await run(["mobile", "android", "snapchat", "attach", "--account", "snapOne", "--serial", "emulator-5554"], {
      adb,
      records: [{ id: `android:${SERIAL}`, os: "android", serial: SERIAL, accountName: "snapOne", platform: "snapchat", network: null, attachedAt: "2026-11-14T10:00:00.000Z" }],
    });
    expect(done.code).toBe(1);
    expect(done.err).toContain("phoneAlreadyAttached");
    expect(done.records).toHaveLength(1);
  });

  test("the same phone cannot take a second account", async () => {
    const done = await run(["mobile", "android", "snapchat", "attach", "--account", "snapTwo", "--serial", SERIAL], {
      records: [{ id: `android:${SERIAL}`, os: "android", serial: SERIAL, accountName: "snapOne", platform: "snapchat", network: null, attachedAt: "2026-11-14T10:00:00.000Z" }],
    });
    expect(done.code).toBe(1);
    expect(done.err).toContain("phoneAlreadyAttached");
    expect(done.records).toHaveLength(1);
  });

  test("a phone that is not connected is refused", async () => {
    const done = await run(["mobile", "android", "snapchat", "attach", "--account", "snapOne", "--serial", "192.168.1.44:5555"]);
    expect(done.code).toBe(1);
    expect(done.err).toContain("phoneNotFound");
  });

  test("an account with no phone is refused, and nothing is chosen for it", async () => {
    const done = await run(["mobile", "android", "snapchat", "state", "--account", "snapOne"]);
    expect(done.code).toBe(1);
    expect(done.err).toContain("noPhoneAttached");
  });

  test("an account with two phones is refused rather than guessed", async () => {
    const done = await run(["mobile", "android", "snapchat", "state", "--account", "snapOne"], {
      records: [
        { id: `android:${SERIAL}`, os: "android", serial: SERIAL, accountName: "snapOne", platform: "snapchat", network: null, attachedAt: "2026-11-14T10:00:00.000Z" },
        { id: "android:emulator-5554", os: "android", serial: "emulator-5554", accountName: "snapOne", platform: "snapchat", network: null, attachedAt: "2026-11-14T10:00:00.000Z" },
      ],
    });
    expect(done.code).toBe(1);
    expect(done.err).toContain("noPhoneSelected");
  });

  test("a deactivated account is refused", async () => {
    const done = await run(["mobile", "android", "snapchat", "attach", "--account", "snapGone", "--serial", SERIAL]);
    expect(done.code).toBe(1);
    expect(done.err).toContain("accountNotUsable");
  });

  test("an account that does not exist is refused", async () => {
    const done = await run(["mobile", "android", "snapchat", "attach", "--account", "nobody", "--serial", SERIAL]);
    expect(done.code).toBe(1);
    expect(done.err).toContain("accountNotFound");
  });
});

describe("the account's own phone", () => {
  const attached: MobileDeviceRecord[] = [
    { id: `android:${SERIAL}`, os: "android", serial: SERIAL, accountName: "snapOne", platform: "snapchat", network: "us grid one", attachedAt: "2026-11-14T10:00:00.000Z" },
  ];

  test("the state says what the phone is doing", async () => {
    const done = await run(["mobile", "android", "snapchat", "state", "--account", "snapOne"], { records: attached });
    expect(done.code).toBe(0);
    expect(done.out).toContain("snapOne runs on " + SERIAL);
    expect(done.out).toContain("online");
    expect(done.out).toContain("ASUS_Z01QD");
    expect(done.out).toContain("battery 87%");
  });

  test("a phone on a tcp serial is connected before its state is read", async () => {
    const adb = new FakeAdb();
    adb.connected = [];
    const records: MobileDeviceRecord[] = [
      { id: "android:127.0.0.1:16384", os: "android", serial: "127.0.0.1:16384", accountName: "snapOne", platform: "snapchat", network: "us grid one", attachedAt: "2026-11-14T10:00:00.000Z" },
    ];
    const done = await run(["mobile", "android", "snapchat", "state", "--account", "snapOne"], { adb, records });
    expect(done.code).toBe(0);
    expect(adb.connects).toContain("127.0.0.1:16384");
    expect(done.out).toContain("127.0.0.1:16384");
  });

  test("every call names the phone's own serial", async () => {
    const done = await run(["mobile", "android", "snapchat", "state", "--account", "snapOne"], { records: attached });
    expect(done.adb.calls.length).toBeGreaterThan(0);
    for (const call of done.adb.calls) expect(call.serial).toBe(SERIAL);
  });

  test("opening the app starts Snapchat on that phone", async () => {
    const done = await run(["mobile", "android", "snapchat", "open", "--account", "snapOne"], { records: attached });
    expect(done.code).toBe(0);
    expect(done.out).toContain("Snapchat is in the front on " + SERIAL);
    const launch = done.adb.calls.find((call) => call.command[0] === "monkey");
    expect(launch?.command).toEqual(["monkey", "-p", "com.snapchat.android", "1"]);
  });

  test("inspecting records the screen, the UI tree and the network calls", async () => {
    const runs = mkdtempSync(join(tmpdir(), "logMobileRun"));
    try {
      const done = await run(["mobile", "android", "snapchat", "inspect", "--account", "snapOne"], { records: attached, runs });
      expect(done.code).toBe(0);
      expect(done.out).toContain("1 step(s) recorded");
      expect(done.out).toContain("read with tcpdump");
    } finally {
      rmSync(runs, { recursive: true, force: true });
    }
  });

  test("a tap is a second step", async () => {
    const runs = mkdtempSync(join(tmpdir(), "logMobileRun"));
    try {
      const done = await run(["mobile", "android", "snapchat", "inspect", "--account", "snapOne", "--tap", "120,240"], { records: attached, runs });
      expect(done.code).toBe(0);
      expect(done.out).toContain("2 step(s) recorded");
      const tap = done.adb.calls.find((call) => call.command[0] === "input");
      expect(tap?.command).toEqual(["input", "tap", "120", "240"]);
    } finally {
      rmSync(runs, { recursive: true, force: true });
    }
  });

  test("a tap that is not one point is refused", async () => {
    const done = await run(["mobile", "android", "snapchat", "inspect", "--account", "snapOne", "--tap", "120"], { records: attached });
    expect(done.code).toBe(1);
    expect(done.err).toContain("--tap is one point as x,y");
  });

  test("without tcpdump the network calls are read from the log", async () => {
    const adb = new FakeAdb();
    adb.tcpdump = false;
    const done = await run(["mobile", "android", "snapchat", "inspect", "--account", "snapOne"], { records: attached, adb, runs: mkdtempSync(join(tmpdir(), "logMobileRun")) });
    expect(done.code).toBe(0);
    expect(done.out).toContain("read with logcat");
  });
});
