/**
 * Spawns `python/logWorker.py`, the bridge into facebook-camofox-client. This
 * is the piece the seed-only CLI was missing: it launches a real Camoufox
 * browser. Ported from inferencesaver `scripts/facebook-client.mjs`, which
 * spawned the old `facebook-worker.py` the same way.
 *
 * `LOG_PYTHON` picks the interpreter (default `python`). The interpreter
 * must have facebook-camofox-client installed (`pip install -e`).
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { pipeProcessLog } from "../../observability/processLog/index.ts";
import { parseWorkerOutput } from "./helpers/index.ts";
import type { WorkerAction, WorkerClient, WorkerRequest, WorkerResult, WorkerRunOptions } from "./types.ts";

export const WORKER_PATH = fileURLToPath(new URL("../../../python/logWorker.py", import.meta.url));

export const runWorker: WorkerClient = <A extends WorkerAction>(
  request: WorkerRequest & { action: A },
  options: WorkerRunOptions = {},
): Promise<WorkerResult<A>> => {
  const python = process.env.LOG_PYTHON || "python";
  return new Promise((resolve) => {
    // stderr goes through processLog: live on the terminal, and into the MCP
    // tool result and log file when run as a tool.
    const proc = spawn(python, [WORKER_PATH, JSON.stringify(request)], {
      stdio: [options.interactive ? "inherit" : "ignore", "pipe", "pipe"],
    });
    pipeProcessLog(proc.stderr, "worker");
    let stdout = "";
    proc.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    proc.on("error", (error) =>
      resolve({ ok: false, code: "workerNotStarted", detail: `could not start ${python}: ${error.message}. Set LOG_PYTHON.` }),
    );
    proc.on("close", (code) => resolve(parseWorkerOutput(stdout, code ?? -1) as WorkerResult<A>));
  });
};
