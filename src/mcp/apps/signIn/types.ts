import type { ViewerView } from "../../../browser/viewer/index.ts";
import type { BrowserViewLocation } from "../../../cli/browser/index.ts";
import type { SignInLinkDeps } from "../../../platformKit/signInLink/index.ts";

export const SIGN_IN_TOOL = "sessionsSignIn";

export const SIGN_IN_RUNGS = ["app", "url", "text"] as const;
export type SignInRung = (typeof SIGN_IN_RUNGS)[number];

export type ElicitUrl = (url: string, message: string, elicitationId: string) => Promise<{ action?: unknown }>;

export const PENDING_ELICITATION_FIELD = "inputRequired";

export const SIGN_IN_INPUT_KEY = "signIn";

export interface PendingElicitation {
  url: string;
  message: string;
}

export interface DeferredElicitation {
  elicit: ElicitUrl;
  asked: () => PendingElicitation | null;
}

export interface SignInSurface {
  rung: SignInRung;
  location: BrowserViewLocation;
  requester: string;
  origin: string;
  elicit?: ElicitUrl;
  view?: (account: string) => Promise<ViewerView>;
  links?: SignInLinkDeps;
}
