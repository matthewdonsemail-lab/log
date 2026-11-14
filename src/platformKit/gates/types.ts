import type { FlowDefinition } from "../../browser/flow/index.ts";
import type { Command } from "../../cli/runner/types.ts";
import type { CommandTool } from "../../mcp/server/helpers/toolsFromCommands.ts";
import type { LogToolInput } from "../../mcp/server/types.ts";
import type { CapabilityAccount } from "../capability/index.ts";
import type { SessionCheckAccount } from "../sessionCheck/index.ts";

export const GATE_CALLERS = ["cli", "mcp", "stateless", "logCall", "alias", "console", "runtime"] as const;

export type GateCaller = (typeof GATE_CALLERS)[number];

export const GATE_ORDER = ["terminalOnly", "input", "live", "approval", "bypass", "platform", "play", "session", "hosted", "busy"] as const;

export type GateStep = (typeof GATE_ORDER)[number];

export interface GatedTool {
  tool: string;
  platform: string | null;
  capability: string | null;
}

export interface BusyHolder {
  id: string;
  tool: string;
  startedAt: string;
}

export interface GateDeps {
  commands: readonly Command[];
  flows: readonly FlowDefinition[];
  accounts: () => readonly CapabilityAccount[];
  play?: (gated: GatedTool) => string | null;
  session?: (account: string, platform: string) => GateSessionAccount | null;
  busy: (account: string | null) => BusyHolder | null;
}

export type GateSessionAccount = Pick<SessionCheckAccount, "name" | "status" | "state" | "checkedAt" | "lastCheck">;

export interface GatePass {
  ok: true;
  argv: string[];
  note?: string;
  entry: CommandTool | null;
  gated: GatedTool;
  longRunning: boolean;
  account: string | null;
}

export interface GateRefusal {
  ok: false;
  step: GateStep;
  code: string;
  message: string;
  entry: CommandTool | null;
}

export type GateResult = GatePass | GateRefusal;

export type GateInput = LogToolInput | undefined;
