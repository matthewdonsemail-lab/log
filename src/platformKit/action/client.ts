import { createActor, toPromise } from "xstate";
import { actionMachine } from "./machine.ts";
import type { ActionActors, ActionOptions, ActionResult, Confirmation, GateVerdict, PartsOutcome } from "./types.ts";

export async function runAction<Held, Answer>(actors: ActionActors<Held, Answer>, options: ActionOptions = {}): Promise<ActionResult<Held, Answer>> {
  const actor = createActor(actionMachine(actors, options));
  const finished = toPromise(actor);
  actor.start();
  return (await finished) as ActionResult<Held, Answer>;
}

export function confirmAnswer(answer: { ok: boolean; code?: string; detail?: string }): Confirmation {
  return answer.ok ? { ok: true } : { ok: false, code: answer.code ?? "platformRefused", detail: answer.detail ?? "" };
}

export function confirmParts(parts: PartsOutcome): Confirmation {
  if (parts.movedOn || parts.interrupted) return { ok: false, code: "chatMovedOn", detail: `they wrote while it was being sent: ${parts.sent} of ${parts.total} sent` };
  if (parts.lost) return { ok: false, code: "chatClaimLost", detail: `the claim on this chat was lost: ${parts.sent} of ${parts.total} sent` };
  if (parts.sent === parts.total) return { ok: true };
  return confirmAnswer({ ok: false, code: parts.last?.code, detail: parts.last?.detail });
}

export const passGate = async (): Promise<GateVerdict<null>> => ({ ok: true, held: null });

export const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export function rethrowFailure<Held, Answer>(result: ActionResult<Held, Answer>): void {
  if (result.error !== undefined) throw result.error;
}
