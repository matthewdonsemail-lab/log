import type { Platform } from "../../cli/runner/helpers/platforms.ts";

export type SignInKind = "cookies" | "connect" | "browser";

export interface ConsoleAccount {
  id: string;
  platform: Platform;
  accountName: string;
  sessionState: string | null;
  browserProfile: boolean;
  signIn: SignInKind;
}

export interface ConsolePlatformGroup {
  platform: Platform;
  label: string;
  accounts: ConsoleAccount[];
}

export interface ConsoleConnections {
  schemaVersion: 1;
  source: "local";
  generatedAt: string;
  path: string;
  total: number;
  platforms: ConsolePlatformGroup[];
}
