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

`log fish clone|speak` became `log clone voice|speak` and is refused with that form. On X, `log twitter voice` sends it as an X Chat voice message through vendor/twikit, the way X Chat's own app does (rule 151).

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

## Sounding like his own voice notes, and saying what was written (rule 147)

Every spoken file goes through two steps in `speakToFile` before anything uses it:

1. **Shaped** by `processLikeMatt` (`helpers/realism.ts`). The settings in `REALISM` were measured from five of matt's own Discord voice notes against the clone: phone squash and his top end, his slow mic drift (about 1.9 dB), the tone swaying as the phone moves, phone-mic saturation on loud words, and his own room tone, cut from the quiet gaps in his own voice notes (`quietPieces`; a recording with a floor under -60 dB, like a generated one, gives none) and laid under the voice where his sits (30 to 33 dB under it). The same text gives the same file (`seeded`).
2. **Listened back** with AssemblyAI's word timings (`listenTo`, kept by the file's hash) and checked by `readSpoken` (`helpers/spoken.ts`). Words in `SPOKEN_LEXICON` are written the way the clone says them right before it speaks (`speakableText`: `op` goes as `OP`) and must come back as themselves, as one word under 400 ms. A lexicon word heard as something else or spelled out, or more than a quarter of the words different, is refused `spokenMismatch`. An acronym not in the lexicon is refused `pronunciationUnknown` before anything is spoken, and a note that can't be listened back is never sent (`spokenCheckFailed`).

A lexicon entry is added only when matt says how he says the word.

## In another language (rule 148)

When matt asks for a voice note in another language, the translation goes out with `--translationOf "<the original>"` and `--language <code>` (zh-CN, es-ES ...). The voice gate grades the original, because it compares a draft with matt's own writing and can't match a translation to it. The clone speaks in that language instead of its own, and the listen-back check reads Chinese, Japanese and Korean one character at a time.

