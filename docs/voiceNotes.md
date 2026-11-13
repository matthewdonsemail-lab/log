---
title: "Voice notes"
---

# Voice notes

Every voice note matt was sent, or sent himself, on X, Discord and Slack is transcribed with [AssemblyAI](https://www.assemblyai.com/docs) and written into the conversation store. `log search`, `voice` and the SubQ matrices then see what was said instead of a bare file name.

## What it looks like in the store

Before, an X voice note was only its marker, and a Discord one was an empty message:

```text
(audio: 9035F3EB-8899-42CE-8BF7-E6AD2C4F152E.m4a)
```

After `log transcribe`:

```text
(voice note: "<what was said, word for word>")
```

## How audio is detected

Once, for every platform, in the shared message layer: `python/platformKit/media.py` for the engines and `src/platformKit/media` for the commands (rule 126). An attachment is audio when its content type is `audio/*` or `video/ogg`, its extension is `.ogg .oga .opus .m4a .mp3 .wav .aac .webm`, or the platform says so itself: Discord's voice-message flag (8192) with a duration, or a waveform; X Chat's audio media; Slack's `slack_audio` file subtype. A video or image type is never audio. Every platform's messages keep their attachments, and `log new platform` writes that shape into a new engine; `check:platforms` refuses an engine whose messages drop them.

## Where each voice note comes from

| Platform | How log finds it | How the file is fetched |
| --- | --- | --- |
| X | The `(audio: <name>)` marker in the saved X Chat conversation, matched to its media in the account's X Chat store (`inboxSync.json`) | Already saved by the X Chat read, or fetched through the account's one X session: the conversation is read again with its audio events reopened (rule 105) |
| Slack | A file the read or watch keeps on the message | Through gabriel's own authenticated transport (rule 125), when the chat is read |
| Discord | Discord's own sound search (`/channels/<id>/messages/search?has=sound`), one chat at a time through log's Discord engine | From its fresh attachment url, through the same engine; Discord's urls expire, so the search is what gets a fresh one |

Any refusal from a platform (a 429, a 401, anything that isn't an answer) stops that platform's part of the run. Nothing is retried, and what was found before it is kept (rule 94).

## AssemblyAI

Each file goes up with `POST /v2/upload`, its transcript is asked for with `POST /v2/transcript` (language detected), and it is polled with `GET /v2/transcript/<id>` every 3 s until it is `completed` or `error`, at most 15 minutes. The key is `ASSEMBLYAI_API_KEY` or `ASSEMBLY_AI_KEY`: the environment, `.env.local` in the repo, `~/.buzz/.env.local` or `~/filmcraft/.env.local`. It is never printed. Without it `log transcribe` refuses with `assemblyAiKeyMissing` before it reads anything.

Each transcript is kept once by the sha256 of its file in `~/.logCli/transcripts/<hash>.json`, and `~/.logCli/transcripts/messages.json` ties each message (platform, account, message id, file name) to its file's hash. A file already transcribed is never sent again. Saving a conversation (an export, `twitterDms`, `searchIndex`) writes the kept transcripts back in, so a fresh read never loses them.

## New voice notes

| Where | What happens |
| --- | --- |
| `slackRead` | Each audio file is saved through gabriel's transport and transcribed |
| `discordRead` | Each audio attachment is saved through the engine and transcribed, and the message shows `(voice note: "…")` |
| `twitterDms` with or conversation | Each X Chat audio file the read saved is transcribed in the thread |
| The Discord watch (inbox hook) | A voice message pushed by the gateway is saved and transcribed before it reaches the agent's `>>> NEW DISCORD MESSAGE` alert |
| The X inbox alert | Shows the kept transcript; one not transcribed yet says so, and reading the chat transcribes it |

## Commands

```bash
log transcribe --list
```

```bash
log transcribe
```

```bash
log transcribe --platform discord --account myDiscordName
```

```bash
log transcribe file ~/Downloads/note.m4a
```

The run ends by updating the search index with the conversations that changed (`--noIndex` skips it). Code: `src/media/voiceNotes`, `src/cli/transcribe`. Spec: [docs/specs/voiceNotes.md](./specs/voiceNotes.md).
