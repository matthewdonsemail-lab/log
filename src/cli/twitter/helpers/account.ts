import { findTwitterAccount, recordTwitterSession, twitterGate } from "../../../twitter/account/session/index.ts";
import type { TwitterAccount, TwitterEngineRun, TwitterEngineSpec } from "../../../twitter/account/session/index.ts";
import { refuse } from "../../runner/helpers/index.ts";
import type { CommandContext, CommandResult } from "../../runner/types.ts";

export type Engine = (spec: TwitterEngineSpec) => Promise<TwitterEngineRun>;

export async function openTwitterAccount(context: CommandContext, label: string, ref: string): Promise<{ ok: true; account: TwitterAccount; engine: Engine } | { ok: false; result: CommandResult }> {
  const account = await findTwitterAccount(context.twenty, ref);
  const gate = twitterGate(account);
  if (!gate.ok) return { ok: false, result: refuse(label, gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail) };
  const direct = context.directTwitter;
  if (!direct) return { ok: false, result: { code: 1, stderr: `log ${label}: the direct-API engine isn't wired in this context` } };
  const engine: Engine = async (spec) => {
    const run = direct(account, spec);
    for (const line of await recordTwitterSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
    return run;
  };
  return { ok: true, account, engine };
}

export function governorLine(run: TwitterEngineRun): string | null {
  const g = run.answer.governor;
  if (!g) return null;
  return `  governor: ${g.day_count}/${g.daily_cap} requests and ${g.mutation_count} writes today${g.cooldown_active ? `, paused ${Math.ceil(g.cooldown_remaining_s / 60)} min` : ""}`;
}
