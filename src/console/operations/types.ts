import type { CredentialFetch } from "../../auth/credentials/index.ts";
import type { CheckToolCaller } from "../accountCheck/index.ts";

export const BROWSER_OPERATIONS = ["browserState", "browserOpen", "browserFrame", "browserInput", "browserAction", "browserSaveState", "browserClose"] as const;
export const CONSOLE_OPERATIONS = ["connectionsList", "credentialsSave", "credentialsRead", "accountCheck", "accountSignIn", "usage", "events", ...BROWSER_OPERATIONS] as const;
export type ConsoleOperation = (typeof CONSOLE_OPERATIONS)[number];

export const SECRET_ARGS: Readonly<Partial<Record<ConsoleOperation, readonly string[]>>> = {
  credentialsSave: ["values"],
  accountSignIn: ["cookies", "username", "password"],
  browserInput: ["event"],
};

export const REDACTED = "<redacted>";

export const PRIVATE_RESULT_TOOLS: readonly string[] = ["report", "reportData"];

export const CONSOLE_SAFE_ERRORS = [
  "consoleInputInvalid",
  "consoleOperationUnknown",
  "credentialInputInvalid",
  "credentialRejected",
  "credentialRateLimited",
  "credentialValidationUnavailable",
  "credentialSaveUnconfirmed",
  "browserProviderUnavailable",
  "accountNotFound",
  "accountCheckBusy",
  "accountCheckStopped",
  "accountDeactivated",
  "browserCheckRequired",
  "accountCheckUnavailable",
  "signInInputInvalid",
  "cookieSignInUnavailable",
  "passwordSignInUnavailable",
  "cookiesIncomplete",
  "signInBusy",
  "usageRangeInvalid",
  "browserMissing",
  "browserViewerUnavailable",
  "browserGenerationChanged",
  "browserBusy",
  "browserStateChanged",
  "browserInputStopped",
  "browserInputInvalid",
  "browserInputFailed",
  "browserCheckUnresolved",
  "browserOperationRefused",
] as const;
export type ConsoleSafeError = (typeof CONSOLE_SAFE_ERRORS)[number];

export interface ConsoleOperationDeps {
  callTool?: CheckToolCaller;
  fetcher?: CredentialFetch;
  now?: () => number;
}

export const CONSOLE_ERROR_STATUS: Readonly<Record<string, number>> = {
  consoleInputInvalid: 400,
  consoleOperationUnknown: 404,
  credentialInputInvalid: 400,
  signInInputInvalid: 400,
  cookiesIncomplete: 400,
  usageRangeInvalid: 400,
  credentialRejected: 422,
  credentialRateLimited: 429,
  accountNotFound: 404,
  accountCheckBusy: 409,
  accountCheckStopped: 409,
  accountDeactivated: 409,
  browserCheckRequired: 409,
  signInBusy: 409,
  cookieSignInUnavailable: 409,
  passwordSignInUnavailable: 409,
  credentialSaveUnconfirmed: 503,
  credentialValidationUnavailable: 503,
  browserProviderUnavailable: 503,
  accountCheckUnavailable: 503,
  browserMissing: 404,
  browserViewerUnavailable: 503,
  browserGenerationChanged: 409,
  browserBusy: 409,
  browserStateChanged: 409,
  browserInputStopped: 409,
  browserInputInvalid: 400,
  browserInputFailed: 409,
  browserCheckUnresolved: 409,
  browserOperationRefused: 409,
};

export const CONSOLE_MUTATIONS: Readonly<Record<string, ConsoleOperation>> = {
  "/api/console/credentials": "credentialsSave",
  "/api/console/credentials/read": "credentialsRead",
  "/api/console/connections/check": "accountCheck",
  "/api/console/signIn": "accountSignIn",
  "/api/console/browserCheck/state": "browserState",
  "/api/console/browserCheck/open": "browserOpen",
  "/api/console/browserCheck/frame": "browserFrame",
  "/api/console/browserCheck/input": "browserInput",
  "/api/console/browserCheck/action": "browserAction",
  "/api/console/browserCheck/saveState": "browserSaveState",
  "/api/console/browserCheck/close": "browserClose",
};

export const STREAM_TOOLS: readonly string[] = ["browserState", "browserOpen", "browserInput", "browserAction", "browserSaveState", "browserClose", "browserViewStream", "browserViewFrame", "browserViewInput", "browserViewDone", "browserView"];
export const FRAME_TOOLS: readonly string[] = ["browserFrame", "browserViewFrame"];