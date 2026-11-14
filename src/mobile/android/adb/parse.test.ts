import { describe, expect, test } from "bun:test";
import { parseAdbDevices, parseBatteryLevel, parseForegroundApp } from "./parse.ts";

describe("adb devices", () => {
  test("reads the long listing, one phone a line", () => {
    const devices = parseAdbDevices(
      [
        "List of devices attached",
        "127.0.0.1:21503        device product:ASUS_Z01QD model:ASUS_Z01QD device:ASUS_Z01QD transport_id:3",
        "emulator-5554          offline",
        "192.168.1.44:5555      unauthorized",
        "",
      ].join("\n"),
    );
    expect(devices).toHaveLength(3);
    expect(devices[0]).toEqual({ serial: "127.0.0.1:21503", state: "device", model: "ASUS_Z01QD", product: "ASUS_Z01QD", transportId: "3" });
    expect(devices[1]).toMatchObject({ serial: "emulator-5554", state: "offline", model: null });
    expect(devices[2]).toMatchObject({ serial: "192.168.1.44:5555", state: "unauthorized" });
  });

  test("ignores the noise around the phones", () => {
    const devices = parseAdbDevices(["List of devices attached", "* daemon started successfully", "no permissions (user in plugdev group)", ""].join("\n"));
    expect(devices).toEqual([]);
  });
});

describe("what the phone says", () => {
  test("the app in the front is read from the resumed activity", () => {
    const text = "    mResumedActivity: ActivityRecord{c62b7a8 u0 com.snapchat.android/com.snap.identity.loginsignup.ui.LoginSignupActivity t42}";
    expect(parseForegroundApp(text)).toBe("com.snapchat.android/com.snap.identity.loginsignup.ui.LoginSignupActivity");
  });

  test("no resumed activity means nothing is in the front", () => {
    expect(parseForegroundApp("  mResumedActivity: null")).toBeNull();
    expect(parseForegroundApp("")).toBeNull();
  });

  test("the battery level is a number or nothing", () => {
    expect(parseBatteryLevel("  level: 87")).toBe(87);
    expect(parseBatteryLevel("  scale: 100")).toBeNull();
  });
});
