import { at, chunksOf, documentsOf, embeddedResults, type Json, obj, responsesOf, str } from "../../read/helpers/json.ts";
import type { GroupMember, MembersPage } from "../types.ts";

export const MEMBERS_REFETCH_QUERY = "GroupsCometMembersPageNewMembersSectionRefetchQuery";

type Har = { log?: { entries?: unknown[] } };

export const membersUrlOf = (key: string): string => `https://www.facebook.com/groups/${key}/members`;

export function memberOf(edge: unknown): GroupMember | string {
  const node = obj(at(edge, "node"));
  const type = str(node?.__typename);
  if (type !== "User") return type || "noNode";
  const id = str(node?.id);
  if (!/^\d+$/.test(id)) return "noId";
  const followers = node?.follower_count;
  return {
    id,
    name: str(node?.name),
    url: str(node?.url),
    bio: str(at(node, "bio_text", "text")).trim(),
    category: str(node?.profile_plus_category_display_name) || null,
    followers: typeof followers === "number" && Number.isFinite(followers) ? followers : null,
    joined: str(at(edge, "join_status_text", "text")),
  };
}

function pageOf(groups: { group: unknown }[]): MembersPage {
  const page: MembersPage = { groupId: null, members: [], skipped: {}, endCursor: null, hasNextPage: null };
  const seen = new Set<string>();
  for (const { group } of groups) {
    const section = obj(at(group, "new_members"));
    if (!section) continue;
    page.groupId = page.groupId ?? (str(at(group, "id")) || null);
    const edges = Array.isArray(section.edges) ? section.edges : [];
    for (const edge of edges) {
      const member = memberOf(edge);
      if (typeof member === "string") page.skipped[member] = (page.skipped[member] ?? 0) + 1;
      else if (!seen.has(member.id)) {
        seen.add(member.id);
        page.members.push(member);
      }
    }
    const info = obj(section.page_info);
    if (info) {
      page.endCursor = str(info.end_cursor) || page.endCursor;
      if (typeof info.has_next_page === "boolean") page.hasNextPage = info.has_next_page;
    }
  }
  return page;
}

export function membersFromRefetch(text: string): MembersPage {
  return pageOf(chunksOf(text).map((chunk: Json) => ({ group: at(chunk, "data", "node") })));
}

export function membersFromPage(html: string): MembersPage {
  return pageOf(embeddedResults(html).map((result) => ({ group: at(result, "data", "group") })));
}

export function membersRefetches(har: Har): string[] {
  return responsesOf(har, [MEMBERS_REFETCH_QUERY]);
}

export function memberPagesOf(har: Har | undefined): MembersPage[] {
  const pages = documentsOf(har ?? {}).map(membersFromPage);
  for (const text of membersRefetches(har ?? {})) pages.push(membersFromRefetch(text));
  return pages.filter((p) => p.members.length || p.hasNextPage !== null || Object.keys(p.skipped).length);
}
