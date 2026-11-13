import { PLATFORMS } from "../../cli/runner/helpers/platforms.ts";
import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import type { CommandContext } from "../../cli/runner/types.ts";
import { cookieCommandOf, cookieSaveBy, liveWiring, signInActorsOf } from "../../cli/sessions/helpers/index.ts";
import { logDbSignInStore, runSignIn } from "../../platformKit/signIn/index.ts";
import type { SignInActors, SignInResult as MachineResult, SignInRoute, SignInStore } from "../../platformKit/signIn/index.ts";
import type { ConnectionAccount } from "../connections/index.ts";
import { localAccountsPath, readLocalAccounts, writeLocalAccounts } from "../../twenty/graphql/index.ts";
import { inProcessToolCaller } from "../accountCheck/index.ts";
import type { CheckToolCaller } from "../accountCheck/index.ts";
import { connectionIdOf, loadConnectionsView } from "../connections/index.ts";
import { parseCookies } from "./helpers/cookies.ts";
import { COOKIE_NAMES, PASSWORD_PLATFORMS, SIGN_IN_METHODS } from "./types.ts";
import type { SignInMethod, SignInPrompts, SignInRequest, SignInResult } from "./types.ts";

type Env = Record<string, string | undefined>;

export interface ConsoleSignInDeps {
  callTool?: CheckToolCaller;
  actors?: (route: SignInRoute, cookieContext: () => Promise<CommandContext>, callTool: CheckToolCaller) => SignInActors;
  store?: SignInStore;
}

export const signInDeps: { context: () => Promise<Partial<CommandContext>> } = {
  context: async () => ({}),
};

function text(value: unknown, max: number): string {
  if (typeof value !== "string") throw new Error("signInInputInvalid");
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max || /[\r\n\0]/.test(trimmed)) throw new Error("signInInputInvalid");
  return trimmed;
}

export function signInRequestOf(input: Record<string, unknown>): SignInRequest {
  const platform = String(input.platform ?? "") === "x" ? "twitter" : String(input.platform ?? "");
  if (!(PLATFORMS as readonly string[]).includes(platform)) throw new Error("signInInputInvalid");
  if (!(SIGN_IN_METHODS as readonly unknown[]).includes(input.method)) throw new Error("signInInputInvalid");
  const method = input.method as SignInMethod;
  const account = text(input.account, 120).replace(/^@/, "");
  if (method === "browser") return { platform: platform as Platform, method, account };
  if (method === "cookies") {
    if (typeof input.cookies !== "string" || !input.cookies.trim() || input.cookies.length > 65536) throw new Error("signInInputInvalid");
    return { platform: platform as Platform, method: "cookies", account, cookies: input.cookies };
  }
  return { platform: platform as Platform, method: "password", account, username: text(input.username, 320), password: text(input.password, 1024) };
}

export function answeringPrompts(answers: string[]): SignInPrompts {
  return {
    intro: () => {},
    outro: () => {},
    cancel: () => {},
    password: async (option) => {
      const value = answers.shift() ?? "";
      return option.validate?.(value) ? Symbol.for("clack:cancel") : value;
    },
  };
}

async function cookieContext(answers: string[]): Promise<CommandContext> {
  const { createContext } = await import("../../cli/runner/client.ts");
  const quiet = () => {};
  return createContext({ ...(await signInDeps.context()), out: quiet, err: quiet, cookiePrompts: answeringPrompts(answers) });
}

function defaultActors(route: SignInRoute, context: () => Promise<CommandContext>, callTool: CheckToolCaller): SignInActors {
  return signInActorsOf(liveWiring(callTool, cookieSaveBy(context)), route);
}

async function machineSignIn(request: SignInRequest, deps: ConsoleSignInDeps): Promise<SignInResult> {
  const route: SignInRoute = request.method === "cookies" ? "cookies" : "browser";
  const known = loadConnectionsView().accounts.find((account) => account.platform === request.platform && account.name.toLowerCase() === request.account.toLowerCase());
  if (!known && route === "browser") throw new Error("accountNotFound");
  let answers: string[] = [];
  if (route === "cookies") {
    const names = COOKIE_NAMES[request.platform];
    if (!names || !(await cookieCommandOf(request.platform))) throw new Error("cookieSignInUnavailable");
    const values = parseCookies(request.cookies, names);
    answers = names.map((name) => values[name]);
  }
  const account = known ? { id: known.id, name: known.name, platform: known.platform, status: known.status, state: known.state, checkedAt: known.checkedAt, lastCheck: known.lastCheck } : { id: connectionIdOf(request.platform, request.account), name: request.account, platform: request.platform };
  const callTool = deps.callTool ?? (await inProcessToolCaller());
  const actors = (deps.actors ?? defaultActors)(route, () => cookieContext(answers), callTool);
  const result = await runSignIn({ account, route }, { actors, store: deps.store });
  const detail = result.state === "signedIn" ? "signedIn" : result.state === "waitingForOwner" ? "browserOpened" : (result.save?.detail ?? result.detail ?? result.code ?? result.state);
  return { signedIn: result.state === "signedIn", next: result.state === "waitingForOwner" ? "browserCheck" : "none", accountId: account.id, detail: detail.split("\n")[0].slice(0, 300), state: result.state };
}

export async function finishConsoleSignIn(account: ConnectionAccount, deps: ConsoleSignInDeps = {}): Promise<MachineResult | null> {
  const store = deps.store ?? logDbSignInStore();
  const held = store.load(account.id);
  if (!held) return null;
  const callTool = deps.callTool ?? (await inProcessToolCaller());
  const actors = (deps.actors ?? defaultActors)(held.route, () => cookieContext([]), callTool);
  return runSignIn({ account: { id: account.id, name: account.name, platform: account.platform, status: account.status, state: account.state, checkedAt: account.checkedAt, lastCheck: account.lastCheck }, finish: true }, { actors, store });
}

function passwordSignIn(request: SignInRequest, env: Env): SignInResult {
  if (!PASSWORD_PLATFORMS.includes(request.platform)) throw new Error("passwordSignInUnavailable");
  const path = localAccountsPath(env);
  const rows = readLocalAccounts(path);
  const row = rows.find((item) => String(item.platform ?? "").toLowerCase() === request.platform && String(item.accountName ?? item.name ?? "").toLowerCase() === request.account.toLowerCase());
  if (!row) throw new Error("accountNotFound");
  Object.assign(row, { email: request.username, password: request.password, updatedAt: new Date().toISOString() });
  writeLocalAccounts(rows, path);
  return { signedIn: false, next: "browserCheck", accountId: connectionIdOf(request.platform, String(row.accountName ?? row.name)), detail: "loginSaved", state: "signInNeeded" };
}

export async function signInConsoleAccount(input: Record<string, unknown>, env: Env = process.env, deps: ConsoleSignInDeps = {}): Promise<SignInResult> {
  const request = signInRequestOf(input);
  return request.method === "password" ? passwordSignIn(request, env) : machineSignIn(request, deps);
}
