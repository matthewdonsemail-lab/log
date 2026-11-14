import { mobileDeviceId } from "../device/index.ts";
import type { MobileDeviceInfo, MobileDriver, MobileNetworkCapture } from "../device/index.ts";

export const APPLE_ROUTE_READY = false;

export function appleNotWired(action: string): string {
  return `log mobile apple: ${action} is not wired on this machine: no iPhone is paired with Apple's own device tooling here, so nothing is claimed about it. Android is the route that works today.`;
}

export function createAppleDriver(): MobileDriver {
  const refuse = async (action: string): Promise<never> => {
    const error = new Error(appleNotWired(action)) as Error & { code: string };
    error.code = "appleDeviceNotWired";
    throw error;
  };
  return {
    os: "apple",
    listDevices: () => refuse("listing the phones"),
    readState: (_serial: string): Promise<MobileDeviceInfo> => refuse("reading a phone"),
    openApp: (_serial: string, _packageName: string): Promise<void> => refuse("opening an app"),
    screenshot: (_serial: string): Promise<Uint8Array> => refuse("taking the screen"),
    uiTree: (_serial: string): Promise<string> => refuse("reading the screen"),
    networkCalls: (_serial: string): Promise<MobileNetworkCapture> => refuse("reading the network calls"),
    tap: (_serial: string, _x: number, _y: number): Promise<void> => refuse("tapping"),
  };
}

export function appleDeviceId(serial: string): string {
  return mobileDeviceId("apple", serial);
}
