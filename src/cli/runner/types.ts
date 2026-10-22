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

export interface MarketplaceData {
  listings: ListingRecord[];
  accounts: ConnectionRecord[];
}

export interface CommandContext {
  load: () => MarketplaceData;
  twenty: TwentyClient;
  worker: WorkerClient;
  session: SessionFactory;
  connectSession: ConnectSessionFactory;
  profileSession: ProfileSessionFactory;
  inspectSession: InspectSessionRunner;
  sendInspect: (current: CurrentInspect, action: InspectAction, args: string[], timeoutMs: number, expect?: { name: string; ms?: number }, options?: InspectStepOptions) => Promise<InspectStepResult | null>;
  adsPower?: AdsPowerClient;
  connectTiming?: Partial<ConnectTiming>;
  out: (line: string) => void;
  err: (line: string) => void;
  now?: () => Date;
}

export interface Command {
  name: string;
  summary: string;
  args?: string;
  usage: string;
  platform: "facebook" | "any" | "byArgument";
  run(context: CommandContext, argv: string[]): Promise<CommandResult> | CommandResult;
}
