# What a send reads about its conversation

matt, 2026-11-12, after an agent spent a run trying to scope a job out of Invoker on Discord and every draft failed the voice gate:

> "when we're messaging people it's not going to have all of this here randomly assorted stuff ... the schema for a conversation and then sending a message and all of the things of other conversations is just all over the place"

> "as the new message comes in that individual message is indexed ... a background process that is running, so we don't have to do it ... these things shouldn't need to be necessarily ran unless super important"

> "it keeps scoring really low on the gate and it's because it's a mountain wall of text, like a form for understanding"

What happened (thread "boss maxxing", run 77, 2026-11-12):

- The agent read the whole Invoker chat and the spreadsheet he sent, then drafted.
- The first draft had seven lines, each a question: "the whole folder codex was working in - the source archive the tests and the json receipts the excel is pulling from / when you say it needs live recordings what exactly is being recorded / ...". It scored voice 0.216, inContext 0.73, friendLike 0.50, openerOnly 0.40 and toThem 0.46. It needs voice 0.8.
- A shorter version with six bare question lines scored voice 0.155, inContext 0.40 and friendLike 0.41.
- Other attempts scored 0.163, 0.659 and 0.8. Each one meant another full gate.
- The agent then went looking through his writing guide and his whole history for wording. matt stopped it.

So the problems are:

1. The drafter starts from a pile of context: matt's X writing guide, his replies from every platform, the chat and the spreadsheet. It turns that into a form of questions.
2. The gate re-assembles a similar pile at send time on every attempt: p50 3.9 s, p95 8.9 s, max 26 s.
3. Nothing about a conversation is kept as it happens. Each message is stored and keyword-indexed when it arrives, but nobody keeps what the conversation is about, what is open, or what matt already said or asked there. Every send works it out again from raw text.

## The decision

How should log keep and hand over a conversation's context, so that:

- the drafter gets a short picture of this conversation only;
- the gate reads the same thing;
- whatever has to be computed is done in the background as each message lands, not at send time?
