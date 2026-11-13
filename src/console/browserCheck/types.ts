import type { ViewerStream } from "../../browser/viewer/index.ts";

export const BROWSER_CHECK_PHASES = ["profileRequired", "providerSetupRequired", "operationUncertain", "browserMissing", "viewerUnavailable", "ready", "signInRequired", "needsResolution", "needsAttention", "verified", "busy"] as const;
export type BrowserCheckPhase = (typeof BROWSER_CHECK_PHASES)[number];

export const BROWSER_ACTIONS = ["back", "reload", "verify", "resolve", "linkProfile"] as const;
export type BrowserAction = (typeof BROWSER_ACTIONS)[number];

export type BrowserLocation = "local" | "remote";

export interface BrowserCheckReason {
  code: string;
  message: string;
}

export interface BrowserCheckView {
  accountId: string;
  account: string;
  phase: BrowserCheckPhase;
  location: BrowserLocation;
  viewerId: string | null;
  generation: string | null;
  revision: string | null;
  pageState: string | null;
  address: string | null;
  width: number | null;
  height: number | null;
  canInteract: boolean;
  canResolve: boolean;
  canComplete: boolean;
  canNavigate: boolean;
  canGoBack: boolean;
  stream: ViewerStream | null;
  reason: BrowserCheckReason | null;
}

export interface BrowserCheckFrame {
  generation: string;
  revision: string;
  mimeType: "image/jpeg";
  data: string;
}

export type BrowserToolCaller = (name: string, input: Record<string, unknown>) => Promise<{ isError?: boolean; structuredContent?: unknown }>;

export const BROWSER_CHECK_ERRORS = ["browserMissing", "browserViewerUnavailable", "browserGenerationChanged", "browserBusy", "browserStateChanged", "browserInputStopped", "browserInputInvalid", "browserInputFailed", "browserCheckUnresolved", "browserOperationUnconfirmed", "browserOperationRefused", "browserCheckUnsupported"] as const;

export const VERIFIED_FOR_MS = 120_000;
