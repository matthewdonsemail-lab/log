export type LogSource = "worker" | "session";

export interface LogLine {
  source: LogSource;
  line: string;
  at: string;
}

export type LogSink = (entry: LogLine) => void;
