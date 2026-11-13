import { createActor, toPromise } from "xstate";
import { actionMachine } from "./machine.ts";
import type { ActionActors, ActionOptions, ActionResult, Confirmation } from "./types.ts";

export async function runAction<Held, Answer>(actors: ActionActors<Held, Answer>, options: ActionOptions = {}): Promise<ActionResult<Held, Answer>> {
  const actor = createActor(actionMachine(actors, options));
  const finished = toPromise(actor);
  actor.start();
  return (await finished) as ActionResult<Held, Answer>;
}

export function confirmAnswer(answer: { ok: boolean; code?: string; detail?: string }): Confirmation {
  return answer.ok ? { ok: true } : { ok: false, code: answer.code ?? "platformRefused", detail: answer.detail ?? "" };
}

export function rethrowFailure<Held, Answer>(result: ActionResult<Held, Answer>): void {
  if (result.error !== undefined) throw result.error;
}
