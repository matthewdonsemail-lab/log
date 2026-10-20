#!/usr/bin/env bun
/**
 * log CLI entrypoint.
 *
 * A thin wrapper on purpose: argument parsing, command dispatch, and all
 * behaviour live in the `cli` domain so they can be tested without spawning a
 * process. It only adds the live log (rule 26): every line this run prints,
 * and every line its Python writes, also goes to `~/.logCli/mcp/<day>.log`,
 * the file the MCP server writes, so one Monitor shows a run however it started.
 */
import { runCli } from "../src/cli/runner/index.ts";
import { appendLiveLine, liveLogDir } from "../src/observability/liveLog/index.ts";
import { setLogSink } from "../src/observability/processLog/index.ts";

const argv = process.argv.slice(2);
const tool = `cli:${argv[0] ?? "help"}`;
const dir = liveLogDir();
appendLiveLine(dir, tool, "out", `▶ log ${argv.join(" ")}`);
setLogSink((entry) => {
  process.stderr.write(`${entry.line}\n`);
  appendLiveLine(dir, tool, entry.source, entry.line, entry.at);
});
const code = await runCli(argv, {
  out: (line) => {
    console.log(line);
    appendLiveLine(dir, tool, "out", line);
  },
  err: (line) => {
    console.error(line);
    appendLiveLine(dir, tool, "err", line);
  },
});
appendLiveLine(dir, tool, "out", `■ exit ${code}`);
process.exit(code);
