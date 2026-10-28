import type { CurrentInspect, InspectAction, InspectSessionRunner, InspectStepOptions, InspectStepResult } from "../../browser/inspect/index.ts";
import type { ConnectSessionFactory, ProfileSessionFactory, SessionFactory } from "../../camofox/session/index.ts";
import type { ConnectTiming } from "../../marketplace/connect/index.ts";
import type { WorkerClient } from "../../camofox/worker/index.ts";
import type { ConnectionRecord } from "../../marketplace/account/index.ts";
import type { ListingRecord } from "../../marketplace/listing/index.ts";
import type { TwentyClient } from "../../twenty/graphql/index.ts";
import type { AdsPowerClient } from "../../browser/adsPower/index.ts";
import type { DecisionsClient } from "../../subq/decisions/index.ts";
import type { Platform } from "./helpers/platforms.ts";

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
  decisions?: DecisionsClient;
  connectTiming?: Partial<ConnectTiming>;
  out: (line: string) => void;
  err: (line: string) => void;
  now?: () => Date;
  sleep?: (ms: number) => Promise<void>;
  cancelled?: () => boolean;
  directTwitter?: (account: import("../../marketplace/socialAccount/index.ts").FacebookAccount, spec: import("../../twitter/account/session/index.ts").TwitterEngineSpec) => import("../../twitter/account/session/index.ts").TwitterEngineRun;
  directTwitterLive?: (account: import("../../marketplace/socialAccount/index.ts").FacebookAccount, spec: import("../../twitter/account/session/index.ts").TwitterEngineSpec, onLive: (event: import("../../twitter/account/session/index.ts").XChatLiveEvent) => void) => Promise<import("../../twitter/account/session/index.ts").TwitterEngineRun>;
  directRead?: (account: import("../../marketplace/socialAccount/index.ts").FacebookAccount, groupId: string) => import("../../directApi/engine/index.ts").DirectOutcome<{ id: string | null; text: string; creation_time: number | null }>;
  directReddit?: (account: import("../../platformKit/session/index.ts").PlatformAccount, spec: import("../../platformKit/session/index.ts").PlatformEngineSpec) => import("../../platformKit/session/index.ts").PlatformEngineRun;
  directDiscord?: (account: import("../../platformKit/session/index.ts").PlatformAccount, spec: import("../../platformKit/session/index.ts").PlatformEngineSpec) => import("../../platformKit/session/index.ts").PlatformEngineRun;
}

export interface FlagSpec {
  name: string;
  kind: "string" | "integer" | "boolean" | "enum" | "pairs";
  description: string;
  values?: readonly string[];
  required?: boolean;
  live?: true;
  bypass?: true;
  global?: true;
}

export interface PositionalSpec {
  name: string;
  kind: "string" | "enum" | "rest";
  description: string;
  values?: readonly string[];
  required?: boolean;
}

export type ToolEffect = "read" | "write" | "delete" | "browser";

export interface InputForm {
  words: readonly string[];
  effect?: ToolEffect;
  summary: string;
  positionals: readonly PositionalSpec[];
  flags: readonly FlagSpec[];
}

export interface CommandInput {
  forms: readonly InputForm[];
}

export interface Command {
  name: string;
  summary: string;
  args?: string;
  usage: string;
  platform: Platform | "any" | "byArgument";
  effect: ToolEffect;
  input?: CommandInput;
  run(context: CommandContext, argv: string[]): Promise<CommandResult> | CommandResult;
}
