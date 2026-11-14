import { assign, fromPromise, setup } from "xstate";
import type { ActionActors, ActionOptions, ActionOutcome, ActionResult, ActionStage, Confirmation, GateVerdict } from "./types.ts";

interface ActionContext<Held, Answer> {
  stage: ActionStage;
  outcome: ActionOutcome | null;
  held?: Held;
  answer?: Answer;
  code?: string;
  detail?: string;
  error?: unknown;
}

export function actionMachine<Held, Answer>(actors: ActionActors<Held, Answer>, options: ActionOptions = {}) {
  type Context = ActionContext<Held, Answer>;
  return setup({
    types: { context: {} as Context, output: {} as ActionResult<Held, Answer> },
    actors: {
      gate: fromPromise(async (): Promise<GateVerdict<Held>> => actors.gate()),
      act: fromPromise(async ({ input }: { input: { held: Held } }): Promise<Answer> => actors.act(input.held)),
      confirm: fromPromise(async ({ input }: { input: { held: Held; answer: Answer } }): Promise<Confirmation> => actors.confirm(input.answer, input.held)),
    },
    guards: {
      gatePassed: (_, verdict: GateVerdict<Held>) => verdict.ok,
      platformConfirmed: (_, confirmation: Confirmation) => confirmation.ok,
    },
    actions: {
      noteStage: (_, stage: ActionStage) => options.onStage?.(stage),
      keepHeld: assign((_, verdict: GateVerdict<Held>) => (verdict.ok ? { held: verdict.held } : {})),
      keepAnswer: assign((_, answer: Answer) => ({ answer })),
      keepRefusal: assign((_, refusal: GateVerdict<Held> | Confirmation) => (refusal.ok ? {} : { code: refusal.code, detail: refusal.detail })),
      keepError: assign((_, error: unknown) => ({ error })),
      settle: assign((_, outcome: ActionOutcome) => ({ outcome })),
    },
  }).createMachine({
    id: "platformAction",
    initial: "gating",
    context: { stage: "gating", outcome: null },
    states: {
      gating: {
        entry: [assign({ stage: "gating" }), { type: "noteStage", params: "gating" }],
        invoke: {
          src: "gate",
          onDone: [
            { guard: { type: "gatePassed", params: ({ event }: { event: { output: GateVerdict<Held> } }) => event.output }, target: "acting", actions: { type: "keepHeld", params: ({ event }) => event.output } },
            { target: "refused", actions: { type: "keepRefusal", params: ({ event }: { event: { output: GateVerdict<Held> } }) => event.output } },
          ],
          onError: { target: "refused", actions: { type: "keepError", params: ({ event }: { event: { error: unknown } }) => event.error } },
        },
      },
      acting: {
        entry: [assign({ stage: "acting" }), { type: "noteStage", params: "acting" }],
        invoke: {
          src: "act",
          input: ({ context }) => ({ held: context.held as Held }),
          onDone: { target: "confirming", actions: { type: "keepAnswer", params: ({ event }) => event.output } },
          onError: { target: "uncertain", actions: { type: "keepError", params: ({ event }: { event: { error: unknown } }) => event.error } },
        },
      },
      confirming: {
        entry: [assign({ stage: "confirming" }), { type: "noteStage", params: "confirming" }],
        invoke: {
          src: "confirm",
          input: ({ context }) => ({ held: context.held as Held, answer: context.answer as Answer }),
          onDone: [
            { guard: { type: "platformConfirmed", params: ({ event }: { event: { output: Confirmation } }) => event.output }, target: "done" },
            { target: "refused", actions: { type: "keepRefusal", params: ({ event }: { event: { output: Confirmation } }) => event.output } },
          ],
          onError: { target: "uncertain", actions: { type: "keepError", params: ({ event }: { event: { error: unknown } }) => event.error } },
        },
      },
      done: { type: "final", entry: { type: "settle", params: "done" } },
      refused: { type: "final", entry: { type: "settle", params: "refused" } },
      uncertain: { type: "final", entry: { type: "settle", params: "uncertain" } },
    },
    output: ({ context }) => ({
      outcome: context.outcome ?? "uncertain",
      stage: context.stage,
      ...(context.held !== undefined ? { held: context.held } : {}),
      ...(context.answer !== undefined ? { answer: context.answer } : {}),
      ...(context.code !== undefined ? { code: context.code, detail: context.detail } : {}),
      ...(context.error !== undefined ? { error: context.error } : {}),
    }),
  });
}
