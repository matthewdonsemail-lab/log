import { viewerState } from "../../../browser/viewer/index.ts";
import { PLATFORM_SITES } from "../../runner/helpers/platforms.ts";
import type { Platform } from "../../runner/helpers/platforms.ts";
import { runSessionCheck } from "../../../platformKit/sessionCheck/index.ts";
import type { SessionReport, SessionToolCaller } from "../../../platformKit/sessionCheck/index.ts";
import { readSessionSave } from "../../../platformKit/signIn/index.ts";
import type { SaveOutcome, SignInAccount, SignInActors, SignInRoute } from "../../../platformKit/signIn/index.ts";
import type { Command, CommandContext } from "../../runner/types.ts";

export const SIGN_IN_GOAL = "Open the account's browser on the platform's sign-in page so the owner signs in, then save the new session";

export interface SignInWiring {
  callTool: SessionToolCaller;
  viewerPhase: (account: string) => Promise<string>;
  sessionSave: (accountId: string, since: string) => SaveOutcome | null;
  cookieSave: (account: SignInAccount) => Promise<SaveOutcome>;
  sleep: (ms: number) => Promise<void>;
  now: () => Date;
  waitMs: number;
  closeMs: number;
  saveMs: number;
  pollMs: number;
}

export function signInUrlOf(platform: Platform): string {
  return platform === "facebook" ? "https://www.facebook.com/" : PLATFORM_SITES[platform].home;
}

function refused(answer: { isError?: boolean; structuredContent?: unknown }): string | null {
  const content = (answer.structuredContent ?? {}) as { ok?: unknown; stderr?: unknown };
  if (!answer.isError && content.ok !== false) return null;
  return typeof content.stderr === "string" && content.stderr.trim() ? content.stderr.trim().split("\n")[0].slice(0, 300) : "the browser step was refused";
}

async function checked(account: SignInAccount, callTool: SessionToolCaller): Promise<SessionReport> {
  const run = await runSessionCheck(account, { callTool });
  if (run.outcome === "busy") throw new Error(`accountCheckBusy: ${run.report.detail ?? "another check is running"}`);
  return run.report;
}

export function signInActorsOf(wiring: SignInWiring, route: SignInRoute): SignInActors {
  const gone = async (account: SignInAccount) => (await wiring.viewerPhase(account.name)) === "browserMissing";
  return {
    check: (account) => checked(account, wiring.callTool),
    recheck: (account) => checked(account, wiring.callTool),
    async open(account) {
      if (!(await gone(account))) return;
      const why = refused(await wiring.callTool("inspectStart", { account: account.name, url: signInUrlOf(account.platform), detach: true, goal: SIGN_IN_GOAL, waitMs: 50000 }));
      if (why) throw new Error(`browserOperationRefused: ${why}`);
    },
    async waitForOwner(account, finish) {
      if (finish && !(await gone(account))) {
        const why = refused(await wiring.callTool("inspectDo", { account: account.name, action: "stop", goal: SIGN_IN_GOAL, json: true, waitMs: 50000 }));
        if (why) throw new Error(`browserOperationRefused: ${why}`);
      }
      const until = wiring.now().getTime() + (finish ? wiring.closeMs : wiring.waitMs);
      for (;;) {
        if (await gone(account)) return { finished: true };
        if (wiring.now().getTime() >= until) return { finished: false };
        await wiring.sleep(wiring.pollMs);
      }
    },
    async save(account, since) {
      if (route === "cookies") return wiring.cookieSave(account);
      const until = wiring.now().getTime() + wiring.saveMs;
      for (;;) {
        const outcome = wiring.sessionSave(account.id, since);
        if (outcome) return outcome;
        if (wiring.now().getTime() >= until) throw new Error("sessionSaveUnconfirmed: the browser closed but no save of its session was recorded");
        await wiring.sleep(wiring.pollMs);
      }
    },
  };
}

export async function cookieCommandOf(platform: Platform): Promise<Command | null> {
  if (platform === "twitter") return (await import("../../twitter/helpers/cookies.ts")).cookiesCommand;
  if (platform === "linkedin") return (await import("../../linkedin/helpers/cookies.ts")).linkedinCookiesCommand;
  if (platform === "slack") return (await import("../../slack/helpers/cookies.ts")).slackCookiesCommand;
  return null;
}

export function cookieSaveBy(context: () => Promise<CommandContext>, now: () => Date = () => new Date()): (account: SignInAccount) => Promise<SaveOutcome> {
  return async (account) => {
    const command = await cookieCommandOf(account.platform);
    if (!command) return { saved: false, code: "cookieSignInUnavailable", detail: `${account.platform} has no cookie prompt`, at: now().toISOString() };
    const result = await command.run(await context(), ["save", "--account", account.name]);
    if (result.code === 0) return { saved: true, code: null, detail: "the platform accepted the cookies and they were saved", at: now().toISOString() };
    const said = String(result.stderr ?? "the platform did not accept those cookies").split("\n")[0].slice(0, 300);
    return { saved: false, code: /: ([a-z][A-Za-z]+)(:|$)/.exec(said)?.[1] ?? "cookiesNotSaved", detail: said, at: now().toISOString() };
  };
}

export function liveWiring(callTool: SessionToolCaller, cookieSave: SignInWiring["cookieSave"], options: { waitMs?: number; sleep?: (ms: number) => Promise<void>; now?: () => Date } = {}): SignInWiring {
  return {
    callTool,
    viewerPhase: async (account) => (await viewerState(account)).phase,
    sessionSave: readSessionSave,
    cookieSave,
    sleep: options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms))),
    now: options.now ?? (() => new Date()),
    waitMs: options.waitMs ?? 0,
    closeMs: 60_000,
    saveMs: 30_000,
    pollMs: 2_000,
  };
}
