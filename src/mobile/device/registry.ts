import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { MobileDeviceRecord, MobileRegistry } from "./types.ts";

export function mobileDevicesPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_MOBILE_DEVICES || join(homedir(), ".logCli", "mobileDevices.json");
}

export function readMobileDevices(path = mobileDevicesPath()): MobileDeviceRecord[] {
  if (!existsSync(path)) return [];
  const parsed = JSON.parse(readFileSync(path, "utf8")) as { devices?: MobileDeviceRecord[] };
  return Array.isArray(parsed.devices) ? parsed.devices : [];
}

export function writeMobileDevices(records: MobileDeviceRecord[], path = mobileDevicesPath()): void {
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.tmp`;
  writeFileSync(temp, JSON.stringify({ devices: records }, null, 2), { mode: 0o600 });
  renameSync(temp, path);
}

export function createMobileRegistry(path = mobileDevicesPath()): MobileRegistry {
  return {
    path,
    read: () => readMobileDevices(path),
    write: (records: MobileDeviceRecord[]) => writeMobileDevices(records, path),
  };
}
