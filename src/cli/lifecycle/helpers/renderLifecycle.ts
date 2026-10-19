import type { AccountStanding } from "../../../marketplace/lifecycle/index.ts";

export interface LifecycleRow {
  accountName: string;
  status: string | null;
  state: string;
  stored: string | null;
  left: string[];
}

/** One line per account: its status, where its lifecycle is, what onboarding has left. Pure. */
export function renderLifecycleTable(rows: LifecycleRow[]): string {
  const lines = ["Account                               Status       Lifecycle                     Left"];
  for (const r of rows) {
    const stored = r.stored && r.stored !== r.state ? ` (Twenty: ${r.stored})` : "";
    lines.push(`${r.accountName.padEnd(37)} ${String(r.status ?? "unset").padEnd(12)} ${r.state.padEnd(29)} ${r.left.join(", ") || "-"}${stored}`);
  }
  return lines.join("\n");
}

/** A node of the machine's definition, as much of XState's StateNode as is read here. */
interface Node {
  key: string;
  id: string;
  type: string;
  states: Record<string, Node>;
  invoke: { src: unknown }[];
  on: Record<string, { target?: Node[] }[]>;
  always: { target?: Node[] }[];
  after: { delay: unknown; target?: Node[] }[];
}

const short = (id: string) => id.replace(/^lifecycle\./, "");
const targets = (t: { target?: Node[] }[] | undefined) =>
  [...new Set((t ?? []).flatMap((x) => (x.target ?? []).map((n) => short(n.id))))].join(" | ");

/**
 * The machine's own definition as an indented tree: each state, what it runs,
 * its events, its automatic moves and timers. Generated, so the doc never
 * drifts from the code. Pure.
 */
export function renderStateTree(root: Node, depth = 0): string[] {
  const lines: string[] = [];
  for (const node of Object.values(root.states ?? {})) {
    const pad = "  ".repeat(depth);
    const kind = node.type === "final" ? " (final)" : "";
    const runs = (node.invoke ?? []).map((i) => (typeof i.src === "string" ? i.src : "")).filter(Boolean);
    lines.push(`${pad}- **${node.key}**${kind}${runs.length ? `: runs \`${runs.join("`, `")}\`` : ""}`);
    for (const [event, list] of Object.entries(node.on ?? {})) {
      if (event.startsWith("xstate.") && !event.startsWith("xstate.done") && !event.startsWith("xstate.after")) continue;
      const to = targets(list as { target?: Node[] }[]);
      if (!to) continue;
      const label = event.startsWith("xstate.done.actor") ? "done" : event.startsWith("xstate.error") ? "error" : event.startsWith("xstate.after") ? `after ${event.split(".")[2]?.split("|")[0]}` : event;
      lines.push(`${pad}  - ${label} → ${to}`);
    }
    const always = targets(node.always);
    if (always) lines.push(`${pad}  - then → ${always}`);
    lines.push(...renderStateTree(node, depth + 1));
  }
  return lines;
}

export function standingLine(s: AccountStanding): string {
  return Object.entries(s)
    .filter(([k]) => k !== "accountId")
    .map(([k, v]) => `${k}=${v ?? "-"}`)
    .join(" ");
}
