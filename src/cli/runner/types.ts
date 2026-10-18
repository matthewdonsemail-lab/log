/** Command surface types. */

import type { ConnectionRecord } from "../../marketplace/account/index.ts";
import type { ListingRecord } from "../../marketplace/listing/index.ts";

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
  /** Loads the Marketplace data. Injectable so tests can pin the rows. */
  load: () => MarketplaceData;
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
