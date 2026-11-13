import { PLATFORMS } from "../../cli/runner/helpers/platforms.ts";
import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import type { Command, CommandContext } from "../../cli/runner/types.ts";
import { localAccountsPath, readLocalAccounts, writeLocalAccounts } from "../../twenty/graphql/index.ts";
import { connectionIdOf } from "../connections/index.ts";
import { parseCookies } from "./helpers/cookies.ts";
import { COOKIE_NAMES, PASSWORD_PLATFORMS } from "./types.ts";
import type { SignInPrompts, SignInRequest, SignInResult } from "./types.ts";

type CookieDeps = { prompts: SignInPrompts; tty: () => { stdinTTY: boolean | undefined; stdoutTTY: boolean | undefined } };
type CookieRoute = { command: Command; deps: CookieDeps };
type Env = Record<string, string | undefined>;

export const signInDeps: { route: (platform: Platform) => Promise<CookieRoute | null>; context: () => Promise<Partial<CommandContext>> } = {
  route: async (platform) => {
    if (platform === "twitter") {
      const { cookiesCommand, cookiesDeps } = await import("../../cli/twitter/helpers/cookies.ts");
      return { command: cookiesCommand, deps: cookiesDeps as unknown as CookieDeps };
    }
    if (platform === "linkedin") {
      const { linkedinCookiesCommand, linkedinCookiesDeps } = await import("../../cli/linkedin/helpers/cookies.ts");
      return { command: linkedinCookiesCommand, deps: linkedinCookiesDeps as unknown as CookieDeps };
    }
    if (platform === "slack") {
      const { slackCookiesCommand, slackCookiesDeps } = await import("../../cli/slack/helpers/cookies.ts");
      return { command: slackCookiesCommand, deps: slackCookiesDeps as unknown as CookieDeps };
    }
    return null;
  },
  context: async () => ({}),
};

let busy = false;

function text(value: unknown, max: number): string {
  if (typeof value !== "string") throw new Error("signInInputInvalid");
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max || /[\r\n\0]/.test(trimmed)) throw new Error("signInInputInvalid");
  return trimmed;
}

export function signInRequestOf(input: Record<string, unknown>): SignInRequest {
  const platform = String(input.platform ?? "") === "x" ? "twitter" : String(input.platform ?? "");
  if (!(PLATFORMS as readonly string[]).includes(platform)) throw new Error("signInInputInvalid");
  if (input.method !== "cookies" && input.method !== "password") throw new Error("signInInputInvalid");
  const account = text(input.account, 120).replace(/^@/, "");
  if (input.method === "cookies") {
    if (typeof input.cookies !== "string" || !input.cookies.trim() || input.cookies.length > 65536) throw new Error("signInInputInvalid");
    return { platform: platform as Platform, method: "cookies", account, cookies: input.cookies };
  }
  return { platform: platform as Platform, method: "password", account, username: text(input.username, 320), password: text(input.password, 1024) };
}

function stubPrompts(answers: string[]): SignInPrompts {
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

async function cookieSignIn(request: SignInRequest): Promise<SignInResult> {
  const names = COOKIE_NAMES[request.platform];
  const route = names ? await signInDeps.route(request.platform) : null;
  if (!names || !route) throw new Error("cookieSignInUnavailable");
  const values = parseCookies(request.cookies, names);
  if (busy) throw new Error("signInBusy");
  busy = true;
  const held = { prompts: route.deps.prompts, tty: route.deps.tty };
  route.deps.prompts = stubPrompts(names.map((name) => values[name]));
  route.deps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
  try {
    const { createContext } = await import("../../cli/runner/client.ts");
    const quiet = () => {};
    const result = await route.command.run(createContext({ ...(await signInDeps.context()), out: quiet, err: quiet }), ["save", "--account", request.account]);
    const accountId = connectionIdOf(request.platform, request.account);
    if (result.code !== 0) return { signedIn: false, next: "none", accountId, detail: String(result.stderr ?? "the platform did not accept those cookies").split("\n")[0].slice(0, 300) };
    return { signedIn: true, next: "none", accountId, detail: "signedIn" };
  } finally {
    route.deps.prompts = held.prompts;
    route.deps.tty = held.tty;
    busy = false;
  }
}

function passwordSignIn(request: SignInRequest, env: Env): SignInResult {
  if (!PASSWORD_PLATFORMS.includes(request.platform)) throw new Error("passwordSignInUnavailable");
  const path = localAccountsPath(env);
  const rows = readLocalAccounts(path);
  const row = rows.find((item) => String(item.platform ?? "").toLowerCase() === request.platform && String(item.accountName ?? item.name ?? "").toLowerCase() === request.account.toLowerCase());
  if (!row) throw new Error("accountNotFound");
  Object.assign(row, { email: request.username, password: request.password, updatedAt: new Date().toISOString() });
  writeLocalAccounts(rows, path);
  return { signedIn: false, next: "browserCheck", accountId: connectionIdOf(request.platform, String(row.accountName ?? row.name)), detail: "loginSaved" };
}

export async function signInConsoleAccount(input: Record<string, unknown>, env: Env = process.env): Promise<SignInResult> {
  const request = signInRequestOf(input);
  return request.method === "cookies" ? cookieSignIn(request) : passwordSignIn(request, env);
}
