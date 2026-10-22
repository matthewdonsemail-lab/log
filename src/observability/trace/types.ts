export interface TraceLine {
  at: string;
  kind: "event" | "state" | "actor";
  actor: string;
  event?: string;
  state?: string;
  detail?: Record<string, unknown>;
}

export type TraceSink = (line: TraceLine) => void;
