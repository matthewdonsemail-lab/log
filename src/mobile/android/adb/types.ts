export type AdbDeviceState = "device" | "offline" | "unauthorized" | "unknown";

export interface AdbDevice {
  serial: string;
  state: AdbDeviceState;
  model: string | null;
  product: string | null;
  transportId: string | null;
}

export interface AdbClient {
  devices(): Promise<AdbDevice[]>;
  connect(serial: string): Promise<boolean>;
  shell(serial: string, command: string[]): Promise<string>;
  execOut(serial: string, command: string[]): Promise<Uint8Array>;
}

export class AdbError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
