import { assign, fromPromise, setup } from "xstate";
import { checkSession } from "../../platformKit/sessionCheck/index.ts";
import type { SessionVerdict } from "../../platformKit/sessionCheck/index.ts";
import type { CheckAccount, CheckRecorder, CheckResult, CheckToolCaller } from "./types.ts";

export function checkStateOfVerdict(verdict: SessionVerdict): CheckResult["state"] {
  if (verdict === "signedIn") return "succeeded";
  if (verdict === "signInNeeded") return "signInNeeded";
  if (verdict === "stopped") return "stopped";
  return "unknown";
}

export interface CheckTask {
  account: CheckAccount;
  resolve: (result: CheckResult) => void;
}

export function sessionCheckTool(platform: string): string {
  return `${platform}SessionCheck`;
}

export function checkStateOf(answer: { isError?: boolean; structuredContent?: unknown }): CheckResult["state"] {
  const content = answer.structuredContent && typeof answer.structuredContent === "object" && !Array.isArray(answer.structuredContent) ? (answer.structuredContent as { ok?: unknown; job?: unknown }) : undefined;
  if (content?.job) return "unknown";
  if (answer.isError || content?.ok === false) return "stopped";
  return content?.ok === true ? "succeeded" : "unknown";
}

export function accountCheckMachine(callTool: CheckToolCaller, record: CheckRecorder) {
  return setup({
    types: { context: {} as { task: CheckTask | null }, events: {} as { type: "check"; task: CheckTask } },
    actors: {
      check: fromPromise(async ({ input }: { input: CheckTask }): Promise<CheckResult> => {
        record(input.account.id, "running");
        const session = await checkSession({ id: input.account.id, name: input.account.name, platform: input.account.platform }, callTool);
        const state = checkStateOfVerdict(session.verdict);
        record(input.account.id, state);
        return { state, session };
      }),
    },
  }).createMachine({
    id: "consoleAccountCheck",
    initial: "idle",
    context: { task: null },
    states: {
      idle: { on: { check: { target: "checking", actions: assign({ task: ({ event }) => event.task }) } } },
      checking: {
        invoke: {
          src: "check",
          input: ({ context }) => context.task as CheckTask,
          onDone: { target: "idle", actions: [({ context, event }) => context.task?.resolve(event.output), assign({ task: null })] },
          onError: { target: "idle", actions: [({ context }) => context.task?.resolve({ state: "unavailable" }), assign({ task: null })] },
        },
      },
    },
  });
}
