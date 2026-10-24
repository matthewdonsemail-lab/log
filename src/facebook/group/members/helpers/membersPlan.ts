import type { GroupMember, MembersPlan, MembersStop, MembersSummary, OwnerMember, OwnerReason } from "../types.ts";

export const MEMBERS_PER_PAGE = 10;
export const PAGES_PER_SCROLL = 2;
export const DEFAULT_SECONDS_PER_SCROLL = 15;
export const MAX_COUNT = 5000;
export const MAX_SCROLLS = 1000;
export const MAX_SECONDS_PER_SCROLL = 600;

export const OWNER_BIO = /\b(owner|co-owner|founder|ceo|president|proprietor|self-employed)\b/i;

export function scrollsFor(count: number): number {
  return Math.ceil(Math.max(0, count - MEMBERS_PER_PAGE) / (MEMBERS_PER_PAGE * PAGES_PER_SCROLL));
}

export function defaultMaxScrolls(scrolls: number): number {
  return Math.min(MAX_SCROLLS, scrolls * 2 + 2);
}

export function planMembers(count: number, secondsPerScroll: number = DEFAULT_SECONDS_PER_SCROLL, maxScrolls: number | null = null): MembersPlan {
  const scrolls = scrollsFor(count);
  const cap = maxScrolls ?? defaultMaxScrolls(scrolls);
  const planned = Math.min(scrolls, cap);
  return { count, scrolls: planned, maxScrolls: cap, secondsPerScroll, minutes: Math.round((planned * secondsPerScroll) / 6) / 10 };
}

export function planLine(plan: MembersPlan): string {
  return `count ${plan.count} → ~${plan.scrolls} scrolls, ~${plan.minutes} min at ${plan.secondsPerScroll}s per scroll`;
}

export function mergeMembers(seen: GroupMember[], more: GroupMember[]): GroupMember[] {
  const known = new Set(seen.map((m) => m.id));
  const merged = [...seen];
  for (const member of more) {
    if (known.has(member.id)) continue;
    known.add(member.id);
    merged.push(member);
  }
  return merged;
}

export function stopOf(state: { members: number; hasNextPage: boolean | null; scrolls: number }, plan: MembersPlan): MembersStop | null {
  if (state.members >= plan.count) return "count";
  if (state.hasNextPage === false) return "end";
  if (state.scrolls >= plan.maxScrolls) return "maxScrolls";
  return null;
}

export function ownerReasonOf(member: GroupMember): OwnerReason | null {
  if (OWNER_BIO.test(member.bio)) return "bio";
  if (member.category) return "page";
  return null;
}

export function ownersOf(members: GroupMember[]): OwnerMember[] {
  const owners: OwnerMember[] = [];
  for (const member of members) {
    const ownerReason = ownerReasonOf(member);
    if (ownerReason) owners.push({ ...member, ownerReason });
  }
  return owners;
}

export function summaryOf(members: GroupMember[]): MembersSummary {
  const owners = ownersOf(members);
  return {
    members: members.length,
    withBio: members.filter((m) => m.bio).length,
    owners: owners.length,
    ownersByBio: owners.filter((m) => m.ownerReason === "bio").length,
    pages: members.filter((m) => m.category).length,
  };
}
