# Architecture & Flow Diagrams

This directory contains domain-separated Mermaid diagrams documenting ListeningKit's end-to-end architecture, data flow, security model, and ingestion pipelines. Each diagram is maintained as a standalone `.mmd` file for modularity and reusability, and rendered below with accompanying documentation.

## Table of Diagrams

| Domain | Diagram | Format | Description |
|---|---|---|---|
| **System** | [System Overview](#1-system-overview) | [`system-overview.mmd`](system-overview.mmd) | High-level topology across channels, Camoufox clients, Hono API, Convex, AI scoring, and push alerts |
| **Backend** | [Convex Live Architecture](#2-convex-live-architecture) | [`convex-architecture.mmd`](convex-architecture.mmd) | Live deployment architecture: React UI + Extension, Convex functions/crons/HTTP, Reddit sources, and local adapters |
| **Data Model** | [Entity Relationship Diagram](#3-data-model-erd) | [`data-model-erd.mmd`](data-model-erd.mmd) | Workspace relationships between Accounts, Communities, Keywords, Listings, Threads, Chat Messages, and Brands |
| **Security** | [API Key Auth Sequence](#4-api-key-authentication-sequence) | [`api-auth-sequence.mmd`](api-auth-sequence.mmd) | Scoped authorization check, SHA-256 secret verification, and route execution gate |
| **Contracts** | [OpenAPI Pipeline](#5-openapi-pipeline) | [`openapi-pipeline.mmd`](openapi-pipeline.mmd) | Single source of truth from Zod schemas to OpenAPI spec, Fumadocs pages, and mock server |
| **Automation** | [Group Discovery & Join Flow](#6-group-discovery--join-flow) | [`group-join-flow.mmd`](group-join-flow.mmd) | Facebook group join lifecycle, humanized form submission, and Bark push notifications |
| **Discovery** | [Keyword & Community Follow-up Loop](#7-keyword--community-follow-up-loop) | [`keyword-followup-loop.mmd`](keyword-followup-loop.mmd) | Post inspection chain, keyword extraction, Google dorking for sibling communities, and map synthesis |
| **Brand** | [Brand Context Pipeline](#8-brand-context-pipeline) | [`brand-context-pipeline.mmd`](brand-context-pipeline.mmd) | Extraction from website URL, sitemap indexing, prompt compiler, and RAG reply context generation |
| **Brand** | [Brand Feedback Loop](#9-brand-feedback-loop) | [`brand-feedback-loop.mmd`](brand-feedback-loop.mmd) | Voice upgrades, versioned prompt immutability, index merges, and gold examples |

---

### 1. System Overview

**File:** [`system-overview.mmd`](system-overview.mmd)

```mermaid
flowchart LR
  subgraph sources["Channels you own / follow"]
    FB[Facebook groups & pages]
    XT[X / Twitter]
    RD[Reddit communities]
  end

  subgraph action["Camoufox action clients"]
    FBC["facebook-camofox-client"]
    TWK["twtkit"]
    RDC["reddit-camofox-client"]
  end

  FB --> FBC
  XT --> TWK
  RD --> RDC

  FBC & TWK & RDC -->|REST| HONO["Hono API<br/>(deployed on Railcode)"]
  HONO <--> CX[("Convex<br/>storage + queries")]

  KW["Keyword analysis<br/>local LLM or OpenAI-compatible endpoint"] --> CX
  FC["Firecrawl research<br/>Google dorks, area-scoped"] --> CX

  CX --> WEB["ListeningKit client<br/>(this repo)"]
  WEB --> BARK["Bark push"]
  BARK --> PH((Your phone))
```

---

### 2. Convex Live Architecture

**File:** [`convex-architecture.mmd`](convex-architecture.mmd)

```mermaid
flowchart LR
  subgraph browser["Your browser"]
    UI["ListeningKit dashboard<br/>React + Clerk sign-in"]
    EXT["ListeningKit Connect<br/>Chrome extension"]
  end
  subgraph convex["Convex"]
    FN["queries, mutations, actions<br/>live subscriptions (useQuery)"]
    CRON["cron every 10 min<br/>watch.tick"]
    HTTP["HTTP actions<br/>POST /ingest · GET /session"]
    DB[("accounts · posts · keywords<br/>hits · sessions · ingestKeys")]
  end
  subgraph reddit["Reddit sources, freshest first"]
    API["Reddit API<br/>app OAuth"]
    RSS["Reddit plain feed"]
    MIR["public mirror"]
  end
  subgraph local["Your machine (optional)"]
    CAMO["reddit-camofox-client<br/>+ clients/reddit_push.py"]
  end
  UI <-->|"useQuery / mutations"| FN
  EXT -.->|"token, pasted by you"| UI
  CRON --> API
  CRON -.->|"if refused"| RSS
  CRON -.->|"if refused"| MIR
  CAMO -->|"POST /ingest (ingest key)"| HTTP
  CAMO -->|"GET /session (ingest key)"| HTTP
  FN --- DB
  CRON --- DB
  HTTP --- DB
```

---

### 3. Data Model ERD

**File:** [`data-model-erd.mmd`](data-model-erd.mmd)

```mermaid
erDiagram
  CONNECTION ||--o{ COMMUNITY : "facebook joins"
  CONNECTION ||--o{ LISTING : "accountId"
  CONNECTION ||--o{ THREAD : "accountId"
  APIKEY }o--o| CONNECTION : "scopes.accountId (null = all)"
  APIKEY }o--o{ COMMUNITY : "scopes.groupIds ([] = all)"
  COMMUNITY ||--o{ KEYWORD : "groupId (facebook/reddit only)"
  THREAD ||--o{ CHAT_MESSAGE : "threadId"
  KEYWORD ||--o{ ANALYTICS : "keywordId (in-memory fan-out)"
  BRAND }o--o{ COMMUNITY : "intelligence.targetCommunities"

  CONNECTION {
    string id PK
    string platform "facebook | x | reddit"
    string label
    string connectedAt "null until the extension verifies"
  }
  COMMUNITY {
    string id PK
    string platform
    string name
    string url "nullable; set for resolved rows"
    string[] entryQuestions "facebook join gates"
    string[] answers
    string joinState "none | pending | accepted"
    string accountId FK "facebook joins only"
  }
  KEYWORD {
    string id PK
    string phrase
    string platform
    string groupId FK "null on x; must be a joined community elsewhere"
    string status "listening | paused"
    int signalsCount
  }
  LISTING {
    string id PK "normalized"
    string listingId "numeric Marketplace id"
    string title
    string price
    string location
    string accountId FK
    locationPoint locationPoint "lat/lng + radiusKm 1-200"
    string images "1-4 URLs, first is cover"
    string status "under-review | under-review-duplicate | active | sold | removed"
  }
  THREAD {
    string id PK "normalized"
    string platform
    string accountId FK
    string platformThreadId "dm_conversation_id / thread_key / t4_ first_message_name"
    string platformParticipantId
    string subject "reddit only"
    string preview
    int unread
  }
  CHAT_MESSAGE {
    string id PK "normalized"
    string threadId FK
    string from "me | them"
    string platformMessageId
    string body
    string sentAt
    string replyTo "platformMessageId of the replied message (is_self_reply on facebook)"
  }
  FEED_ITEM {
    string id PK
    string platform
    string variant "post-text | post-image | comment"
    string body
    metrics likes "comments shares views replies reposts"
  }
  APIKEY {
    string id PK
    string name
    string prefix "lk_live_4f7ak2***** — only secret-derived value stored"
    string secretHash "SHA-256 of the secret"
    scope scopes "accountId, groupIds[], canSendMessages, canReceiveMessages"
  }
  BRAND {
    string id PK "'brand-default' — one workspace record"
    identity identity "name, website, tagline, logoUrl"
    location location "label, lat/lng, radiusKm"
    voice voice "tone, formality, dos/donts, gold examples"
    offerings offerings "name + detail"
    sources sources "indexed site pages: url, title, text, status"
    channels channels "per-platform style, examples, triage, autoreplies"
    memory memory "working-facts rules"
    intelligence intelligence "selectedKeyword, competitors, targetCommunities"
  }
```

---

### 4. API Key Authentication Sequence

**File:** [`api-auth-sequence.mmd`](api-auth-sequence.mmd)

```mermaid
sequenceDiagram
  participant C as Client
  participant G as authorizeApiKey (scopes.ts)
  participant V as verifyApiKey (server.ts)
  participant S as Route store

  C->>G: Bearer lk_live_… + route + ctx { accountId?, groupId? }
  G->>V: SHA-256 the presented secret
  V->>V: match hash against stored keys
  alt unknown / revoked
    G-->>C: { ok: false, "Unknown or revoked API key." }
  else scope mismatch
    G-->>C: { ok: false, first failing reason }
  else allowed
    G->>V: key — its `lastUsedAt` stamped
    G->>S: route runs under the key's scope
    S-->>C: normal response
  end
```

---

### 5. OpenAPI Pipeline

**File:** [`openapi-pipeline.mmd`](openapi-pipeline.mmd)

```mermaid
flowchart LR
  subgraph code["apps/web/src/lib"]
    S["domain server.ts — routes + describeRoute(operationId, tags, responses)"]
    Z["openapi.ts — Zod schemas for requests/responses, error envelope, issue vocab"]
    C["mock-api.ts — one root app mounting every domain app"]
  end
  S -->|imports| Z
  C --> E["pnpm --filter web openapi:export<br/>hono-openapi generateSpecs"]
  S --> E
  E --> O[("apps/docs/openapi.json — committed")]
  O --> G["pnpm --filter docs gen:api<br/>(scripts/generate-api-docs.mjs)"]
  G --> P["per-tag endpoint pages<br/>mdx + Scalar try-it consoles"]
  C --> M["pnpm --filter web mock:server<br/>localhost:5174 — /openapi.json + /scalar<br/>fresh seeds, no persistence"]
  P -->|consoles execute against| M
  D["browser dashboard"] -->|in-process app.request| C
```

---

### 6. Group Discovery & Join Flow

**File:** [`group-join-flow.mmd`](group-join-flow.mmd)

```mermaid
sequenceDiagram
  participant U as You
  participant W as ListeningKit client
  participant H as Hono API (Railcode)
  participant F as facebook-camofox-client
  participant B as Bark

  U->>W: pick a listed group, join
  W->>H: submit join (platform REST API)
  H->>F: send the content the group requires (join-form answers)
  F->>F: Camoufox browser submits with humanize=true
  F->>B: push "accepted into group"
  B-->>U: notification on your phone
  F->>H: account starts polling the group automatically
  H-->>W: new posts stream into the log
```

---

### 7. Keyword & Community Follow-up Loop

**File:** [`keyword-followup-loop.mmd`](keyword-followup-loop.mmd)

```mermaid
flowchart TD
  INSPECT[Inspect post] --> RK[Find related mentions]
  INSPECT --> RC[Find related groups/communities]
  INSPECT --> DR[Draft a response + resource]
  RK --> PICK[Pick promising keywords]
  PICK --> RETRY[None relevant? dig the replies]
  PICK --> ONLINE[Look online?]
  RC --> ONLINE
  ONLINE --> DORK[Google dorking]
  DORK --> GROUPS[Sibling communities + joins]
  GROUPS --> MAP([keyword × community map])
  PICK --> MAP
  MAP --> LISTEN[Start listening]
  DR --> SEND[Reply with attached resource]
```

---

### 8. Brand Context Pipeline

**File:** [`brand-context-pipeline.mmd`](brand-context-pipeline.mmd)

```mermaid
flowchart TD
  URL[Website URL] --> EXTRACT[extractBrandFromUrl]
  EXTRACT --> IDENT[identity<br/>name, site, tagline]
  URL --> SITEMAP[sitemap]
  SITEMAP --> INDEX[POST /brand/index<br/>appends unseen URLs, skips seen]
  INDEX --> SOURCES[sources<br/>pages: url, title, text, status]
  REVEAL[Onboarding reveal] -. not yet wired .-> INTEL[intelligence<br/>keyword, competitors, communities]
  EDITS[Brand tab edits] --> VOICE[voice<br/>tone, formality, rules, examples]
  EDITS --> OFF[offerings<br/>name + detail]
  EDITS --> LOC[location<br/>label, pinpoint, radius]

  IDENT & SOURCES & INTEL & VOICE & OFF & LOC --> ENTITY([BrandEntity<br/>one record])

  ENTITY --> COMPILER[buildBrandSystemPrompt<br/>v2, deterministic]
  COMPILER --> CTX[buildReplyContext<br/>prompt + version + sourceRefs]
  SOURCES --> RETR[retrieveSourceRefs<br/>keyword overlap — mock mirror<br/>of the live RAG namespace]
  RETR --> CTX
  CTX --> DRAFT[draftReply<br/>cites url + excerpt]
  CTX -. live target .-> AGENT[Convex agent<br/>instructions + RAG messages]
```

---

### 9. Brand Feedback Loop

**File:** [`brand-feedback-loop.mmd`](brand-feedback-loop.mmd)

```mermaid
flowchart LR
  EDIT[Voice edit<br/>on the Brand tab] --> COMPILER2[prompt vN+1]
  COMPILER2 --> DRAFT2[future drafts]
  DRAFT2 -.->|old drafts keep vN| HIST([history never rewrites])

  REINDEX[POST /brand/index] --> MERGE[unseen URLs appended<br/>seen rows untouched]
  FAIL[source failed] --> STAY[stays failed<br/>no retry path yet]
  V1[v1 persisted rows] --> MIGRATE[migrate on load<br/>written back clean]
  HAND[Gold examples<br/>curated by hand] --> COMPILER2
  REVEAL2[Reveal picks] -.->|no reader yet| INTEL2[intelligence block]
```
