import type { InspectionEvent } from "xstate";
import type { TraceSink } from "../types.ts";
import { stateToPath } from "./stateToPath.ts";

/**
 * XState `inspect` callback -> trace lines. Keeps the process's own events
 * and child-actor results (`xstate.done.actor.check` shows as `check.done`),
 * and skips the rest of XState's internal `xstate.*` events.
 * `summarize` picks which context fields go on each state line.
 */
export function createInspector(
  sink: TraceSink,
  summarize: (context: unknown) => Record<string, unknown> = () => ({}),
  now: () => Date = () => new Date(),
) {
  const lastState = new Map<string, string>();
  return (inspection: InspectionEvent) => {
    const actor = (inspection.actorRef as { id?: string }).id ?? "actor";
    const at = now().toISOString();
    if (inspection.type === "@xstate.actor") {
      sink({ at, kind: "actor", actor });
    } else if (inspection.type === "@xstate.event") {
      const type = inspection.event.type;
      const child = type.match(/^xstate\.(done|error)\.actor\.(.+)$/);
      if (child) sink({ at, kind: "event", actor, event: `${child[2]}.${child[1]}` });
      else if (!type.startsWith("xstate.")) sink({ at, kind: "event", actor, event: type });
    } else if (inspection.type === "@xstate.snapshot") {
      const snapshot = inspection.snapshot as { value?: unknown; context?: unknown };
      if (snapshot.value === undefined) return;
      const state = stateToPath(snapshot.value as never);
      if (lastState.get(actor) === state) return;
      lastState.set(actor, state);
      sink({ at, kind: "state", actor, state, detail: summarize(snapshot.context) });
    }
  };
}
