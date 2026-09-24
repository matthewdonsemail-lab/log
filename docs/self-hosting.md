# Self-Hosting & Local Development Guide

This guide walks you through setting up, configuring, and running the self-hosted coding version of **ListeningKit** on your own infrastructure or local machine.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Step 1: Clone & Install Dependencies](#step-1-clone--install-dependencies)
- [Step 2: Convex Backend Configuration](#step-2-convex-backend-configuration)
- [Step 3: Web App & Clerk Authentication](#step-3-web-app--clerk-authentication)
- [Step 4: Running the Development Stack](#step-4-running-the-development-stack)
- [Step 5: Account Connection & Chrome Extension](#step-5-account-connection--chrome-extension)
- [Step 6: Running Local Social Media Adapters](#step-6-running-local-social-media-adapters)
- [Step 7: AI Agent & MCP Configuration](#step-7-ai-agent--mcp-configuration)
- [Production Deployment](#production-deployment)
- [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Prerequisites

Before starting, ensure your system meets the following requirements:

- **Node.js**: `v20.0.0` or higher (`node -v`)
- **pnpm**: `v10.0.0` or higher (`pnpm -v`)
- **Python**: `3.10` or higher with `pip` (required for local social media reader adapters and extension packaging)
- **Google Chrome**: Installed locally (required for Playwright automated browser reading on X and Facebook)
- **Convex Account**: Free account at [convex.dev](https://convex.dev)
- **Clerk Account**: Free account at [clerk.com](https://clerk.com) for user authentication
- *(Optional)* **OpenAI API Key**: For match scoring and intent classification
- *(Optional)* **Firecrawl API Key**: For automated brand extraction from website URLs
- *(Optional)* **AgentMail API Key & Inbox**: For real-time email match digests

---

## Architecture Overview

ListeningKit operates in two primary modes:

1. **Live Convex Mode (`VITE_API_MODE=live`)**:
   - The Vite/React frontend communicates directly with your Convex backend via reactive queries (`useQuery`) and mutations.
   - User identity is managed by Clerk with JWTs cryptographically verified by Convex.
   - Background crons poll Reddit and score matches using AI.
   - Local Python adapters use headless Chrome to safely read X and Facebook and stream new hits into `/ingest`.
2. **In-Browser Demo Mode**:
   - Runs purely in-memory using an embedded Hono mock server (`apps/web/src/lib/mock-api.ts`) and `localStorage`.
   - Requires zero cloud accounts or API keys; perfect for trying the UI immediately.

---

## Quick Start

If you just want to run the web UI and explore the mock experience:

```bash
git clone https://github.com/matthewdonsemail-lab/log.git
cd log
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) for the dashboard and [http://localhost:3001](http://localhost:3001) for the documentation.

---

## Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/matthewdonsemail-lab/log.git
cd log

# Install JavaScript/TypeScript dependencies across the monorepo
pnpm install

# (Optional) Install Python client requirements for local adapters
cd clients
pip install -r requirements.txt
playwright install chrome
cd ..
```

---

## Step 2: Convex Backend Configuration

ListeningKit uses [Convex](https://convex.dev) for real-time database persistence, crons, and serverless actions.

### 1. Log in to Convex
```bash
npx convex login
```

### 2. Initialize and Push Backend Functions
Push the database schema, queries, mutations, and actions to your Convex project:

```bash
pnpm exec convex dev --once --typecheck=disable
```

### 3. Configure Deployment Environment Variables
Set the required secrets in your Convex deployment using `convex env set`:

```bash
# Generate a random 32-byte base64 encryption key for securing connected account cookies
# In PowerShell:
$key = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
pnpm exec convex env set SESSION_ENCRYPTION_KEY "$key"

# In Bash / macOS:
pnpm exec convex env set SESSION_ENCRYPTION_KEY "$(openssl rand -base64 32)"

# Configure Clerk JWT verification (obtain these from your Clerk dashboard -> JWT Templates -> Convex)
pnpm exec convex env set AUTH_ISSUER "https://your-clerk-domain.clerk.accounts.dev"
pnpm exec convex env set AUTH_AUDIENCE "convex"

# (Optional) AI Scoring with OpenAI
pnpm exec convex env set OPENAI_API_KEY "sk-..."
pnpm exec convex env set AI_MODEL "gpt-4o-mini" # default is gpt-4o-mini

# (Optional) Firecrawl Website Extraction
pnpm exec convex env set FIRECRAWL_API_KEY "fc-..."

# (Optional) AgentMail Notification Emails
pnpm exec convex env set AGENTMAIL_API_KEY "am_..."
pnpm exec convex env set AGENTMAIL_INBOX_ID "inbox_..."

# (Optional) Reddit App Credentials (for official API access; falls back to public RSS/mirror if unset)
pnpm exec convex env set REDDIT_CLIENT_ID "your_client_id"
pnpm exec convex env set REDDIT_CLIENT_SECRET "your_client_secret"

# Proxy setting for local dev: allow adapters to run without an upstream residential proxy
pnpm exec convex env set PROXY_REQUIRED "false"
```

---

## Step 3: Web App & Clerk Authentication

Create an environment configuration file for the web application at `apps/web/.env.local`:

```ini
# Enable live Convex communication
VITE_API_MODE=live

# Your Convex deployment URL (found in Convex Dashboard or convex.json)
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Your Clerk publishable key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Step 4: Running the Development Stack

You can launch the complete stack concurrently or run individual workspaces:

### Run Everything
```bash
pnpm dev
```
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **Fumadocs Docs App**: [http://localhost:3001](http://localhost:3001)

### Workspace Commands

| Task | Command |
|---|---|
| Run Web Client Only | `pnpm --filter web dev` |
| Run Docs Site Only | `pnpm --filter docs dev` |
| Run In-Memory Mock Server | `pnpm --filter web mock:server` (port 5174) |
| Push Convex Functions | `pnpm exec convex dev --once --typecheck=disable` |
| Run Test Suite | `pnpm test:backend` && `pnpm --filter web test` |
| Run Code Linting | `pnpm run lint` |

---

## Step 5: Account Connection & Chrome Extension

ListeningKit Connect is a lightweight Chrome Extension (Manifest V3) that extracts session cookies from Reddit, X, and Facebook so that your self-hosted instance can listen to channels you have access to.

### 1. Build the Extension Zip
```bash
python scripts/build-extension.py
```
This packages `apps/extension` into `apps/web/public/listeningkit-extension.zip`.

### 2. Install Unpacked Extension in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** in the upper right corner.
3. Click **Load unpacked** and select the directory: `apps/extension`.

### 3. Connect an Account
1. Open Reddit, X, or Facebook in your browser and ensure you are logged in.
2. Click the **ListeningKit Connect** extension icon in your Chrome toolbar.
3. Click **Copy your [Platform] token**.
4. Navigate to your ListeningKit dashboard ([http://localhost:3000/dashboard/settings](http://localhost:3000/dashboard/settings)).
5. Paste the sealed token into the corresponding account field. The server validates and encrypts it with AES-256-GCM.

---

## Step 6: Running Local Social Media Adapters

Because X and Facebook restrict public scraping APIs, ListeningKit includes local Python adapters that use real Google Chrome to perform polite keyword searches and push new matching posts to your Convex deployment.

### Setup Environment for Adapters
In your terminal, set the ingest credentials (generated from your dashboard API / Settings page):

```bash
# In Bash:
export LISTENINGKIT_INGEST_URL="https://your-deployment.convex.site"
export LISTENINGKIT_INGEST_KEY="lk_ingest_..."

# In PowerShell:
$env:LISTENINGKIT_INGEST_URL="https://your-deployment.convex.site"
$env:LISTENINGKIT_INGEST_KEY="lk_ingest_..."
```

### Run Adapters

```bash
# Run X / Twitter Reader
python clients/x_push.py

# Run Facebook Reader
python clients/facebook_push.py

# Run Reddit Poll
python clients/reddit_push.py
```

Each adapter:
1. Calls `GET /session` to securely receive the owner's decrypted cookies.
2. Calls `GET /phrases` to fetch the active keywords to monitor.
3. Browses recent search results in headless Chrome with jitter and rate limits.
4. Posts extracted items to `POST /ingest`, where Convex matches keywords, schedules AI scoring, and sends notifications.

---

## Step 7: AI Agent & MCP Configuration

ListeningKit provides a built-in **Model Context Protocol (MCP)** server on `POST /mcp` compatible with Claude Code, Claude Desktop, Cursor, and Hermes.

### Generate an API Key
1. Go to your dashboard: [http://localhost:3000/dashboard/api](http://localhost:3000/dashboard/api).
2. Click **Create API Key**.
3. Select the required scopes:
   - `read`: Read keywords, matches, plan status.
   - `write:phrases`: Add, pause, and remove tracked keywords.
4. Copy the generated key (`lk_api_...`).

### Configure Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "listeningkit": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote-client",
        "https://your-deployment.convex.site/mcp",
        "--header",
        "Authorization: Bearer lk_api_YOUR_KEY_HERE"
      ]
    }
  }
}
```

---

## Production Deployment

### 1. Deploy Convex Backend
```bash
pnpm exec convex deploy --yes
```

### 2. Deploy Web Frontend
You can upload the static Vite build directly to Convex Static Hosting:
```bash
pnpm deploy:site
```
Or deploy `apps/web` to Vercel / Cloudflare Pages by providing the environment variables:
- `VITE_API_MODE=live`
- `VITE_CONVEX_URL=https://<your-prod-deployment>.convex.cloud`
- `VITE_CLERK_PUBLISHABLE_KEY=pk_live_...`

---

## Troubleshooting & FAQ

### 1. "Refused login / Unauthorized" in Adapters
- Your connected session cookies may have expired. Open the platform in Chrome, open ListeningKit Connect, copy a fresh token, and save it in the dashboard.

### 2. "Proxy Required (HTTP 503)"
- By default, the production deployment enforces a residential proxy (`PROXY_URL`) to protect accounts from rate limits.
- For local development, disable the proxy requirement by running:
  ```bash
  pnpm exec convex env set PROXY_REQUIRED "false"
  ```

### 3. Missing Subreddit Matches on Reddit
- Without `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`, Reddit falls back to public RSS feeds which Reddit frequently rate-limits (HTTP 429). Create a free "script" app at [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) and set those environment variables in Convex.

### 4. Clerk Authentication Infinite Loop
- Verify that `VITE_CLERK_PUBLISHABLE_KEY` in `apps/web/.env.local` matches the same Clerk project as `AUTH_ISSUER` in your Convex deployment.
