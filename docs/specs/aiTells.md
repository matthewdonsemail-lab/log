---
title: "AI tells and watermark"
---

# AI tells and watermark

Every X and Discord send's copy is read for what AI chat interfaces leave in text (the watermark reading), and every draft the voice gate reads is also read for AI phrasing against curated lists and matt's own writing. Rules 111 and 112.

## Watermark reading

### REQ-AITELLS-01: The reading is clean, stylistic or artifacts

The copy is read by the vendored claude-watermark-checker. Any deterministic finding (zero-width or other hidden characters, odd spaces, pasted Claude HTML) makes it `artifacts`; only curly quotes or em dashes make it `stylistic`; nothing found is `clean`. The statistical watermark is always said to be `unknown`.

### REQ-AITELLS-02: planSend refuses copy with artifacts

`planSend` refuses a send whose copy reads as `artifacts`, with the code `aiArtifacts`, naming what was found. Nothing is sent.

### REQ-AITELLS-03: The plan carries the reading and every send logs it

A send `planSend` allows carries its watermark reading, and both a direct send and each queue send log it in one line.

### REQ-AITELLS-13: A Discord send is read the same way before anything goes out

`log discord send` (MCP `discordSend`, `discordSendLive`) reads the whole message with the same watermark reading before the dry run or any send. Copy that reads as `artifacts` is refused with `aiArtifacts`, naming what was found, and nothing is sent. Otherwise the reading is logged in one line, printed in the dry run and carried in its `--json`, live or not. Rule 111.

## AI phrasing

### REQ-AITELLS-04: vale-ai-tells rules run on the draft

The tbhb/vale-ai-tells rules (`vendor/aiTells/valeAiTells/styles`, its substitution and existence rules) are run on the draft the way Vale would, and any hit that is not muted fails it.

### REQ-AITELLS-05: The index embeds every literal phrase with Jina

`log voice aiIndex` collects every literal phrase from vale-ai-tells first, then ai-slop-detector, ai-vocabulary, SLOP_Detector, the AI-written samples and the X complaints, and embeds them with Jina `jina-embeddings-v3`.

### REQ-AITELLS-06: Phrases quoted on X are kept only when close to a curated one

A phrase from the X complaints list is kept in the index only when it sits at cosine 0.6 or more from a curated phrase.

### REQ-AITELLS-07: matt's own p50 and p99 are measured

The index measures matt's own messages from the voice index against the phrases and keeps his p50 and p99 closeness.

### REQ-AITELLS-08: Vale rules matt uses himself are muted

A vale rule that hits in over 2% of matt's own messages is muted and never fails a draft.

### REQ-AITELLS-09: Phrases matt says himself never fail a draft

A phrase vale flags that matt says himself in 5 or more of his own messages is his voice and never fails a draft.

### REQ-AITELLS-10: Each chunk's closest AI phrase is found and reranked

The draft is cut into lines and word windows, each chunk's closest AI phrase is found by cosine, and the closest are reranked with `jina-reranker-v2-base-multilingual`.

### REQ-AITELLS-11: A draft closer to AI phrasing than matt's p99 fails

The draft fails when a vale rule hits or its closest chunk sits closer to an AI phrase than matt's own p99.

### REQ-AITELLS-12: The voice gate keeps the index current and fails on AI tells

`log voice` builds the AI tells index itself when it is missing or older than matt's voice index, and a draft whose AI tells reading fails does not pass the gate.
