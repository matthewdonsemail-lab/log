import { AdbError, parseBatteryLevel, parseForegroundApp, parseTcpSerial } from "./adb/index.ts";
import type { AdbClient, AdbDeviceState } from "./adb/index.ts";
import { mobileDeviceId } from "../device/index.ts";
import type { MobileDeviceInfo, MobileDeviceState, MobileDriver, MobileNetworkCapture } from "../device/index.ts";

const UI_DUMP_PATH = "/sdcard/window.xml";
const CAPTURE_SECONDS = 8;
const CAPTURE_FILE = "/data/local/tmp/logCapture.txt";
const NETWORK_HOSTS = /snapchat\.com|sc-cdn\.net|kit\.snapchat|okhttp|graphql/i;
const CAPTURE_REFUSED = /operation not permitted|permission to perform this capture|permission denied/i;

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
  async function readDump(serial: string): Promise<string | null> {
    const bytes = await adb.execOut(serial, ["cat", UI_DUMP_PATH]).catch(() => null);
    if (!bytes || !bytes.length) return null;
    const text = decode(bytes);
    return text.includes("hierarchy") ? text : null;
  }

  async function capture(serial: string, command: string): Promise<string> {
    return adb.shell(serial, [command]).catch((error: Error) => `the capture failed: ${error.message}`);
  }

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
      let dumped = "";
      let failure: Error | null = null;
      try {
        dumped = await adb.shell(serial, ["uiautomator", "dump", UI_DUMP_PATH]);
      } catch (error) {
        failure = error as Error;
      }
      const tree = await readDump(serial);
      if (tree) return tree;
      if (failure) throw failure;
      throw new AdbError("uiTreeFailed", `the phone did not write its UI tree: ${dumped.trim().slice(0, 200)}`);
    },
    async networkCalls(serial: string): Promise<MobileNetworkCapture> {
      const probe = await adb.shell(serial, ["which", "tcpdump"]).catch(() => "");
      if (probe.includes("tcpdump")) {
        const hasTimeout = (await adb.shell(serial, ["which", "timeout"]).catch(() => "")).includes("timeout");
        const captureCommand = hasTimeout
          ? `timeout ${CAPTURE_SECONDS} tcpdump -i any -A -s 0 -nn port 443 2>&1; exit 0`
          : `tcpdump -i any -A -s 0 -nn -c 50 port 443 > ${CAPTURE_FILE} 2>&1 & sleep ${CAPTURE_SECONDS}; cat ${CAPTURE_FILE}; exit 0`;
        let text = await capture(serial, captureCommand);
        if (CAPTURE_REFUSED.test(text)) {
          const rooted = await adb.root(serial).catch(() => false);
          if (rooted) text = await capture(serial, captureCommand);
        }
        const lines = text.split(/\r?\n/).filter(Boolean).slice(0, 200);
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
