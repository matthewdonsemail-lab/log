import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import type { CredentialInputType, CredentialProvider } from "../../auth/credentials/index.ts";

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

export const ACCOUNT_STATUSES = ["active", "warming", "limited", "paused", "needsLogin", "checkpoint", "restricted", "banned", "dead", "deactivated"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const SESSION_STATES = ["loggedIn", "loggedOut", "restricted", "checkpoint", "unknown", "shadowSuspect", "accountWarning"] as const;
export type SessionState = (typeof SESSION_STATES)[number];

export const CHECK_STATES = ["running", "succeeded", "stopped", "unavailable", "unknown"] as const;
export type CheckState = (typeof CHECK_STATES)[number];

export type ProxyProvider = "twoCaptcha" | "byteful" | "unknown";

export interface LaunchOutcome {
  phase: string;
  retryAt: string | null;
  code: string;
}

export interface LastCheck {
  state: CheckState;
  checkedAt: string;
  launchOutcome?: LaunchOutcome;
}

export interface ConnectionAccount {
  id: string;
  name: string;
  platform: Platform;
  homeCountry: string | null;
  proxyProvider: ProxyProvider | null;
  status: AccountStatus | "unknown";
  statusReason: string | null;
  state: SessionState;
  checkedAt: string | null;
  signIn: SignInKind;
  lastCheck: LastCheck | null;
}

export interface SavedKeyField {
  id: string;
  label: string;
  secret: boolean;
  required: boolean;
  inputType: CredentialInputType;
  hasValue: boolean;
  masked: string | null;
}

export type ExtensionState = "configured" | "notConfigured" | "unavailable";

export interface ExtensionConnection {
  key: CredentialProvider;
  state: ExtensionState;
  fields: SavedKeyField[];
  persisted: boolean;
}

export interface ConnectionsView {
  schemaVersion: 1;
  source: "workspace";
  generatedAt: string;
  accounts: ConnectionAccount[];
  extensions: ExtensionConnection[];
}

export interface ConsoleConnections {
  schemaVersion: 1;
  source: "local";
  generatedAt: string;
  path: string;
  total: number;
  platforms: ConsolePlatformGroup[];
  accounts: ConnectionAccount[];
  extensions: ExtensionConnection[];
}
