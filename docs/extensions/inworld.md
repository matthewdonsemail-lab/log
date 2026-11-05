---
title: "Inworld"
---

# Inworld

[Inworld](https://docs.inworld.ai) is the default voice provider for [the voice clone](./voiceClone.md) (rule 143). Instant voice cloning is free on every plan, and the free plan includes about 70 minutes of speech.

## The two calls

The client (`src/extensions/inworld/client.ts`) knows only these, each with `Authorization: Basic <INWORLD_API_KEY>` (the Base64 credentials from the Inworld portal, sent as they are):

- `POST https://api.inworld.ai/voices/v1/voices:clone`, JSON `displayName`, `languageCode` (`LOG_VOICE_LANGUAGE`, default `en-IE`; when Inworld answers 400 `INVALID_ARGUMENT` it is sent again as `en-GB`, Inworld's own example of a British accent), `description` naming the accent (`LOG_VOICE_ACCENT`, default Irish), and `voiceSamples`, each `audioData` as base64 wav with its `transcription` when `~/.logCli/transcripts` holds matt's AssemblyAI transcript of that file (Inworld says TTS-2 cloning makes its own and ignores it, so a missing one is not paid for). `log clone voice --apply --replace` makes it again, keeping the old voice id under `previous` (rule 145). Inworld works best with 10 to 30 s and cuts longer clips at 30 s, so log sends matt's own voice notes shortest first up to 30 s in all. The answer's `voice.voiceId` (`{workspace}__{voice}`) is kept in `~/.logCli/voice/clone.json` under `inworld`.
- `POST https://api.inworld.ai/tts/v1/voice`, JSON `text` (up to 2,000 characters; log keeps a voice note under 600), `voiceId`, `modelId`, `language` (the language the clone was made in) and `audioConfig` (`audioEncoding` `WAV`, `speakingRate` from `LOG_VOICE_SPEED`, default 1.15). The answer's `audioContent` is base64 audio. No accent instruction is sent: the clone carries the accent (rule 147). On `inworld-tts-2` the text gets `[breathe]` at the start and once at least 8 words have gone by (`withBreaths`); emotion tags such as `[excited]` pass through as written. `inworld-tts-2-flash` ignores tags, so it gets none.

A clone made on Inworld speaks with `inworld-tts-2` (its `preferred` model, rule 146) unless `--model` says otherwise.

Inworld's own docs say instant cloning may not do well on unique accents and gets closer the nearer the sample is to 30 s, so matt's clone is one continuous 30 s of his own Discord voice note rather than several short ones (rule 147).

## Setting it up

- `INWORLD_API_KEY` in `.env.local`; its name is in `.env.example`.
- `log clone voice`, read the list, then `log clone voice --apply` once, and `log clone speak --text "…"` to hear it.
