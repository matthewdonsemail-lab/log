import { assign, fromPromise, setup } from "xstate";
import type { WatcherActors, WatcherClaim, WatcherEnd, WatcherEvent, WatcherOptions, WatcherRun, WatcherState } from "./types.ts";

interface WatcherContext<Result> {
  state: WatcherState;
  end: WatcherEnd;
  code: string | null;
  holder?: number;
  generation?: number;
  result?: Result;
  error?: unknown;
}

export function accountWatcherMachine<Result>(actors: WatcherActors<Result>, options: WatcherOptions = {}) {
  type Context = WatcherContext<Result>;
  const entered = (state: WatcherState) => [{ type: "settle" as const, params: state }, { type: "noteState" as const, params: state }];
  return setup({
    types: { context: {} as Context, events: {} as WatcherEvent, output: {} as WatcherRun<Result> },
    actors: {
      claim: fromPromise(async (): Promise<WatcherClaim> => actors.claim()),
      connect: fromPromise(async (): Promise<Result> => actors.connect()),
      catchUp: fromPromise(async (): Promise<void> => actors.catchUp()),
      release: fromPromise(async ({ input }: { input: { end: WatcherEnd; code: string | null } }): Promise<void> => actors.release(input.end, input.code)),
    },
    guards: {
      claimRefused: (_, claim: WatcherClaim) => !claim.ok,
      endedAs: ({ context }, end: WatcherEnd) => context.end === end,
      behind: () => actors.behind(),
    },
    actions: {
      noteState: (_, state: WatcherState) => options.onState?.(state),
      settle: assign((_, state: WatcherState) => ({ state })),
      keepClaim: assign((_, claim: WatcherClaim) => (claim.ok ? { generation: claim.generation } : { holder: claim.holder })),
      keepResult: assign((_, result: Result) => {
        const ended = actors.endOf(result);
        return { result, end: ended.end, code: ended.code };
      }),
      keepFailure: assign(({ context }, error: unknown) => (context.error === undefined ? { error, end: "failed" as const, code: context.code ?? "watcherFailed" } : { end: "failed" as const })),
    },
  }).createMachine({
    id: "accountWatcher",
    initial: "starting",
    context: { state: "starting", end: "stopped", code: null },
    states: {
      starting: {
        entry: entered("starting"),
        invoke: {
          src: "claim",
          onDone: [
            { guard: { type: "claimRefused", params: ({ event }: { event: { output: WatcherClaim } }) => event.output }, target: "busy", actions: { type: "keepClaim", params: ({ event }) => event.output } },
            { target: "running", actions: { type: "keepClaim", params: ({ event }) => event.output } },
          ],
          onError: { target: "failed", actions: { type: "keepFailure", params: ({ event }: { event: { error: unknown } }) => event.error } },
        },
      },
      running: {
        initial: "catchingUp",
        invoke: {
          src: "connect",
          onDone: { target: "releasing", actions: { type: "keepResult", params: ({ event }: { event: { output: Result } }) => event.output } },
          onError: { target: "releasing", actions: { type: "keepFailure", params: ({ event }: { event: { error: unknown } }) => event.error } },
        },
        states: {
          catchingUp: {
            entry: entered("catchingUp"),
            invoke: { src: "catchUp", onDone: { target: "live" }, onError: { target: "live" } },
            on: { dropped: { target: "reconnecting" } },
          },
          live: {
            entry: entered("live"),
            on: { dropped: { target: "reconnecting" }, opened: { target: "catchingUp" }, recheck: { guard: "behind", target: "catchingUp" } },
          },
          reconnecting: {
            entry: entered("reconnecting"),
            on: { opened: { target: "catchingUp" }, heard: { target: "catchingUp" }, recheck: { guard: "behind", target: "catchingUp" } },
          },
        },
      },
      releasing: {
        invoke: {
          src: "release",
          input: ({ context }) => ({ end: context.end, code: context.code }),
          onDone: [
            { guard: { type: "endedAs", params: "signInNeeded" }, target: "signInNeeded" },
            { guard: { type: "endedAs", params: "coolingDown" }, target: "coolingDown" },
            { guard: { type: "endedAs", params: "failed" }, target: "failed" },
            { target: "stopped" },
          ],
          onError: { target: "failed", actions: { type: "keepFailure", params: ({ event }: { event: { error: unknown } }) => event.error } },
        },
      },
      busy: { type: "final", entry: entered("busy") },
      stopped: { type: "final", entry: entered("stopped") },
      signInNeeded: { type: "final", entry: entered("signInNeeded") },
      coolingDown: { type: "final", entry: entered("coolingDown") },
      failed: { type: "final", entry: entered("failed") },
    },
    output: ({ context }) => ({
      state: context.state,
      code: context.code,
      ...(context.holder !== undefined ? { holder: context.holder } : {}),
      ...(context.generation !== undefined ? { generation: context.generation } : {}),
      ...(context.result !== undefined ? { result: context.result } : {}),
      ...(context.error !== undefined ? { error: context.error } : {}),
    }),
  });
}
