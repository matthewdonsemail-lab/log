---
title: "Conversation search"
---

# Conversation search

Finding context in conversations is a search, never reading every thread. `log search "<query>"` (MCP `search`) runs keyword and meaning search together over every conversation log has read, fused into one ranking, with filters for platform, account, person and day. `log search index` reads the conversations and keeps the indexes on disk; `log search bench` times it. Rule 89 (with rule 88 for X Chat, decrypted with the saved PIN).

## Searching

### REQ-SEARCH-01: Keyword and meaning search run together and are fused

A query runs BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over the query's embedding) in parallel, and fuses the two lists with reciprocal rank fusion. Each hit keeps its keyword rank and its meaning rank.

### REQ-SEARCH-02: Reciprocal rank fusion scores each hit by its ranks

Each chunk's fused score is the sum, over the lists it is in, of one over the constant (60) plus its rank, and hits are ordered by that score.

### REQ-SEARCH-03: The filters keep only matching chunks

`--platform`, `--account`, `--with` (a handle, with or without @, any case) and `--after` (a day, `YYYY-MM-DD`) drop every chunk that doesn't match, from both lists before they are fused. With a filter set, each list is read four times deeper so a filtered search still finds enough.

### REQ-SEARCH-04: The embeddings are local all-MiniLM-L6-v2

Chunks and queries are embedded on this machine with all-MiniLM-L6-v2 (`@huggingface/transformers`, mean pooled and normalised), never through a hosted API.

## Indexing

### REQ-SEARCH-05: The index reads every conversation through the platform's engine

`log search index` reads each account's conversations through its platform's engine in one export read: each signed-in X account's inbox with X Chat decrypted when its PIN is saved (rule 88), and each Discord account's DMs and groups. The conversations are saved in `~/.logCli/conversations` (`LOG_CONVERSATIONS_DIR` moves it), one file each.

### REQ-SEARCH-06: The indexes survive restarts

The chunks, the BM25 index and the vector index are written to `~/.logCli/search` (`LOG_SEARCH_DIR` moves it), and a search opens them from there.

### REQ-SEARCH-07: An update embeds only what changed

An index update embeds only the chunks that are new or whose text changed and removes the ones gone. The whole index is rebuilt when it doesn't exist yet, when the embedding model or its size changed, or with `--rebuild`.

## Timing

### REQ-SEARCH-08: The bench prints p50, p95 and p99, cold and warm, beside a linear scan

`log search bench` times realistic queries once cold and then over `--rounds` warm rounds, prints the p50, p95 and p99 of each, and prints a plain linear scan's time a query beside them.
