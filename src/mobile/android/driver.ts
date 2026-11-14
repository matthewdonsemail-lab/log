import { AdbError, parseBatteryLevel, parseForegroundApp, parseTcpSerial } from "./adb/index.ts";
import type { AdbClient, AdbDeviceState } from "./adb/index.ts";
import { mobileDeviceId } from "../device/index.ts";
import type { MobileDeviceInfo, MobileDeviceState, MobileDriver, MobileNetworkCapture } from "../device/index.ts";

const UI_DUMP_PATH = "/sdcard/window.xml";
const NETWORK_HOSTS = /snapchat\.com|sc-cdn\.net|kit\.snapchat|okhttp|graphql/i;

export function adbStateToMobileState(state: AdbDeviceState): MobileDeviceState {
  if (state === "device") return "online";
  if (state === "offline") return "offline";
  if (state === "unauthorized") return "unauthorized";
  return "unknown";
}

function decode(bytes: Uint8Array): string {
  return new TextDecoder("utf8").decode(bytes);
}

export function createAndroidDriver(adb: AdbClient): MobileDriver {
  async function readState(serial: string): Promise<MobileDeviceInfo> {
    let devices = await adb.devices();
    let device = devices.find((entry) => entry.serial === serial);
    if (!device && parseTcpSerial(serial)) {
      await adb.connect(serial).catch(() => false);
      devices = await adb.devices();
      device = devices.find((entry) => entry.serial === serial);
    }
    if (!device) throw new AdbError("phoneNotFound", `no phone with the serial ${serial} is connected`);
    if (device.state !== "device") {
      return {
        id: mobileDeviceId("android", serial),
        os: "android",
        serial,
        state: adbStateToMobileState(device.state),
        model: device.model,
        osVersion: null,
        foregroundApp: null,
        battery: null,
      };
    }
    const [model, release, activities, battery] = await Promise.all([
      adb.shell(serial, ["getprop", "ro.product.model"]).catch(() => device.model ?? ""),
      adb.shell(serial, ["getprop", "ro.build.version.release"]).catch(() => ""),
      adb.shell(serial, ["dumpsys", "activity", "activities"]).catch(() => ""),
      adb.shell(serial, ["dumpsys", "battery"]).catch(() => ""),
    ]);
    return {
      id: mobileDeviceId("android", serial),
      os: "android",
      serial,
      state: "online",
      model: model.trim() || device.model,
      osVersion: release.trim() || null,
      foregroundApp: parseForegroundApp(activities),
      battery: parseBatteryLevel(battery),
    };
  }

  return {
    os: "android",
    async listDevices(): Promise<MobileDeviceInfo[]> {
      const devices = await adb.devices();
      return Promise.all(
        devices.map(async (device) => {
          if (device.state !== "device") {
            return {
              id: mobileDeviceId("android", device.serial),
              os: "android" as const,
              serial: device.serial,
              state: adbStateToMobileState(device.state),
              model: device.model,
              osVersion: null,
              foregroundApp: null,
              battery: null,
            };
          }
          return readState(device.serial);
        }),
      );
    },
    readState,
    async openApp(serial: string, packageName: string): Promise<void> {
      await adb.shell(serial, ["monkey", "-p", packageName, "1"]);
    },
    async screenshot(serial: string): Promise<Uint8Array> {
      return adb.execOut(serial, ["screencap", "-p"]);
    },
    async uiTree(serial: string): Promise<string> {
      const dumped = await adb.shell(serial, ["uiautomator", "dump", UI_DUMP_PATH]);
      if (!dumped.includes("dumped to")) throw new AdbError("uiTreeFailed", `the phone did not write its UI tree: ${dumped.trim().slice(0, 200)}`);
      return decode(await adb.execOut(serial, ["cat", UI_DUMP_PATH]));
    },
    async networkCalls(serial: string): Promise<MobileNetworkCapture> {
      const probe = await adb.shell(serial, ["which", "tcpdump"]).catch(() => "");
      if (probe.includes("tcpdump")) {
        const hasTimeout = (await adb.shell(serial, ["which", "timeout"]).catch(() => "")).includes("timeout");
        const capture = hasTimeout
          ? ["timeout", "8", "tcpdump", "-i", "any", "-A", "-s", "0", "-nn", "port", "443"]
          : ["tcpdump", "-i", "any", "-A", "-s", "0", "-nn", "-c", "50", "port", "443"];
        const text = await adb.shell(serial, capture).catch((error: Error) => `the capture failed: ${error.message}`);
        const lines = text.split(/\r?\n/).filter(Boolean).slice(-200);
        return { mode: "tcpdump", lines };
      }
      const text = await adb.shell(serial, ["logcat", "-d", "-v", "brief", "-t", "300"]).catch(() => "");
      const lines = text.split(/\r?\n/).filter((line) => NETWORK_HOSTS.test(line)).slice(-200);
      return { mode: "logcat", lines };
    },
    async tap(serial: string, x: number, y: number): Promise<void> {
      await adb.shell(serial, ["input", "tap", String(x), String(y)]);
    },
  };
}
