---
name: conversations
description: Store and manage buyers' Marketplace conversations in Twenty (rule 34) - agencyConversations tied to their agencyListing and socialAccount, agencyMessages tied to their conversation. Use when matt asks about buyers, leads, messages, inbox, replies, "who wrote about this listing", or to record a scanned thread.
---

# conversations

A buyer who writes about a listing is an `agencyConversation` on that
listing and account. Each message is an `agencyMessage` in it. The shape,
and where each field came from (Listaro, blaster), is in
`docs/conversations.md`.

## Hard boundaries

1. **Twenty only.** These commands never open a browser and never write to
   Facebook (rule 8). Replying waits for matt.
2. **Additive** (rule 13). A field is only ever added through
   `scripts/twenty/twentySetup.mjs`, then the client is regenerated
   (`bun run twenty:client`, rule 14). blaster's SMS fields are never
   renamed or retyped.
3. **Never guess the listing.** A thread is tied to a listing by the
   Facebook listing id, or by a title only one listing on the account has.
   Otherwise it stays unmatched until `log facebook conversation link`.
4. **A person's call stands.** `BOOKED`, `LOST` and `SPAM` are never moved
   by a scan.

## The routine

```bash
log facebook conversations --account <name>                  # newest first
log facebook conversation show <id>                          # every message; * marks unread
log facebook conversation record --account <name> --file threads.json
log facebook conversation read <id>
log facebook conversation lead <id> QUALIFIED
log facebook conversation link <id> --listing <agencyListingId>
```

`record` is idempotent: a second run on the same file adds nothing.

## Reading the inbox (next)

The scan that writes `threads.json` from Facebook isn't built. Record the
Marketplace inbox with `log inspect` first (rule 29: goto the inbox,
snapshot, open a thread, snapshot), read its HAR with rea for the requests
that carry thread and message ids (rule 25), then build the scan from that
recording.
