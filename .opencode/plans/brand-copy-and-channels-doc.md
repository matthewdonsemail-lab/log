# Plan: concrete Brand copy + `channels` docs page (in-app links)

Goal: stop `DashboardBrand.tsx` from speaking in abstractions ("Real conversational fragments. No formal sign-offs or canned corporate lines.") and make each section state the **actual mechanic** in one or two plain sentences, with a `Learn more` link into the in-app docs. Add the missing docs page that explains the per-channel pick, since `voice.mdx` only covers prompt compilation.

Decided: links are **in-app** → `/dashboard/docs/brand/...` (served by the existing `docs/*` iframe route in `App.tsx:63` + `DashboardDocs.tsx`; subpaths already work via `toDocsSrc`).

## 1. New docs page — `apps/docs/content/docs/brand/channels.mdx`

Exact content to write (frontmatter + body):

```mdx
---
title: Channel texting
description: The four dials per channel — style, raw snippets, triage, autoreplies — and the exact pick the agent runs before every send.
---

# Channel texting

Global [voice](/docs/brand/voice) compiles into the agent's system prompt. Each channel (`facebook`, `x`, `reddit`) carries its own `ChannelProfile` on top — **how the agent texts there**: a style dial, raw snippets it sends, the triage flow it pushes, and toggleable autoreplies. Everything below is what the mock `simulateOutbound()` actually does, and what the live agent will do with the same inputs.

## The four dials

| Dial | Holds | Effect on a send |
|---|---|---|
| **Style** | `casual` or `standard` | `casual` lowercases the whole picked line before it goes out — like a human typing fast. `standard` sends it as written. |
| **Raw snippets** | `examples: string[]` — chat fragments, no sign-offs | The pick pool. The snippet with the most word overlap against the post the agent detected is sent verbatim as first touch. |
| **Triage flow** | `triage: string[]` — ordered asks | The **first** item is appended to every send. The full list is the order the agent pushes to qualify the deal. |
| **Autoreplies** | `autoreplies: { trigger, reply, enabled }[]` | When a post's words match a trigger harder than any snippet, that line sends instead — it's the one you approved for sending. |

## Why snippets are fragments, not sentences

Snippets are sent **verbatim as the first touch**, and the first triage ask rides behind them. A snippet ending in "Best regards, The Team" would ship as-is and read corporate on a Marketplace thread — which is exactly the thing the dial exists to avoid. Practical rule:

1. **Write it as you'd text it.** Fragments, lowercase, no greeting, no sign-off. `anyone around know someone with a van` — not `Hello, do you by chance know a van operator…`.
2. **One topic per snippet.** The picker matches on word overlap — the post's own words (`van`, `shed`, `salthill`) have to appear in the snippet you want to trigger it.
3. **Put your safest general opener first.** When nothing scores above zero, the first snippet is the fallback send, so slot #1 is your default line.
4. **Don't end snippets with a question.** The triage nudge gets appended as the question.
5. **Keep triage item #1 to one short ask.** It rides along on *every* send on that channel.

## The pick, exactly

Deterministic — the same post always previews (and sends) the same message:

1. Score every **enabled autoreply** by word overlap (words of 4+ chars) against the detected post. The best wins; ties keep the autoreply, because it's the line you approved.
2. Score every **raw snippet** the same way; a snippet that scores strictly higher replaces the current pick.
3. Nothing scored above zero → first snippet, else the house fallback line for the channel's style.
4. Append **triage item #1** (question-marked if the base doesn't already end in one).
5. `casual` applies last, lowercasing the joined line.

These same strings also reach the live agent verbatim — snippets as `Example replies to mimic:`, enabled autoreplies as `Enabled base replies — adapt to their actual words and send:`. What the simulator previews is byte-for-byte what the agent is told.

## Live simulator labels

The Brand tab's simulator types the detected post and labels the result with one of three lines — they map to the pick above:

| Label under the blue bubble | The pick |
|---|---|
| `Matched autoreply · <trigger>` | An enabled line won on word overlap; the trigger names why. |
| `Matched a gold example` | A snippet won the scoring. |
| `No close match — style fallback` | Nothing scored — first snippet or house line sent, so read it as "this post won't match anything you've written yet." |

If the preview reads wrong, the snippets are wrong — fix the snippets, not the drafts.
```

Grounding (all verified in code):
- Pick algorithm: `apps/web/src/lib/brand/prompt.ts:153-195` (`simulateOutbound`) — autoreplies scored first (`prompt.ts:166-175`), strictly-higher example replaces (`prompt.ts:176-185`), fallback `examples[0] ?? FIRST_TOUCH_FALLBACK[style]` (`prompt.ts:186`), triage[0] append (`prompt.ts:191-195`), casual lowercase (`prompt.ts:188,193`).
- Verbatim prompt lines: `prompt.ts:55-66` ("Example replies to mimic:", "Enabled base replies — when the lead context matches a trigger, adapt that reply to their actual words and send:").
- UI label strings: `DashboardBrand.tsx:364-368`.

## 2. Register the page — `apps/docs/content/docs/brand/_meta.json`

```json
{
  "index": "Brand",
  "voice": "Voice to system prompt",
  "channels
": "Channel texting",
  "website-index": "Website index",
  "agent-context": "Agent context"
}
```

## 3. Rewrite `DashboardBrand.tsx` copy (in-place, same register — specifics, not length)

Import `ArrowRight` is already present; link style follows the in-app convention `font-semibold text-[#2A8CFF] hover:underline` (see `DashboardAnalyticsPage.tsx:181`).

| Location | Current | New |
|---|---|---|
| `DashboardBrand.tsx:277-279` (under "How we actually text") | "Real conversational fragments. No formal sign-offs or canned corporate lines." | "Sent verbatim as first touch: the snippet closest to the lead's own words wins, then your first triage ask is tacked on. Keep them short and human — no sign-offs." + line with `Learn more` link → `/dashboard/docs/brand/channels` |
| `DashboardBrand.tsx:287-289` (under "Triage flow") | "What the agent pushes to qualify the deal before booking." | "Item 1 rides along on every send. The rest is the order the agent works through before booking." |
| `DashboardBrand.tsx:336-338` (Facebook simulator) | "Paste the detected post / lead context — the blue bubble is the first-touch outbound message the agent sends." | "Paste the lead's post — it picks the enabled autoreply or snippet whose words overlap most, appends triage ask #1, and previews it as the blue first touch." + `How the pick works` link → `/dashboard/docs/brand/channels#the-pick-exactly` |
| `DashboardBrand.tsx:427-430` (X / Reddit intro) | "Quick, sharp one-liners. In and out." / "Helpful community member with technical context — answers the question, skips the pitch." | Keep (already concrete); no change. |
| `DashboardBrand.tsx:444` (X/Reddit "How we actually text") | no sub-line exists | Add the same sub-line + link as the Facebook one (one shared `SnippetsBlurb` component to avoid three-way copy drift). |
| `DashboardBrand.tsx:466-469` (X/Reddit simulator) | "Type the agent's reply — it renders as the blue ListeningKit Agent comment in the thread." / "Type the agent's reply — it threads below the opening post." | Keep — these describe the render, and they're accurate. No change. |
| `AutorepliesSection` sub-line `DashboardBrand.tsx:631-633` | "{enabled} of {n} on" only | Prepend the mechanic: "When a post's words match a trigger harder than any snippet, that line sends instead — {enabled} of {n} on." |
| Memory tab `DashboardBrand.tsx:383-385` | "What the agent remembers on every reply — pricing baselines, boundaries, jobs taken and declined." | "Compiled verbatim into the agent's instructions as 'never contradict these' — pricing baselines, boundaries, jobs taken and declined." + `Learn more` link → `/dashboard/docs/brand/voice` |
| Tone (`StyleRow`, `DashboardBrand.tsx:524-551`) | None | Small sub-line under the Select: "casual sends lowercase, like a human typing fast · standard sends it as written." (no link needed; one sentence) |
| Empty `GoldExamples` body `DashboardBrand.tsx:574` | "Paste 3–5 messages you would actually send here." | "Paste 3–5 lines you'd actually send — one topic each, no sign-offs, safest opener first." |

Link markup (react-router `Link`, already imported):

```tsx
<Link to="/dashboard/docs/brand/channels" className="font-semibold text-[#2A8CFF] hover:underline">
  Learn more
</Link>
```

Extract one tiny local component to avoid copy drift across the three channel tabs:

```tsx
function SnippetsLearnMore({ to }: { to: string }) {
  return (
    <Link to={to} className="font-semibold text-[#2A8CFF] hover:underline">
      Learn more
    </Link>
  )
}
```

(File-local; `DashboardBrand.tsx` already defines `EditButton`/`BrandSurface` the same way.)

## 4. Deliberately NOT changed

- No behavior changes, no prop changes, no route changes — the `docs/*` iframe already serves subpaths (`DashboardDocs.tsx:14-19`).
- No form rules touched (AGENTS.md form rules don't apply — this is display copy).
- `voice.mdx` / other MDX untouched (they stay correct; channels.mdx links out to voice, not a rewrite).

## 5. Verify

1. `pnpm --filter docs typecheck` (if the docs app has the script — confirm in `apps/docs/package.json`; else skip).
2. `pnpm -r lint` — must stay clean (oxlint).
3. `pnpm --filter web typecheck` — known to fail repo-wide on a pre-existing `@types/react` 18/19 duplicate (209 errors on a clean tree, verified by stash). Confirm zero *new* errors vs that baseline by diffing the error file lists for touched files.
4. Manual (dev server, if up): Brand tab → facebook/x/reddit/memory tabs render the new sub-lines; "Learn more" navigates inside the dashboard to the rendered MDX page; hash link `#the-pick-exactly` scrolls to the section.