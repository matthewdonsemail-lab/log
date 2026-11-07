#!/usr/bin/env bun
import "../src/config/userEnv/autoload.ts";
import { runFast } from "../src/cli/runner/client.ts";
import { appendLiveLine, liveLogDir } from "../src/observability/liveLog/index.ts";
import { setLogSink } from "../src/observability/processLog/index.ts";
import { msText, timeCall } from "../src/observability/timing/index.ts";

const argv = process.argv.slice(2);
const tool = `cli:${argv[0] ?? "help"}`;
const dir = liveLogDir();
appendLiveLine(dir, tool, "out", `▶ log ${argv.join(" ")}`);
setLogSink((entry) => {
  process.stderr.write(`${entry.line}\n`);
  appendLiveLine(dir, tool, entry.source, entry.line, entry.at);
});
const firstFlag = argv.findIndex((a) => a.startsWith("-"));
const words = (firstFlag < 0 ? argv : argv.slice(0, firstFlag)).slice(0, 3).join(" ");
const began = performance.now();
let callId = "";
const code = await timeCall(`cli ${words || "help"}`, async (call) => {
  callId = call.callId;
  const exit = await runFast(argv, {
    out: (line) => {
      console.log(line);
      appendLiveLine(dir, tool, "out", line);
    },
    err: (line) => {
      console.error(line);
      appendLiveLine(dir, tool, "err", line);
    },
  });
  call.attrs.exit = exit;
  return exit;
});
appendLiveLine(dir, tool, "out", `■ exit ${code} in ${msText(performance.now() - began)} (call ${callId})`);
process.exit(code);
