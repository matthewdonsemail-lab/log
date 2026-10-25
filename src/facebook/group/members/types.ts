import type { ErrorCode } from "../../../errors/catalog/index.ts";

export interface GroupMember {
  id: string;
  name: string;
  url: string;
  bio: string;
  category: string | null;
  followers: number | null;
  joined: string;
}

export interface MembersPage {
  groupId: string | null;
  members: GroupMember[];
  skipped: Record<string, number>;
  endCursor: string | null;
  hasNextPage: boolean | null;
}

export type OwnerReason = "bio" | "page";

export interface OwnerMember extends GroupMember {
  ownerReason: OwnerReason;
}

export interface MembersPlan {
  count: number;
  scrolls: number;
  maxScrolls: number;
  secondsPerScroll: number;
  minutes: number;
}

export type MembersStop = "count" | "end" | "maxScrolls";

export interface MembersStepInput {
  action: "goto" | "scroll";
  args: string[];
}

export interface MembersStepReply {
  ok: boolean;
  error?: string;
  url?: string;
  title?: string;
  folder?: string;
  har?: { log?: { entries?: unknown[] } };
}

export interface MembersReadInput {
  account: string;
  group: { key: string; membersUrl: string };
  plan: MembersPlan;
}

export interface MembersStepNote {
  step: string;
  ok: boolean;
  folder?: string;
  detail?: string;
}

export interface MembersReadContext extends MembersReadInput {
  groupId: string | null;
  members: GroupMember[];
  skipped: Record<string, number>;
  endCursor: string | null;
  hasNextPage: boolean | null;
  scrolls: number;
  stop: MembersStop | null;
  problem: { code: ErrorCode; detail: string } | null;
  steps: MembersStepNote[];
}

export interface MembersReadOutput {
  account: string;
  groupKey: string;
  groupId: string | null;
  result: "read" | "stopped";
  stop: MembersStop | null;
  members: GroupMember[];
  scrolls: number;
  hasNextPage: boolean | null;
  endCursor: string | null;
  skipped: Record<string, number>;
  problem: { code: ErrorCode; detail: string } | null;
  steps: MembersStepNote[];
}

export interface MembersSummary {
  members: number;
  withBio: number;
  owners: number;
  ownersByBio: number;
  pages: number;
}

export interface SavedMembers {
  tsv: string;
  json: string;
}
