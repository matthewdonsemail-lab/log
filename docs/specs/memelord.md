---
title: "Memelord extension"
---

# Memelord extension

log's first extension: Memelord's meme templates, clips and stickers, searched for the moment in a chat and sent in context. Only its four free discovery tools are reachable, so nothing costs money. Rules 41, 94 and 119.

## Reach

### REQ-MEME-01: Only the four free discovery tools are reachable

The client knows four Memelord endpoints and nothing else: the template search, one template by id, the trending templates and the image tool catalog, all under `https://www.memelord.com/api/v1`. No endpoint that generates, edits, renders or runs a model has a path in log.

Checked by: code and SubQ

### REQ-MEME-02: Every call is a GET with the key as a bearer token

Each call is an HTTP GET carrying the key as `Authorization: Bearer <key>`, its inputs in the query string or the path. Nothing is sent in a body.

Checked by: code and SubQ

### REQ-MEME-03: No key means no call

The key comes from `MEMELORD_API_KEY` (the environment, `.env.local`, or `~/.config/listeningkit/memelord-api-key.txt`). Without one, every tool answers `memelordKeyMissing` and calls nothing.

Checked by: code and SubQ

### REQ-MEME-04: Memelord's own refusal is passed on

An answer that isn't 200, or that says `success: false`, comes back as a refusal with Memelord's HTTP status, its code (`API_KEY_INVALID`, `NOT_FOUND`, `INVALID_PARAMETER`…) and its error text, and the command exits 1.

Checked by: code and SubQ

## Answers

### REQ-MEME-05: Each template comes back with its media url

Search, trending and one template each give, for every template, its id, name, type, media url (the first https url among the media fields), text slot count and what it means (its context or description).

Checked by: code and SubQ

### REQ-MEME-06: Values are camelCase in log and converted at the boundary

The image tool categories and the search methods are camelCase in log (`imageToImage`, `combined`) and turned into Memelord's own values (`image-to-image`, `semantic_combined`) only when the call is made. Rule 1.

Checked by: code and SubQ

## The command

### REQ-MEME-07: A bad limit is refused before any call

`log memelord search` takes a limit from 1 to 100 and `trending` from 1 to 12; anything else is refused with exit 1 before Memelord is called.

Checked by: SubQ

### REQ-MEME-08: The image tools are listed, never run

`log memelord tools` lists the catalog and says log never runs them; there is no command or tool that runs one.

Checked by: code and SubQ

## Taste

### REQ-MEME-09: The taste index is read from the pictures he sent

`log memelord taste --build` takes every picture in a file of his X media posts, sends each one as an image to SubQ, and keeps only those SubQ calls a meme (at least 0.5), each with the style it picks from the styles matt named (deep fried, larping, streamer reacts, shitpost) or other. Rule 120.

Checked by: code and SubQ

### REQ-MEME-10: Search ranks by his taste and says it first

Unless `--noTaste`, search scores each template from its picture against his taste (his styles and the memes he has sent) and lists them from the highest score down, and the answer's first line is his taste. A template with no picture to read keeps its place at the end.

Checked by: code and SubQ
