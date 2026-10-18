/** One observable step of a running XState actor, as the CLI prints it. */
export interface TraceLine {
  /** ISO time the step was seen. */
  at: string;
  /** `event` = something was sent; `state` = the actor moved; `actor` = an actor started. */
  kind: "event" | "state" | "actor";
  /** Actor id, e.g. `relist` or `relist.check`. */
  actor: string;
  /** Event type, for `event` lines. */
  event?: string;
  /** State value as a dotted path, for `state` lines. */
  state?: string;
  /** Short context summary for `state` lines. */
  detail?: Record<string, unknown>;
}

export type TraceSink = (line: TraceLine) => void;
