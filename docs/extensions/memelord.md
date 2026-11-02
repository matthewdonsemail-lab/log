---
title: "Memelord"
---

# Memelord

[Memelord](https://www.memelord.com/hackers/mcp) is a library of meme templates, video clips and stickers, searchable by meaning, with what each one means and what is trending now. log uses it to answer a chat with a meme that fits the moment (rule 119).

## What log can do with it

Only Memelord's four free discovery tools are reachable from log, so nothing costs money (rule 41). Generating, editing or running any model is not wired in.

| Tool | Command | What it gives |
| --- | --- | --- |
| `memelordSearch` | `log memelord search "<the moment>" [--type meme\|video\|sticker] [--method context\|combined\|media\|fulltext\|fuzzy] [--limit <n>]` | Templates that fit, each with its name, type, media url and description |
| `memelordTemplate` | `log memelord template <id>` | One template in full: its media url, text slots and description |
| `memelordTrending` | `log memelord trending [--limit <n>] [--media image\|video]` | What is trending now, each with its cultural context |
| `memelordTools` | `log memelord tools [--category imageToImage\|imageTextToImage\|textToImage]` | The catalog of one-shot image tools; log lists them and never runs them |

Memelord's REST API (`https://www.memelord.com/api/v1`) is called with plain GETs, the key sent as a bearer token. Its own camelCase-breaking values (`image-to-image`, `semantic_context`) are converted at that boundary only.

## Setting it up

1. Create a key at [memelord.com/settings/developer](https://www.memelord.com/settings/developer). It starts with `mlord_live_`.
2. Put it in `.env.local` as `MEMELORD_API_KEY=…` (or in `~/.config/listeningkit/memelord-api-key.txt`).
3. Restart the Claude app so the log MCP has the tools.

Without a key every tool answers `memelordKeyMissing` and calls nothing. Memelord's own errors are passed on with their code (`API_KEY_INVALID`, `NOT_FOUND`, `INVALID_PARAMETER`).

## Sending a meme

A meme goes out as its media url on a line of its own; Discord shows an image (`.webp`, `.png`) or a clip (`.mp4`) inline. The whole loop, read, pick, search, gate, send, is the use case [docs/useCases/discord/memeReply.md](../useCases/discord/memeReply.md) and the `memelord` skill.

## How it is checked

The spec is [docs/specs/memelord.md](../specs/memelord.md): the code proves the four endpoints and their GET method, and SubQ checks the behaviour on every commit (rule 117).
