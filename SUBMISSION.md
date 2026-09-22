# Submission kit (for Matthew)

Everything to record, post and submit. Deadline: **Tue 22 Sep 2026, 12:00 PM PT**.
Submit at https://vibeapps.dev/judging/convex-all-gas-hackathon-openai/submit

- Live app: https://tremendous-seahorse-330.convex.site
- Repo: https://github.com/matthewdonsemail-lab/log (public, `hackathon.md` at the root)

Everything below was checked on the live site on 2026-09-22 (see "Checked" at the end). **The OpenAI key is now set on prod: matches show real scores.**

## 0. Before you press record (10 minutes)

Do these first so nothing on screen is empty or broken. Use a normal browser window, signed in with a Google account you are happy to show.

**The app**
- [ ] Sign in works and lands on onboarding.
- [ ] You have connected **Reddit** (Chrome extension, then paste the token in Settings, Connections).
- [ ] At least one **Reddit phrase** is saved (for example `need a bookkeeper` in `smallbusiness`) and shows matches. Press **Check now**.
- [ ] Settings, Notifications: your email is saved and **Send a test email** arrives.
- [ ] Have a real business website ready to paste, for example `mailchimp.com`.
- [ ] The Free plan allows **one phrase per platform**, so add only one Reddit phrase in the video (and one each for X and Facebook if you show them). Or raise the limits while you record (see `HANDOFF.md`, Plans and pricing) and put them back afterwards.
- [ ] A real, scored phrase is already live on prod (`ipad` in `r/ipad`, scored matches showing). Use it as-is, or swap it for your own before recording — remove it first (Free plan allows one).

**The API scene (new)**
- [ ] On the **API** page, make a key named `demo` with **Read** only. Copy it once.
- [ ] Open a terminal and set it as a variable **before recording**, so the key is never on screen:
  - PowerShell: `$env:KEY = "lk_api_..."` and `$env:BASE = "https://tremendous-seahorse-330.convex.site/api/v1"`
  - macOS or Linux: `export KEY=lk_api_...` and `export BASE=https://tremendous-seahorse-330.convex.site/api/v1`
- [ ] Test the command you will show: `curl "$BASE/matches?limit=3" -H "Authorization: Bearer $KEY"` (PowerShell: `curl.exe "$env:BASE/matches?limit=3" -H "Authorization: Bearer $env:KEY"`). It should print JSON, not an error.
- [ ] Clear the terminal so the key you typed is not in the scrollback, and make the font large.
- [ ] Delete the `demo` key from the API page after recording.

**The MCP scene (optional, 10 seconds)**
- [ ] On the **API** page, make a key named `agent` with **Read** only. Copy it once.
- [ ] Set it as a variable **before recording**: PowerShell `$env:LISTENINGKIT_KEY = "lk_api_..."`, or `export LISTENINGKIT_KEY=lk_api_...`.
- [ ] Add it to Claude Code in a scratch folder: `claude mcp add --transport http listeningkit https://tremendous-seahorse-330.convex.site/mcp --header "Authorization: Bearer $LISTENINGKIT_KEY"` (PowerShell: `--header "Authorization: Bearer $env:LISTENINGKIT_KEY"`). Then `claude mcp list` should say **Connected**. Clear the terminal so the key is not in the scrollback.
- [ ] Test the prompt you will type: `Use listeningkit to show my plan and my three newest matches.` It should answer with your real data. If you have no matches yet, ask for `my plan` instead.
- [ ] Delete the `agent` key from the API page after recording, and run `claude mcp remove listeningkit`.
- [ ] Only Claude Code and Claude Desktop (through `mcp-remote`) were run for real. Cursor and Hermes follow their official docs but were not run. **ChatGPT is not supported yet, so do not show or claim it.**

**Optional, only if you want them**
- [ ] X and Facebook helpers (the proxy is set on the site): run them on your computer before recording. See the Guide, X and Facebook helpers.
- [ ] Scores now show by default (the OpenAI key is set). No extra step needed.
- [ ] **Do not show or mention direct messages / the Messages tab.** It is built for real (X only) but X moved DMs to an encrypted "X Chat" that blocks the live read; it is not demo-ready. See `HANDOFF.md`.
- [ ] **Webhooks demo.** Webhooks are a **Pro feature and are off for everyone**, so by default the Webhooks box on the API page says "part of the Pro plan, which is coming soon". That is honest and fine to show. To demo a working one, the operator (you) can switch them on for the recording and then off again:
  - On: `pnpm exec convex env set --prod PLAN_WEBHOOKS_PER_PERSON 1`
  - Off again: `pnpm exec convex env remove --prod PLAN_WEBHOOKS_PER_PERSON`
  - Open https://webhook.site, copy your unique address, add it as a webhook on the API page, press **Send a test**, and show the request arriving with the `X-ListeningKit-Signature` header. A real scored match needs the OpenAI key.
  - If you do not do this, say nothing about webhooks working. Do not claim it.

**Screen hygiene**
- [ ] Close other tabs, hide bookmarks and any window with keys or logins in it. **Never show a token, an ingest key, an API key or a terminal with a key in it.**

What works today, so you only promise that: Reddit end to end with real, scored matches, website reading (Firecrawl), email alerts (AgentMail), Google sign-in, plans and pricing, the docs, the API with scoped keys (read, add and change phrases), an MCP server for AI agents (Claude Code and Claude Desktop checked; Cursor and Hermes not run; not ChatGPT), and X and Facebook posts through a helper on your own computer. Webhooks are built but are a Pro feature and off. X direct messages are built and tested but not demo-ready (X's new encrypted Chat blocks the live read) — do not show them.

## 1. Video script (target 2:45, hard limit 3:00)

Screen recording with your voice. Speak plainly. One idea per scene. If you run long, cut the extension scene first, then the docs scene.

| Time | On screen | Say |
|---|---|---|
| 0:00 | Landing page | "This is ListeningKit. It watches Reddit, X and Facebook for the exact phrases your customers use, so you can reach them the moment they ask for help." |
| 0:12 | Type a website in the box, press **Get started** | "You start with your own website." |
| 0:20 | Onboarding: sign in with Google | "Sign in with Google, no password." |
| 0:28 | Pick the platforms | "Pick where your customers are." |
| 0:35 | Paste the website; brand appears (name, tagline, offerings) | "Firecrawl reads my real website and builds my brand profile. Nothing is typed in by hand." |
| 0:53 | Extension icon, then paste the token, then Connected | "A small Chrome extension hands over my login. It is stored encrypted and never shown again." |
| 1:08 | Keywords: add a phrase, press **Check now** | "I tell it what to listen for: a phrase, and the community." |
| 1:23 | Matches list, with real scores | "Every new post that says my phrase shows up here, newest first, scored by OpenAI so I know which ones matter." |
| 1:38 | Settings, Notifications: **Send a test email**, then the email arriving | "Strong matches are emailed to me through AgentMail, one short digest at a time." |
| 1:53 | **API** page: the scope tick-boxes, then the terminal running the `curl` command | "There is a real API too. I make a key and choose what it may do: read only, or also add and change phrases. Then my own code gets my matches as JSON." |
| 2:23 | Landing page, Pricing section | "Start free with one of each. Pro is on the way, with more, and webhooks." |
| 2:33 | Dashboard, Docs tab | "Guides for users and developers are built in." |
| 2:41 | Landing page, then the repo | "It runs on Convex: live queries, crons, scheduled functions and HTTP actions. Thanks for watching." |

Adjustments:
- X and Facebook helpers running: add 10 seconds after 1:23: "X and Facebook work through a helper on my own computer, using a proxy the site provides, so people never handle one."
- MCP scene done: add 10 seconds after the API scene. Show the terminal, run `claude mcp list` (it says Connected), then ask Claude Code: "Use listeningkit to show my plan and my three newest matches." Say: "The same key also works for AI agents through MCP. Claude reads my matches, and a read-only key cannot change anything." Then cut the docs scene (2:33) to stay under 3:00. Leave this out if you did not do the checklist above.
- Webhooks demo done: add 15 seconds to the API scene: "And on Pro, a webhook sends a signed message to my server the moment a strong match appears." Show the request arriving. Otherwise leave this sentence out.

Tips: record at 1080p, zoom the browser to 110 percent, keep the cursor slow, cut every pause longer than 2 seconds.

## 2. The short post (X or LinkedIn)

Post the video with one of these. Add the live link. Do not add any key, token or email address.

**X (under 280 characters):**

> Built ListeningKit for the @convex All Gas hackathon: it watches Reddit, X and Facebook for the phrases your customers use, reads your site with Firecrawl, emails strong matches via AgentMail, and has a scoped API plus an MCP server for AI agents. Live: https://tremendous-seahorse-330.convex.site

**LinkedIn:**

> I built ListeningKit for the Convex All Gas hackathon. It watches Reddit, X and Facebook for the exact phrases your customers use ("need a bookkeeper", "switching accountants") and shows you the posts the moment they appear.
>
> What is inside: Convex for the backend (live queries, crons, scheduled functions, HTTP actions), Clerk for sign-in, Firecrawl to read your website and build your brand profile, AgentMail to email you strong matches, and a small Chrome extension so your logins stay encrypted and out of the browser. There is also a scoped API and an MCP server, so your own code or an AI agent like Claude can read your matches and manage your phrases, and signed webhooks are built for the Pro plan.
>
> Try it: https://tremendous-seahorse-330.convex.site
> Code: https://github.com/matthewdonsemail-lab/log

## 3. Submission form

| Field | What to put |
|---|---|
| Project name | ListeningKit |
| One-line description (under 140 characters) | Social listening for Reddit, X and Facebook: get the best matches by email, API or from your AI agent (MCP). |
| Short description (under 400 characters) | ListeningKit watches Reddit, X and Facebook for the exact phrases your customers use and lists every new post that matches. It reads your website with Firecrawl to learn your business, emails the strongest matches through AgentMail, and has a scoped API and an MCP server so your code or an AI agent can read matches and manage phrases. Built on Convex with live queries, crons, scheduled functions and HTTP actions. |
| Live URL | https://tremendous-seahorse-330.convex.site |
| Repository | https://github.com/matthewdonsemail-lab/log |
| Video | the link to your upload (YouTube unlisted, Loom or similar) |
| Sponsor tools used | Firecrawl (website reading), AgentMail (email alerts). OpenAI (match scoring) only if its key is set on the live site. |
| Convex features | schema and indexes, queries, mutations, actions, HTTP actions, crons, scheduled functions, live queries, static hosting component |

If the form asks what else is in it: plans and pricing (Free limits enforced on the server), a public API with scoped keys and phrase writes, an MCP server (7 tools, same keys, scopes and plan limits) with setup docs for Claude, Cursor and Hermes, signed webhooks (a Pro feature, off by default), an X and Facebook helper that runs on the user's own computer, and documentation built into the app.

## 4. Final checks (3 minutes)

- [ ] Open the live URL in a private window: the landing page loads, the Pricing section is there, and **Get started** leads to onboarding.
- [ ] Open https://tremendous-seahorse-330.convex.site/docs/guide/api.html in a private window: it shows "The API".
- [ ] Open https://tremendous-seahorse-330.convex.site/docs/guide/mcp.html in a private window: it shows "Use it from an AI agent (MCP)".
- [ ] The video plays for someone who is not signed in to your account.
- [ ] The repo is public and `hackathon.md` is at its root.
- [ ] Nothing in the video, post or repo shows a key, token or password. Watch the video once with the sound off, looking only for keys.
- [ ] Delete the `demo` and `agent` API keys, and switch webhooks back off if you turned them on.
- [ ] Rotate the Firecrawl and AgentMail keys after the deadline (they were pasted in a chat during development).

## Checked on the live site (2026-09-22)

Everything in this kit was tested on the live site, signed in, with cleanup: landing and pricing, the website box, sign-in, Firecrawl reading a real site, the AgentMail test email, Free plan billing, the docs and docs tab, API keys with scopes, reads, phrase writes (with the Free limit and safe retries), a read-only key being refused, webhooks refused on Free and working when switched on (signed, verified at an outside receiver), the proxy endpoint, and the ingest door. The MCP server was tested with the official MCP Python SDK (17 checks) and the Claude Code and Claude Desktop setup snippets were run for real; Cursor and Hermes were not run, and ChatGPT is not supported. **OpenAI scoring was set today and verified live: a real Reddit post ("ipad" in r/ipad) scored 80, "Wants help".**

**A real bug was found and fixed today:** the prod static site's own build was pointing at the dev Convex backend, so dashboard-driven actions (sign-in, keywords, matches) were silently hitting dev's database while served from the prod URL. Direct API/MCP calls were unaffected. Fixed and redeployed; confirmed by downloading the live JS bundle and checking it references the prod deployment.

Not demo-ready: X direct messages (built, tested, but X moved DMs to an encrypted "X Chat" that blocks the live read) and Facebook/Reddit messages (not built). The X and Facebook post helpers were checked on dev through the proxy, not re-run on prod today.
