# Every file the proposals name

14 November 2026.

Status: reference, generated. A script read the five proposal documents, collected every repo path they name, and checked each against `main` at 4f38eabb. It lists what the documents name; it does not prove the list is complete.

191 paths: 136 files that exist, 33 folders that exist, 5 that don't exist yet, 17 patterns.

**Columns**
- **State:** `file` or `folder` exists on `main`; `new` does not exist yet, so the slice creates it; `pattern` stands for several files.
- **Slices:** the slices of [platformNeutralSurfaces.md](platformNeutralSurfaces.md) that name it.
- **Named in:** `plan` is platformNeutralSurfaces, `schema` is capabilitySchema, `parity` is schemaParityAudit, `context` is contextInjectionAudit, `inApp` is inAppVerificationAndGenerativeUI.

## Commands and the CLI runner

| Path | State | Slices | Named in |
|---|---|---|---|
| `src/cli/**/index.ts` | pattern | 11 | plan, parity |
| `src/cli/adsPower/` | folder | 12 | plan |
| `src/cli/adsPower/index.ts` | file |  | parity |
| `src/cli/auth/` | folder | 12 | plan |
| `src/cli/auth/index.ts` | file |  | parity |
| `src/cli/browser/index.ts` | file | 20 | plan, inApp |
| `src/cli/campaign/` | folder | 12 | plan |
| `src/cli/campaign/index.ts` | file |  | parity |
| `src/cli/capture/` | folder | 12 | plan |
| `src/cli/capture/index.ts` | file |  | parity |
| `src/cli/clone/index.ts` | file |  | parity |
| `src/cli/console/index.ts` | file |  | parity |
| `src/cli/discord/index.ts` | file |  | parity |
| `src/cli/errors/` | folder | 12 | plan |
| `src/cli/errors/index.ts` | file |  | parity |
| `src/cli/flow/` | folder | 12 | plan |
| `src/cli/flow/index.ts` | file |  | parity |
| `src/cli/inspect/index.ts` | file | 1 | plan, parity |
| `src/cli/instagram/index.ts` | file | 14 | plan, parity |
| `src/cli/join/` | folder | 12 | plan |
| `src/cli/join/**` | pattern |  | parity |
| `src/cli/kb/index.ts` | file |  | context |
| `src/cli/launch/helpers/setup.ts` | file | 19 | plan, context |
| `src/cli/launch/helpers/start.ts` | file | 19 | plan |
| `src/cli/launch/index.ts` | file | 19 | plan, context |
| `src/cli/lifecycle/` | folder | 12 | plan |
| `src/cli/lifecycle/index.ts` | file |  | parity |
| `src/cli/linkedin/index.ts` | file |  | parity |
| `src/cli/listing/index.ts` | file |  | parity |
| `src/cli/live/` | folder | 12 | plan |
| `src/cli/live/index.ts` | file |  | parity |
| `src/cli/localAccount/` | folder | 12 | plan |
| `src/cli/localAccount/index.ts` | file |  | parity |
| `src/cli/new/index.ts` | file |  | parity |
| `src/cli/poll/` | folder | 12 | plan |
| `src/cli/poll/index.ts` | file |  | parity |
| `src/cli/preflight/` | folder | 12 | plan |
| `src/cli/preflight/index.ts` | file |  | parity |
| `src/cli/profile/` | folder | 12 | plan |
| `src/cli/profile/index.ts` | file |  | parity |
| `src/cli/proxy/` | folder | 12 | plan |
| `src/cli/proxy/index.ts` | file |  | parity |
| `src/cli/react/index.ts` | file |  | schema, parity |
| `src/cli/reddit/index.ts` | file | 14 | plan, parity |
| `src/cli/runner/client.ts` | file |  | parity |
| `src/cli/runner/commandInput.test.ts` | file | 11 | plan, parity |
| `src/cli/runner/helpers/commandInput.ts` | file | 11 | plan, parity |
| `src/cli/runner/helpers/parseArgs.ts` | file | 11 | plan, parity |
| `src/cli/runner/helpers/platforms.ts` | file |  | plan |
| `src/cli/runner/helpers/refuse.ts` | file | 13 | plan, parity |
| `src/cli/runner/types.ts` | file | 11, 13 | plan, parity |
| `src/cli/runs/index.ts` | file |  | parity |
| `src/cli/runtime/index.ts` | file | 13, 17 | plan, parity, context |
| `src/cli/sessions/index.ts` | file | 13 | plan, parity |
| `src/cli/slack/index.ts` | file | 14 | plan, parity |
| `src/cli/storage/index.ts` | file |  | parity |
| `src/cli/twitter/helpers/dms.ts` | file |  | parity |
| `src/cli/twitter/helpers/queue.ts` | file |  | parity |
| `src/cli/twitter/helpers/send.ts` | file | 14 | plan, parity |
| `src/cli/voiceNote/index.ts` | file |  | schema, parity |
| `src/cli/warmup/` | folder | 12 | plan |
| `src/cli/warmup/**` | pattern |  | parity |

## The MCP server, catalog and apps

| Path | State | Slices | Named in |
|---|---|---|---|
| `src/mcp/apps/browserView/client.ts` | file | 20, 22 | plan, parity, inApp |
| `src/mcp/apps/browserView/connect.ts` | new |  | inApp |
| `src/mcp/apps/browserView/types.ts` | file |  | inApp |
| `src/mcp/apps/report/client.ts` | file | 21, 22 | plan, parity, inApp |
| `src/mcp/apps/report/view/run.ts` | file | 21 | plan, inApp |
| `src/mcp/catalog/helpers/entries.ts` | file | 12, 15 | plan, parity |
| `src/mcp/catalog/helpers/search.ts` | file | 15 | plan, parity |
| `src/mcp/catalog/index.ts` | file |  | parity |
| `src/mcp/jobs/client.ts` | file | 4 | plan |
| `src/mcp/server/helpers/activePlay.ts` | file | 14, 17 | plan, parity, context |
| `src/mcp/server/helpers/agentRules.ts` | file | 18 | plan, context |
| `src/mcp/server/helpers/guardCall.ts` | file | 14 | plan |
| `src/mcp/server/helpers/guideAnswer.ts` | file | 16 | plan, context |
| `src/mcp/server/helpers/guides.ts` | file | 18 | plan, parity, context |
| `src/mcp/server/helpers/toolAliases.ts` | file |  | parity |
| `src/mcp/server/helpers/toolAnnotations.ts` | file |  | plan |
| `src/mcp/server/helpers/toolsFromCommands.ts` | file | 11, 18, 22 | plan, parity, context |
| `src/mcp/server/helpers/toolsFromFlows.ts` | file | 12, 18 | plan, parity, context |
| `src/mcp/server/index.ts` | file | 13, 20, 22 | plan, parity, context, inApp |
| `src/mcp/server/types.ts` | file | 13, 14 | plan, schema, parity |

## Shared platform code

| Path | State | Slices | Named in |
|---|---|---|---|
| `src/browser/` | folder | 5 | plan |
| `src/browser/runStore/client.ts` | file | 1 | plan |
| `src/browser/runStore/helpers/storageVerdict.ts` | file | 18 | plan, context |
| `src/errors/catalog/types.ts` | file | 13 | plan, parity |
| `src/marketplace/` | folder | 5 | plan |
| `src/marketplace/account/helpers/accountLabel.ts` | file | 1 | plan |
| `src/marketplace/socialAccount/client.ts` | file | 15 | plan, parity |
| `src/platformKit/` | folder | 5 | plan |
| `src/platformKit/<domain>` | pattern |  | plan |
| `src/platformKit/capability/` | new |  | schema |
| `src/platformKit/gates/` | new | 14 | plan, parity |
| `src/platformKit/session/client.ts` | file | 15 | plan, parity |
| `src/platformKit/sessionCheck/` | folder | 4 | plan |
| `src/platformKit/sessionCheck/client.ts` | file | 13, 20 | plan, parity, inApp |
| `src/platformKit/signIn/` | new | 3 | plan |
| `src/platformKit/watcher/` | new | 10 | plan |
| `src/surface/catalog/index.ts` | file | 11 | plan, parity |

## Console and runtime

| Path | State | Slices | Named in |
|---|---|---|---|
| `src/console/` | folder |  | inApp |
| `src/console/accountCheck/machine.ts` | file |  | plan, parity |
| `src/console/browserCheck/client.ts` | file | 14 | plan, parity |
| `src/console/operations/client.ts` | file |  | parity |
| `src/console/operations/types.ts` | file | 20, 21 | plan, inApp |
| `src/runtime/bridge/client.ts` | file | 20, 21 | plan, inApp |

## Hooks, router and context

| Path | State | Slices | Named in |
|---|---|---|---|
| `src/agentHooks/answers/client.ts` | file | 18 | plan, context |
| `src/agentHooks/chatNames/index.ts` | file |  | context |
| `src/agentHooks/pageState/index.ts` | file | 18 | plan, context |
| `src/agentHooks/registry/index.ts` | file | 19 | plan, context |
| `src/agentHooks/registry/types.ts` | file | 19 | plan, context |
| `src/contextLayer/hook/client.ts` | file | 16 | plan, context |
| `src/contextLayer/session/client.ts` | file | 17 | plan, context |
| `src/contextLayer/session/types.ts` | file |  | context |
| `src/inbox/senders/types.ts` | file | 21 | plan, inApp |
| `src/inbox/watch/client.ts` | file | 10 | plan, schema, parity |
| `src/useCases/review/client.ts` | file |  | context |
| `src/useCases/router/client.ts` | file | 16 | plan, context |
| `src/useCases/router/fixtures/` | folder |  | context |
| `src/useCases/router/types.ts` | file | 16 | plan |

## Storage

| Path | State | Slices | Named in |
|---|---|---|---|
| `src/storage/platform/client.ts` | file | 21 | plan, inApp |
| `src/storage/platform/helpers/extenders.ts` | file | 21 | plan, inApp |
| `src/storage/platform/types.ts` | file | 21 | plan, inApp |
| `src/storage/schema/helpers/migrations.ts` | file | 21 | plan, inApp |
| `src/storage/schema/helpers/platformTables.ts` | file | 21 | plan, inApp |
| `src/storage/schema/schema.test.ts` | file |  | inApp |

## Platforms

| Path | State | Slices | Named in |
|---|---|---|---|
| `src/discord/account/` | folder |  | inApp |
| `src/facebook/` | folder | 5 | plan |
| `src/linkedin/` | folder |  | inApp |
| `src/slack/` | folder |  | inApp |
| `src/twitter/queue/run/client.ts` | file |  | schema |

## Other source

| Path | State | Slices | Named in |
|---|---|---|---|
| `src/<platform>/<area>/<domain>` | pattern |  | plan |
| `src/knowledge/base/helpers/collect.ts` | file | 1 | plan |

## Python: engines, browser and the hosted control service

| Path | State | Slices | Named in |
|---|---|---|---|
| `python/*Api/engine.py` | pattern | 13 | plan, parity |
| `python/browser/browserViewer.py` | file | 20 | plan, inApp |
| `python/controlService/dispatcher.py` | file | 14, 20 | plan, inApp |
| `python/controlService/mcpRoutes.py` | file | 14, 18, 22 | plan, parity, context |
| `python/controlService/settings.py` | file | 22 | plan |
| `python/controlService/tools.py` | file | 14, 20 | plan, schema, parity, context, inApp |
| `python/twitterApi/engine.py` | file |  | parity, inApp |

## Scripts and checks

| Path | State | Slices | Named in |
|---|---|---|---|
| `lefthook.yml` | file |  | context |
| `package.json` | file | 22 | plan, context |
| `scripts/checks/` | folder |  | context |
| `scripts/checks/checkAgentHooks.ts` | file |  | context |
| `scripts/checks/checkPlatforms.ts` | file | 1 | plan |
| `scripts/checks/checkUseCases.ts` | file |  | context |
| `scripts/contextLayer/service.ts` | file | 16 | plan, context |
| `scripts/docs/buildDocs.ts` | file | 18 | plan, parity, context |
| `scripts/docs/syncSiteSkills.mjs` | file |  | context |
| `scripts/hooks/antigravity.ts` | file | 19 | plan, context |
| `scripts/hooks/inbox.ts` | file | 10 | plan |

## Docs, use cases and skills

| Path | State | Slices | Named in |
|---|---|---|---|
| `.claude/` | folder |  | context |
| `.claude/settings.json` | file |  | context |
| `.claude/skills` | folder |  | schema |
| `.claude/skills/log-*` | pattern |  | context |
| `AGENTS.md` | file |  | plan |
| `docs/guides` | folder |  | context |
| `docs/guides/*` | pattern |  | context |
| `docs/guides/<topic>.md` | pattern |  | context |
| `docs/harnesses/*` | pattern |  | context |
| `docs/harnesses/*.md` | pattern | 9, 19 | plan, context |
| `docs/harnesses/hermes.md` | file |  | context |
| `docs/harnesses/README.md` | file |  | context |
| `docs/lifecycle.md` | file |  | parity |
| `docs/proposals/listeningKitInstanceContracts.md` | file |  | inApp |
| `docs/proposals/listeningKitNativeData.md` | file |  | inApp |
| `docs/reference.md` | file | 11 | plan, parity |
| `docs/storageAgainstTheBook.md` | file |  | inApp |
| `docs/storageReadPath.md` | file |  | inApp |
| `docs/unifyStorage.md` | file |  | inApp |
| `docs/useCases` | folder |  | context |
| `docs/useCases/**` | pattern | 16, 18 | plan, context |
| `docs/useCases/inbox/signIn.md` | file | 2 | plan |
| `skills/` | folder |  | context |
| `skills/**` | pattern | 18 | plan, context |
| `skills/flow/SKILL.md` | file |  | context |
| `skills/host/SKILL.md` | file |  | context |
| `skills/humanMouse/SKILL.md` | file |  | context |
| `skills/inspect/SKILL.md` | file |  | context |
| `skills/profileSetup/SKILL.md` | file |  | context |
| `skills/warmup/SKILL.md` | file |  | context |

## Harness files and the Hermes plugin

| Path | State | Slices | Named in |
|---|---|---|---|
| `.agents/hooks.json` | file | 19 | plan, context |
| `.codex/hooks.json` | file |  | context |
| `.opencode/plugins/logHooks/**` | pattern | 19 | plan, context |
| `hermesPlugin/` | folder | 9 | plan, context |
| `hermesPlugin/**` | pattern | 19 | plan, context |
| `hermesPlugin/skills` | folder |  | context |
| `hermesPlugin/skills/*` | pattern |  | parity, context |
| `hermesPlugin/skills/dm-inbox/SKILL.md` | file |  | parity |
| `hermesPlugin/skills/outreach/SKILL.md` | file |  | parity |

## The site

| Path | State | Slices | Named in |
|---|---|---|---|
| `site/apps/web/src/landing/**` | pattern |  | parity |
| `site/apps/web/src/landing/mcp/mcpContent.ts` | file |  | parity |
