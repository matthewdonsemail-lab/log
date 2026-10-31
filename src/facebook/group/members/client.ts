import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { ownerReasonOf } from "./helpers/index.ts";
import type { GroupMember, MembersPlan, MembersReadOutput, SavedMembers } from "./types.ts";

export const MEMBER_COLUMNS = ["id", "name", "url", "bio", "category", "followers", "joined", "owner"] as const;

export function membersDirOf(env: NodeJS.ProcessEnv = process.env): string {
  return env.LOG_MEMBERS_DIR || join(homedir(), ".logCli", "members");
}

export const runStampOf = (now: Date): string => now.toISOString().replace(/[-:]/g, "").slice(0, 15);

const cell = (value: string | number | null): string => (value === null ? "" : String(value).replace(/[\t\r\n]+/g, " ").trim());

export function membersTsv(members: GroupMember[]): string {
  const rows = members.map((m) => [m.id, m.name, m.url, m.bio, m.category, m.followers, m.joined, ownerReasonOf(m)].map(cell).join("\t"));
  return `${[MEMBER_COLUMNS.join("\t"), ...rows].join("\n")}\n`;
}

export function saveMembers(output: MembersReadOutput, members: GroupMember[], plan: MembersPlan, options: { owners: boolean; now: Date; dir?: string }): SavedMembers {
  const folder = join(options.dir ?? membersDirOf(), output.groupKey);
  mkdirSync(folder, { recursive: true });
  const base = join(folder, runStampOf(options.now));
  const tsv = `${base}.tsv`;
  const json = `${base}.json`;
  writeFileSync(tsv, membersTsv(members));
  const record = {
    account: output.account,
    group: output.groupKey,
    groupId: output.groupId,
    at: options.now.toISOString(),
    plan,
    owners: options.owners,
    result: output.result,
    stop: output.stop,
    scrolls: output.scrolls,
    hasNextPage: output.hasNextPage,
    problem: output.problem,
    members: members.map((m) => ({ ...m, owner: ownerReasonOf(m) })),
  };
  writeFileSync(json, `${JSON.stringify(record, null, 2)}\n`);
  return { tsv, json };
}
