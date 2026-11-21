# Research and decisions

Every research note, test matrix and proposal behind log's design, in one place. Each topic keeps its research, the options it scored and what was picked. Back to [docs](../README.md); the controls these led to are on the [trust page](../trust.md).

## Decisions

| Topic | Research | Other files |
|---|---|---|
| agentTrust | [Agent trust research (#255)](agentTrust/research.md) | [docsAudit](agentTrust/docsAudit.md), [judgeMatrix](agentTrust/judgeMatrix.md) |
| benchmarks | [Benchmarks for log: the right test for each area, from the research](benchmarks/research.md) |  |
| encryptedStore | [Encrypted account store research (#258)](encryptedStore/research.md) |  |
| genuiEverywhere | [Research: one generative-UI view in every harness, local and hosted](genuiEverywhere/research.md) |  |
| mcpReload | [Research findings (Parallel and GitHub, 2026-11-07)](mcpReload/research.md) | [issue](mcpReload/issue.md), [readme_mcp-reloader](mcpReload/readme_mcp-reloader.md), [readme_mcpmon](mcpReload/readme_mcpmon.md), [readme_reloaderoo](mcpReload/readme_reloaderoo.md) |
| pipeline | [Research: labelling conversations, sales stages, and linking people](pipeline/research.md) | [issue](pipeline/issue.md), [proposal](pipeline/proposal.md), [results](pipeline/results.md) |
| processLimits | [Research: processes and IPC, from the fundamentals and measured on the owner's machine](processLimits/research.md) | [issue](processLimits/issue.md), [results](processLimits/results.md), [tools](processLimits/tools.md), [transcripts](processLimits/transcripts.md) |
| relateApp | [Research: the Relate state machine view (#267)](relateApp/research.md) | [stately](relateApp/stately.md) |
| slopDetector | [Research: frontier-model writing conventions](slopDetector/research.md) | [issue](slopDetector/issue.md), [proposal](slopDetector/proposal.md), [repos](slopDetector/repos.md), [results](slopDetector/results.md) |
| voiceOptions | [Research: writing like one person from their own messages](voiceOptions/research.md) | [issue](voiceOptions/issue.md), [results](voiceOptions/results.md) |

## Proposals

- [One name and one input shape per capability](../proposals/capabilitySchema.md)
- [How context reaches the model: guides, router, hooks and harnesses](../proposals/contextInjectionAudit.md)
- [Conversation card: one short record per chat, read by the writer and the voice gate](../proposals/conversationCard.md)
- [Every file the proposals name](../proposals/fileIndex.md)
- [One view, every harness: log's generative UI in ChatGPT, Claude and local harnesses](../proposals/genuiEverywhere.md)
- [In-app verification (computer use) and generative-UI data storage](../proposals/inAppVerificationAndGenerativeUI.md)
- [Workspace data model: DDIA applied to the existing .logCli runtime](../proposals/listeningKitInstanceContracts.md)
- [Data boundary: hosted control service and workspace-local application database](../proposals/listeningKitNativeData.md)
- [Native Log schema and application contract](../proposals/listeningKitSchema.md)
- [Usage summaries](../proposals/listeningKitUsage.md)
- [People across platforms: one person, every identity, and the first-time interactor (issue #95)](../proposals/peopleAcrossPlatforms.md)
- [One platform-neutral capability set across the CLI, MCP and console](../proposals/platformNeutralSurfaces.md)
- [CLI and MCP parity: schemas, results and gates](../proposals/schemaParityAudit.md)
- [soron: capture the conversation around a personal mention, edits and deletions included](../proposals/soron.md)
- [Sources for the platform-neutral surfaces spec](../proposals/sources.md)
- [Turn awareness, tool health, the morning debrief and selling on calls](../proposals/turnAware.md)
- [Proposal: drafts grounded in the owner's own replies, one defined gate score, ranked options](../proposals/voiceOptions.md)

## Provider research

- [Persistent Cloud Browser Fleets: Costs, Constraints, and Shortlist](../providerResearch/agentVmHosts.md)
- [cloudBrowsersAndAntidetect.md](../providerResearch/cloudBrowsersAndAntidetect.md)
- [cloudPhonesAndDevices.md](../providerResearch/cloudPhonesAndDevices.md)
- [Residential Proxy Costs and Reliability for Persistent Accounts](../providerResearch/proxiesAndCaptcha.md)
- [References](../providerResearch/selfManagedCompute.md)

## Platform notes

Captured API notes for each platform live under [platforms](../platforms); agent-facing guides under [guides](../guides).
