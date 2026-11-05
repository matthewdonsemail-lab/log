---
title: "Voice clone"
---

# Voice clone

log keeps one voice: matt's, cloned from the voice notes he sent himself. When he says "send <person> a voice note saying …", it goes out as the platform's own voice note in his voice (rule 142). A voice note only ever goes out when matt asks for one, never on the agent's own initiative, and never any other audio.

The voice layer is provider-agnostic (rule 143), the way proxies are: one interface in `src/extensions/voiceClone`, and each provider an extension of its own.

| Provider | Page | Clone | Speech | Key |
| --- | --- | --- | --- | --- |
| `inworld` (the default) | [Inworld](./inworld.md) | instant, free, wav references 3 to 30 s | `inworld-tts-2-flash` (cheapest) or `inworld-tts-2`, about 70 free minutes | `INWORLD_API_KEY` |
| `fishAudio` | [Fish Audio](./fishAudio.md) | needs API credit, references as they are, 10 to 60 s | `s2.1-pro-free` (free) or `s2.1-pro` | `FISH_API_KEY` |

The provider is `--provider`, else `LOG_VOICE_PROVIDER` in `.env.local`, else `inworld`. A new provider is one more extension implementing `VoiceProviderClient` and one row in `PROVIDER_CLIENTS`.

## What log can do with it

| Tool | Command | What it does |
| --- | --- | --- |
| `cloneVoice` | `log clone voice [--provider <p>] [--apply]` | Lists the voice notes matt sent himself that it would clone from; `--apply` clones his voice once on that provider |
| `cloneSpeak` | `log clone speak --text "<words>" [--provider <p>] [--model <m>] [--format mp3\|wav]` | Says the words in his cloned voice to a file under `~/.logCli/voiceNotes`; plays and sends nothing |
| `discordVoice`, `discordVoiceLive` | `log discord voice --account <a> --channel <chat> --text "<words>" [--provider <p>]` | A Discord voice message (flags 8192, its waveform and duration) |
| `instagramVoice`, `instagramVoiceLive` | `log instagram voice --account <a> --with <handle> --text "<words>" [--provider <p>]` | An Instagram voice clip through instagrapi's `direct_send_voice` |
| `slackVoice`, `slackVoiceLive` | `log slack voice --account <a> --chat <chat> --text "<words>" [--provider <p>]` | An audio file shared into the chat through Slack's own upload, which Slack plays inline |

`log fish clone|speak` became `log clone voice|speak` and is refused with that form. X has no voice note command: twikit has no audio send, and no vendored code or doc shows X's DM voice upload.

## The clone

`log clone voice` finds matt's own recordings in what the engines kept: Discord voice messages (`~/.logCli/discord/<account>/media/<chat>/<messageId>_voice-message.ogg`) and Instagram voice clips (`voice_<itemId>.m4a`). It keeps only the ones he sent: `fromMe` in the conversation store, or his `ownMessage` in the .db. Nobody else's voice is ever sent to a provider. It takes them shortest first, each at least 5 s, within the provider's limit, converting them to wav with ffmpeg when the provider wants wav. Without `--apply` it only lists them. Each provider's clone is made once and kept in `~/.logCli/voice/clone.json` (`LOG_VOICE_CLONE_DIR` moves it), keyed by provider, with the recordings it came from.

## A voice note

Every voice command takes `--text` only: a path or an audio file name as the text is refused (`voiceNoteInvalid`), and there is no flag for audio. Without `--live` nothing is generated or sent. With `--live --approvedBy`:

1. the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137); a refusal there sends nothing;
2. the provider says it in the clone (as wav), and ffmpeg converts it: Discord ogg/opus 48 kHz mono, Instagram and Slack AAC in .m4a;
3. its duration and waveform are measured from the audio itself;
4. the chat is claimed (rule 133), the engine's `voice` write sends it through the account's one session, and the claim is released.

The engines take only a file log made under `~/.logCli/voiceNotes` with the platform's suffix (`voice_note_path`). Instagram's upload goes on instagrapi's curl adapter under the one-call lock (rules 128, 129); Slack's on gabriel's curl_cffi transport (rule 125). Any refusal stops, and nothing is retried (rule 94).

Spec: [docs/specs/voiceClone.md](../specs/voiceClone.md). Use case: [Sending a voice note](../useCases/inbox/voiceNote.md).
