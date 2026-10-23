#!/usr/bin/env bun
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
