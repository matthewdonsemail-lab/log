import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clearCurrentInspect, writeCurrentInspect } from "../../browser/inspect/index.ts";
import type { CurrentInspect } from "../../browser/inspect/index.ts";
import type { WorkerClient } from "../../camofox/worker/index.ts";
import { emitLog } from "../../observability/processLog/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runToolCall } from "../server/index.ts";
import { accountOfArgv, appendProgress, busyJob, finishJob, jobView, readJob, requestCancel, startJob, statusOf } from "./index.ts";

const doctorReply = { ok: true, checks: { python: "3.12", facebookCamofoxClient: "/fcc", camoufoxBrowser: "/c.exe", camoufoxVersion: "1" } };
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const structured = (result: Awaited<ReturnType<typeof runToolCall>>) => result.structuredContent as { exit: number; job?: { id: string; status: string; afterLine: number }; json?: unknown };
const textOf = (result: Awaited<ReturnType<typeof runToolCall>>) => (result.content as { text: string }[])[0].text;

describe("a long run outlasting its call becomes a job (Duet plan step 4)", () => {
  test("it comes back running with its job id; jobStatus follows its lines and returns the result when it ends", async () => {
    const worker = (async () => {
      emitLog("worker", "Opening the browser through the proxy");
      await sleep(400);
      emitLog("worker", "Self-check passed");
      return doctorReply;
    }) as unknown as WorkerClient;
    const context = { twenty: marketplaceFixture(), worker };
    const started = await runToolCall("doctor", { args: ["--json"], waitMs: 50 }, context, () => {}, () => []);
    const handle = structured(started);
    expect(handle.exit).toBe(-1);
    expect(handle.job?.status).toBe("running");
    expect(textOf(started)).toContain(`jobStatus { jobId: "${handle.job!.id}"`);
    const first = await runToolCall("jobStatus", { jobId: handle.job!.id, afterLine: 0, waitMs: 5000, json: true }, context, () => {}, () => []);
    const view = (structured(first).json as { job: { status: string; progress: { line: string }[]; afterLine: number } }).job;
    expect(view.progress.length).toBeGreaterThan(0);
    let status = view.status;
    let afterLine = view.afterLine;
    for (let i = 0; i < 20 && status === "running"; i++) {
      const next = (structured(await runToolCall("jobStatus", { jobId: handle.job!.id, afterLine, waitMs: 2000, json: true }, context, () => {}, () => [])).json as { job: { status: string; afterLine: number } }).job;
      status = next.status;
      afterLine = next.afterLine;
    }
    expect(status).toBe("completed");
    const done = readJob(handle.job!.id)!;
    expect(done.result).toMatchObject({ exit: 0, ok: true });
    expect(done.text).toContain("Self-check passed");
  });

  test("a run that ends inside its wait comes back whole, with its job finished", async () => {
    const worker = (async () => doctorReply) as unknown as WorkerClient;
    const result = await runToolCall("doctor", { args: ["--json"] }, { twenty: marketplaceFixture(), worker }, () => {}, () => []);
    expect(structured(result).exit).toBe(0);
    expect(structured(result).job?.status).toBe("completed");
    expect(readJob(structured(result).job!.id)?.status).toBe("completed");
  });

  test("a quick tool is never a job", async () => {
    const result = await runToolCall("accounts", {}, { twenty: marketplaceFixture() }, () => {}, () => []);
    expect(structured(result).job).toBeUndefined();
  });
});

describe("one job per account, cancel at the next browser step", () => {
  const runDir = mkdtempSync(join(tmpdir(), "logJobRun"));
  const current: CurrentInspect = { account: "galwayOne", runDir, commandsPath: join(runDir, "commands.jsonl"), repliesPath: join(runDir, "replies.jsonl"), startedAt: new Date().toISOString() };
  afterEach(() => clearCurrentInspect(undefined, "galwayOne"));

  test("a second long call on the same account is refused with accountBusy; a cancel stops the first at its next step", async () => {
    writeCurrentInspect(current);
    writeFileSync(current.repliesPath, "");
    let steps = 0;
    const sendInspect = async () => {
      steps++;
      await sleep(150);
      return null;
    };
    const context = { twenty: marketplaceFixture(), sendInspect, now: () => new Date("2026-10-22T12:00:00Z") };
    const started = await runToolCall("check", { account: "galwayOne", bypass: true, confirmBypass: true, waitMs: 20 }, context, () => {}, () => []);
    const id = structured(started).job!.id;
    expect(structured(started).exit).toBe(-1);
    expect(busyJob("galwayOne")?.id).toBe(id);
    const second = await runToolCall("check", { account: "galwayOne", bypass: true, confirmBypass: true, waitMs: 20 }, context, () => {}, () => []);
    expect(textOf(second)).toContain("accountBusy");
    const cancel = await runToolCall("jobCancel", { jobId: id }, context, () => {}, () => []);
    expect(cancel.isError).toBe(false);
    for (let i = 0; i < 40 && readJob(id)?.status === "running"; i++) await sleep(50);
    expect(readJob(id)?.status).toBe("cancelled");
    expect(readJob(id)?.text).toContain("jobCancelled");
    expect(steps).toBeLessThan(5);
    expect(busyJob("galwayOne")).toBeNull();
  });
});

describe("the job store", () => {
  test("a running job whose server is gone is lost", () => {
    const record = startJob({ tool: "publishLive", argv: ["facebook", "publish"], account: "a", live: true });
    expect(statusOf(record, () => false)).toBe("lost");
    expect(statusOf(record)).toBe("running");
    finishJob(record.id, "completed", { exit: 0 }, "done");
  });

  test("a live job past Publish is never cancelled (rule 10); a finished one has nothing to stop", () => {
    const record = startJob({ tool: "publishLive", argv: ["facebook", "publish", "--live"], account: "b", live: true });
    appendProgress(record.id, { at: new Date().toISOString(), source: "err", line: "12:00:01  publish             state  publishing" });
    const refused = requestCancel(record.id);
    expect(refused.ok).toBe(false);
    expect(refused.ok ? "" : refused.message).toContain("past Publish");
    finishJob(record.id, "completed", { exit: 0 }, "done");
    expect(requestCancel(record.id)).toMatchObject({ ok: false });
    expect(jobView(readJob(record.id)!, 0).progress).toHaveLength(1);
  });

  test("the account comes from the argv the tool built", () => {
    expect(accountOfArgv(["facebook", "check", "--account=galwayOne"])).toBe("galwayOne");
    expect(accountOfArgv(["flow", "run", "x", "--account", "bethlehem", "--live"])).toBe("bethlehem");
    expect(accountOfArgv(["facebook", "publish", "--listing=x"])).toBeNull();
  });
});
