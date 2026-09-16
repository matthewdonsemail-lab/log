import { createActor, type AnyActorLogic } from 'xstate'

export interface DrivenSnapshot<TValue, TContext> {
  value: TValue
  context: TContext
}

/**
 * Run platform-machine events without a standing actor: build from input,
 * send the events in order, snapshot, stop. The mock store drives every
 * mutation through this so each request is a pure input → snapshot
 * function of the persisted row — no cross-request actor leaks, no hanging
 * clients. Tests use the same helper, so store and spec execute identical
 * transitions.
 */
export function driveMachine<TValue, TContext>(
  logic: AnyActorLogic,
  input: unknown,
  events: Array<{ type: string; [key: string]: unknown }>
): DrivenSnapshot<TValue, TContext> {
  const actor = createActor(logic, { input })
  actor.start()
  try {
    for (const event of events) actor.send(event)
    const snapshot = actor.getSnapshot() as { value: TValue; context: TContext }
    return { value: snapshot.value, context: snapshot.context }
  } finally {
    actor.stop()
  }
}
