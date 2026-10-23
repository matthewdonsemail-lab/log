import type { StateValue } from "xstate";

export function stateToPath(value: StateValue): string {
  if (typeof value === "string") return value;
  return Object.entries(value)
    .map(([key, child]) => (child === undefined ? key : `${key}.${stateToPath(child as StateValue)}`))
    .join(",");
}
