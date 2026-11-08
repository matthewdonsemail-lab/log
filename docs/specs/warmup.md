---
title: "Warm-up"
---

# Warm-up

The warm-up makes an account look used before it sells: Listaro's five Facebook activities run as recorded flows (`log facebook warmup stages`), and the Reels activity (`log facebook warmup reel`) watches reels the way a real person with the account's persona would, each step checked against what it must achieve. Rules 36, 49 and 50, with the command forms of rules 60 and 63 and the code layout of rule 64.

## Stages

### REQ-WARMUP-01: The stages are Listaro's five activities, each a flow of its own

The stages are feedBrowse, marketplaceBrowse, createAccessCheck, sellingVisit and messagesVisit, in that order, each scripted from Listaro's `account-warmup.ts` and each turned into its own flow (`warmupFeedBrowse` and so on).

Checked by: code (anchors)

### REQ-WARMUP-02: Recording turns each activity into a flow, never from a broken recording

`log facebook warmup stages record` runs each activity's steps in one open browser, and saves each activity whose steps all worked as a flow from the recording. An activity whose step failed, or that met a checkpoint, is not saved as a flow.

Checked by: code and SubQ

### REQ-WARMUP-03: Running needs every flow recorded, and runs them in turn in one browser

`log facebook warmup stages run` is refused with `flowNotRecorded` while any picked activity's flow is missing. Otherwise the warm-up machine runs each activity's flow in turn in the one open browser, with a gap between activities (10 s by default, `--gapSeconds`).

Checked by: code and SubQ

### REQ-WARMUP-04: A checkpoint, login wall or restriction stops the stages

When an activity ends on a checkpoint, a login wall or a policy restriction, the warm-up machine stops in its blocked state and the issue is recorded on the account. A noted issue (`marketplaceMayNotPost`) is written down and the warm-up carries on.

Checked by: code and SubQ

### REQ-WARMUP-05: Each stage event goes to the stage log

Every start, activity, step, gap, note, stop and end of a stages run is written as one `stageLog` record in `log.db` (the old `~/.logCli/runs/warmup/stageLog.jsonl` is imported once), read with `log facebook warmup stages log`.

Checked by: code and SubQ

## Reels steps

### REQ-WARMUP-06: Reels start with the sound on

The Reels activity opens Reels and then presses Unmute before the first watch, since reels start muted.

Checked by: code and SubQ

### REQ-WARMUP-07: Every Reels step says what it must achieve

Each Reels step that acts carries what it must achieve: a swipe presses Next card and must change the URL to another `/reel/` page, opening the comments must show the Comments heading and closing them must hide it, and a step is checked against that when it returns.

Checked by: code and SubQ

### REQ-WARMUP-08: The comments are scrolled over the panel

Reading the comments scrolls with the wheel over the Comments panel (`scrollIn` on the Comments heading), not over the video.

Checked by: code and SubQ

### REQ-WARMUP-09: Each run writes the outline of the steps that did not work

A Reels or other activity record or run writes `warmup_<platform>_<activity>.json` in the browser's run folder, with every step's outcome and the ones that did not do what they should.

Checked by: code and SubQ

### REQ-WARMUP-10: A drawn session skips most reels after a glance

A drawn Reels session (`reel plan`, `reel run`) draws its length from a range (8 to 20 reels by default) and skips a reel after a 1 to 3 s glance with a chance of 0.6 by default (`--skip`), often a few in a row; only the others are watched, and on those the comments, the profile and a like may follow.

Checked by: code and SubQ

### REQ-WARMUP-11: Likes need --likes, clicks need --live

A step that likes is skipped unless the run has `--likes`, and a step that clicks on the page is skipped unless it has `--live`, in the drawn session, the persona session and the stages alike. The persona's allowed actions allow a like only with both `--live` and `--likes`.

Checked by: code and SubQ

## Persona

### REQ-WARMUP-12: One persona, one real viewer and one pack per account

`--persona` keeps one persona per account, drawn once from the datasets and saved, one real KuaiRand-1K viewer matched to the persona's scroll speed and saved beside it, and one persona pack built from both. They are reused on every later run unless `--newPersona` is given.

Checked by: code and SubQ

### REQ-WARMUP-13: SubQ reads each reel from its frame

When a reel lands, SubQ is sent its frame (the screenshot), its caption and creator, the persona and its pack, and asked what the reel is, whether it is this persona's kind of content, and the one action they would pick among those the run allows.

Checked by: code and SubQ

### REQ-WARMUP-14: The watch is the viewer's real play scaled by the interest effect

The watch time of a reel is the real viewer's next play, moved within the viewer's own plays by whether the reel is theirs, scaled by the interest effect measured on KuaiRand-Pure's random log, and capped at the pack's attention span.

Checked by: code and SubQ

### REQ-WARMUP-15: The watch counts from when the reel landed

The watch time counts from when the reel landed, so the time SubQ takes to read it is part of the watch: only what is left of the watch is waited.

Checked by: code and SubQ

### REQ-WARMUP-16: At most one action per reel, by its score

Each reel gets at most one action (like, open the comments, open the profile), drawn by its score: its chance in the pack times the interest effect, times the segment's weight, times how well the watch fits the viewer's attention. An action the run does not allow scores 0, and a like scores 0 within 3 reels of the last like.

Checked by: code and SubQ

### REQ-WARMUP-17: A close call is settled by SubQ's pick

When the two best actions score within 20 percent of the best and the drawn action is one of them, SubQ's pick decides between them when it named one of the two.

Checked by: code and SubQ

### REQ-WARMUP-18: rea reads each step without holding up the next

Each Reels persona step is sent with `reaLater`, so rea reads its recording without the next step waiting for it.

Checked by: code and SubQ
