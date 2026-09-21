# Submission kit (for Matthew)

Everything to record, post and submit. Deadline: **Tue 22 Sep 2026, 12:00 PM PT**.
Submit at https://vibeapps.dev/judging/convex-all-gas-hackathon-openai/submit

- Live app: https://tremendous-seahorse-330.convex.site
- Repo: https://github.com/matthewdonsemail-lab/log (public, `hackathon.md` at the root)

## 0. Before you press record (5 minutes)

Do these first so nothing on screen is empty or broken. Check each one on the live app, in a normal browser window, signed in with a Google account you are happy to show.

- [ ] Sign in works and lands on onboarding.
- [ ] You have connected **Reddit** (Chrome extension, then paste the token in Settings, Connections).
- [ ] At least one **Reddit phrase** is saved (for example `need a bookkeeper` in `smallbusiness`) and shows matches. Press **Check now**.
- [ ] Settings, Notifications: your email is saved and **Send a test email** arrives.
- [ ] Have a real business website ready to paste, for example `mailchimp.com`.
- [ ] Close other tabs, hide bookmarks and any window with keys or logins in it. **Never show a token, an ingest key or a terminal with a key in it.**
- [ ] The proxy is set up, so X and Facebook helpers work (run them on your computer before recording: see the Guide, X and Facebook helpers). Optional: the OpenAI key (matches show score badges). If the OpenAI key is not set, **skip the scoring scenes**. Show only what works.

What works today, so you only promise that: Reddit end to end, website reading (Firecrawl), email alerts (AgentMail), Google sign-in, the docs, and X and Facebook through a helper on your own computer (the proxy is set on the site). Match scores need the OpenAI key.

## 1. Video script (target 2:30, hard limit 3:00)

Screen recording with your voice. Speak plainly. One idea per scene.

| Time | On screen | Say |
|---|---|---|
| 0:00 | Landing page | "This is ListeningKit. It watches Reddit, X and Facebook for the exact phrases your customers use, so you can reach them the moment they ask for help." |
| 0:15 | Type a website in the box, press **Get started** | "You start with your own website." |
| 0:25 | Onboarding: sign in with Google | "Sign in with Google, no password." |
| 0:35 | Pick the platforms | "Pick where your customers are." |
| 0:45 | Paste the website; brand appears (name, tagline, offerings) | "Firecrawl reads my real website and builds my brand profile. Nothing is typed in by hand." |
| 1:05 | Extension icon, then paste the token, then Connected | "A small Chrome extension hands over my login. It is stored encrypted and never shown again." |
| 1:25 | Keywords: add a phrase, press **Check now** | "I tell it what to listen for: a phrase, and the community." |
| 1:45 | Matches list (scores if OpenAI is on) | "Every new post that says my phrase shows up here, newest first. With scoring on, an AI rates how likely the writer is to buy." |
| 2:05 | Settings, Notifications: **Send a test email**, then the email arriving | "Strong matches are emailed to me through AgentMail, one short digest at a time." |
| 2:25 | Dashboard, Docs tab | "Guides for users and developers are built in." |
| 2:35 | Landing page, then the repo | "It runs on Convex: live queries, crons, scheduled functions and HTTP actions. Thanks for watching." |

If OpenAI is not set up, cut "scores" from scene 1:45 and say "matches". If the X and Facebook helpers are running, add 10 seconds after 1:45: "X and Facebook work through a helper on my own computer, using a proxy the site provides, so people never handle one."

Tips: record at 1080p, zoom the browser to 110 percent, keep the cursor slow, cut every pause longer than 2 seconds.

## 2. The short post (X or LinkedIn)

Post the video with one of these. Add the live link. Do not add any key, token or email address.

**X (under 280 characters):**

> Built ListeningKit for the @convex All Gas hackathon: it watches Reddit, X and Facebook for the phrases your customers use, reads your website with Firecrawl, and emails strong matches through AgentMail. Live: https://tremendous-seahorse-330.convex.site

**LinkedIn:**

> I built ListeningKit for the Convex All Gas hackathon. It watches Reddit, X and Facebook for the exact phrases your customers use ("need a bookkeeper", "switching accountants") and shows you the posts the moment they appear.
>
> What is inside: Convex for the backend (live queries, crons, scheduled functions, HTTP actions), Clerk for sign-in, Firecrawl to read your website and build your brand profile, AgentMail to email you strong matches, and a small Chrome extension so your logins stay encrypted and out of the browser.
>
> Try it: https://tremendous-seahorse-330.convex.site
> Code: https://github.com/matthewdonsemail-lab/log

## 3. Submission form

| Field | What to put |
|---|---|
| Project name | ListeningKit |
| One-line description (under 140 characters) | Social listening for Reddit, X and Facebook: watch for the phrases your customers use and get the best matches by email. |
| Short description (under 400 characters) | ListeningKit watches Reddit, X and Facebook for the exact phrases your customers use and lists every new post that matches. It reads your website with Firecrawl to learn your business, scores matches by how likely the writer is to buy, and emails the strongest through AgentMail. Built on Convex with live queries, crons, scheduled functions and HTTP actions. |
| Live URL | https://tremendous-seahorse-330.convex.site |
| Repository | https://github.com/matthewdonsemail-lab/log |
| Video | the link to your upload (YouTube unlisted, Loom or similar) |
| Sponsor tools used | Firecrawl (website reading), AgentMail (email alerts). OpenAI (match scoring) only if its key is set on the live site. |
| Convex features | schema and indexes, queries, mutations, actions, HTTP actions, crons, scheduled functions, live queries, static hosting component |

## 4. Final checks (2 minutes)

- [ ] Open the live URL in a private window: the landing page loads and **Get started** leads to onboarding.
- [ ] The video plays for someone who is not signed in to your account.
- [ ] The repo is public and `hackathon.md` is at its root.
- [ ] Nothing in the video, post or repo shows a key, token or password.
- [ ] Rotate the Firecrawl and AgentMail keys after the deadline (they were pasted in a chat during development).
