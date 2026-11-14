import { assign, fromPromise, setup } from "xstate";
import type { SessionReport } from "../sessionCheck/index.ts";
import type { OwnerWait, SaveOutcome, SignInAccount, SignInActors, SignInFinalState, SignInInput, SignInMachineOutput, SignInRoute, SignInStage } from "./types.ts";

interface SignInContext {
  account: SignInAccount;
  route: SignInRoute;
  finish: boolean;
  startedAt: string;
  stage: SignInStage;
  state: SignInFinalState | null;
  waiting: boolean;
  check: SessionReport | null;
  save: SaveOutcome | null;
  recheck: SessionReport | null;
  code: string | null;
  detail: string | null;
}

type SignInEvent = { type: "resume"; finish: boolean };

function missing(name: string): never {
  throw new Error(`signInActorMissing: ${name}`);
}

const placeholders = {
  check: fromPromise(async ({ input }: { input: SignInAccount }): Promise<SessionReport> => missing(`check ${input.name}`)),
  open: fromPromise(async ({ input }: { input: SignInAccount }): Promise<void> => missing(`open ${input.name}`)),
  waitForOwner: fromPromise(async ({ input }: { input: { account: SignInAccount; finish: boolean } }): Promise<OwnerWait> => missing(`waitForOwner ${input.account.name}`)),
  save: fromPromise(async ({ input }: { input: { account: SignInAccount; since: string } }): Promise<SaveOutcome> => missing(`save ${input.account.name}`)),
  recheck: fromPromise(async ({ input }: { input: SignInAccount }): Promise<SessionReport> => missing(`recheck ${input.name}`)),
};

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));
const errorCode = (error: unknown) => /^([a-z][A-Za-z]+)(:|$)/.exec(errorText(error))?.[1] ?? "signInFailed";

export const signInMachine = setup({
  types: { context: {} as SignInContext, input: {} as SignInInput, events: {} as SignInEvent, output: {} as SignInMachineOutput },
  actors: placeholders,
  guards: {
    alreadySignedIn: (_, report: SessionReport) => report.verdict === "signedIn",
    platformStopped: (_, report: SessionReport) => report.verdict === "stopped",
    accountOutOfUse: (_, report: SessionReport) => report.verdict === "skipped" && report.code === "accountDeactivated",
    browserRoute: ({ context }) => context.route === "browser",
    ownerFinished: (_, wait: OwnerWait) => wait.finished,
    sessionSaved: (_, outcome: SaveOutcome) => outcome.saved,
    recheckSignedIn: ({ context }, report: SessionReport) => report.verdict === "signedIn" || (report.verdict === "skipped" && report.code !== "accountDeactivated" && context.save?.saved === true),
  },
  actions: {
    enter: assign((_, stage: SignInStage) => ({ stage, waiting: false })),
    keepCheck: assign((_, report: SessionReport) => ({ check: report, code: report.code, detail: report.detail })),
    keepSave: assign((_, outcome: SaveOutcome) => ({ save: outcome, code: outcome.code, detail: outcome.detail })),
    keepRecheck: assign((_, report: SessionReport) => ({ recheck: report, code: report.code, detail: report.detail })),
    keepError: assign((_, error: unknown) => ({ code: errorCode(error), detail: errorText(error).slice(0, 300) })),
    markWaiting: assign({ waiting: true }),
    takeResume: assign((_, event: SignInEvent) => ({ finish: event.finish, waiting: false })),
    settle: assign((_, state: SignInFinalState) => ({ state })),
  },
}).createMachine({
  id: "signIn",
  initial: "checking",
  context: ({ input }) => ({ account: input.account, route: input.route, finish: input.finish, startedAt: input.startedAt, stage: "checking", state: null, waiting: false, check: null, save: null, recheck: null, code: null, detail: null }),
  states: {
    checking: {
      entry: { type: "enter", params: "checking" },
      invoke: {
        src: "check",
        input: ({ context }) => context.account,
        onDone: [
          { guard: { type: "alreadySignedIn", params: ({ event }: { event: { output: SessionReport } }) => event.output }, target: "signedIn", actions: { type: "keepCheck", params: ({ event }) => event.output } },
          { guard: { type: "platformStopped", params: ({ event }: { event: { output: SessionReport } }) => event.output }, target: "stopped", actions: { type: "keepCheck", params: ({ event }) => event.output } },
          { guard: { type: "accountOutOfUse", params: ({ event }: { event: { output: SessionReport } }) => event.output }, target: "failed", actions: { type: "keepCheck", params: ({ event }) => event.output } },
          { guard: "browserRoute", target: "opening", actions: { type: "keepCheck", params: ({ event }) => event.output } },
          { target: "saving", actions: { type: "keepCheck", params: ({ event }) => event.output } },
        ],
        onError: { target: "failed", actions: { type: "keepError", params: ({ event }: { event: { error: unknown } }) => event.error } },
      },
    },
    opening: {
      entry: { type: "enter", params: "opening" },
      invoke: {
        src: "open",
        input: ({ context }) => context.account,
        onDone: { target: "waitingForOwner" },
        onError: { target: "failed", actions: { type: "keepError", params: ({ event }: { event: { error: unknown } }) => event.error } },
      },
    },
    waitingForOwner: {
      entry: { type: "enter", params: "waitingForOwner" },
      on: { resume: { target: "waitingForOwner", reenter: true, actions: { type: "takeResume", params: ({ event }) => event } } },
      invoke: {
        src: "waitForOwner",
        input: ({ context }) => ({ account: context.account, finish: context.finish }),
        onDone: [{ guard: { type: "ownerFinished", params: ({ event }: { event: { output: OwnerWait } }) => event.output }, target: "saving" }, { actions: "markWaiting" }],
        onError: { target: "failed", actions: { type: "keepError", params: ({ event }: { event: { error: unknown } }) => event.error } },
      },
    },
    saving: {
      entry: { type: "enter", params: "saving" },
      invoke: {
        src: "save",
        input: ({ context }) => ({ account: context.account, since: context.startedAt }),
        onDone: [
          { guard: { type: "sessionSaved", params: ({ event }: { event: { output: SaveOutcome } }) => event.output }, target: "rechecking", actions: { type: "keepSave", params: ({ event }) => event.output } },
          { target: "signInNeeded", actions: { type: "keepSave", params: ({ event }) => event.output } },
        ],
        onError: { target: "failed", actions: { type: "keepError", params: ({ event }: { event: { error: unknown } }) => event.error } },
      },
    },
    rechecking: {
      entry: { type: "enter", params: "rechecking" },
      invoke: {
        src: "recheck",
        input: ({ context }) => context.account,
        onDone: [
          { guard: { type: "recheckSignedIn", params: ({ event }: { event: { output: SessionReport } }) => event.output }, target: "signedIn", actions: { type: "keepRecheck", params: ({ event }) => event.output } },
          { guard: { type: "platformStopped", params: ({ event }: { event: { output: SessionReport } }) => event.output }, target: "stopped", actions: { type: "keepRecheck", params: ({ event }) => event.output } },
          { target: "signInNeeded", actions: { type: "keepRecheck", params: ({ event }) => event.output } },
        ],
        onError: { target: "failed", actions: { type: "keepError", params: ({ event }: { event: { error: unknown } }) => event.error } },
      },
    },
    signedIn: { type: "final", entry: { type: "settle", params: "signedIn" } },
    signInNeeded: { type: "final", entry: { type: "settle", params: "signInNeeded" } },
    stopped: { type: "final", entry: { type: "settle", params: "stopped" } },
    failed: { type: "final", entry: { type: "settle", params: "failed" } },
  },
  output: ({ context }) => ({ state: context.state ?? "failed", stage: context.stage, check: context.check, save: context.save, recheck: context.recheck, code: context.code, detail: context.detail }),
});

export function signInMachineWith(actors: SignInActors) {
  return signInMachine.provide({
    actors: {
      check: fromPromise(async ({ input }: { input: SignInAccount }) => actors.check(input)),
      open: fromPromise(async ({ input }: { input: SignInAccount }) => actors.open(input)),
      waitForOwner: fromPromise(async ({ input }: { input: { account: SignInAccount; finish: boolean } }) => actors.waitForOwner(input.account, input.finish)),
      save: fromPromise(async ({ input }: { input: { account: SignInAccount; since: string } }) => actors.save(input.account, input.since)),
      recheck: fromPromise(async ({ input }: { input: SignInAccount }) => actors.recheck(input)),
    },
  });
}
