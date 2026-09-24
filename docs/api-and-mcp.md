# Developer API & MCP Server Reference

ListeningKit offers first-class programmatic interfaces for developers and autonomous AI agents: a REST API, a **Model Context Protocol (MCP)** server, and signed webhooks.

---

## Authentication & API Keys

All programmatic requests require a Bearer token generated from the dashboard at `/dashboard/api`.

```http
Authorization: Bearer lk_api_0123456789abcdef...
```

- Keys begin with `lk_api_` followed by 64 hexadecimal characters.
- Only the SHA-256 hash is stored on the server.
- Keys are revocable at any time from the dashboard.
- Key rate limit: **60 requests per minute** per key (tracked via `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers).

### Scopes Matrix

| Scope | Allowed Operations |
|---|---|
| `read` | Read plan status, active keywords, matched posts, and scores. Default on all keys. |
| `write:phrases` | Create new keywords (`POST /keywords`), pause/resume phrases (`PATCH /keywords/:id`), and delete phrases (`DELETE /keywords/:id`). |
| `webhooks` | Register, test, update, and delete webhook subscriptions. |

```mermaid
sequenceDiagram
  participant C as Client / AI Agent
  participant G as Scoped Gateway
  participant V as Key Verifier
  participant S as Convex Storage

  C->>G: Bearer lk_api_... + Request
  G->>V: Hash token & check scopes
  alt Scope Missing or Invalid Token
    G-->>C: 401 / 403 JSON Error
  else Authorized
    G->>S: Execute Query or Mutation
    S-->>C: 200 OK + Payload
  end
```

Diagram source: [`docs/diagrams/api-auth-sequence.mmd`](diagrams/api-auth-sequence.mmd)

---

## Model Context Protocol (MCP) Server

ListeningKit exposes an HTTP-based MCP server at:

```
POST https://log.listeningkit.com/mcp
```

Or on your self-hosted deployment:
```
POST https://<your-deployment>.convex.site/mcp
```

The MCP server adheres to the JSON-RPC 2.0 specification over HTTP and allows AI coding assistants (Claude Code, Claude Desktop, Cursor, Hermes) to inspect social listening data and manage campaigns programmatically.

### Available Tools

| Tool Name | Required Scope | Destructive? | Description |
|---|---|---|---|
| `get_plan` | `read` | No | Returns the current plan limits, usage count, and active platform quotas. |
| `list_keywords` | `read` | No | Returns all configured keywords, status (`active`/`paused`), and signal hit counts. |
| `list_matches` | `read` | No | Retrieves recent keyword hits, filtered by platform, minimum AI score, and cursor pagination. |
| `get_match` | `read` | No | Fetches a single matched social post by ID, including its AI analysis, intent, and permalink. |
| `add_keyword` | `write:phrases` | No | Creates a new keyword tracking rule (enforces Free plan limits). Supports `idempotency_key`. |
| `set_keyword_status` | `write:phrases` | No | Toggles a keyword between `active` and `paused`. |
| `remove_keyword` | `write:phrases` | **Yes** | Permanently deletes a keyword tracking rule. |

> [!NOTE]
> Post text returned by `list_matches` and `get_match` is user-generated content from external platforms and is explicitly labelled as untrusted data.

### Client Configuration

#### 1. Claude Code CLI
```bash
claude mcp add listeningkit -- https://log.listeningkit.com/mcp --header "Authorization: Bearer lk_api_YOUR_KEY"
```

#### 2. Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "listeningkit": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote-client",
        "https://log.listeningkit.com/mcp",
        "--header",
        "Authorization: Bearer lk_api_YOUR_KEY"
      ]
    }
  }
}
```

#### 3. Cursor IDE
Under **Settings** > **Features** > **MCP Servers**, add:
- **Type**: `command`
- **Command**: `npx -y mcp-remote-client https://log.listeningkit.com/mcp --header "Authorization: Bearer lk_api_YOUR_KEY"`

---

## REST API Endpoints

All REST routes are prefixed under `/api/v1` on your deployment host.

### 1. Account & Plan
- `GET /api/v1/me` — Retrieve authenticated user profile and plan information.

### 2. Keywords
- `GET /api/v1/keywords` — List tracked keywords and platforms.
- `POST /api/v1/keywords` — Add a new phrase to monitor (supports `Idempotency-Key` header).
- `GET /api/v1/keywords/:id` — Retrieve details for a single keyword.
- `PATCH /api/v1/keywords/:id` — Update status (`active`, `paused`).
- `DELETE /api/v1/keywords/:id` — Delete a tracked keyword.

### 3. Matches & Signals
- `GET /api/v1/matches` — Query scored social signals:
  - Query parameters: `limit` (1-100), `platform` (`reddit`, `x`, `facebook`), `min_score` (0-100), `before` (cursor).
- `GET /api/v1/matches/:id` — Retrieve post content, author, sentiment, intent, and AI reasoning.

### 4. Webhooks
- `GET /api/v1/webhooks` — List configured endpoints.
- `POST /api/v1/webhooks` — Register a webhook URL and trigger score threshold.
- `PATCH /api/v1/webhooks/:id` — Update status or threshold.
- `DELETE /api/v1/webhooks/:id` — Remove a webhook.
- `POST /api/v1/webhooks/:id/test` — Trigger an immediate test payload.
- `GET /api/v1/webhooks/:id/deliveries` — Review delivery log and response status codes.

---

## Webhook Signatures & Security

When a post matches a monitored keyword with an AI score meeting or exceeding your threshold, ListeningKit delivers a JSON payload via HTTP `POST`.

### Request Headers
- `X-ListeningKit-Signature`: Hex-encoded `HMAC-SHA256(secret, timestamp + "." + body)`.
- `X-ListeningKit-Timestamp`: Unix epoch milliseconds.
- `Content-Type`: `application/json`.

### Payload Structure
```json
{
  "event": "match.scored",
  "data": {
    "hitId": "hit_abc123",
    "keyword": "open source ai",
    "platform": "reddit",
    "post": {
      "id": "post_xyz789",
      "author": "developer_jane",
      "url": "https://reddit.com/r/technology/...",
      "title": "Looking for open source AI tools...",
      "body": "Does anyone have recommendations for...",
      "metrics": {
        "likes": 42,
        "comments": 15
      }
    },
    "score": 92,
    "intent": "High purchasing intent / Product discovery",
    "reason": "The author is explicitly evaluating open-source AI tooling for their team."
  }
}
```

### Signature Verification Example (Node.js)
```typescript
import crypto from 'node:crypto';

export function verifyWebhook(
  payload: string,
  timestamp: string,
  signature: string,
  signingSecret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', signingSecret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}
```

### Webhook Delivery Rules
- **HTTPS Only**: Endpoints must resolve to public domains over TLS. Private IP addresses and localhost are rejected.
- **Delivery Retries**: Failed deliveries are retried with exponential backoff at 1 minute, 5 minutes, and 30 minutes.
- **Circuit Breaker**: Webhooks are automatically disabled after 5 consecutive failed deliveries.

---

## OpenAPI Specification & Interactive Consoles

The complete REST contract is defined in [`apps/web/src/lib/openapi.ts`](../apps/web/src/lib/openapi.ts) and exported to [`apps/docs/openapi.json`](../apps/docs/openapi.json).

You can run the interactive Scalar API console locally:
```bash
pnpm --filter web mock:server
# Open http://localhost:5174/scalar
```
Or explore the documentation site at [http://localhost:3001/api-reference](http://localhost:3001/api-reference).
