import { DEFAULT_STATUS_WAIT_MS, jobView, listJobs, readJob, requestCancel, waitForJob } from "../../mcp/jobs/index.ts";
import type { JobView } from "../../mcp/jobs/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const JOB_USAGE = [
  "Usage: log job status <jobId> [--afterLine <n>] [--waitMs <ms>] [--json]   (a long MCP run: its status, the lines after afterLine, and its result once it ends; waits up to waitMs, default 10000, for something new)",
  "       log job cancel <jobId>   (stops it at its next browser step; never once Publish is clicked, rule 10)",
  "       log job list [--json]   (the latest jobs)",
].join("\n");

const JOB_ID = { name: "jobId", kind: "string", required: true, description: "The job's id, from the call that started it" } as const;

export const JOB_INPUT: CommandInput = {
  forms: [
    {
      words: ["status"],
      summary: "A long run's status, the lines after afterLine, and its result once it ends",
      positionals: [JOB_ID],
      flags: [
        { name: "afterLine", kind: "integer", description: "How many progress lines you already have (the last call's afterLine)" },
        { name: "waitMs", kind: "integer", description: "How long to wait for a new line or the end, in ms (default 10000, at most 50000)" },
        JSON_FLAG,
      ],
    },
    { words: ["cancel"], effect: "write", summary: "Stop a long run at its next browser step", positionals: [JOB_ID], flags: [] },
    { words: ["list"], summary: "The latest jobs", positionals: [], flags: [JSON_FLAG] },
  ],
};

export function renderJob(view: JobView): string {
  const head = `Job ${view.id} (${view.tool}${view.account ? `, ${view.account}` : ""}): ${view.status}${view.cancelRequested && view.status === "running" ? ", stopping at its next browser step" : ""}, started ${view.startedAt}${view.endedAt ? `, ended ${view.endedAt}` : ""}.`;
  const lines = view.progress.map((p) => `${p.at.slice(11, 19)}  ${p.line}`);
  const tail = view.status === "running" ? [`Still running: call again with afterLine ${view.afterLine}.`] : view.status === "lost" ? ["Lost: the server that ran it stopped before it ended. Its lines are above; read where the browser is (browsers) before running it again."] : view.text ? ["", view.text] : [];
  return [head, ...lines, ...tail].join("\n");
}

const int = (value: string | true | undefined, fallback: number) => (typeof value === "string" && /^\d+$/.test(value) ? Number(value) : fallback);

export const jobCommand: Command = {
  usage: JOB_USAGE,
  platform: "any",
  name: "job",
  effect: "read",
  input: JOB_INPUT,
  summary: "Follow or stop a long MCP run: each runs as a job when it outlasts its call's wait",
  args: "status <jobId> [--afterLine <n>] [--waitMs <ms>] | cancel <jobId> | list",
  async run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(JOB_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log job: ${parsed.error}\n${JOB_USAGE}` };
    const [sub, id, ...rest] = parsed.positionals;
    if (rest.length) return { code: 1, stderr: `log job: unexpected argument "${rest[0]}"\n${JOB_USAGE}` };
    if (sub === "list") {
      const views = listJobs().slice(0, 20).map((r) => jobView(r, Number.MAX_SAFE_INTEGER));
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ jobs: views }, null, 2) };
      return { code: 0, stdout: views.length ? views.map((v) => `${v.id}  ${v.status.padEnd(9)}  ${v.tool}${v.account ? `  ${v.account}` : ""}  ${v.startedAt}`).join("\n") : "No jobs yet." };
    }
    if (!id) return { code: 1, stderr: `log job: the job's id is needed\n${JOB_USAGE}` };
    if (sub === "cancel") {
      const verdict = requestCancel(id);
      if (!verdict.ok) return { code: 1, stderr: `log job cancel: ${verdict.message}` };
      return { code: 0, stdout: `Job ${id} (${verdict.record.tool}) will stop at its next browser step. Follow it with log job status ${id}.` };
    }
    if (sub !== "status") return { code: 1, stderr: `log job: pick status, cancel or list\n${JOB_USAGE}` };
    if (!readJob(id)) return { code: 1, stderr: `log job status: no job ${id}` };
    const view = await waitForJob(id, int(parsed.flags["afterLine"], 0), int(parsed.flags["waitMs"], DEFAULT_STATUS_WAIT_MS));
    if (!view) return { code: 1, stderr: `log job status: no job ${id}` };
    if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ job: view }, null, 2) };
    return { code: 0, stdout: renderJob(view) };
  },
};
