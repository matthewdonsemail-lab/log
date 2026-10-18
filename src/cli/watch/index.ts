/**
 * `log watch` — start the listing monitor (an XState machine) for one account
 * and watch it run. Every event and state change is printed as it happens,
 * through XState's inspect API (`observability/trace`).
 *
 * The account and its listings come from Twenty. It checks Marketplace >
 * Selling through the camofox worker (account check and proxy gate first,
 * rule 12), writes each check back to the account's agencyListing rows, then
 * decides per listing: healthy, repost after a cooldown, or never repost.
 * Decisions only: it does not post. Ctrl+C stops it cleanly.
 */
import { createActor, fromPromise, toPromise } from "xstate";
import type { ScanResult, WorkerFailure } from "../../camofox/worker/index.ts";
import { listListingsWhere, syncDashboard } from "../../marketplace/agencyListing/index.ts";
import { DEFAULT_MONITOR_TIMING, monitorMachine } from "../../marketplace/monitor/index.ts";
import type { CheckOutcome, MonitorOutput, WatchedListing } from "../../marketplace/monitor/index.ts";
import { recordAccountIssue } from "../../marketplace/replacement/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { openAccount } from "../live/index.ts";
import { renderLoss } from "../live/helpers/index.ts";
import { parseArgs, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { renderMonitorOutput, summarizeMonitor, toCheckOutcome } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const WATCH_USAGE = "Usage: log watch --account <accountName> [--checks <n>] [--interval <minutes>] [--json]";

/** Seam for tests: how Ctrl+C reaches the running actor. */
export const watchDeps = {
  onInterrupt(stop: () => void): () => void {
    process.once("SIGINT", stop);
    return () => process.off("SIGINT", stop);
  },
};

export const watchCommand: Command = {
  name: "watch",
  summary: "Run the listing monitor (XState) for one account and print every step",
  args: "--account <name> [--checks <n>] [--interval <min>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["account", "checks", "interval"] });
    if (!parsed.ok) return { code: 1, stderr: `log watch: ${parsed.error}\n${WATCH_USAGE}` };
    if (parsed.positionals.length > 0) return { code: 1, stderr: `log watch: unexpected argument "${parsed.positionals[0]}"\n${WATCH_USAGE}` };
    const checks = parsed.flags["checks"] === undefined ? 1 : Number(parsed.flags["checks"]);
    const interval = parsed.flags["interval"] === undefined ? undefined : Number(parsed.flags["interval"]);
    if (!Number.isInteger(checks) || checks < 0) return { code: 1, stderr: `log watch: --checks must be 0 (forever) or more` };
    if (interval !== undefined && !(interval > 0)) return { code: 1, stderr: `log watch: --interval must be minutes above 0` };

    // The account check runs before anything opens (rule 12); the proxy gate runs at launch.
    const opened = await openAccount(context, "watch", WATCH_USAGE, parsed.flags["account"], "run");
    if (!("run" in opened)) return opened;
    const { account, run } = opened;

    const json = Boolean(parsed.flags["json"]);
    let listings: WatchedListing[];
    try {
      // The account's listings that should be on its Selling dashboard.
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

    const machine = monitorMachine.provide({
      actors: {
        check: fromPromise<CheckOutcome, { accountId: string }>(async () => {
          const result = await context.worker({
            action: "marketplace.scan",
            account_id: account.id,
            storage_state_path: run.statePath,
            proxy_path: run.proxyPath,
          });
          if (result.ok) await syncDashboard(context.twenty, account.id, (result as ScanResult).listings);
          return toCheckOutcome(result as ScanResult | WorkerFailure);
        }),
      },
    });

    // NDJSON on stdout for --json (one trace line per step), readable lines on stderr otherwise.
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
      // What the monitor saw about the account goes to Twenty (and may replace its campaign listings).
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
