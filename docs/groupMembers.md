# Reading a Facebook group's members (rule 77)

Status: **built, 2026-10-24** (matt approved the design that day). `log facebook read members` reads a group's newest members from its People tab, in the account's open browser, nothing clicked. Code: `src/facebook/group/members`. MCP tool: `readMembers` (read-only on Facebook, no live twin).

```
log facebook read members --account <a> --group <url|id> --count <n> [--secondsPerScroll <s>] [--maxScrolls <n>] [--owners] [--bypass] [--json]
```

## Where the members come from

Recorded with `log inspect` on account 61594063207669 in "Junk Removal Winners" (`junkremovalwinners`, group 3549906855288164), run `20261024T060921`: a goto of `/groups/junkremovalwinners/members`, then 18 plain `scroll` steps (3-5 wheel moves of 300-600 px each). Nothing was clicked.

- **The page's HTML** (step 03) carries the first 10 new members, embedded in the page's Relay JSON at `data.group.new_members`: `edges[]` and `page_info` (`end_cursor`, `has_next_page`). The same HTML also holds the admins and experts (`paginated_member_sections`): those are not read.
- **Every scroll** fires [`GroupsCometMembersPageNewMembersSectionRefetchQuery`](platforms/facebook/groups/GroupsCometMembersPageNewMembersSectionRefetchQuery.md) (`count: 10`, the `cursor`, `groupID`), 1 to 3 times a scroll, 2 on average (steps 04-21: 340 members in 34 answers over 18 scrolls, 350 with the page's 10, no duplicates). Its answer is `data.node.new_members` in the same shape.

Each edge is one member: `edge.join_status_text.text` ("Joined about an hour ago", "Joined on Wednesday") and `edge.node`, a `"__typename": "User"` object with `id`, `name`, `url`, `bio_text.text`, `profile_plus_category_display_name`, `follower_count`. A node that isn't a User is counted (`skipped`) and never kept; a member is merged by its `id`, first seen kept, newest first as Facebook lists them. An answer for another group (its `node.id`) is ignored.

| Field | From | Note |
| --- | --- | --- |
| `id` | `node.id` | the profile's numeric id |
| `name` | `node.name` | |
| `url` | `node.url` | the profile link |
| `bio` | `node.bio_text.text` | 194 of the 350 recorded had one ("Owner at …", "Works at …", a town, a school) |
| `category` | `node.profile_plus_category_display_name` | set on professional profiles and pages, 160 of 350: "Local service", "Waste management company", and also "Digital creator", "Personal blog", "Entrepreneur" |
| `followers` | `node.follower_count` | |
| `joined` | `edge.join_status_text.text` | Facebook's words, not a date |

## The plan: `--count` and `--secondsPerScroll`

matt, 2026-10-24: "the time it takes for 40 scrolls is interesting and should also be a variable". So:

- `--count <n>` (1-5000) is how many members to read. The page gives 10, each scroll about 2 pages of 10, so the plan is `ceil((count - 10) / 20)` scrolls (`scrollsFor`).
- `--secondsPerScroll <s>` (default 15, 0-600) is the wait before each scroll. The plan's minutes are `scrolls × secondsPerScroll / 60`; each scroll step's own time (the wheel moves and the page settling, 15-30 s in the recording) comes on top, and the result says how long it really took.
- `--maxScrolls <n>` caps the scrolls (default twice the plan's, plus 2, since a scroll brings 1 to 3 pages).

It says the plan before the first step, e.g. `count 30 → ~1 scrolls, ~0.2 min at 10s per scroll`, and `count 810 → ~40 scrolls, ~10 min at 15s per scroll`.

## The machine

`membersReadMachine` (`src/facebook/group/members/machine.ts`, XState, rule 6), its one side effect the step in the account's open browser (rule 35):

- `opening`: goto `/groups/<g>/members`; the first members from its HTML. A checkpoint or a login stops it; a members page with no member list stops it with `groupPageNotOpened`.
- `waiting`: `--secondsPerScroll`.
- `scrolling`: a plain `scroll`, as recorded; that step's refetch answers are read from its own HAR (rule 73).
- It stops at `--count` members (`count`), when `has_next_page` is false (`end`), or at `--maxScrolls` (`maxScrolls`). A failed scroll stops it with what was read so far (`groupReadStepFailed`).

Nothing is clicked, typed or followed: the tab's Add friend and Follow buttons are never touched (rule 8). It refuses outside the account's hours unless `--bypass` (rules 18, 20), and without the account's open browser (`groupBrowserNotOpen`): it never opens one.

## Owners: `--owners`

A member is an owner when their bio names `owner`, `co-owner`, `founder`, `CEO`, `president`, `proprietor` or `self-employed` (whole words, any case), or when they are a page: a category set (`ownerReasonOf`: `bio` first, then `page`). `--owners` keeps only those in the files and the `--json` output; the summary always counts both. In the recording most categories are "Digital creator" (professional mode on a person's profile), so pages-only owners are many: the files say which reason each owner has (`owner` column: `bio` or `page`).

## Output

Nothing goes to Twenty. Each run writes:

- `~/.logCli/members/<group>/<run time>.tsv` (`LOG_MEMBERS_DIR` moves it): `id`, `name`, `url`, `bio`, `category`, `followers`, `joined`, `owner`, one row a member, tabs and newlines in a bio flattened.
- the same name `.json`: the account, the group and its id, the plan, the stop, the scrolls, and every member with its `owner` reason.

It prints how many members, how many with a bio, the owners (by bio and as a page only), the pages, the plan against how long it took, each step, and the two files. `--json` returns the members and the summary.

## First live run

2026-10-24, account 61594063207669, in its open inspect session (20261024T060921, steps 22-24), `--group junkremovalwinners --count 30 --secondsPerScroll 10 --bypass`: the plan said `count 30 → ~1 scrolls, ~0.2 min at 10s per scroll`; the page gave 10, the first scroll 10 (1 answer), the second 30 (3 answers), so it stopped at 30 after 2 scrolls in 84 s. 30 members, 15 with a bio, 15 owners (4 by bio, 11 as a page only), 14 pages. Nothing was clicked.

## Known state

A step on `/groups/<g>/members` whose `GroupsCometMembersPageNewMembersSectionRefetchQuery` answered with `new_members` edges is the page state `groupMembersList` (`src/browser/flow/helpers/pageState.ts`). It needs nothing (`needsNothing`): no resolver, the page-state hook says it once and never holds the turn on it, and an inspect step there is decided without a SubQ reading.
