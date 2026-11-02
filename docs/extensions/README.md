---
title: "Extensions"
---

# Extensions

Extensions are services log uses to make an account act more like a person on social media: not another platform to post on, but something a person would reach for in a conversation, like a meme. Each one is an outside service with its own key, reached through log's own command and MCP tools, never by hand (rule 106).

| Extension | What it adds | Tools | Cost |
| --- | --- | --- | --- |
| [Memelord](./memelord.md) | Memes, clips and stickers found for the moment in a chat, sent in context | `memelordSearch`, `memelordTemplate`, `memelordTrending`, `memelordTools` | Free tools only |

How an extension is used is a use case like any other: [replying with a meme in a Discord chat](../useCases/discord/memeReply.md). What each one must do is in its spec ([docs/specs/memelord.md](../specs/memelord.md)) and is checked against the code on every commit (rule 117).

## Adding one

- Its client lives in `src/extensions/<name>`, its command in `src/cli/<name>`, both camelCase (rule 1).
- Only what matt asked for is reachable (rule 39), and only free calls unless he says to spend (rule 41).
- Its key goes in `.env.local`, with its name in `.env.example`.
- It gets a page here, a skill (`skills/<name>`), a spec, and the `extensions` guide names its command.
