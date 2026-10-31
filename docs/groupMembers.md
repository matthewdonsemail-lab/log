# Reading a Facebook group's members

`log facebook read members` reads a group's newest members from its People tab: their name, profile, bio, page category, followers and when they joined. It runs in the account's already-open browser, only scrolls, and never clicks. Use it when you want a list of who recently joined a group, for example to find business owners in it.

```
log facebook read members --account <a> --group <url|id> --count <n> [--secondsPerScroll <s>] [--maxScrolls <n>] [--owners] [--bypass] [--json]
```

Code: `src/facebook/group/members`. MCP tool: `readMembers` (read-only, so there is no live version).

## Where the members come from

This was worked out from a `log inspect` recording: open `/groups/<group>/members`, then 18 plain scrolls (3-5 wheel moves of 300-600 px each). Nothing was clicked.

- **The page's HTML** carries the first 10 new members, in the page's embedded Relay JSON at `data.group.new_members` (`edges[]` and `page_info` with `end_cursor` and `has_next_page`). The same HTML also holds the admins and experts (`paginated_member_sections`), which aren't read.
- **Every scroll** fires [`GroupsCometMembersPageNewMembersSectionRefetchQuery`](platforms/facebook/groups/GroupsCometMembersPageNewMembersSectionRefetchQuery.md) with `count: 10`, the `cursor` and the `groupID`. It fires 1 to 3 times per scroll, 2 on average. Its answer is `data.node.new_members`, in the same shape. In the recording, 18 scrolls gave 340 members in 34 answers, 350 with the page's 10, and no duplicates.

Each edge is one member: `edge.join_status_text.text` ("Joined about an hour ago", "Joined on Wednesday") and `edge.node`, a `"__typename": "User"` object.

- A node that isn't a User is counted as `skipped` and never kept.
- Members are merged by `id`; the first one seen is kept, newest first, as Facebook lists them.
- An answer for a different group (its `node.id`) is ignored.

| Field | From | Note |
| --- | --- | --- |
| `id` | `node.id` | The profile's numeric id. |
| `name` | `node.name` | |
| `url` | `node.url` | The profile link. |
| `bio` | `node.bio_text.text` | About half had one in the recording ("Owner at …", "Works at …", a town, a school). |
| `category` | `node.profile_plus_category_display_name` | Set on professional profiles and pages: "Local service", "Waste management company", but also "Digital creator", "Personal blog". |
| `followers` | `node.follower_count` | |
| `joined` | `edge.join_status_text.text` | Facebook's words, not a date. |

## Planning a read: `--count` and `--secondsPerScroll`

How long a read takes is something you choose.

- **`--count <n>`** (1-5000) is how many members to read. The page gives 10, and each scroll about 20 more, so the plan is `ceil((count - 10) / 20)` scrolls (`scrollsFor`).
- **`--secondsPerScroll <s>`** (default 15, 0-600) is the wait before each scroll. The planned minutes are `scrolls × secondsPerScroll / 60`. Each scroll's own time (the wheel moves and the page settling, 15-30 s in the recording) comes on top, and the result says how long it really took.
- **`--maxScrolls <n>`** caps the scrolls. The default is twice the plan plus 2, since a scroll can bring 1 to 3 pages.

It prints the plan before the first step, for example `count 30 → ~1 scrolls, ~0.2 min at 10s per scroll` or `count 810 → ~40 scrolls, ~10 min at 15s per scroll`.

## How a read runs

`membersReadMachine` (`src/facebook/group/members/machine.ts`) is an XState machine. Its only side effect is a step in the account's open browser.

1. **Opening:** go to `/groups/<g>/members` and take the first members from its HTML. A checkpoint or login page stops it. A members page with no member list stops it with `groupPageNotOpened`.
2. **Waiting:** wait `--secondsPerScroll`.
3. **Scrolling:** one plain scroll, as recorded. That step's refetch answers are read from its own recording (HAR).
4. **Stopping:** it stops at `--count` members (`count`), when `has_next_page` is false (`end`), or at `--maxScrolls` (`maxScrolls`). A failed scroll stops it and keeps what was read so far (`groupReadStepFailed`).

Nothing is clicked, typed or followed: the Add friend and Follow buttons are never touched. It refuses to run outside the account's active hours unless you pass `--bypass`, and it refuses without the account's open browser (`groupBrowserNotOpen`). It never opens a browser itself.

## Finding owners: `--owners`

A member counts as an owner when either:

- **their bio** names `owner`, `co-owner`, `founder`, `CEO`, `president`, `proprietor` or `self-employed` (whole words, any case), or
- **they are a page**: their category is set.

`ownerReasonOf` checks the bio first, then the page. `--owners` keeps only owners in the files and the `--json` output; the summary always counts both. Many categories are "Digital creator" (professional mode on a personal profile), so page-only owners can be numerous. The files say which reason each owner has (the `owner` column: `bio` or `page`).

## Output

Nothing goes to Twenty. Each run writes two files:

- `~/.logCli/members/<group>/<run time>.tsv` (`LOG_MEMBERS_DIR` moves it): `id`, `name`, `url`, `bio`, `category`, `followers`, `joined`, `owner`, one row per member, with tabs and newlines in bios flattened.
- The same name as `.json`: the account, the group and its id, the plan, why it stopped, the scrolls, and every member with its `owner` reason.

It prints how many members it read, how many had a bio, the owners (by bio and as a page only), the pages, the plan against the real time, each step, and the two file paths. `--json` returns the members and the summary.

## Example run

`--count 30 --secondsPerScroll 10 --bypass` on a group: the plan said `count 30 → ~1 scrolls, ~0.2 min at 10s per scroll`. The page gave 10 members, the first scroll 10 more (one answer), the second 30 more (three answers), so it stopped at 30 after 2 scrolls in 84 seconds. Of the 30, 15 had a bio and 15 were owners (4 by bio, 11 as a page only). Nothing was clicked.

## The known page state

A step on `/groups/<g>/members` whose `GroupsCometMembersPageNewMembersSectionRefetchQuery` answered with `new_members` edges is the page state `groupMembersList` (`src/browser/flow/helpers/pageState.ts`). It needs nothing (`needsNothing`): there is no resolver, the page-state hook mentions it once and never holds the turn on it, and an inspect step there is decided without a SubQ reading.

The rules behind this are in AGENTS.md.
