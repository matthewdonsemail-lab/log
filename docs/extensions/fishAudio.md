---
title: "Fish Audio"
---

# Fish Audio

[Fish Audio](https://docs.fish.audio) clones a voice from a few seconds of audio and says any text in it, through a hosted API. log uses it for one thing: matt's own voice, so that when he says "send <person> a voice note saying …", it goes out as the platform's own voice note in his voice (rule 142). A voice note only ever goes out when matt asks for one, never on the agent's own initiative, and never any other audio.

## What log can do with it

| Tool | Command | What it does |
| --- | --- | --- |
| `fishClone` | `log fish clone [--apply]` | Lists the voice notes matt sent himself that it would clone from; `--apply` makes his voice model once |
| `fishSpeak` | `log fish speak --text "<words>" [--model s2.1-pro-free\|s2.1-pro] [--format mp3\|wav]` | Says the words in his cloned voice to a file under `~/.logCli/voiceNotes`; plays and sends nothing |
| `discordVoice`, `discordVoiceLive` | `log discord voice --account <a> --channel <chat> --text "<words>"` | A Discord voice message (flags 8192, its waveform and duration), the bubble Discord's own app records |
| `instagramVoice`, `instagramVoiceLive` | `log instagram voice --account <a> --with <handle> --text "<words>"` | An Instagram voice clip through instagrapi's `direct_send_voice` |
| `slackVoice`, `slackVoiceLive` | `log slack voice --account <a> --chat <chat> --text "<words>"` | An audio file shared into the chat through Slack's own upload, which Slack plays inline |

X has no voice note command: twikit has no audio send, and no vendored code or doc shows X's DM voice upload, so nothing is guessed.

## The three Fish calls

The client (`src/extensions/fishAudio/client.ts`) knows only these, each with `FISH_API_KEY` as a bearer token:

- `POST https://api.fish.audio/model`, multipart: `type` tts, `title`, `train_mode` fast (usable at once), `visibility` private, and the `voices` files. The answer's `_id` is the model id.
- `GET https://api.fish.audio/model/{id}`: the model's state (`created`, `training`, `trained`, `failed`).
- `POST https://api.fish.audio/v1/tts`, JSON `text`, `reference_id` (the model id), `format`, with the `model` header. `s2.1-pro-free` is listed at $0 (Fish's free developer tier, under fair-use limits) and is the default; `s2.1-pro` is $15 per million UTF-8 bytes and is used only when `--model` names it.

## The clone

`log fish clone` finds matt's own recordings in what the engines kept: Discord voice messages (`~/.logCli/discord/<account>/media/<chat>/<messageId>_voice-message.ogg`) and Instagram voice clips (`voice_<itemId>.m4a`). It keeps only the ones he sent: `fromMe` in the conversation store, or his `ownMessage` in the .db. Nobody else's voice is ever sent to Fish. It takes them shortest first, each 5 to 60 s, up to 60 s in all, and refuses under 10 s (`voiceRecordingsMissing`). Without `--apply` it only lists them. The model is made once; its id is kept in `~/.logCli/voice/fishClone.json` (`LOG_VOICE_CLONE_DIR` moves it) with the recordings it came from.

## A voice note

Every voice command takes `--text` only: a path or an audio file name as the text is refused (`voiceNoteInvalid`), and there is no flag for audio. Without `--live` nothing is generated or sent. With `--live --approvedBy`:

1. the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137);
2. Fish says it in the clone (as wav), and ffmpeg converts it: Discord ogg/opus 48 kHz mono, Instagram and Slack AAC in .m4a;
3. its duration and waveform are measured from the audio itself (Discord's base64 waveform, Instagram's 70 levels);
4. the chat is claimed (rule 133), the engine's `voice` write sends it through the account's one session, and the claim is released.

The engines take only a file log made under `~/.logCli/voiceNotes` with the platform's suffix (`voice_note_path`). Instagram's upload to `rupload.facebook.com` goes on instagrapi's curl adapter, not its plain-requests helper (rule 128), under the one-call lock (rule 129). Slack's upload goes through gabriel's curl_cffi transport (rule 125). Any refusal stops, and nothing is retried (rule 94).

## Setting it up

- `FISH_API_KEY` in `.env.local` (or `~/.buzz/.env.local`); its name is in `.env.example`.
- ffmpeg and ffprobe on the path, with libopus and aac.
- `log fish clone`, read the list, then `log fish clone --apply` once, and `log fish speak --text "…"` to hear it.

Spec: [docs/specs/fishVoice.md](../specs/fishVoice.md). Use case: [Sending a voice note](../useCases/inbox/voiceNote.md).
