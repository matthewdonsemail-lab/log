import type { AdbDevice, AdbDeviceState } from "./types.ts";

const STATES: Readonly<Record<string, AdbDeviceState>> = {
  device: "device",
  offline: "offline",
  unauthorized: "unauthorized",
  unknown: "unknown",
};

export function parseAdbDevices(text: string): AdbDevice[] {
  const out: AdbDevice[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("List of devices") || line.startsWith("*") || line.startsWith("adb:")) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const serial = parts[0];
    if (!/^[\w.:-]+$/.test(serial)) continue;
    const state = STATES[parts[1]];
    if (!state) continue;
    const attributes: Record<string, string> = {};
    for (const part of parts.slice(2)) {
      const match = /^([a-z_]+):(.*)$/.exec(part);
      if (match) attributes[match[1]] = match[2];
    }
    out.push({
      serial,
      state,
      model: attributes.model ?? null,
      product: attributes.product ?? null,
      transportId: attributes.transport_id ?? null,
    });
  }
  return out;
}

export function parseForegroundApp(text: string): string | null {
  const line = ["mResumedActivity", "topResumedActivity", "mFocusedActivity"]
    .map((name) => new RegExp(`${name}[^\\n]*`).exec(text)?.[0])
    .find(Boolean);
  if (!line) return null;
  const match = /([a-zA-Z][a-zA-Z0-9_]*\.[a-zA-Z0-9_.]+)\/([A-Za-z0-9_.$]+)/.exec(line);
  return match ? `${match[1]}/${match[2]}` : null;
}

export function parseBatteryLevel(text: string): number | null {
  const match = /level:\s*(\d+)/.exec(text);
  return match ? Number(match[1]) : null;
}

export function parseTcpSerial(serial: string): string | null {
  const match = /^(\S+):(\d+)$/.exec(serial.trim());
  return match ? match[0] : null;
}
