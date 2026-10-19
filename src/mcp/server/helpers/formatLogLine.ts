/** Where a line came from: the command's own output, or a Python process's stderr. */
export type LogStream = "out" | "err" | "worker" | "session";

/** One line of the live MCP log file: `<time> <tool> <stream> | <line>`. Pure. */
export function formatLogLine(at: string, tool: string, stream: LogStream, line: string): string {
  return `${at} ${tool} ${stream.padEnd(7)}| ${line}`;
}

/** `~/.logCli/mcp/2026-10-19.log`: one file per UTC day. Pure. */
export function logFileName(at: string): string {
  return `${at.slice(0, 10)}.log`;
}
