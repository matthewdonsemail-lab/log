/** Command surface types. */

import type { CurrentInspect, InspectAction, InspectSessionRunner, InspectStepOptions, InspectStepResult } from "../../browser/inspect/index.ts";
import type { ConnectSessionFactory, ProfileSessionFactory, SessionFactory } from "../../camofox/session/index.ts";
import type { ConnectTiming } from "../../marketplace/connect/index.ts";
import type { WorkerClient } from "../../camofox/worker/index.ts";
import type { ConnectionRecord } from "../../marketplace/account/index.ts";
import type { ListingRecord } from "../../marketplace/listing/index.ts";
import type { TwentyClient } from "../../twenty/graphql/index.ts";
import type { AdsPowerClient } from "../../browser/adsPower/index.ts";

export interface CommandResult {
  code: number;
  stdout?: string;
  stderr?: string;
}

/** What a command reads: the listings and the accounts that publish them. */
export interface MarketplaceData {
  listings: ListingRecord[];
  accounts: ConnectionRecord[];
}

export interface CommandContext {
  /** The listeningkit-hackathon seed, kept for the listing machine port. Live commands use `twenty`. */
  load: () => MarketplaceData;
  /** Twenty, where the Facebook accounts (socialAccounts) and listings (agencyListings) live. Injected in tests. */
  twenty: TwentyClient;
  /** Runs the camofox worker (launches a real browser). Injected so tests never do. */
  worker: WorkerClient;
  /** Starts a publish session (a long-lived Camoufox browser). Injected so tests never do. */
  session: SessionFactory;
  /** Starts a connect session (`log connect`'s browser). Injected so tests never launch one. */
  connectSession: ConnectSessionFactory;
  /** Starts a profile session (`log profile setup`). Injected so tests never launch one. */
  profileSession: ProfileSessionFactory;
  /** Runs a `log inspect` session to its end. Injected so tests never launch one. */
  inspectSession: InspectSessionRunner;
  /** Sends one step to the open inspect session and waits for its reply. Injected in tests. */
  sendInspect: (current: CurrentInspect, action: InspectAction, args: string[], timeoutMs: number, expect?: { name: string; ms?: number }, options?: InspectStepOptions) => Promise<InspectStepResult | null>;
  /** AdsPower's Local API (rule 42). Injected in tests; default: the app on this machine (ADSPOWER_HOST). */
  adsPower?: AdsPowerClient;
  /** The connect machine's timings, for tests (default: 5 s reads, 30 s code windows, `--wait`). */
  connectTiming?: Partial<ConnectTiming>;
  /** Writes to stdout. Injected so commands stay testable. */
  out: (line: string) => void;
  /** Writes to stderr. */
  err: (line: string) => void;
  /** The clock for the local-hours gate (rule 18). Tests inject it; default: now. */
  now?: () => Date;
}

export interface Command {
  name: string;
  summary: string;
  /** Positional argument names, for usage output. */
  args?: string;
  /**
   * Its full usage: every subcommand, argument and flag. The README's command
   * table and the MCP tool's description are generated from it (rule 56).
   */
  usage: string;
  /**
   * Which platform it acts on (rule 60): `facebook` (Facebook only today),
   * `any` (no platform, or every one), or `byArgument` (the platform is its
   * first argument, `log warmup <platform> …`, and every usage line names it).
   */
  platform: "facebook" | "any" | "byArgument";
  run(context: CommandContext, argv: string[]): Promise<CommandResult> | CommandResult;
}
