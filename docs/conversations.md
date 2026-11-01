# Buyer conversations

When a buyer messages an account about a Marketplace listing, log stores that chat as a conversation in your Twenty server, tied to the account and the listing. Each message is its own row, so you can see every lead, where it stands, and which listing it came from. Read this if you work with leads or want to know how a chat is matched to a listing.

## The shape

A conversation is a row in Twenty's `agencyConversations`, and every message is an `agencyMessages` row. These are the same two objects an SMS tool already uses for its threads. log only added fields and relations (`scripts/twenty/twentySetup.mjs`), so existing SMS rows and readers keep working.

```
socialAccount 1 ──< agencyConversation >── 1 agencyListing
                          │
                          └──< agencyMessage
```

- `agencyConversation.socialAccount`: the account the buyer wrote to.
- `agencyConversation.agencyListing`: the listing they wrote about.
- `agencyMessage.agencyConversation`: the conversation a message belongs to.

The reverse fields are `socialAccount.agencyConversations`, `agencyListing.agencyConversations` and `agencyConversation.agencyMessages`.

## Where the design comes from

| Source | What it gave | What changed |
| --- | --- | --- |
| An earlier Marketplace tool | A thread is a lead: buyer name, id and profile; lead status `new → contacted → qualified → booked / lost / spam`; per-message read flag, who sent it (person, VA, AI, system), AI draft status and original text. | It keyed a thread on a hash of the buyer's name, so one buyer writing about two listings became one lead. It stored the listing as a title only, and put the current time into message ids, so a rescan stored every message again. Here the key is the account plus Facebook's own thread id, the listing is a relation, and a message key stays the same across rescans. |
| An SMS tool's conversations | One identity per thread (`pairKey`); a summary (`latestDirection`, `latestPreview` of 120 characters, `latestMessageAt`, `latestMessageId`, `messageCount`) that only moves forward; a message status that only moves up `received < queued < sent < undelivered < failed < delivered`. | The same fields are reused for Marketplace rows, with `channel = FACEBOOK_MARKETPLACE`. |
| Twenty, before log | `agencyConversation` (phone numbers, `pairKey`, latest fields, status, links) and `agencyMessage` (direction, status, body, numbers, errors). | Untouched, except that a message now links to its conversation. |

## Fields log added

**agencyConversation**

- `channel`: `SMS` or `FACEBOOK_MARKETPLACE`. Empty means SMS (rows written before the field existed).
- `facebookThreadId`: the id in `facebook.com/messages/t/<id>`. `pairKey` is `facebookMarketplace:<socialAccountId>:<facebookThreadId>`.
- `buyerName`, `buyerFacebookId`, `buyerProfileUrl`, `buyerPhone`, `buyerEmail`. Phone and email are taken from what the buyer wrote.
- `listingTitle`, `facebookListingId`: what the thread header shows.
- `leadStatus`: `NEW`, `CONTACTED`, `QUALIFIED`, `BOOKED`, `LOST`, `SPAM`.
- `unreadCount`, `lastReadAt`, `respondedAt` (our first reply), `lastScannedAt`.
- `autoReplied`, `aiTookOver`.

**agencyMessage**

- `channel`, `sentAt`, `facebookMessageId`, `senderName`.
- `messageKey`: `fb:<facebookMessageId>`, or `h:` plus a hash of direction, sender, shown time and text. It is unique within a conversation.
- `isRead`, `sentBy` (`PERSON`, `VA`, `AI`, `SYSTEM`), `aiStatus`, `aiOriginalText`.
- `media`: `[{ url, kind }]`.
- Reused from the SMS fields: `direction` (`inbound` / `outbound`), `status`, `body`, `errorCode`, `errorMessage`.

## What recording a thread does

`recordThread` (`src/marketplace/conversation/client.ts`) takes one thread as the inbox showed it and:

1. **Finds the conversation** by `pairKey`, or creates it as `NEW`.
2. **Ties it to a listing** on that account: by Facebook listing id first, then by title, but only when exactly one listing has that title. If two listings share a title, it stays unmatched and you link it with `log facebook conversation link`.
3. **Adds each new message** whose key isn't stored yet. Our messages are marked read, the buyer's unread.
4. **Moves the summary forward only.** Our first reply makes the lead `CONTACTED`; a phone number from the buyer makes it `QUALIFIED`. `BOOKED`, `LOST` and `SPAM` are a person's call, and a scan never sets them.

Recording the same scan twice adds nothing.

## Commands

```bash
log facebook conversations [--account <name>] [--listing <agencyListingId>] [--json]
log facebook conversation show <id>
log facebook conversation read <id>                    # marks the buyer's messages read; unread 0
log facebook conversation lead <id> BOOKED             # NEW | CONTACTED | QUALIFIED | BOOKED | LOST | SPAM
log facebook conversation link <id> --listing <agencyListingId>
log facebook conversation record --account <name> --file threads.json
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

Each command is also an MCP tool (`conversations`, `conversation`). None of them opens a browser or writes to Facebook.

## Not built yet

- **Reading the inbox from Facebook.** The scan that produces these threads is a browser launch like any other, with every launch gate. Its clicks and reads will be written from a `log inspect` recording of the Marketplace inbox first.
- **Replying.** Sending a message writes to Facebook, so it waits until the owner asks for it. The fields for it are already in place: `sentBy`, `aiStatus`, `aiOriginalText`, `autoReplied`, `aiTookOver`.

The rules behind this are in AGENTS.md.
