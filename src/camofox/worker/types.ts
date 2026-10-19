/**
 * The contract between log-cli and `python/logWorker.py`, the bridge into
 * facebook-camofox-client (github.com/PRACE1/facebook-camofox-client).
 * One JSON request in (argv), one JSON result out (stdout).
 */
import type { CodedFailure } from "../../errors/catalog/index.ts";
import type { ProxyCheck } from "../proxy/index.ts";

export type WorkerAction = "doctor" | "marketplace.scan" | "marketplace.status" | "proxy.check";

export interface WorkerRequest {
  action: WorkerAction;
  /** Stable Facebook account id, the same id space as `marketplace/account`. */
  account_id?: string;
  /** Playwright storage_state file holding that account's Facebook session. */
  storage_state_path?: string;
  /**
   * The account's proxy file (`camofox/proxy`). The worker refuses to open a
   * browser without it, except for `login` (rule 12). Credentials never go on argv.
   */
  proxy_path?: string;
  /**
   * The run's `device.json` (`camofox/device`): pinned locale, home timezone
   * and the account's device. The proxy gate opens no browser without it.
   */
  device_path?: string | null;
  /** Rule 22: the folder for this action's raw HAR and step timeline. The gate opens no context without it. */
  capture_dir?: string | null;
  params?: Record<string, unknown>;
}

/**
 * `ListingHealthStatus` from facebook-camofox-client
 * `domain_marketplace/relist.py`: what the seller dashboard badge says.
 */
export type DashboardHealth =
  | "ACTIVE"
  | "UNDER_REVIEW"
  | "DUPLICATE_TAKEDOWN"
  | "DELETED_BY_FB"
  | "POLICY_VIOLATION"
  | "COMMERCE_BAN"
  | "CHECKPOINT_REQUIRED"
  | "SOLD"
  | "RETRY_EXHAUSTED"
  | "UNKNOWN";

export interface DoctorChecks {
  python: string;
  facebookCamofoxClient: string | null;
  facebookCamofoxClientError?: string;
  camoufoxBrowser: string | null;
  camoufoxVersion?: string;
  camoufoxBrowserError?: string;
}

/** One card read off Marketplace > Selling > Your listings. */
export interface ScannedListing {
  listingId: string;
  title: string | null;
  health: DashboardHealth;
  clicks: number;
  href: string;
}

/** A failed call: a catalog code (`src/errors/catalog/types.ts`), plus whatever the worker sent with it (`url`, `bodySample`). */
export type WorkerFailure = CodedFailure & { [key: string]: unknown };

export type DoctorResult = { ok: boolean; checks: DoctorChecks };
export type ScanResult = {
  ok: true;
  url: string;
  listings: ScannedListing[];
  /** Titles under the "Needs attention" heading (the zone Listaro flagged). */
  needsAttention: string[];
  /** Start of the page text, so log-cli can spot account problems (bans, limits, checkpoints). */
  bodySample?: string;
};
export type StatusResult = { ok: true; listingId: string; listingUrl: string; status: string; title: string | null };

export interface WorkerResultMap {
  doctor: DoctorResult;
  "marketplace.scan": ScanResult;
  "marketplace.status": StatusResult;
  "proxy.check": ProxyCheck;
}

export type WorkerResult<A extends WorkerAction> = WorkerResultMap[A] | WorkerFailure;

export interface WorkerRunOptions {
  /** Hand the terminal's stdin to the worker. */
  interactive?: boolean;
}

/** Runs one worker request. Injectable so tests never launch a browser. */
export type WorkerClient = <A extends WorkerAction>(
  request: WorkerRequest & { action: A },
  options?: WorkerRunOptions,
) => Promise<WorkerResult<A>>;
