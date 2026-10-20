# Buyer conversations

AGENTS.md rule 34. A buyer who writes about a listing is a conversation in
Twenty's `agencyConversations`, and every message is an `agencyMessages` row.
They are the same two objects blaster's SMS threads use. log-cli only added
fields and relations (`scripts/twenty/twentySetup.mjs`, rule 13), so blaster's SMS
rows and the dialer's reads keep working.

```
socialAccount 1 ──< agencyConversation >── 1 agencyListing
                          │
                          └──< agencyMessage
```

- `agencyConversation.socialAccount`: the account the buyer wrote to.
- `agencyConversation.agencyListing`: the listing they wrote about.
- `agencyMessage.agencyConversation`: the thread a message is in.

The inverse fields are `socialAccount.agencyConversations`,
`agencyListing.agencyConversations` and `agencyConversation.agencyMessages`.

## Where the shape comes from

| Source | What it gave | What was changed |
| --- | --- | --- |
| Listaro_backup (`supabase/migrations/001`, `020`, `023`, `024`) | A thread is a lead: buyer name, id and profile; lead status `new → contacted → qualified → booked / lost / spam`; per-message `is_read`, `sent_by` (user, va, ai, system), `ai_status` (draft, approved, sent, dismissed, failed), `ai_original_text`; unique `(thread_id, message_id)` | Listaro keyed a thread on a hash of the buyer's name, so one buyer writing about two listings was one lead. It stored the listing as a title only, and hashed `new Date()` into message ids, so a rescan stored every message again. Here the key is the account plus Facebook's own thread id, the listing is a relation, and a message key is stable across rescans |
| blaster (`convex/schema/conversations.ts`, `convex/conversations/*`) | `pairKey` as the one identity; `latestDirection`, `latestPreview` (120 characters), `latestMessageAt`, `latestMessageId`, `messageCount`; the summary only moves forward; a message status only moves up `received < queued < sent < undelivered < failed < delivered` | The same fields are reused on Marketplace rows, with `channel = FACEBOOK_MARKETPLACE` |
| Twenty, before log-cli | `agencyConversation` (peerPhone, blasterNumber, pairKey, latest*, status, links to prospect, phone and lead) and `agencyMessage` (direction, status, body, from/to numbers, errors) | Untouched. A message had no link to its conversation; it has one now |

## The fields log-cli added

**agencyConversation**

- `channel`: `SMS` or `FACEBOOK_MARKETPLACE`. An empty value means SMS (rows written before it).
- `facebookThreadId`: the id in `facebook.com/messages/t/<id>`. `pairKey` is `facebookMarketplace:<socialAccountId>:<facebookThreadId>`.
- `buyerName`, `buyerFacebookId`, `buyerProfileUrl`, `buyerPhone`, `buyerEmail`. The phone and email are taken from what the buyer wrote.
- `listingTitle`, `facebookListingId`: what the thread header shows.
- `leadStatus`: `NEW`, `CONTACTED`, `QUALIFIED`, `BOOKED`, `LOST`, `SPAM`.
- `unreadCount`, `lastReadAt`, `respondedAt` (our first reply), `lastScannedAt`.
- `autoReplied`, `aiTookOver`.

**agencyMessage**

- `channel`, `sentAt`, `facebookMessageId`, `senderName`.
- `messageKey`: `fb:<facebookMessageId>`, or `h:` plus a hash of direction, sender, shown time and text. It is unique inside a conversation.
- `isRead`, `sentBy` (`PERSON`, `VA`, `AI`, `SYSTEM`), `aiStatus`, `aiOriginalText`.
- `media`: `[{ url, kind }]`.
- Reused from blaster: `direction` (`inbound` / `outbound`), `status`, `body`, `errorCode`, `errorMessage`.

## What a scan stores

`recordThread` (`src/marketplace/conversation/client.ts`) takes one thread as
the inbox showed it and:

1. Finds the conversation by `pairKey`, or creates it as `NEW`.
2. Ties it to a listing on that account. It matches the Facebook listing id
   first, then the title, but only when exactly one listing has that title.
   Two listings with one title stay unmatched (`log conversation link`).
3. Adds each message whose key isn't stored yet. Ours are read, the buyer's
   are unread.
4. Moves the summary forward only. Our first reply makes the lead `CONTACTED`,
   and a phone number from the buyer makes it `QUALIFIED`. `BOOKED`, `LOST`
   and `SPAM` are a person's call and a scan never moves them.

Running it twice on the same scan adds nothing.

## Commands

```bash
log conversations [--account <name>] [--listing <agencyListingId>] [--json]
log conversation show <id>
log conversation read <id>                    # the buyer's messages are read; unread 0
log conversation lead <id> BOOKED             # NEW | CONTACTED | QUALIFIED | BOOKED | LOST | SPAM
log conversation link <id> --listing <agencyListingId>
log conversation record --account <name> --file threads.json
```

The `--file` for `record` holds one thread, a list, or `{ "threads": [...] }`:

```json
{
  "facebookThreadId": "9001",
  "buyerName": "Sam",
  "listingTitle": "Rubbish Removal Galway",
  "facebookListingId": "111",
  "messages": [
    { "direction": "inbound", "body": "Is this still available?", "sentAt": "2026-10-19T14:00:00Z", "senderName": "Sam" }
  ]
}
```

Each command is also an MCP tool (`conversations`, `conversation`). Nothing
here opens a browser or writes to Facebook (rule 8).

## Not built yet

- **Reading the inbox from Facebook.** The scan that produces those threads
  is a launch like any other (rules 11-12, 15-18, 22, 24). Its clicks and
  reads are written from a `log inspect` recording of the Marketplace inbox
  first (rule 29), not from Listaro's selectors.
- **Replying.** Sending a message writes to Facebook, so it waits for matt
  (rule 8). The fields for it are in place: `sentBy`, `aiStatus`,
  `aiOriginalText`, `autoReplied`, `aiTookOver`.
