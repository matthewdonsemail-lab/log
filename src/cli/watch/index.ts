import { join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import type { ScanResult, WorkerFailure } from "../../camofox/worker/index.ts";
import { listListingsWhere, syncDashboard } from "../../marketplace/agencyListing/index.ts";
import { DEFAULT_MONITOR_TIMING, monitorMachine } from "../../marketplace/monitor/index.ts";
import type { CheckOutcome, MonitorOutput, WatchedListing } from "../../marketplace/monitor/index.ts";
import { homeOf, outsideActiveHours } from "../../marketplace/home/index.ts";
import { recordAccountIssue } from "../../marketplace/replacement/index.ts";
import { settleInBackground } from "../../rea/capture/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { keepNewDevice, keepSession, openAccount } from "../live/index.ts";
import { renderLoss } from "../live/helpers/index.ts";
import { parseArgs, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { renderMonitorOutput, summarizeMonitor, toCheckOutcome } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const WATCH_USAGE = "Usage: log facebook watch --account <accountName> [--checks <n>] [--interval <minutes>] [--json] [--bypass]";

export const watchDeps = {
  onInterrupt(stop: () => void): () => void {
    process.once("SIGINT", stop);
    return () => process.off("SIGINT", stop);
  },
};

export const watchCommand: Command = {
  usage: WATCH_USAGE,
  platform: "facebook",
  name: "watch",
  summary: "Run the listing monitor (XState) for one account and print every step",
  args: "--account <name> [--checks <n>] [--interval <min>] [--json] [--bypass]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json", "bypass"], valued: ["account", "checks", "interval"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook watch: ${parsed.error}\n${WATCH_USAGE}` };
    const bypassHours = Boolean(parsed.flags["bypass"]);
    if (parsed.positionals.length > 0) return { code: 1, stderr: `log facebook watch: unexpected argument "${parsed.positionals[0]}"\n${WATCH_USAGE}` };
    const checks = parsed.flags["checks"] === undefined ? 1 : Number(parsed.flags["checks"]);
    const interval = parsed.flags["interval"] === undefined ? undefined : Number(parsed.flags["interval"]);
    if (!Number.isInteger(checks) || checks < 0) return { code: 1, stderr: `log facebook watch: --checks must be 0 (forever) or more` };
    if (interval !== undefined && !(interval > 0)) return { code: 1, stderr: `log facebook watch: --interval must be minutes above 0` };

    const opened = await openAccount(context, "watch", WATCH_USAGE, parsed.flags["account"], "run", bypassHours);
    if (!("run" in opened)) return opened;
    const { account, run } = opened;

    const json = Boolean(parsed.flags["json"]);
    let listings: WatchedListing[];
    try {
      listings = (await listListingsWhere(context.twenty, { socialAccountId: { eq: account.id } }))
        .filter((l) => l.listingId && (l.status === "active" || l.status === "underReview"))
        .map((l) => ({
          listingId: l.listingId as string,
          title: l.title,
          knownStatus: l.status === "active" ? ("active" as const) : ("underReview" as const),
          generation: l.generation,
        }));
    } catch (error) {
      run.cleanup();
      return refuseError("watch", error);
    }

    const now = context.now ?? (() => new Date());
    let deviceSaved = false;
    let checkNumber = 0;
    const machine = monitorMachine.provide({
      actors: {
        check: fromPromise<CheckOutcome, { accountId: string }>(async () => {
          const home = homeOf(account);
          const outside = !home.ok ? home.detail : bypassHours ? null : outsideActiveHours(account, home.home.timezone, now());
          if (outside) return toCheckOutcome({ ok: false, code: home.ok ? "outsideActiveHours" : home.code, detail: outside });
          checkNumber += 1;
          const captureDir = run.captureDir ? join(run.captureDir, `check${checkNumber}`) : null;
          const result = await context.worker({
            action: "marketplace.scan",
            account_id: account.id,
            storage_state_path: run.statePath,
            proxy_path: run.proxyPath,
            device_path: run.devicePath,
            capture_dir: captureDir,
          });
          const capture = captureDir ? settleInBackground(captureDir) : null;
          if (capture) context.err(capture);
          if (!deviceSaved) {
            const note = await keepNewDevice(context, account, run);
            if (note) {
              deviceSaved = true;
              context.err(note);
            }
          }
          const saved = await keepSession(context, account, run);
          if (saved) context.err(saved);
          if (result.ok) await syncDashboard(context.twenty, account.id, (result as ScanResult).listings);
          return toCheckOutcome(result as ScanResult | WorkerFailure);
        }),
      },
    });

    const inspect = createInspector(
      (line) => (json ? context.out(JSON.stringify(line)) : context.err(formatTraceLine(line))),
      summarizeMonitor,
    );
    const actor = createActor(machine, {
      id: `monitor:${account.accountName}`,
      input: {
        accountId: account.accountName,
        listings,
        maxChecks: checks,
        timing: interval === undefined ? undefined : { ...DEFAULT_MONITOR_TIMING, pollIntervalMs: interval * 60_000 },
      },
      inspect,
    });

    const release = watchDeps.onInterrupt(() => actor.send({ type: "STOP" }));
    try {
      actor.start();
      const output = (await toPromise(actor)) as MonitorOutput;
      const loss = output.issue ? await recordAccountIssue(context.twenty, account, output.issue, output.stopReason) : null;
      const failed = output.stopReason !== "checks done" && output.stopReason !== "stopped";
      const code = failed ? 1 : 0;
      if (json) return { code, stdout: JSON.stringify({ kind: "output", ...output, accountStatus: loss?.status ?? null }) };
      return { code, stdout: [renderMonitorOutput(output), ...(loss ? [renderLoss(loss)] : [])].join("\n") };
    } catch (error) {
      return refuseError("watch", error);
    } finally {
      release();
      run.cleanup();
    }
  },
};
