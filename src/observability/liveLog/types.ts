/** Where a line came from: the command's own output, or a Python process's stderr. */
export type LogStream = "out" | "err" | "worker" | "session";
