/**
 * `log watch` — start the listing monitor (an XState machine) for one account
 * and watch it run. Every event and state change is printed as it happens,
 * through XState's inspect API (`observability/trace`).
 *
 * It checks Marketplace > Selling through the camofox worker, then decides per
 * listing: healthy, repost after a cooldown, or never repost. Decisions only:
 * it does not post. Ctrl+C stops it cleanly.
 */
import { createActor, fromPromise, toPromise } from "xstate";
import { proxyPath } from "../../camofox/proxy/index.ts";
import { storageStatePath } from "../../camofox/worker/index.ts";
import type { ScanResult, WorkerFailure } from "../../camofox/worker/index.ts";
import { DEFAULT_MONITOR_TIMING, monitorMachine } from "../../marketplace/monitor/index.ts";
import type { CheckOutcome, MonitorOutput, WatchedListing } from "../../marketplace/monitor/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { renderMonitorOutput, summarizeMonitor, toCheckOutcome } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const WATCH_USAGE = "Usage: log watch --account <accountId> [--checks <n>] [--interval <minutes>] [--json]";

/** Statuses that should still be on the selling dashboard. */
const LIVE_STATUSES = new Set(["active", "underReview", "underReviewDuplicate"]);

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
  args: "--account <id> [--checks <n>] [--interval <min>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["account", "checks", "interval"] });
    if (!parsed.ok) return { code: 1, stderr: `log watch: ${parsed.error}\n${WATCH_USAGE}` };
    if (parsed.positionals.length > 0) return { code: 1, stderr: `log watch: unexpected argument "${parsed.positionals[0]}"\n${WATCH_USAGE}` };

    const data = context.load();
    const accountId = parsed.flags["account"];
    if (typeof accountId !== "string") {
      return { code: 1, stderr: `log watch: --account is required. Known: ${data.accounts.map((a) => a.id).join(", ")}\n${WATCH_USAGE}` };
    }
    if (!data.accounts.some((account) => account.id === accountId)) {
      return { code: 1, stderr: `log watch: unknown account "${accountId}". Known: ${data.accounts.map((a) => a.id).join(", ")}` };
    }
    const checks = parsed.flags["checks"] === undefined ? 1 : Number(parsed.flags["checks"]);
    const interval = parsed.flags["interval"] === undefined ? undefined : Number(parsed.flags["interval"]);
    if (!Number.isInteger(checks) || checks < 0) return { code: 1, stderr: `log watch: --checks must be 0 (forever) or more` };
    if (interval !== undefined && !(interval > 0)) return { code: 1, stderr: `log watch: --interval must be minutes above 0` };

    const json = Boolean(parsed.flags["json"]);
    const listings: WatchedListing[] = data.listings
      .filter((listing) => listing.accountId === accountId && LIVE_STATUSES.has(listing.status))
      .map((listing) => ({ listingId: listing.listingId, title: listing.title, knownStatus: listing.status, generation: 0 }));

    const machine = monitorMachine.provide({
      actors: {
        check: fromPromise<CheckOutcome, { accountId: string }>(async ({ input }) => {
          const result = await context.worker({
            action: "marketplace.scan",
            account_id: input.accountId,
            storage_state_path: storageStatePath(input.accountId),
            proxy_path: proxyPath(input.accountId),
          });
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
      id: `monitor:${accountId}`,
      input: {
        accountId,
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
      const failed = output.stopReason !== "checks done" && output.stopReason !== "stopped";
      const code = failed ? 1 : 0;
      if (json) return { code, stdout: JSON.stringify({ kind: "output", ...output }) };
      return { code, stdout: renderMonitorOutput(output) };
    } finally {
      release();
    }
  },
};
