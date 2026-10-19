import type { AnyStateMachine } from "xstate";

interface Node {
  key: string;
  type?: string;
  states?: Record<string, Node>;
  transitions?: Map<string, Edge[]>;
  always?: Edge[];
}

interface Edge {
  eventType: string;
  target?: { key: string }[];
  guard?: string | { type?: unknown } | ((...args: unknown[]) => unknown);
}

/** `xstate.done.actor.0.publish.openingForm` -> `done`. Pure. */
function eventLabel(eventType: string): string {
  if (eventType === "") return "always";
  if (eventType.startsWith("xstate.done.actor")) return "done";
  if (eventType.startsWith("xstate.error.actor")) return "error";
  const after = /^xstate\.after\.([^.]+)/.exec(eventType);
  if (after) return `after ${after[1]}`;
  return eventType;
}

function guardLabel(guard: Edge["guard"]): string {
  if (!guard) return "";
  if (typeof guard === "string") return guard;
  if (typeof guard === "function") return "guarded";
  return typeof guard.type === "string" ? guard.type : "guarded";
}

/**
 * A machine's top-level states and every transition between them, as a
 * Mermaid `stateDiagram-v2`, read from the machine definition itself so it
 * can't drift from the code. Edge labels are `event [guard]`. Pure.
 */
export function toMermaid(machine: AnyStateMachine): string {
  const root = machine.root as unknown as Node;
  const states = root.states ?? {};
  const lines = ["stateDiagram-v2", `  [*] --> ${String(machine.config.initial)}`];
  const seen = new Set<string>();
  for (const [name, node] of Object.entries(states)) {
    const edges = [...(node.transitions ? [...node.transitions.values()].flat() : []), ...(node.always ?? [])];
    for (const edge of edges) {
      for (const target of edge.target ?? []) {
        const guard = guardLabel(edge.guard);
        const label = `${eventLabel(edge.eventType)}${guard ? ` [${guard}]` : ""}`;
        const line = `  ${name} --> ${target.key}: ${label}`;
        if (!seen.has(line)) {
          seen.add(line);
          lines.push(line);
        }
      }
    }
    if (node.type === "final") lines.push(`  ${name} --> [*]`);
  }
  return lines.join("\n");
}
