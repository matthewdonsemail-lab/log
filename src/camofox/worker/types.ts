import type { CodedFailure } from "../../errors/catalog/index.ts";
import type { ProxyCheck } from "../../browser/proxy/index.ts";

export type WorkerAction = "doctor" | "marketplace.scan" | "marketplace.status" | "proxy.check";

export interface WorkerRequest {
  action: WorkerAction;
  account_id?: string;
  storage_state_path?: string;
  proxy_path?: string;
  device_path?: string | null;
  capture_dir?: string | null;
  params?: Record<string, unknown>;
}

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

export interface ScannedListing {
  listingId: string;
  title: string | null;
  health: DashboardHealth;
  clicks: number;
  href: string;
}

export type WorkerFailure = CodedFailure & { [key: string]: unknown };

export type DoctorResult = { ok: boolean; checks: DoctorChecks };
export type ScanResult = {
  ok: true;
  url: string;
  listings: ScannedListing[];
  needsAttention: string[];
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
  interactive?: boolean;
}

export type WorkerClient = <A extends WorkerAction>(
  request: WorkerRequest & { action: A },
  options?: WorkerRunOptions,
) => Promise<WorkerResult<A>>;
