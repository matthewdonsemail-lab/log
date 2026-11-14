import { createHash, randomBytes } from "node:crypto";
import { DEFAULT_CONSOLE_PORT } from "../../console/screens/index.ts";
import { logDbSignInLinkStore } from "./helpers/index.ts";
import { SIGN_IN_LINK_MS, SIGN_IN_LINK_PARAM, SIGN_IN_LINK_PATH } from "./types.ts";
import type { SignInLink, SignInLinkStore, SignInLinkTarget } from "./types.ts";

export interface SignInLinkDeps {
  store?: SignInLinkStore;
  now?: () => Date;
  token?: () => string;
}

const TOKEN = /^[A-Za-z0-9_-]{32,64}$/;

function keyOf(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function localConsoleOrigin(port: number = DEFAULT_CONSOLE_PORT): string {
  return `http://127.0.0.1:${port}`;
}

export function signInLinkUrl(origin: string, token: string): string {
  const url = new URL(SIGN_IN_LINK_PATH, origin);
  url.searchParams.set(SIGN_IN_LINK_PARAM, token);
  return url.toString();
}

export function issueSignInLink(target: SignInLinkTarget, requester: string, origin: string, deps: SignInLinkDeps = {}): SignInLink {
  if (!requester) throw new Error("signInLinkInvalid: no person to make the link for");
  const store = deps.store ?? logDbSignInLinkStore();
  const now = (deps.now ?? (() => new Date()))();
  const token = (deps.token ?? (() => randomBytes(32).toString("base64url")))();
  const expiresAt = new Date(now.getTime() + SIGN_IN_LINK_MS).toISOString();
  store.put(keyOf(token), { accountId: target.accountId, account: target.account, platform: target.platform, requester, expiresAt });
  return { url: signInLinkUrl(origin, token), expiresAt };
}

export function redeemSignInLink(token: unknown, requester: string | undefined, deps: SignInLinkDeps = {}): SignInLinkTarget {
  if (typeof token !== "string" || !TOKEN.test(token) || !requester) throw new Error("signInLinkInvalid");
  const store = deps.store ?? logDbSignInLinkStore();
  const now = (deps.now ?? (() => new Date()))().getTime();
  const key = keyOf(token);
  const seen = store.read(key);
  if (!seen || Date.parse(seen.expiresAt) <= now) throw new Error("signInLinkInvalid");
  if (seen.requester !== requester) throw new Error("signInLinkNotYours");
  const taken = store.take(key);
  if (!taken || Date.parse(taken.expiresAt) <= now) throw new Error("signInLinkInvalid");
  return { accountId: taken.accountId, account: taken.account, platform: taken.platform };
}
