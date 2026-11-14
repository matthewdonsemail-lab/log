import { codeOfText, commandKey, isPlatform } from "../../cli/runner/helpers/index.ts";
import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import type { Command } from "../../cli/runner/types.ts";
import { accountOfArgv } from "../../mcp/jobs/client.ts";
import { guardCall } from "../../mcp/server/helpers/guardCall.ts";
import { gatedToolOf, platformOfTool } from "../../mcp/server/helpers/playGate.ts";
import { currentToolName } from "../../mcp/server/helpers/toolAliases.ts";
import { LIVE_SUFFIX } from "../../mcp/server/helpers/toolAnnotations.ts";
import { commandTools, legacyArgsTool } from "../../mcp/server/helpers/toolsFromCommands.ts";
import type { CommandTool } from "../../mcp/server/helpers/toolsFromCommands.ts";
import { capabilityOf, choosePlatform } from "../capability/index.ts";
import { sessionGate } from "../sessionCheck/index.ts";
import { actingAsOwnerTools } from "../../mcp/server/helpers/playGate.ts";
import { isLongRunning } from "./helpers/index.ts";
import type { GateCaller, GateDeps, GatedTool, GateInput, GateRefusal, GateResult, GateStep } from "./types.ts";

const STEP_OF_CODE: Readonly<Record<string, GateStep>> = { terminalOnly: "terminalOnly", liveNotConfirmed: "live", notApproved: "approval", bypassNotConfirmed: "bypass" };

const refusal = (step: GateStep, code: string, message: string, entry: CommandTool | null): GateRefusal => ({ ok: false, step, code, message, entry });

export function entryOfTool(name: string, commands: readonly Command[]): CommandTool | null {
  const current = currentToolName(name);
  return commandTools(commands).find((t) => t.tool === current) ?? legacyArgsTool(current, commands);
}

function capabilityTarget(name: string, input: GateInput, deps: GateDeps): GatedTool | GateRefusal | null {
  const live = name.endsWith(LIVE_SUFFIX);
  const definition = capabilityOf(live ? name.slice(0, -LIVE_SUFFIX.length) : name);
  if (!definition || definition.effect === "read") return null;
  const account = typeof input?.account === "string" ? input.account : "";
  const asked = typeof input?.platform === "string" && isPlatform(input.platform) ? (input.platform as Platform) : undefined;
  if (!account) return null;
  const chosen = choosePlatform(deps.accounts(), account, asked);
  if (!chosen.ok) return refusal("platform", chosen.code, `${chosen.code}: ${name}: ${chosen.detail}. Nothing was sent.`, null);
  const binding = definition.platforms[chosen.platform];
  if (!binding) return refusal("platform", "capabilityMissing", `capabilityMissing: ${name} isn't on ${chosen.platform}. Nothing was sent.`, null);
  const platformTool = commandTools(deps.commands).find((t) => commandKey(t.command) === binding.command && (t.form?.words ?? []).join(" ") === binding.words.join(" ") && t.live === live);
  if (!platformTool) return refusal("platform", "capabilityMissing", `capabilityMissing: ${name} on ${chosen.platform} names ${binding.command}, which has no ${live ? "live " : ""}tool. Nothing was sent.`, null);
  return { tool: platformTool.tool, platform: chosen.platform, capability: name };
}

export function gatedToolFor(name: string, input: GateInput, deps: Pick<GateDeps, "commands" | "flows" | "accounts">): GatedTool | GateRefusal {
  const current = currentToolName(name);
  const capability = capabilityTarget(current, input, deps as GateDeps);
  if (capability) return capability;
  const tool = gatedToolOf(current, input as Record<string, unknown> | undefined, deps.flows);
  return { tool, platform: platformOfTool(tool, deps.commands, deps.flows), capability: null };
}

const HOSTED_LIVE = (name: string) => `approvalRequired: ${name} acts as the owner, and a live run through the hosted runtime needs an approval, which is not built yet. Nothing was run. The owner runs it from a local client.`;

const BUSY = (account: string, holder: { id: string; tool: string; startedAt: string }) => `accountBusy: job ${holder.id} (${holder.tool}) holds ${account}, started ${holder.startedAt}. Follow it with jobStatus { jobId: "${holder.id}" }, or stop it with jobCancel (rule 35).`;

export function gateCall(tool: string, input: GateInput, caller: Exclude<GateCaller, "cli">, deps: GateDeps): GateResult {
  const name = currentToolName(tool);
  const entry = entryOfTool(name, deps.commands);
  const guard = guardCall(name, input, deps.commands);
  if (!guard.ok) return refusal(STEP_OF_CODE[guard.code] ?? "input", guard.code, guard.message, entry);
  const gated = gatedToolFor(name, input, deps);
  if ("ok" in gated) return { ...gated, entry };
  const noPlay = deps.play?.(gated) ?? null;
  if (noPlay) return refusal("play", codeOfText(noPlay), noPlay, entry);
  const owner = typeof input?.account === "string" ? input.account : accountOfArgv(guard.argv);
  const held = owner && gated.platform && deps.session && actingAsOwnerTools(deps.commands, deps.flows).has(gated.tool) ? deps.session(owner, gated.platform) : null;
  const verdict = held ? sessionGate(held) : { ok: true as const };
  if (!verdict.ok) return refusal("session", verdict.code, `${verdict.code}: ${name}: ${verdict.detail}. Nothing was sent.`, entry);
  if (caller === "runtime" && entry?.live) return refusal("hosted", "approvalRequired", HOSTED_LIVE(name), entry);
  const longRunning = entry ? isLongRunning(entry.command) : false;
  const account = accountOfArgv(guard.argv);
  const holder = longRunning ? deps.busy(account) : null;
  if (holder && account) return refusal("busy", "accountBusy", BUSY(account, holder), entry);
  return { ok: true, argv: guard.argv, ...(guard.note ? { note: guard.note } : {}), entry, gated, longRunning, account };
}

export function gateCli(command: Pick<Command, "longRunning" | "terminalOnly">, argv: readonly string[], deps: Pick<GateDeps, "busy">): GateRefusal | null {
  if (!isLongRunning(command)) return null;
  const account = accountOfArgv([...argv]);
  const holder = deps.busy(account);
  return holder && account ? refusal("busy", "accountBusy", BUSY(account, holder), null) : null;
}
