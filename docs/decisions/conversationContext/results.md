# Result: a conversation card per chat, kept up to date in the background

SubQ (`subq-snap-1.1`) ran on 2026-11-12. It read 87,486 characters of evidence: `issue.md`, `research.md`, the voice gate spec and its code, the chat context code and the `scopeAJob` use case. Raw answers are in `subqResults.json`, and the runner is `runMatrix.mjs`.

## Best option on each criterion

| Criterion | Pick | Probability |
|---|---|---|
| Only this conversation | conversationCard | 0.92 |
| Short for the drafter | conversationCard | 0.99 |
| Fast at send time | conversationCard | 0.91 |
| Passes the gate first time | conversationCard | 0.97 |
| Background work only when needed | conversationCard | 0.64 (scopedAtSend 0.34) |
| Fits log's rules | conversationCard | 0.61 |
| Cheap to build | today | 0.79 |
| **Overall** | **conversationCard** | **0.92** |

## Scores (0 to 4)

| | today | scopedAtSend | indexOnArrival | conversationCard |
|---|---|---|---|---|
| scopedToThisChat | 0.19 | 3.07 | 3.09 | 3.89 |
| shortForTheDrafter | 0.11 | 2.82 | 2.59 | 3.99 |
| sendLatency | 1.01 | 2.42 | 3.54 | 3.94 |
| passesFirstTime | 0.92 | 2.40 | 2.62 | 3.70 |
| onlyWhenNeeded | 3.83 | 3.95 | 2.20 | 3.73 |
| fitsLogRules | 3.80 | 3.92 | 3.87 | 3.83 |
| buildCost | 3.95 | 2.96 | 2.34 | 2.14 |

## Claims

SubQ found all eight claims true, each at 0.98 or above:

- nothing is embedded when a message arrives;
- the voice index is parsed twice per gate;
- SubQ is a minority of the gate's time;
- the evidence comes from every platform;
- the writing guide covers X only;
- there is no per-conversation state;
- the form-of-questions drafts scored 0.15 to 0.22;
- the owner already appends every message.

## What gets built

- **The card.** A table in log.db, one row per chat. It records who they are, what the conversation is about, what they asked that is still open, what matt already said or asked there, and the last few messages.
- **When it is updated.** The account's owner refreshes the card in the background, only when a message lands in a chat that is being worked: claimed, or with a reply waiting.
- **What the drafter gets.** The card and the last messages, instead of the writing guide and other conversations. It answers the open item in one or two short lines.
- **What the gate reads.** The same card. matt's global voice comes in as a short profile only.
- **What stays.** Every check in code (rule 137).

The one thing against it is build cost (2.14). On background work, scopedAtSend came close (0.34). It is the cheaper first step, because it cuts the cross-conversation pile with nothing running in the background.
