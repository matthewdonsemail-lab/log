import type { CurrentInspect, InspectAction, InspectSessionRunner, InspectStepOptions, InspectStepResult } from "../../browser/inspect/index.ts";
import type { ConnectSessionFactory, ProfileSessionFactory, SessionFactory } from "../../camofox/session/index.ts";
import type { ConnectTiming } from "../../platformKit/connect/index.ts";
import type { WorkerClient } from "../../camofox/worker/index.ts";
import type { ConnectionRecord } from "../../platformKit/account/index.ts";
import type { ListingRecord } from "../../facebook/marketplace/listing/index.ts";
import type { TwentyClient } from "../../twenty/graphql/index.ts";
import type { AdsPowerClient } from "../../browser/adsPower/index.ts";
import type { DecisionsClient } from "../../subq/decisions/index.ts";
import type { Platform } from "./helpers/platforms.ts";

export interface CommandResult {
  code: number;
  stdout?: string;
  stderr?: string;
  error?: import("../../errors/catalog/index.ts").ErrorCode;
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
  refused?: (code: string) => void;
  image?: (data: string, mimeType: string) => void;
  now?: () => Date;
  sleep?: (ms: number) => Promise<void>;
  cancelled?: () => boolean;
  cookiePrompts?: import("../../console/signIn/types.ts").SignInPrompts;
  directTwitter?: (account: import("../../platformKit/socialAccount/index.ts").FacebookAccount, spec: import("../../twitter/account/session/index.ts").TwitterEngineSpec) => import("../../twitter/account/session/index.ts").TwitterEngineRun | Promise<import("../../twitter/account/session/index.ts").TwitterEngineRun>;
  directTwitterLive?: (account: import("../../platformKit/socialAccount/index.ts").FacebookAccount, spec: import("../../twitter/account/session/index.ts").TwitterEngineSpec, onLive: (event: import("../../twitter/account/session/index.ts").XChatLiveEvent) => void) => Promise<import("../../twitter/account/session/index.ts").TwitterEngineRun>;
  directRead?: (account: import("../../platformKit/socialAccount/index.ts").FacebookAccount, groupId: string) => import("../../directApi/engine/index.ts").DirectOutcome<{ id: string | null; text: string; creation_time: number | null }>;
  directReddit?: (account: import("../../platformKit/session/index.ts").PlatformAccount, spec: import("../../platformKit/session/index.ts").PlatformEngineSpec) => import("../../platformKit/session/index.ts").PlatformEngineRun;
  directDiscord?: (account: import("../../platformKit/session/index.ts").PlatformAccount, spec: import("../../platformKit/session/index.ts").PlatformEngineSpec) => import("../../platformKit/session/index.ts").PlatformEngineRun;
  directDiscordLive?: (account: import("../../platformKit/session/index.ts").PlatformAccount, spec: import("../../platformKit/session/index.ts").PlatformEngineSpec, onLive: (event: Record<string, unknown>) => void) => Promise<import("../../platformKit/session/index.ts").PlatformEngineRun>;
  directLinkedin?: (account: import("../../platformKit/session/index.ts").PlatformAccount, spec: import("../../platformKit/session/index.ts").PlatformEngineSpec) => import("../../platformKit/session/index.ts").PlatformEngineRun;
  directSlack?: (account: import("../../platformKit/session/index.ts").PlatformAccount, spec: import("../../platformKit/session/index.ts").PlatformEngineSpec) => import("../../platformKit/session/index.ts").PlatformEngineRun;
  directSlackLive?: (account: import("../../platformKit/session/index.ts").PlatformAccount, spec: import("../../platformKit/session/index.ts").PlatformEngineSpec, onLive: (event: Record<string, unknown>) => void) => Promise<import("../../platformKit/session/index.ts").PlatformEngineRun>;
  directInstagram?: (account: import("../../platformKit/session/index.ts").PlatformAccount, spec: import("../../platformKit/session/index.ts").PlatformEngineSpec) => import("../../platformKit/session/index.ts").PlatformEngineRun;
  directInstagramLive?: (account: import("../../platformKit/session/index.ts").PlatformAccount, spec: import("../../platformKit/session/index.ts").PlatformEngineSpec, onLive: (event: Record<string, unknown>) => void) => Promise<import("../../platformKit/session/index.ts").PlatformEngineRun>;
}

export type ValueFormat = "date" | "time" | "dateOrSpan" | "jsonObject";

export interface FlagSpec {
  name: string;
  kind: "string" | "integer" | "number" | "boolean" | "booleanValue" | "enum" | "pairs" | "list";
  description: string;
  values?: readonly string[];
  required?: boolean;
  live?: true;
  bypass?: true;
  global?: true;
  min?: number;
  max?: number;
  format?: ValueFormat;
  pattern?: string;
  takes?: string;
  refusal?: string;
  approval?: true;
}

export interface PositionalSpec {
  name: string;
  kind: "string" | "enum" | "rest";
  description: string;
  values?: readonly string[];
  required?: boolean;
}

export interface InputGroup {
  rule: "atLeastOne" | "atMostOne";
  names: readonly string[];
  refusal?: string;
}

export interface ValueCount {
  name: string;
  min: number;
  when: { name: string; values: readonly string[] };
}

export type ToolEffect = "read" | "write" | "delete" | "browser" | "spend";

export interface InputForm {
  words: readonly string[];
  effect?: ToolEffect;
  summary: string;
  positionals: readonly PositionalSpec[];
  flags: readonly FlagSpec[];
  groups?: readonly InputGroup[];
  counts?: readonly ValueCount[];
  terminalOnly?: string;
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
