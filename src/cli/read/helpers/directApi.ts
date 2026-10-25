import { outcomeOf, runEngine } from "../../../directApi/engine/index.ts";
import type { DirectOutcome } from "../../../directApi/engine/index.ts";
import type { FacebookAccount } from "../../../marketplace/socialAccount/index.ts";

export interface DirectPost { id: string | null; text: string; creation_time: number | null; author?: unknown }
export type DirectRead = DirectOutcome<DirectPost>;

export function readGroupDirect(account: FacebookAccount, groupId: string): DirectRead {
  return outcomeOf(runEngine(account, { surface: "groups", method: "feed_read", args: [groupId] })) as DirectRead;
}

export function renderDirectRead(rows: DirectPost[]): string {
  const lines = [`log facebook read group: ${rows.length} post(s) via the direct-API engine (fbk groups.feed_read, no browser).`];
  for (const p of rows) {
    const when = p.creation_time ? new Date(p.creation_time * 1000).toISOString().slice(0, 16) : "?";
    lines.push(`  ${when} ${(p.text || "(no text)").replace(/\s+/g, " ").slice(0, 100)}`);
  }
  lines.push("  Twenty: lastReadAt updated; posts go to OpenMagpie, only matches reach Twenty (rule 65).");
  return lines.join("\n");
}
