import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pageProblem } from "../../../browser/flow/index.ts";
import { recordAccountIssue } from "../../../marketplace/replacement/index.ts";
import type { FacebookAccount } from "../../../marketplace/socialAccount/index.ts";
import type { CommandContext } from "../../runner/types.ts";

export const NAVIGATIONS_FILE = "navigations.jsonl";

export interface Navigation {
  url: string;
  at: string;
}

export function navigationsOf(runDir: string): Navigation[] {
  const path = join(runDir, NAVIGATIONS_FILE);
  if (!existsSync(path)) return [];
  const out: Navigation[] = [];
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const navigation = JSON.parse(line) as Partial<Navigation>;
      if (typeof navigation.url === "string") out.push({ url: navigation.url, at: String(navigation.at ?? "") });
    } catch {
    }
  }
  return out;
}

export function watchCheckpoint(context: CommandContext, account: FacebookAccount, runDir: string, everyMs = 1000): { stop: () => Promise<void> } {
  let seen = 0;
  let recorded = account.status === "checkpoint";
  let pending: Promise<void> = Promise.resolve();
  const tick = () => {
    if (recorded) return;
    const navigations = navigationsOf(runDir);
    const index = navigations.findIndex((n, i) => i >= seen && pageProblem({ action: "navigated" }, { url: n.url })?.code === "checkpointed");
    if (index === -1) {
      seen = navigations.length;
      return;
    }
    seen = index;
    recorded = true;
    const landed = navigations[index];
    const problem = pageProblem({ action: "navigated" }, { url: landed.url })!;
    const detail = `${problem.detail} at ${landed.at}, while its browser was open (${runDir})`;
    pending = recordAccountIssue(context.twenty, account, "checkpointed", detail).then(
      () => context.err(`>>> ${account.accountName} is CHECKPOINT in Twenty: ${detail}`),
      (error) => {
        recorded = false;
        context.err(`>>> ${account.accountName} landed on a checkpoint but Twenty was not updated (${error instanceof Error ? error.message : String(error)}): retrying`);
      }
    );
  };
  const timer = setInterval(tick, everyMs);
  return {
    stop: async () => {
      clearInterval(timer);
      await pending;
      tick();
      await pending;
    },
  };
}
