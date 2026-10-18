/** Command surface types. */

import type { SessionFactory } from "../../camofox/session/index.ts";
import type { WorkerClient } from "../../camofox/worker/index.ts";
import type { ConnectionRecord } from "../../marketplace/account/index.ts";
import type { ListingRecord } from "../../marketplace/listing/index.ts";
import type { TwentyClient } from "../../twenty/graphql/index.ts";

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
  /** Writes to stdout. Injected so commands stay testable. */
  out: (line: string) => void;
  /** Writes to stderr. */
  err: (line: string) => void;
}

export interface Command {
  name: string;
  summary: string;
  /** Positional argument names, for usage output. */
  args?: string;
  run(context: CommandContext, argv: string[]): Promise<CommandResult> | CommandResult;
}
