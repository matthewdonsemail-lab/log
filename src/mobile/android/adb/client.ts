import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { parseAdbDevices, parseTcpSerial } from "./parse.ts";
import { AdbError } from "./types.ts";
import type { AdbClient, AdbDevice } from "./types.ts";

const MEMU_ADB = "C:\\Program Files\\Microvirt\\MEmu\\adb.exe";
const MUMU_ADB = "C:\\Program Files\\Netease\\MuMuPlayer\\nx_main\\adb.exe";

export function adbExecutable(env: Record<string, string | undefined> = process.env): string {
  if (env.LOG_ADB) return env.LOG_ADB;
  if (existsSync(MEMU_ADB)) return MEMU_ADB;
  if (existsSync(MUMU_ADB)) return MUMU_ADB;
  return "adb";
}

export function createAdbClient(options: { exe?: string } = {}): AdbClient {
  const exe = options.exe ?? adbExecutable();
  return {
    async devices(): Promise<AdbDevice[]> {
      const result = spawnSync(exe, ["devices", "-l"], { encoding: "utf8", windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
      if (result.error) throw new AdbError("adbNotFound", `${exe} could not run: ${result.error.message}`);
      return parseAdbDevices(result.stdout ?? "");
    },
    async connect(serial: string): Promise<boolean> {
      const endpoint = parseTcpSerial(serial);
      if (!endpoint) return false;
      const result = spawnSync(exe, ["connect", endpoint], { encoding: "utf8", windowsHide: true, timeout: 20_000 });
      if (result.error) throw new AdbError("adbNotFound", `${exe} could not run: ${result.error.message}`);
      const output = `${result.stdout ?? ""} ${result.stderr ?? ""}`;
      return /connected to|already connected/i.test(output);
    },
    async shell(serial: string, command: string[]): Promise<string> {
      const result = spawnSync(exe, ["-s", serial, "shell", ...command], { encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024, timeout: 40_000 });
      if (result.error) throw new AdbError("adbNotFound", `${exe} could not run: ${result.error.message}`);
      if (result.status !== 0) throw new AdbError("adbCommandFailed", `adb shell ${command.join(" ")} failed on ${serial}: ${(result.stderr || result.stdout || "").trim().slice(0, 300)}`);
      return result.stdout ?? "";
    },
    async execOut(serial: string, command: string[]): Promise<Uint8Array> {
      const result = spawnSync(exe, ["-s", serial, "exec-out", ...command], { windowsHide: true, maxBuffer: 256 * 1024 * 1024, timeout: 60_000 });
      if (result.error) throw new AdbError("adbNotFound", `${exe} could not run: ${result.error.message}`);
      if (result.status !== 0) throw new AdbError("adbCommandFailed", `adb exec-out ${command.join(" ")} failed on ${serial}`);
      return result.stdout ?? new Uint8Array();
    },
  };
}
