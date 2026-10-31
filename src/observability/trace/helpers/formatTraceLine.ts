import type { TraceLine } from "../types.ts";

export function formatTraceLine(line: TraceLine): string {
  const time = line.at.slice(11, 19);
  const what = line.kind === "event" ? line.event : line.kind === "state" ? line.state : "started";
  const detail = line.detail && Object.keys(line.detail).length > 0 ? `  ${JSON.stringify(line.detail)}` : "";
  return `${time}  ${line.actor.padEnd(18)}  ${line.kind.padEnd(5)}  ${what}${detail}`;
}
