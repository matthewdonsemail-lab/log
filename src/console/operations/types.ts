import type { CredentialFetch } from "../../auth/credentials/index.ts";
import type { CheckStore } from "../../platformKit/sessionCheck/index.ts";
import type { CheckToolCaller } from "../accountCheck/index.ts";
import type { SignInStore } from "../../platformKit/signIn/index.ts";
import type { ConsoleSignInDeps } from "../signIn/index.ts";

export const BROWSER_OPERATIONS = ["browserState", "browserOpen", "browserFrame", "browserInput", "browserAction", "browserSaveState", "browserClose"] as const;
export const CONSOLE_OPERATIONS = ["connectionsList", "credentialsSave", "credentialsRead", "accountCheck", "accountSignIn", "signInLinkOpen", "usage", "events", ...BROWSER_OPERATIONS] as const;
export type ConsoleOperation = (typeof CONSOLE_OPERATIONS)[number];

export interface ConsoleTwin {
  commands: readonly string[];
  app?: readonly string[];
}

export const CONSOLE_TWINS: Readonly<Record<ConsoleOperation, ConsoleTwin>> = {
  connectionsList: { commands: ["consoleConnections"] },
  credentialsSave: { commands: ["credentialsSave"] },
  credentialsRead: { commands: ["credentialsRead"] },
  accountCheck: { commands: ["sessionsCheck"] },
  accountSignIn: { commands: ["sessionsSignIn", "localAccountLogin"] },
  signInLinkOpen: { commands: ["sessionsSignIn"] },
  usage: { commands: ["consoleUsage"] },
  events: { commands: ["consoleEvents"] },
  browserState: { commands: ["browserView"] },
  browserOpen: { commands: ["inspectStart"] },
  browserFrame: { commands: [], app: ["browserViewFrame"] },
  browserInput: { commands: [], app: ["browserViewInput"] },
  browserAction: { commands: ["inspectDo", "inspectDoLive"] },
  browserSaveState: { commands: ["inspectDo"] },
  browserClose: { commands: ["inspectDo"] },
};

export const RUNTIME_TWINS: Readonly<Record<string, ConsoleTwin>> = {
  accountsList: { commands: ["accountsList"] },
};

export const SECRET_ARGS: Readonly<Partial<Record<ConsoleOperation, readonly string[]>>> = {
  credentialsSave: ["values"],
  accountSignIn: ["cookies", "username", "password"],
  signInLinkOpen: ["token"],
  browserInput: ["event"],
};

export const REDACTED = "<redacted>";

export const PRIVATE_RESULT_TOOLS: readonly string[] = ["report", "reportData"];

export const UNJOURNALED_TOOLS: readonly string[] = ["browserViewStream", "browserViewFrame", "browserViewInput", "browserViewDone", "browserFrame", "browserState"];

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
  "signInInputInvalid",
  "cookieSignInUnavailable",
  "passwordSignInUnavailable",
  "cookiesIncomplete",
  "signInRouteUnavailable",
  "sessionSaveUnconfirmed",
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
  "signInLinkInvalid",
  "signInLinkNotYours",
] as const;
export type ConsoleSafeError = (typeof CONSOLE_SAFE_ERRORS)[number];

export interface ConsoleOperationDeps {
  callTool?: CheckToolCaller;
  fetcher?: CredentialFetch;
  now?: () => number;
  checkStore?: CheckStore;
  signInStore?: SignInStore;
  signInActors?: ConsoleSignInDeps["actors"];
  requester?: string;
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
  signInRouteUnavailable: 409,
  sessionSaveUnconfirmed: 503,
  cookieSignInUnavailable: 409,
  passwordSignInUnavailable: 409,
  credentialSaveUnconfirmed: 503,
  credentialValidationUnavailable: 503,
  browserProviderUnavailable: 503,
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
  signInLinkInvalid: 410,
  signInLinkNotYours: 403,
};

export const CONSOLE_MUTATIONS: Readonly<Record<string, ConsoleOperation>> = {
  "/api/console/credentials": "credentialsSave",
  "/api/console/credentials/read": "credentialsRead",
  "/api/console/connections/check": "accountCheck",
  "/api/console/signIn": "accountSignIn",
  "/api/console/signInLink": "signInLinkOpen",
  "/api/console/browserCheck/state": "browserState",
  "/api/console/browserCheck/open": "browserOpen",
  "/api/console/browserCheck/frame": "browserFrame",
  "/api/console/browserCheck/input": "browserInput",
  "/api/console/browserCheck/action": "browserAction",
  "/api/console/browserCheck/saveState": "browserSaveState",
  "/api/console/browserCheck/close": "browserClose",
};

export const STREAM_TOOLS: readonly string[] = ["browserState", "browserOpen", "browserInput", "browserAction", "browserSaveState", "browserClose", "browserViewStream", "browserViewFrame", "browserViewInput", "browserViewDone", "browserView", "sessionsSignIn"];
export const FRAME_TOOLS: readonly string[] = ["browserFrame", "browserViewFrame"];