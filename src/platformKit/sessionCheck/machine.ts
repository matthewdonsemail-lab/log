import { assign, fromPromise, setup } from "xstate";
import type { CheckOutcome, CheckRun, CheckState, CheckStore, SessionCheckAccount, SessionReport, SessionToolCaller } from "./types.ts";

export interface CheckMachineDeps {
  store: CheckStore;
  callTool: SessionToolCaller;
  now: () => Date;
  pid: number;
  gate: (account: SessionCheckAccount, now: Date) => SessionReport | null;
  check: (account: SessionCheckAccount, callTool: SessionToolCaller, now: Date) => Promise<SessionReport>;
  failed: (account: SessionCheckAccount, error: unknown, now: Date) => SessionReport;
}

type GateOutput = { kind: "go" } | { kind: "refused"; report: SessionReport } | { kind: "busy"; holder: number };

interface CheckContext {
  account: SessionCheckAccount;
  report: SessionReport | null;
  holder: number | null;
  outcome: CheckOutcome | null;
}

function busyReport(account: SessionCheckAccount, holder: number, now: Date): SessionReport {
  return { id: account.id, platform: account.platform, account: account.name, verdict: "unknown", code: "accountCheckBusy", detail: `another check of this account is running (pid ${holder})`, httpStatus: null, checkedAt: now.toISOString(), next: null };
}

function stateOf(context: CheckContext): CheckState {
  if (context.outcome === "busy") return "checking";
  return context.report?.verdict ?? "unknown";
}

export function sessionCheckMachine(deps: CheckMachineDeps) {
  return setup({
    types: { context: {} as CheckContext, input: {} as { account: SessionCheckAccount }, output: {} as CheckRun },
    actors: {
      gate: fromPromise(async ({ input }: { input: SessionCheckAccount }): Promise<GateOutput> => {
        const now = deps.now();
        const refused = deps.gate(input, now);
        if (refused) return { kind: "refused", report: refused };
        const claim = deps.store.claim(input.id, deps.pid, now);
        return claim.claimed ? { kind: "go" } : { kind: "busy", holder: claim.holder };
      }),
      check: fromPromise(async ({ input }: { input: SessionCheckAccount }): Promise<SessionReport> => deps.check(input, deps.callTool, deps.now())),
      record: fromPromise(async ({ input }: { input: { account: SessionCheckAccount; report: SessionReport } }): Promise<void> => {
        deps.store.record(input.account.id, { state: input.report.verdict, code: input.report.code, checkedAt: input.report.checkedAt });
      }),
    },
    guards: {
      accountBusy: (_, output: GateOutput) => output.kind === "busy",
      gateRefused: (_, output: GateOutput) => output.kind === "refused",
    },
    actions: {
      keepGate: assign((_, output: GateOutput) => (output.kind === "refused" ? { report: output.report } : output.kind === "busy" ? { holder: output.holder } : {})),
      keepReport: assign((_, report: SessionReport) => ({ report })),
      keepFailure: assign(({ context }, error: unknown) => ({ report: deps.failed(context.account, error, deps.now()) })),
      noteBusy: assign(({ context }) => ({ report: busyReport(context.account, context.holder ?? 0, deps.now()) })),
      settle: assign((_, outcome: CheckOutcome) => ({ outcome })),
    },
  }).createMachine({
    id: "sessionCheck",
    initial: "gating",
    context: ({ input }) => ({ account: input.account, report: null, holder: null, outcome: null }),
    states: {
      gating: {
        invoke: {
          src: "gate",
          input: ({ context }) => context.account,
          onDone: [
            { guard: { type: "accountBusy", params: ({ event }: { event: { output: GateOutput } }) => event.output }, target: "busy", actions: { type: "keepGate", params: ({ event }) => event.output } },
            { guard: { type: "gateRefused", params: ({ event }: { event: { output: GateOutput } }) => event.output }, target: "refused", actions: { type: "keepGate", params: ({ event }) => event.output } },
            { target: "checking" },
          ],
          onError: { target: "failed", actions: { type: "keepFailure", params: ({ event }: { event: { error: unknown } }) => event.error } },
        },
      },
      checking: {
        invoke: {
          src: "check",
          input: ({ context }) => context.account,
          onDone: { target: "recording", actions: { type: "keepReport", params: ({ event }) => event.output } },
          onError: { target: "recording", actions: { type: "keepFailure", params: ({ event }: { event: { error: unknown } }) => event.error } },
        },
      },
      recording: {
        invoke: {
          src: "record",
          input: ({ context }) => ({ account: context.account, report: context.report as SessionReport }),
          onDone: { target: "done" },
          onError: { target: "failed" },
        },
      },
      done: { type: "final", entry: { type: "settle", params: "done" } },
      busy: { type: "final", entry: ["noteBusy", { type: "settle", params: "busy" }] },
      refused: { type: "final", entry: { type: "settle", params: "refused" } },
      failed: { type: "final", entry: { type: "settle", params: "failed" } },
    },
    output: ({ context }) => ({ outcome: context.outcome ?? "failed", state: stateOf(context), report: context.report ?? deps.failed(context.account, new Error("checkFailed"), deps.now()) }),
  });
}
