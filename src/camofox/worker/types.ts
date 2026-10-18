/**
 * The contract between log-cli and `python/logWorker.py`, the bridge into
 * facebook-camofox-client (github.com/PRACE1/facebook-camofox-client).
 * One JSON request in (argv), one JSON result out (stdout).
 */

export type WorkerAction = "doctor" | "login" | "marketplace.scan" | "marketplace.status";

export interface WorkerRequest {
  action: WorkerAction;
  /** Stable Facebook account id, the same id space as `marketplace/account`. */
  account_id?: string;
  /** Playwright storage_state file holding that account's Facebook session. */
  storage_state_path?: string;
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

export type WorkerFailure = { ok: false; error: string; [key: string]: unknown };

export type DoctorResult = { ok: boolean; checks: DoctorChecks };
export type LoginResult = { ok: true; storageStatePath: string; loggedIn: boolean; authFlags: Record<string, boolean> };
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
  login: LoginResult;
  "marketplace.scan": ScanResult;
  "marketplace.status": StatusResult;
}

export type WorkerResult<A extends WorkerAction> = WorkerResultMap[A] | WorkerFailure;

export interface WorkerRunOptions {
  /** Hand the terminal's stdin to the worker (`login` waits for Enter). */
  interactive?: boolean;
}

/** Runs one worker request. Injectable so tests never launch a browser. */
export type WorkerClient = <A extends WorkerAction>(
  request: WorkerRequest & { action: A },
  options?: WorkerRunOptions,
) => Promise<WorkerResult<A>>;
