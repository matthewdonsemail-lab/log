import { createAdbClient, createAndroidDriver } from "../android/index.ts";
import { createAppleDriver } from "../apple/index.ts";
import { createMobileRegistry } from "../device/index.ts";
import type { MobileRegistry, MobileServices } from "../device/index.ts";

export function createMobileServices(options: { registryPath?: string; registry?: MobileRegistry } = {}): MobileServices {
  return {
    registry: options.registry ?? createMobileRegistry(options.registryPath),
    drivers: [createAndroidDriver(createAdbClient()), createAppleDriver()],
  };
}
