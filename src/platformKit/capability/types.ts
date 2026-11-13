import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import type { ToolEffect } from "../../cli/runner/types.ts";

export const CANONICAL_INPUTS = ["account", "chat", "space", "limit"] as const;
export type CanonicalInput = (typeof CANONICAL_INPUTS)[number];

export interface CapabilityInput {
  name: CanonicalInput;
  kind: "string" | "integer";
  description: string;
  required?: boolean;
  min?: number;
}

export type InputMapping = { flag: string } | { positional: true } | { choose: (value: string) => { flag: string }; flags: readonly string[] };

export interface PlatformBinding {
  command: string;
  words: readonly string[];
  inputs: Partial<Record<CanonicalInput, InputMapping>>;
}

export interface CapabilityDefinition {
  noun: string;
  verb: string;
  summary: string;
  effect: ToolEffect;
  inputs: readonly CapabilityInput[];
  platforms: Partial<Record<Platform, PlatformBinding>>;
}

export interface CapabilityRow {
  tool: string;
  noun: string;
  verb: string;
  platform: Platform;
  command: string;
  words: readonly string[];
  effect: ToolEffect;
  live: boolean;
  takes: readonly CanonicalInput[];
}

export interface CapabilityAccount {
  name: string;
  platform: Platform;
}

export type CapabilityRefusalCode = "accountNotFound" | "accountPlatformMismatch" | "platformAmbiguous" | "capabilityMissing" | "inputUnsupported";

export interface CapabilityRefusal {
  ok: false;
  code: CapabilityRefusalCode;
  detail: string;
  platformsWithIt?: readonly Platform[];
}

export type PlatformChoice = { ok: true; platform: Platform; account: string } | CapabilityRefusal;

export type CapabilityArgv = { ok: true; platform: Platform; command: string; argv: string[] } | CapabilityRefusal;
