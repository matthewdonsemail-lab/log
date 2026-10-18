# REA and Meta: Public Evidence and Playwright Candidates

## Executive Summary

- **No Verified Meta Implementation**: I did not establish a public, reproducible REA investigation of the requested Meta surfaces during **14 April-18 October 2026**. This is a limited finding, not proof that no such implementation exists.
- **Issue Matches Need Qualification**: REA issue searches return Facebook and WhatsApp matches; those matches alone do not establish an implementation. Treat the unresolved issues below as leads, not demonstrated cases. [16][22]
- **Concrete Browser Evidence Exists Elsewhere**: REA's browser guide publishes a notes-export request, response shape and initiating JavaScript, but its target is REA's own example, not Meta. [20]
- **JavaScript Evidence Is Primarily Static**: The Electron example publishes an IPC trace and structured analysis result; the guide explicitly distinguishes code-derived behavior from runtime verification. [21]
- **Promotion Is Not Platform Analysis**: A Facebook-hosted REA announcement describes general capabilities without presenting a Meta-targeted investigation. Do not count its hosting platform as its target. [15]
- **Playwright Coverage Is Partial**: Several relevant public repositories were identified, but their exact browser-launch files were not verified. They are listed as candidates rather than falsely presented as fully inspected implementations. [17][8][14][6]

## REA Against Meta: No Confirmed Implementation

**Confirmed implementations: none established in this review.** I cannot substantiate a qualifying REA command/MCP run, target-specific artifact and attributable publication date for Facebook, Instagram, WhatsApp, Messenger, Facebook Marketplace, the Graph API or the Marketing API.

The following issue leads prevent a stronger claim that there are no relevant public mentions. Their inclusion here does **not** mean that they demonstrate REA operating against Meta:

| Public lead | Meta-related association | Date and author | REA command/tool; published evidence; limitation |
|---|---|---|---|
| https://github.com/morluto/rea/issues/3667 | Returned by the repository's Facebook issue search. [16] | Not established in the available evidence. | No qualifying command, MCP invocation or Meta-specific result established here. The match is not counted as an implementation. |
| https://github.com/morluto/rea/issues/2238 | Returned by the repository's WhatsApp issue search. [22] | Not established in the available evidence. | No qualifying command, MCP invocation or WhatsApp artifact established here. The match is not counted as an implementation. |
| https://github.com/morluto/rea/issues/4004 | Surfaced in the Graph API issue-search results. [18] | Not established in the available evidence. | Its appearance in search does not establish that REA was used against the Graph API. Not counted. |

**Bottom line:** the defensible result is "no verified implementation found," not an exhaustive "none exists." The unresolved dates also mean these leads cannot be represented as confirmed publications inside the requested window.

## Nearest Public REA Browser and JavaScript Investigations

These are concrete alternatives to the missing Meta case. The inspected guide pages do not supply publication dates or named authors, so their presence within the requested date window is **not established**.

| Investigation and URL | Author/date; Meta surface | Exact REA command or tool | Published evidence | What it does not show |
|---|---|---|---|---|
| **Browser notes export**: https://rea.tools/guides/browser/ | REA documentation; named author/date not shown. **No Meta target.** | `list-browser-targets`; `inspect-web-page`, including script-source and JSON-body-shape inspection. [20] | A captured `GET /examples/notes-web/notes.json`, HTTP 200 JSON response, `export.js` as initiator, and the response's `notes[]` structure. The script fetches notes and creates a CSV download. [20] | No Facebook/Instagram/API analysis. The capture covers its observation window, not requests that happened earlier. [20] |
| **Electron CSV export**: https://rea.tools/guides/javascript/ | REA documentation; named author/date not shown. **No Meta target.** | `analyze-javascript-application`; structured `normalized_result.summary.ipc` and `normalized_result.graph`. [21] | A renderer-to-preload-to-main-process trace for `notes:export`; a result excerpt reporting one channel and one matching handler; linked application source files. [21] | Static inference is not proof of runtime execution. Computed channel names or ambiguous handlers can remain unresolved. [21] |
| **Notion clipboard investigation**: https://rea.tools/notion/ | Listed by REA's showcase; named author/date not established from that listing. **No Meta target.** | Exact command/MCP tool not supplied in the inspected showcase description. | The description identifies a trace through packaged JavaScript and IPC wrappers to the system clipboard, including an HTML marker connecting rich block data to a copy. [1] | The showcase description alone does not establish exact invocations, a dated execution record or Meta applicability. |

The notes examples provide the clearest inspectable artifacts. Their value is the connection between a finding and specific source/request evidence, not a demonstration that the same workflow has been applied to Meta.

**Direct example artifacts:**

- Browser application: https://rea.tools/examples/notes-web/; script: https://rea.tools/examples/notes-web/export.js; response fixture: https://rea.tools/examples/notes-web/notes.json. [20]
- Electron source: https://rea.tools/examples/notes-electron/main.js and https://rea.tools/examples/notes-electron/csv.js. [21]
- Introductory walkthrough: https://rea.tools/first-investigation. It follows the same Electron export and identifies the handler in `main.js`, lines 8-12; it is not a separate Meta implementation. [19]

## Announcements and Passing Meta Mentions

These items are **not verified REA-on-Meta implementations**.

| Item and URL | Date / author | Meta surface and REA tool | Evidence and missing demonstration |
|---|---|---|---|
| **Facebook community announcement**: https://www.facebook.com/groups/claudeaicommunity/posts/1408928917940938 | Adrees AI Automation. The accessible page displays only "19 hours ago," so its absolute date is not established. [15] | Hosted on Facebook; no Meta-targeted REA command or MCP tool shown. | General claims about inspecting binaries, APKs, websites, .NET and firmware. "Titles are generated by AI from Meta" is platform text, not an analysis result. No Facebook-targeted trace or artifact is established. [15] |
| **Eigent, "REA: Reverse Engineer Anything With AI Agents"**: https://www.eigent.ai/blog/rea-reverse-engineer-anything | **12 October 2026**; Eigent. [2] | General REA coverage; no demonstrated Meta target established. | Describes the project as an MCP server and CLI. That description is not evidence of a Meta-specific run. [2] |
| **byteiota launch article**: https://byteiota.com/rea-launches-give-your-ai-agent-reverse-engineering-power | **7 October 2026**; individual author not established. [7] | General announcement; no Meta target or individual Meta-specific tool invocation established. | Describes CLI/MCP capabilities, not a published Facebook, Instagram, WhatsApp or API investigation. [7] |

A Facebook share link, a Meta-generated title, or publication on Facebook/Instagram should not be counted as use **against** those services. None of these announcements closes the implementation-evidence gap.

## Public Playwright Repositories: Relevant Candidates, Not Verified Launchers

The following repositories are relevant to the second request. **I did not verify the file containing the browser-launch call**, so I will not invent filenames. Nor was a defensible popularity ranking established; notably, the inspected SPolton repository reports only **5 stars**. [17]

| Repository / author | Target and published description | File launching the browser | Evidence status |
|---|---|---|---|
| https://github.com/passivebot/facebook-marketplace-scraper | Facebook Marketplace; describes Playwright, BeautifulSoup and Streamlit. [14] | **Not verified.** | Relevant public implementation candidate; no REA connection established. |
| https://github.com/SPolton/fb-marketplace-scraper | Facebook Marketplace; describes the same three technologies. Created **18 August 2024**, therefore predates the REA date window. [17] | **Not verified.** | Relevant small public repository, not evidence of a popular REA implementation. |
| https://github.com/abhinavsmukesh/Facebook-marketplace-scraper | Describes a Marketplace data-collection platform built with Playwright. [13] | **Not verified.** | Repository-level description established; browser-launch source and live results not verified. |
| https://github.com/deepmroot/playwright | Describes a FastAPI/Playwright Facebook service covering groups, Marketplace listings and messaging. [6] | **Not verified.** | Public service implementation candidate; not established as official Graph API automation. |
| https://github.com/Scratchycarl/Facebook-Marketplace-AI-Auto-Reply | Describes a Marketplace Messenger bot using Python, Playwright and an LLM, with human approval. [5] | **Not verified.** | Relevant messaging candidate; description alone does not prove successful execution. |
| https://github.com/FaustRen/facebook-graphql-scraper | Describes collection of Facebook posts and reaction statistics; identifies itself as a **GraphQL** scraper. [8] | **Not verified.** | Do **not** relabel it as official Graph API code. The inspected evidence does not establish that distinction or the exact launcher. |

These are useful source leads, but they do **not fully satisfy** the requested "popular code plus exact browser-launch file" catalog. No official Graph API-through-Playwright implementation was verified. GraphQL scraping, Marketplace browser interaction and official Graph API calls are different categories and should remain separate.

## Synthesis

The strongest inspected REA material concerns **non-Meta examples**: a browser network capture, a static Electron IPC trace and a Notion clipboard showcase. They differ in mechanism, scope and evidence strength: request/response observations establish browser activity; static traces establish code relationships; showcase descriptions identify an investigation without supplying every invocation. [20][21][1]

The external Facebook repositories address a different question: they are relevant automation candidates, but they do not demonstrate REA use. The key unresolved deliverables are attributable, dated Meta-specific REA artifacts and inspected Playwright browser-launch files. Neither should be inferred from product descriptions or announcements.

## References

1. *REA case studies.*. https://rea.tools/showcase
2. *REA: Reverse Engineer Anything With AI Agents*. https://www.eigent.ai/blog/rea-reverse-engineer-anything
3. *REA: The Open-Source Tool That Lets Your Agent Reverse ...*. https://inamdaraditya.medium.com/rea-the-open-source-tool-that-lets-your-agent-reverse-engineer-any-closed-source-app-6272c01db2fd
4. *REA MCP Server: Agent Reverse Engineering Security | explainx ...*. https://explainx.ai/blog/rea-reverse-engineering-mcp-server-agent-security-2026
5. *GitHub - Scratchycarl/Facebook-Marketplace-AI-Auto-Reply ...*. https://github.com/Scratchycarl/Facebook-Marketplace-AI-Auto-Reply
6. *GitHub - deepmroot/playwright*. https://github.com/deepmroot/playwright
7. *REA Launches: Give Your AI Agent Reverse Engineering Power*. https://byteiota.com/rea-launches-give-your-ai-agent-reverse-engineering-power
8. *Facebook GraphQL Scraper - GitHub*. https://github.com/FaustRen/facebook-graphql-scraper
9. *Reverse Engineering Guides — REA*. https://rea.tools/guides
10. *api.github.com*. https://api.github.com/search/issues?q=repo%3Amorluto%2Frea%20instagram
11. *api.github.com*. https://api.github.com/repos/morluto/rea/git/trees/main?recursive=1
12. *REA Blog — Thoughts on Reverse Engineering*. https://rea.tools/blog/
13. *GitHub - abhinavsmukesh/Facebook-marketplace-scraper: Advanced Facebook Marketplace intelligence platform built with Playwright. Features automated location detection, stealth browser automation, parallel detail-page extraction, API-ready JSON output, cookie-based session management, and scalable data collection across any Marketplace region. · GitHub*. https://github.com/abhinavsmukesh/Facebook-marketplace-scraper
14. *GitHub - passivebot/facebook-marketplace-scraper: This repository contains a script to scrape Facebook Marketplace data using Playwright, BeautifulSoup and Streamlit. · GitHub*. https://github.com/passivebot/facebook-marketplace-scraper
15. *Claude Ai Community | This open source tool just went viral (242k ⭐)  | Facebook*. https://www.facebook.com/groups/claudeaicommunity/posts/1408928917940938
16. *api.github.com*. https://api.github.com/search/issues?q=repo%3Amorluto%2Frea%20facebook
17. *GitHub - SPolton/fb-marketplace-scraper: This repository contains a script to scrape Facebook Marketplace data using Playwright, BeautifulSoup and Streamlit. · GitHub*. https://github.com/SPolton/fb-marketplace-scraper
18. *api.github.com*. https://api.github.com/search/issues?q=repo%3Amorluto%2Frea%20%22graph%20api%22
19. *Your First Reverse Engineering Investigation — REA*. https://rea.tools/first-investigation
20. *Browser and Network Analysis — REA*. https://rea.tools/guides/browser/
21. *JavaScript and Electron Analysis — REA*. https://rea.tools/guides/javascript/
22. *api.github.com*. https://api.github.com/search/issues?q=repo%3Amorluto%2Frea%20whatsapp
23. *api.github.com*. https://api.github.com/search/issues?q=repo%3Amorluto%2Frea%20marketplace
24. *REA: Let Your AI Agent Reverse Engineer the App Features You Wish You Had - DEV Community*. https://dev.to/arshtechpro/rea-let-your-ai-agent-reverse-engineer-the-app-features-you-wish-you-had-3en7
