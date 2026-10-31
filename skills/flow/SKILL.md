---
name: flow
description: Turn a `log inspect` recording into a flow (rule 31) - a definition built from the recording, its documentation, an XState machine, the `log flow run` command and an MCP tool of its own - and run it on any account. Use after recording a procedure with inspect, when matt says "make it a state machine", "run it on another account", "register it as an MCP", or to run a saved flow such as profileSetup.
---

# flow

Record once, then run anywhere: recording → definition → docs → machine →
command → MCP tool.

## Hard boundaries

1. **Built from a recording, never by hand** (rules 25, 29). Each step's
   element is the role and accessible name the recorded snapshot gave it;
   each step's confirming request is the mutation the recorded step sent.
   A confirming request only proves the call happened. **What it answered
   decides the step** (rule 73): a step's `answers` name the call and what its
   answer must say (a value, what we sent, present, the account's home city,
   country or id), with the error code it raises, written from the request's
   doc ("What it sent and what came back"). `marketplaceListingPublish` checks
   `buy_location`, the set-location answer's city, the create page's
   `marketplace_new_seller_can_post_item` and `sell_location` (so it stops
   before the form when the account may not post), and the listing id in the
   create answer (`noListingId`). `profileSetup`'s three saves check their
   mutations answered 2xx (no saved answers to read fields from yet). Every
   other step with a confirming request checks the field its request doc says
   it answers (`deletePost`: `move_to_trash_story.success` true; `postComment`:
   `comment_create.feedback_comment_edge`; the posts: `story_create.story_id`),
   and a test refuses a flow step that waits on a call without checking its
   answer. A streamed answer is read from its first part. The flow's doc shows
   every check, and recording the flow again keeps them.
2. **Dry run unless `--live`** (rule 8); over MCP, live is its own tool, `flow<Name>Live`, with confirmLive.
3. **Every gate** (rules 11-12, 15-18, 22, 24): a run is one launch through
   the inspect session, so every step is recorded again (snapshot,
   screenshot, HAR, rea) and mapped.
4. **No credential in a step or param** (rule 21): sign-in is `signIn`/`code`,
   which read the private login.json; typed values are redacted in snapshots.
5. Run it live (rule 26): Monitor; every machine state prints.

## The routine

```bash
# 1. record (skills/inspect)
log inspect start --account <a> --url https://www.facebook.com/me --bypass --now
log inspect do click <ref> --live ...   # one step at a time
log inspect do stop

# 2. recording → definition + docs (params renamed from text1/file1)
log flow fromInspect ~/.logCli/runs/inspect/<run> --name profileSetup \
  --rename text1=firstName --rename text2=lastName --rename file1=profilePhoto --rename file2=coverPhoto

# 3. run it on another account (dry run first: lists the filled steps, opens nothing)
log flow run profileSetup --account <a> --set firstName=Bethlehem --set lastName=Trash \
  --set profilePhoto=<path|url> --set coverPhoto=<path|url>
log flow run profileSetup --account <a> ... --live --bypass --now
```

Over MCP the same run is the tool `flowProfileSetup` with `account`, the
params by name; its live twin `flow<Name>Live` runs it on Facebook with `confirmLive: true`.

A failed step ends the run (`failedAt`): read that step's folder in the new
recording (rule 25), re-record the changed part with inspect, rebuild the flow.

## Deterministic steps (rule 79)

A step never guesses which control to press. The session gathers every visible
control and `python/browser/controlMatch.py` scores them: the step's role, then
its name as the accessible name, aria-label, label, text or placeholder (case
and spacing ignored), inside the step's dialog (`within`) or an open dialog
over the page behind it. One match is pressed; two are refused
(`controlAmbiguous`), none is `controlMissing`, a disabled one is waited for
until the step's time runs out (`controlDisabled`). So "Upload Photo" in a
recording finds Facebook's "Upload photo", and a Dismiss button with no
accessible name is found by its text.

`fromInspect` writes what keeps a step deterministic:

- `within`: the dialog around the control in the snapshot before the step.
- `expect`: the call the step must cause, a mutation first, else a plain
  endpoint (`/profile/picture/upload/` is `profilePictureUpload`), else a
  `…DialogQuery`. The session waits for it, and the step fails without it.
- `answers`: what that call must say (rule 73), added from the recording's
  exchanges before the flow ships; `answers.test.ts` refuses a step with
  `expect` and no `answers`.

Before a flow's first click, fill or upload, `clearOverlays` reads the page
and presses Escape for each known overlay over it (`OVERLAY_CLEARS`,
`src/browser/flow/helpers/overlays.ts`), then reads the page again:

| Overlay | Page state | Checked by |
| --- | --- | --- |
| "To allow or block browser notifications from Facebook…" | `browserNotificationsNotice` | gone from the page (Escape sends no call) |
| "What happened" … "Ended on <date>" | `pastNoticeDialog` | `useAccountStatusClearEnrollmentEntryPointActionMutation` answers `data.xfb_ixt_gateway_clear_flow: true` |

One still there after its Escape, or a clear call that answers otherwise,
stops the flow at that step with `overlayNotCleared`. A "What happened" with
no "Ended on" is not cleared: it stays unknown, for SubQ to read (rule 74).
A new overlay is added there with its page state, fixture and answer.

When Facebook changes a page, add its snapshot excerpt to
`python/fixtures/controls/` (no names, no page copy) and a case to
`src/browser/flow/controlMatch.test.ts`, so the next change fails a test, not
a live run.
Rebuild the request docs after a run (rule 27): `capture --docs`.

## Saved flows

| Flow | Recorded | Does |
| --- | --- | --- |
| `profileSetup` | Lancaster, 2026-10-19; the picture steps checked on Exeter, 2026-10-24 | Profile picture, cover photo, name (13 steps). The picture steps wait on the dialog query, the upload and the set mutation, inside "Choose profile picture". The host runs only the parts Twenty has data for (`flowWithParams`). |
| `marketplaceListingDelete` | Bethlehem, 2026-10-23 | Delete one Marketplace listing from Selling: More options, Delete listing, Delete, then "No, haven't sold" on Facebook's survey (6 steps). The menu answer must name the listing id given, and so must the delete answer (`commerce_for_sale_item_delete.deleted_for_sale_item_id`). Run it through `log facebook listing remove`, which then sets the Twenty row REMOVED. |
