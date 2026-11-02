---
title: "Facebook groups"
---

# Facebook groups

Facebook group listening is OpenMagpie's triage job: an account joins a group, OpenMagpie polls it through log-cli's worker (`log facebook poll --request`), keeps every post and sends only the matches to Twenty. log-cli writes only the group's read state to Twenty. A group's members are read from its People tab, a scroll at a time, into files on disk. Rules 65 and 77 (rule 65 replaces rules 61 and 62).

## Listening

### REQ-GROUP-01: The poll worker answers OpenMagpie's groups.search

`log facebook poll --request <json>` takes OpenMagpie's `groups.search` request (Facebook's numeric group ids, terms, a limit of 20 by default and 100 at most) and prints one JSON line in OpenMagpie's record shape: each post's id, group, text, link, author, time, comment count and the terms it matched. Any other action, an empty or non-numeric group id, or a request that is not JSON is refused.

Checked by: code and SubQ

### REQ-GROUP-02: Each group is read in an open browser of an account in it

For each group in the request, the worker picks an account in Twenty that is in that group (members first) whose browser is open, and reads the group as a step in that open browser. With no account in the group it answers `groupNoAccount`; with none whose browser is open, `groupBrowserNotOpen`. It never opens a browser of its own.

Checked by: code and SubQ

### REQ-GROUP-03: A poll clicks nothing and reads no comments

A poll reads the group's posts only: no comments are opened and nothing is clicked.

Checked by: code and SubQ

### REQ-GROUP-04: A sign-in problem is auth_required to OpenMagpie

A checkpoint, a login wall, a video selfie, an expired session or an account never connected is answered to OpenMagpie as `auth_required`.

Checked by: code and SubQ

### REQ-GROUP-05: Only the group's read state and identity are written to Twenty

A group read writes to Twenty only the group row's `readCursor`, `lastReadAt` and `lastReadReason`, and its `facebookGroupId` and `groupUrl` when the read finds the group's numeric id (a row made from a vanity URL gets its real id, which `poll --request` finds groups by). No post and no comment is written to Twenty (`agencyGroupPosts` and `agencyGroupComments` stay unused).

Checked by: code and SubQ

### REQ-GROUP-06: The cursor moves only when the feed read finished

The group's `readCursor` is written only when the read of the feed finished; `lastReadAt` and `lastReadReason` are written every time.

Checked by: code and SubQ

## Members

### REQ-GROUP-07: Members are read from the People tab, nothing clicked

`log facebook read members` goes to the group's `/groups/<g>/members` page in the account's open browser and then only scrolls. Nothing is clicked.

Checked by: code and SubQ

### REQ-GROUP-08: Members come from the page and each scroll's refetch answer

The first members come from the page's HTML, and each scroll's members from Facebook's `GroupsCometMembersPageNewMembersSectionRefetchQuery` answers: each member's id, name, profile, bio, page category, followers and when they joined.

Checked by: code and SubQ

### REQ-GROUP-09: It says up front how long it will take

Before it starts, the read says `count N → ~S scrolls, ~M min at Xs per scroll`, where S is the scrolls needed for the count at 10 members on the page and about 20 a scroll, and X is `--secondsPerScroll`.

Checked by: code and SubQ

### REQ-GROUP-10: secondsPerScroll is the wait before each scroll

`--secondsPerScroll` (15 by default) is the wait before each scroll.

Checked by: code and SubQ

### REQ-GROUP-11: It stops at the count, the end of the list or maxScrolls

The read stops when it has `--count` members, when Facebook's answer says there is no next page, or after `--maxScrolls` scrolls (twice the planned scrolls plus 2 by default).

Checked by: code and SubQ

### REQ-GROUP-12: --owners keeps owners and pages

With `--owners`, only members whose bio names owner, co-owner, founder, CEO, president, proprietor or self-employed, or who are a page (a page category is set), are kept.

Checked by: code and SubQ

### REQ-GROUP-13: Members go to files, never to Twenty

The members are saved to `~/.logCli/members/<group>/<run time>.tsv` and `.json`. Nothing about them is written to Twenty.

Checked by: code and SubQ

### REQ-GROUP-14: A members page that answered is a known state that needs nothing

A group members page whose refetch answered with members is the known page state `groupMembersList`, which needs nothing: no resolver and no reading.

Checked by: code and SubQ
