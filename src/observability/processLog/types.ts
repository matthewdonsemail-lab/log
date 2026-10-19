/**
 * Live log lines from the Python processes (the worker and the publish
 * session): every step they take, each browser action, each auto-login move.
 * They never carry credentials (the Python logs actions only).
 */

/** Which process a line came from. */
export type LogSource = "worker" | "session";

export interface LogLine {
  source: LogSource;
  line: string;
  /** ISO time the line arrived. */
  at: string;
}

/** Where lines go. The default writes them to this process's stderr, as before. */
export type LogSink = (entry: LogLine) => void;
