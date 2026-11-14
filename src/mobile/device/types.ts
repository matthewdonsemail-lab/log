export type MobileOs = "android" | "apple";

export type MobileDeviceState = "online" | "offline" | "unauthorized" | "unknown";

export interface MobileDeviceRecord {
  id: string;
  os: MobileOs;
  serial: string;
  accountName: string;
  platform: string;
  network: string | null;
  attachedAt: string;
}

export interface MobileRegistry {
  path: string;
  read(): MobileDeviceRecord[];
  write(records: MobileDeviceRecord[]): void;
}

export interface MobileDeviceInfo {
  id: string;
  os: MobileOs;
  serial: string;
  state: MobileDeviceState;
  model: string | null;
  osVersion: string | null;
  foregroundApp: string | null;
  battery: number | null;
}

export interface MobileNetworkCapture {
  mode: string;
  lines: string[];
}

export interface MobileDriver {
  os: MobileOs;
  listDevices(): Promise<MobileDeviceInfo[]>;
  readState(serial: string): Promise<MobileDeviceInfo>;
  openApp(serial: string, packageName: string): Promise<void>;
  screenshot(serial: string): Promise<Uint8Array>;
  uiTree(serial: string): Promise<string>;
  networkCalls(serial: string): Promise<MobileNetworkCapture>;
  tap(serial: string, x: number, y: number): Promise<void>;
}

export interface MobileServices {
  registry: MobileRegistry;
  drivers: MobileDriver[];
}

export function mobileDeviceId(os: MobileOs, serial: string): string {
  return `${os}:${serial}`;
}

export function findPhoneOfAccount(records: readonly MobileDeviceRecord[], os: MobileOs, accountName: string): MobileDeviceRecord[] {
  return records.filter((record) => record.os === os && record.accountName === accountName);
}

export function findPhoneOfSerial(records: readonly MobileDeviceRecord[], os: MobileOs, serial: string): MobileDeviceRecord[] {
  return records.filter((record) => record.os === os && record.serial === serial);
}

export function pickOnePhone(records: readonly MobileDeviceRecord[]): { ok: true; phone: MobileDeviceRecord } | { ok: false; count: number } {
  if (records.length === 1) return { ok: true, phone: records[0] };
  return { ok: false, count: records.length };
}
