---
title: "Voice notes"
---

# Voice notes

Every voice note on X and Discord, sent to matt or by him, is transcribed with AssemblyAI and written into the conversation store, so search, the voice gate and SubQ see what was said. Rules 26, 41, 88, 89, 94, 105, 106 and 126.

## AssemblyAI

### REQ-TRANSCRIBE-01: Upload, ask, poll until done

A file is uploaded with `POST https://api.assemblyai.com/v2/upload`, its transcript is asked for with `POST /v2/transcript` naming the upload url, and the transcript is read with `GET /v2/transcript/<id>` every few seconds until AssemblyAI says `completed` or `error`, or 15 minutes pass. Every call carries the key in the `authorization` header.

Checked by: code and SubQ

### REQ-TRANSCRIBE-02: No key means no call

The key is `ASSEMBLYAI_API_KEY` or `ASSEMBLY_AI_KEY` (the environment, the repo's `.env.local`, `~/.buzz/.env.local` or `~/filmcraft/.env.local`), never printed. Without it nothing is sent to AssemblyAI and nothing is read from a platform: `log transcribe` refuses with `assemblyAiKeyMissing`, and a read that met a voice note says it isn't transcribed.

Checked by: code and SubQ

### REQ-TRANSCRIBE-03: AssemblyAI's failure is passed on

An answer that isn't 200, or a transcript whose status is `error`, comes back as `transcriptionFailed` with AssemblyAI's own words, and the run says which voice note failed.

Checked by: code and SubQ

### REQ-TRANSCRIBE-04: A file is transcribed once

Each transcript is kept by the sha256 of its file in the `transcripts` table of `log.db` (its whole answer in `body`), with which message it belongs to in `transcriptLinks`. A file whose hash is kept is answered from there and never sent to AssemblyAI again. The old `~/.logCli/transcripts` files are imported once (`importTranscriptFiles`).

Checked by: code and SubQ

## The store

### REQ-TRANSCRIBE-05: The marker becomes what was said

A message's `(audio: <name>)` marker is replaced by `(voice note: "<transcript>")`, and the leftover `(audio saved: …)` marker goes, only for a message whose platform, account, message id and file name are tied to a kept transcript.

Checked by: code and SubQ

### REQ-TRANSCRIBE-06: A fresh read never loses a transcript

Saving conversations (an export, `twitterDms`, `searchIndex`) writes the kept transcripts back in before anything is written, so a conversation read again keeps its voice notes as words.

Checked by: code and SubQ

### REQ-TRANSCRIBE-07: Discord keeps its attachments

Discord's export, read and watch keep each message's attachments (name, type, duration), and an audio attachment adds its `(audio: <name>)` marker to the message's text, so a voice message is no longer an empty message.

Checked by: code and SubQ

## Finding and fetching

### REQ-TRANSCRIBE-08: X voice notes come through the account's one session

An X voice note's file is the one the X Chat read saved; a missing one is fetched by reading its conversation again through the account's engine with its audio events reopened, never by a request of log's own.

Checked by: code and SubQ

### REQ-TRANSCRIBE-09: Discord voice notes come from Discord's sound search

Discord voice notes are found with Discord's own message search for sound (`has=sound`), one chat at a time, paused between calls, and each file is fetched from its fresh attachment url through the vendored client.

Checked by: code and SubQ

### REQ-TRANSCRIBE-10: A refusal stops it

Any refusal from Discord's search (a 429, a 401, any answer that isn't 200 or 202) stops the whole search with Discord's answer, keeping what was found; nothing is retried. An X read that fails stops the fetching for that account.

Checked by: code and SubQ

## New voice notes

### REQ-TRANSCRIBE-11: Reads and the inbox transcribe as they go

`discordRead`, `slackRead`, `twitterDms` with or conversation, and a voice message the Discord watch hands to the inbox are transcribed before they are shown; the inbox hook shows a kept transcript and says when one isn't transcribed yet.

Checked by: code and SubQ

## Every platform

### REQ-TRANSCRIBE-12: Audio is detected once, for every platform

One shared detector, in Python (`python/platformKit/media.py`) and TypeScript (`src/platformKit/media`), says whether an attachment is audio: a content type of `audio/*` or `video/ogg`, an extension (`.ogg .oga .opus .m4a .mp3 .wav .aac .webm`), or the platform's own flag (Discord's voice-message flag 8192 with a duration, or a waveform; X Chat's audio media; Slack's `slack_audio` file subtype). A video or image type is never audio. The Discord, Slack and X engines and the transcribe path all use it; none has a list of its own.

Checked by: code and SubQ

### REQ-TRANSCRIBE-13: A new platform keeps its attachments from the start

`log new platform` writes a message shape into the new engine that keeps each message's attachments and marks audio with the shared detector, and `check:platforms` refuses any platform engine that answers with messages but doesn't import the shared detector or keep attachments.

Checked by: code and SubQ
