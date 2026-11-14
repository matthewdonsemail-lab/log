import { createActor } from "xstate";
import type { Snapshot } from "xstate";
import { signInRoutesOf } from "../../cli/launch/helpers/start.ts";
import { PLATFORM_LABELS, PLATFORM_SITES } from "../../cli/runner/helpers/platforms.ts";
import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import { nextStepOf } from "../sessionCheck/index.ts";
import type { SessionNextStep } from "../sessionCheck/index.ts";
import { logDbSignInStore } from "./helpers/index.ts";
import { signInMachineWith } from "./machine.ts";
import { SIGN_IN_SNAPSHOT_MS } from "./types.ts";
import type { AccountNotConfigured, SignInAccount, SignInActors, SignInMachineOutput, SignInRequest, SignInResult, SignInRoute, SignInStage, SignInState, SignInStore } from "./types.ts";

export interface SignInDeps {
  actors: SignInActors;
  store?: SignInStore;
  now?: () => Date;
  onStage?: (stage: SignInStage) => void;
}

export function signInRouteFor(account: Pick<SignInAccount, "platform">, wanted?: SignInRoute): SignInRoute {
  const routes = signInRoutesOf(account.platform);
  const route = wanted ?? routes[0];
  if (!route || !routes.includes(route)) throw new Error(`signInRouteUnavailable: ${PLATFORM_LABELS[account.platform]} signs in by ${routes.join(" or ") || "no route log has"}, not ${wanted}`);
  return route;
}

export function signInNextStep(account: SignInAccount, state: SignInState, output: Pick<SignInMachineOutput, "save" | "stage" | "code" | "detail">): SessionNextStep | null {
  if (state === "waitingForOwner") {
    const home = PLATFORM_SITES[account.platform].home;
    return {
      says: `${account.name}'s own browser is open on ${home}. The owner signs in themself on the login screen; browserView shows it live where the host draws it. When they are done, sign-in is finished with done: closing the browser saves the cookies and session from it, and only when its sign-in cookies are there. Closing the window by hand does the same.`,
      tool: { name: "sessionsSignIn", input: { account: account.name, platform: account.platform, done: true } },
      cli: `log sessions signIn --account ${account.name} --platform ${account.platform} --done`,
      alternative: null,
    };
  }
  if (state === "signInNeeded") {
    const next = nextStepOf(account, "signInNeeded");
    const kept = output.save && !output.save.saved ? `Nothing was saved (${output.save.code ?? "notSaved"}): ${output.save.detail ?? "the browser held no sign-in"}, so the stored session was left as it was. ` : "";
    return next ? { ...next, says: `${kept}${next.says}` } : null;
  }
  if (state === "failed") return { says: `Sign-in stopped at ${output.stage}${output.code ? ` (${output.code})` : ""}${output.detail ? `: ${output.detail}` : ""}. Nothing was retried.`, tool: null, cli: null, alternative: null };
  if (state === "stopped") return nextStepOf(account, "stopped");
  return null;
}

export function accountNotConfigured(account: string, platform: Platform | null): AccountNotConfigured {
  const on = platform ? ` on ${PLATFORM_LABELS[platform]}` : "";
  return {
    error: "accountNotConfigured",
    platform,
    account,
    next: {
      says: `No account ${account}${on} is set up in this workspace, so there is nothing to sign in. Add it first: the console's Connections page (Add account), or log localAccount add on the workspace's machine. Then sign it in with sessionsSignIn.`,
      tool: null,
      cli: `log localAccount add --platform ${platform ?? "<platform>"} --account ${account}`,
      alternative: null,
    },
  };
}

function settled(actor: { getSnapshot(): { status: string; context: { waiting: boolean } }; subscribe(observer: { next: () => void; error: (error: unknown) => void }): { unsubscribe(): void } }): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = () => {
      const snapshot = actor.getSnapshot();
      return snapshot.status !== "active" || snapshot.context.waiting;
    };
    if (done()) return resolve();
    const subscription = actor.subscribe({
      next: () => {
        if (!done()) return;
        subscription.unsubscribe();
        resolve();
      },
      error: (error) => {
        subscription.unsubscribe();
        reject(error);
      },
    });
  });
}

export async function runSignIn(request: SignInRequest, deps: SignInDeps): Promise<SignInResult> {
  const store = deps.store ?? logDbSignInStore();
  const now = deps.now ?? (() => new Date());
  const account = request.account;
  const held = store.load(account.id);
  const fresh = held && now().getTime() - held.savedAt < SIGN_IN_SNAPSHOT_MS && (!request.route || request.route === held.route) ? held : null;
  const route = fresh ? fresh.route : signInRouteFor(account, request.route);
  const machine = signInMachineWith(deps.actors);
  const actor = fresh
    ? createActor(machine, { snapshot: fresh.snapshot as Snapshot<unknown> as never, input: { account, route, finish: Boolean(request.finish), startedAt: now().toISOString() } })
    : createActor(machine, { input: { account, route, finish: Boolean(request.finish), startedAt: now().toISOString() } });
  let last: SignInStage | null = null;
  actor.subscribe((snapshot) => {
    if (snapshot.context.stage !== last) deps.onStage?.(snapshot.context.stage);
    last = snapshot.context.stage;
  });
  actor.start();
  if (fresh) actor.send({ type: "resume", finish: Boolean(request.finish) });
  await settled(actor as never);
  const snapshot = actor.getSnapshot();
  const waiting = snapshot.status === "active" && snapshot.context.waiting;
  if (waiting) store.keep(account.id, actor.getPersistedSnapshot(), route, now().getTime());
  else store.drop(account.id);
  actor.stop();
  const context = snapshot.context;
  const state: SignInState = waiting ? "waitingForOwner" : (context.state ?? "failed");
  const output = { save: context.save, stage: context.stage, code: context.code, detail: context.detail };
  return {
    accountId: account.id,
    account: account.name,
    platform: account.platform,
    route,
    state,
    stage: context.stage,
    code: state === "signedIn" ? null : context.code,
    detail: context.detail,
    save: context.save,
    check: context.recheck ?? context.check,
    next: signInNextStep(account, state, output),
  };
}

const STATE_WORDS: Record<SignInState, string> = {
  signedIn: "signed in",
  signInNeeded: "still needs signing in",
  stopped: "stopped (the platform refused)",
  failed: "sign-in failed",
  waitingForOwner: "waiting for the owner to sign in",
};

export function signInText(result: SignInResult): string {
  const why = result.state === "signedIn" || result.state === "waitingForOwner" ? "" : [result.code, result.detail].filter(Boolean).join(": ");
  const saved = result.save ? `\n  session: ${result.save.saved ? "saved from the browser" : `not saved (${result.save.code ?? "notSaved"})`}` : "";
  const next = result.next ? `\n  next: ${result.next.says}${result.next.cli ? `\n  ${result.next.cli}` : ""}` : "";
  return `${result.platform} ${result.account}: ${STATE_WORDS[result.state]} (by ${result.route})${why ? ` (${why})` : ""}${saved}${next}`;
}
