import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import gotoHar from "./fixtures/membersPageGoto.json";
import scrollOneHar from "./fixtures/membersScrollOne.json";
import scrollTwoHar from "./fixtures/membersScrollTwo.json";
import {
  MEMBERS_REFETCH_QUERY,
  memberPagesOf,
  membersFromPage,
  membersRefetches,
  membersTsv,
  membersUrlOf,
  mergeMembers,
  ownerReasonOf,
  ownersOf,
  planLine,
  planMembers,
  saveMembers,
  scrollsFor,
  stopOf,
  summaryOf,
} from "./index.ts";
import type { GroupMember, MembersReadOutput } from "./index.ts";

const GROUP_ID = "3549906855288164";

const member = (over: Partial<GroupMember>): GroupMember => ({ id: "1", name: "A", url: "https://www.facebook.com/a", bio: "", category: null, followers: null, joined: "Joined today", ...over });

describe("extractMembers: the members page and its refetch answers (inspect 20261024T060921)", () => {
  test("the members page's HTML gives its first 10 new members, the group's id and the next page; the experts section is not a member list", () => {
    const [page, ...rest] = memberPagesOf(gotoHar);
    expect(rest).toEqual([]);
    expect(page!.groupId).toBe(GROUP_ID);
    expect(page!.members).toHaveLength(10);
    expect(page!.hasNextPage).toBe(true);
    expect(page!.endCursor).toStartWith("AQHT");
    const first = page!.members[0]!;
    expect(first).toMatchObject({ id: "754353135", name: "Mike Genova", joined: "Joined about an hour ago" });
    expect(first.url).toStartWith("https://www.facebook.com/");
    const experts = membersFromPage(JSON.parse(JSON.stringify(gotoHar)).log.entries[0].response.content.text);
    expect(experts.members.map((m) => m.id)).toEqual(page!.members.map((m) => m.id));
  });

  test("each scroll's GroupsCometMembersPageNewMembersSectionRefetchQuery answer is 10 members with bio, category, followers and when they joined", () => {
    expect(membersRefetches(scrollOneHar)).toHaveLength(1);
    expect(membersRefetches(scrollTwoHar)).toHaveLength(2);
    const [one] = memberPagesOf(scrollOneHar);
    expect(one!.groupId).toBe(GROUP_ID);
    expect(one!.members).toHaveLength(10);
    expect(one!.members[0]).toEqual({ id: "100009167217962", name: "Gary Bousquet", url: "https://www.facebook.com/gary.bousquet.576457", bio: "Owner at NEED-it-GONE 4Seasons Services LLC", category: null, followers: 0, joined: "Joined on Wednesday" });
    const pages = memberPagesOf(scrollTwoHar);
    expect(pages.flatMap((p) => p.members)).toHaveLength(20);
    expect(pages.every((p) => p.hasNextPage === true)).toBe(true);
    const all = pages.flatMap((p) => p.members);
    expect(all.find((m) => m.name === "Carll Quiver")).toMatchObject({ category: "Personal blog", followers: 6518, bio: "" });
  });

  test("a node that isn't a User is counted as skipped, never kept", () => {
    const text = JSON.stringify({ data: { node: { id: GROUP_ID, new_members: { edges: [{ node: { __typename: "Page", id: "9" } }, { node: { __typename: "User", id: "8", name: "B" } }], page_info: { has_next_page: false, end_cursor: null } } } } });
    const har = { log: { entries: [{ request: { postData: { params: [{ name: "fb_api_req_friendly_name", value: MEMBERS_REFETCH_QUERY }] } }, response: { content: { text } } }] } };
    const [page] = memberPagesOf(har);
    expect(page!.members.map((m) => m.id)).toEqual(["8"]);
    expect(page!.skipped).toEqual({ Page: 1 });
    expect(page!.hasNextPage).toBe(false);
  });

  test("the members page URL is the group's /members", () => {
    expect(membersUrlOf("junkremovalwinners")).toBe("https://www.facebook.com/groups/junkremovalwinners/members");
  });
});

describe("membersPlan: scrolls for --count, the minutes from --secondsPerScroll, and when to stop", () => {
  test("the page gives 10, every scroll about 2 pages of 10", () => {
    expect(scrollsFor(10)).toBe(0);
    expect(scrollsFor(30)).toBe(1);
    expect(scrollsFor(31)).toBe(2);
    expect(scrollsFor(810)).toBe(40);
  });

  test("the plan line says the scrolls and minutes up front", () => {
    expect(planLine(planMembers(30, 10))).toBe("count 30 → ~1 scrolls, ~0.2 min at 10s per scroll");
    expect(planLine(planMembers(810, 15))).toBe("count 810 → ~40 scrolls, ~10 min at 15s per scroll");
    expect(planMembers(810, 15).maxScrolls).toBe(82);
    expect(planMembers(810, 15, 5)).toMatchObject({ scrolls: 5, maxScrolls: 5, minutes: 1.3 });
  });

  test("it stops at the count, when the list ends, or at maxScrolls", () => {
    const plan = planMembers(30, 0, 3);
    expect(stopOf({ members: 30, hasNextPage: true, scrolls: 1 }, plan)).toBe("count");
    expect(stopOf({ members: 12, hasNextPage: false, scrolls: 1 }, plan)).toBe("end");
    expect(stopOf({ members: 12, hasNextPage: true, scrolls: 3 }, plan)).toBe("maxScrolls");
    expect(stopOf({ members: 12, hasNextPage: true, scrolls: 2 }, plan)).toBeNull();
  });

  test("members merge by id, first seen kept, in the order they came", () => {
    const merged = mergeMembers([member({ id: "1" }), member({ id: "2" })], [member({ id: "2", name: "later" }), member({ id: "3" })]);
    expect(merged.map((m) => m.id)).toEqual(["1", "2", "3"]);
    expect(merged[1]!.name).toBe("A");
  });
});

describe("the owner filter: a bio naming the owner, or a page", () => {
  test("bio words: owner, co-owner, founder, CEO, president, proprietor, self-employed", () => {
    for (const bio of ["Owner at NEED-it-GONE", "Co-Owner of Haul Co", "Founder at The junk boys", "Owner/Manager/CEO at Junk ByeBye", "President, Acme Hauling", "Proprietor", "Works at Self-employed"]) expect(ownerReasonOf(member({ bio }))).toBe("bio");
    expect(ownerReasonOf(member({ bio: "Works at Amazon.com" }))).toBeNull();
    expect(ownerReasonOf(member({ bio: "Ownership matters" }))).toBeNull();
  });

  test("a page (a category set) is an owner, and the bio wins when both say so", () => {
    expect(ownerReasonOf(member({ category: "Local service" }))).toBe("page");
    expect(ownerReasonOf(member({ category: "Local service", bio: "Owner at Junk Junkies" }))).toBe("bio");
  });

  test("the recorded scrolls: owners by bio and pages, counted in the summary", () => {
    const all = [...memberPagesOf(gotoHar), ...memberPagesOf(scrollOneHar), ...memberPagesOf(scrollTwoHar)].reduce<GroupMember[]>((seen, p) => mergeMembers(seen, p.members), []);
    expect(all).toHaveLength(40);
    const owners = ownersOf(all);
    expect(owners.find((m) => m.name === "Gary Bousquet")?.ownerReason).toBe("bio");
    expect(owners.find((m) => m.name === "Carll Quiver")?.ownerReason).toBe("page");
    const summary = summaryOf(all);
    expect(summary.members).toBe(40);
    expect(summary.owners).toBe(owners.length);
    expect(summary.pages).toBe(all.filter((m) => m.category).length);
    expect(summary.withBio).toBe(all.filter((m) => m.bio).length);
  });
});

describe("the members files", () => {
  test("TSV with a header, one row a member, tabs and newlines in a bio flattened; JSON beside it", () => {
    const members = [member({ id: "1", bio: "Owner\tat\nX" }), member({ id: "2", category: "Local service", followers: 7 })];
    expect(membersTsv(members)).toBe("id\tname\turl\tbio\tcategory\tfollowers\tjoined\towner\n1\tA\thttps://www.facebook.com/a\tOwner at X\t\t\tJoined today\tbio\n2\tA\thttps://www.facebook.com/a\t\tLocal service\t7\tJoined today\tpage\n");
    const dir = mkdtempSync(join(tmpdir(), "logMembers"));
    const output: MembersReadOutput = { account: "a", groupKey: "junkremovalwinners", groupId: GROUP_ID, result: "read", stop: "count", members, scrolls: 1, hasNextPage: true, endCursor: "C", skipped: {}, problem: null, steps: [] };
    const saved = saveMembers(output, members, planMembers(2, 0), { owners: false, now: new Date("2026-10-24T06:30:05Z"), dir });
    expect(saved.tsv).toBe(join(dir, "junkremovalwinners", "20261024T063005.tsv"));
    expect(readFileSync(saved.tsv, "utf8").split("\n")[0]).toBe("id\tname\turl\tbio\tcategory\tfollowers\tjoined\towner");
    expect(JSON.parse(readFileSync(saved.json, "utf8"))).toMatchObject({ group: "junkremovalwinners", groupId: GROUP_ID, members: [{ id: "1", owner: "bio" }, { id: "2", owner: "page" }] });
  });
});
