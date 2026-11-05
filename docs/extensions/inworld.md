---
title: "Inworld"
---

# Inworld

[Inworld](https://docs.inworld.ai) is the default voice provider for [the voice clone](./voiceClone.md) (rule 143). Instant voice cloning is free on every plan, and the free plan includes about 70 minutes of speech.

## The two calls

The client (`src/extensions/inworld/client.ts`) knows only these, each with `Authorization: Basic <INWORLD_API_KEY>` (the Base64 credentials from the Inworld portal, sent as they are):

- `POST https://api.inworld.ai/voices/v1/voices:clone`, JSON `displayName`, `languageCode` (`en-US`: Inworld only detects the language for a single sample), and `voiceSamples`, each `audioData` as base64 wav. Inworld works best with 10 to 30 s and cuts longer clips at 30 s, so log sends matt's own voice notes shortest first up to 30 s in all. The answer's `voice.voiceId` (`{workspace}__{voice}`) is kept in `~/.logCli/voice/clone.json` under `inworld`.
- `POST https://api.inworld.ai/tts/v1/voice`, JSON `text` (up to 2,000 characters; log keeps a voice note under 600), `voiceId`, `modelId` and `audioConfig.audioEncoding` (`MP3` or `WAV`). The answer's `audioContent` is base64 audio.

`inworld-tts-2-flash` (Inworld's lowest cost per character) is used unless `--model inworld-tts-2` says otherwise.

## Setting it up

- `INWORLD_API_KEY` in `.env.local`; its name is in `.env.example`.
- `log clone voice`, read the list, then `log clone voice --apply` once, and `log clone speak --text "…"` to hear it.
