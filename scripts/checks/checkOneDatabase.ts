import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

type Kind = 'repo' | 'capture' | 'dataset' | 'index' | 'media' | 'log' | 'session' | 'fallback'

const WHY: Record<Kind, string> = {
  repo: 'writes files inside the repo (docs, skills, scaffolds)',
  capture: 'a raw browser or engine capture, or its per-run artifacts, kept as files on purpose (rules 19, 22) and pruned once analysed (rule 66)',
  dataset: 'a dataset or export that other tools read as a file',
  index: 'a search or model index in a format its library owns',
  media: 'a media file (audio, image, video)',
  log: 'a log people watch as it is written (the live log, rule 26), a process log, or the private day log (~/.logCli/devlog)',
  session: 'a private per-run or per-account session file (cookies, specs, OAuth), never shared state',
  fallback: 'writes its old file only when log.db or its table is not there yet; the store itself lives in log.db',
}

const ALLOWED: Record<string, { writes: number; kind: Kind }> = {
  'src/config/userEnv/index.ts': { writes: 1, kind: 'session' },
  'src/directApi/governor/client.ts': { writes: 1, kind: 'session' },
  'src/inbox/judgeModel/client.ts': { writes: 1, kind: 'session' },
  'scripts/checks/checkAgentHooks.ts': { writes: 1, kind: 'repo' },
  'scripts/checks/checkAgnostic.ts': { writes: 1, kind: 'repo' },
  'scripts/checks/checkAgentWording.ts': { writes: 1, kind: 'repo' },
  'scripts/checks/checkDocLinks.ts': { writes: 1, kind: 'repo' },
  'scripts/checks/checkBrowserParity.ts': { writes: 1, kind: 'repo' },
  'scripts/checks/checkNoComments.ts': { writes: 1, kind: 'repo' },
  'scripts/checks/checkUseCases.ts': { writes: 1, kind: 'repo' },
  'scripts/checks/mcpApps/render.ts': { writes: 1, kind: 'media' },
  'scripts/commitLog/commitLog.mjs': { writes: 1, kind: 'log' },
  'scripts/datasets/buildInterestEffect.ts': { writes: 1, kind: 'dataset' },
  'scripts/datasets/buildReelViewers.ts': { writes: 1, kind: 'dataset' },
  'scripts/directApi/buildFlowMap.ts': { writes: 3, kind: 'repo' },
  'scripts/directApi/liveRead.ts': { writes: 2, kind: 'capture' },
  'scripts/docs/buildDocs.ts': { writes: 1, kind: 'repo' },
  'scripts/docs/releasesTable.ts': { writes: 2, kind: 'repo' },
  'scripts/docs/syncSiteDocs.mjs': { writes: 4, kind: 'repo' },
  'scripts/docs/syncSiteSkills.mjs': { writes: 3, kind: 'repo' },
  'scripts/privacy/redactDocs.mjs': { writes: 1, kind: 'repo' },
  'scripts/release/nightlyVersion.ts': { writes: 1, kind: 'repo' },
  'scripts/fbk/tryAccount.ts': { writes: 1, kind: 'capture' },
  'scripts/media/personaPictures.ts': { writes: 1, kind: 'dataset' },
  'scripts/useCases/benchRouter.ts': { writes: 1, kind: 'dataset' },
  'scripts/useCases/evalSkillRouter.ts': { writes: 1, kind: 'dataset' },
  'src/agentHooks/opencode/client.ts': { writes: 2, kind: 'repo' },
  'src/agentHooks/hermes/client.ts': { writes: 2, kind: 'repo' },
  'src/agentHooks/harness/client.ts': { writes: 1, kind: 'session' },
  'src/auth/session/client.ts': { writes: 2, kind: 'session' },
  'src/browser/flow/client.ts': { writes: 2, kind: 'capture' },
  'src/browser/inspect/client.ts': { writes: 5, kind: 'capture' },
  'src/browser/run/client.ts': { writes: 5, kind: 'capture' },
  'src/browser/runStore/client.ts': { writes: 7, kind: 'capture' },
  'src/cli/capture/index.ts': { writes: 1, kind: 'capture' },
  'src/cli/launch/index.ts': { writes: 1, kind: 'session' },
  'src/cli/lifecycle/index.ts': { writes: 1, kind: 'repo' },
  'src/cli/publish/index.ts': { writes: 1, kind: 'capture' },
  'src/cli/twitter/helpers/send.ts': { writes: 1, kind: 'media' },
  'src/cli/warmup/helpers/feedRun.ts': { writes: 2, kind: 'capture' },
  'src/cli/warmup/helpers/personaRun.ts': { writes: 4, kind: 'capture' },
  'src/cli/warmup/helpers/platformActivity.ts': { writes: 1, kind: 'capture' },
  'src/directApi/engine/client.ts': { writes: 3, kind: 'session' },
  'src/extensions/memeTaste/helpers/call.ts': { writes: 1, kind: 'dataset' },
  'src/extensions/voiceClone/helpers/voiceNote.ts': { writes: 1, kind: 'media' },
  'src/facebook/group/members/client.ts': { writes: 2, kind: 'capture' },
  'src/facebook/marketplace/check/client.ts': { writes: 1, kind: 'capture' },
  'src/inbox/watch/client.ts': { writes: 2, kind: 'log' },
  'src/facebook/marketplace/host/helpers/progress.ts': { writes: 2, kind: 'capture' },
  'src/mcp/oauth/client.ts': { writes: 1, kind: 'session' },
  'src/media/persona/client.ts': { writes: 3, kind: 'dataset' },
  'src/media/photo/client.ts': { writes: 1, kind: 'dataset' },
  'src/observability/liveLog/index.ts': { writes: 1, kind: 'log' },
  'src/platformKit/session/client.ts': { writes: 4, kind: 'session' },
  'src/release/apply/client.ts': { writes: 1, kind: 'session' },
  'src/release/check/client.ts': { writes: 1, kind: 'session' },
  'src/rea/capture/client.ts': { writes: 8, kind: 'capture' },
  'src/runtime/bridge/client.ts': { writes: 1, kind: 'session' },
  'src/rea/facebookClient/client.ts': { writes: 6, kind: 'capture' },
  'src/rea/inspectMap/client.ts': { writes: 6, kind: 'capture' },
  'src/rea/platformClient/client.ts': { writes: 5, kind: 'capture' },
  'src/scaffold/platform/client.ts': { writes: 2, kind: 'repo' },
  'src/scaffold/platform/helpers/templates.ts': { writes: 2, kind: 'repo' },
  'src/search/conversations/client.ts': { writes: 4, kind: 'index' },
  'src/specs/anchors/client.ts': { writes: 1, kind: 'repo' },
  'src/subq/stepReading/client.ts': { writes: 4, kind: 'capture' },
  'src/subq/stepReading/helpers/stepExchanges.ts': { writes: 1, kind: 'capture' },
  'src/twenty/graphql/helpers/localAccounts.ts': { writes: 1, kind: 'session' },
  'src/twitter/account/session/client.ts': { writes: 6, kind: 'session' },
  'src/linkedin/account/browser/client.ts': { writes: 1, kind: 'session' },
  'src/cli/linkedin/index.ts': { writes: 1, kind: 'capture' },
  'src/voice/pairs/client.ts': { writes: 3, kind: 'index' },
  'src/voice/phrases/client.ts': { writes: 1, kind: 'index' },
  'src/warmup/viewer/client.ts': { writes: 1, kind: 'dataset' },
  'src/models/store/helpers/effects.ts': { writes: 2, kind: 'index' },
  'scripts/twenty/emitTwentyClient.mjs': { writes: 1, kind: 'repo' },
  'scripts/twenty/lightenTwentyClient.mjs': { writes: 1, kind: 'repo' },
  'python/browser/browserViewer.py': { writes: 3, kind: 'capture' },
  'python/browser/harRecorder.py': { writes: 1, kind: 'capture' },
  'python/checks/comments.py': { writes: 1, kind: 'repo' },
  'python/checks/slackTransport.py': { writes: 1, kind: 'repo' },
  'python/checks/twikitTransport.py': { writes: 2, kind: 'repo' },
  'python/device/deviceProfile.py': { writes: 1, kind: 'capture' },
  'python/discordApi/browserIdentity.py': { writes: 2, kind: 'session' },
  'python/discordApi/browserRest.py': { writes: 1, kind: 'media' },
  'python/discordApi/engine.py': { writes: 1, kind: 'media' },
  'python/human/recordMouse.py': { writes: 2, kind: 'dataset' },
  'python/instagramApi/engine.py': { writes: 1, kind: 'media' },
  'python/instagramApi/host.py': { writes: 2, kind: 'session' },
  'python/judge/server.py': { writes: 1, kind: 'session' },
  'python/linkedinApi/share.py': { writes: 1, kind: 'capture' },
  'python/platformKit/host.py': { writes: 1, kind: 'session' },
  'python/session/inspectSession.py': { writes: 12, kind: 'capture' },
  'python/session/profileSession.py': { writes: 1, kind: 'capture' },
  'python/session/publishSession.py': { writes: 2, kind: 'capture' },
  'python/slackApi/engine.py': { writes: 1, kind: 'media' },
  'python/secretStore/__init__.py': { writes: 1, kind: 'session' },
  'python/twitterApi/engine.py': { writes: 8, kind: 'capture' },
  'python/twitterApi/host.py': { writes: 1, kind: 'session' },
  'python/logDb/engineStore.py': { writes: 1, kind: 'fallback' },
  'python/twitterApi/inboxSync.py': { writes: 1, kind: 'fallback' },
  'python/twitterApi/notifications.py': { writes: 1, kind: 'fallback' },
  'hermesPlugin/__init__.py': { writes: 1, kind: 'fallback' },
  'scripts/browserView/hostBench.py': { writes: 3, kind: 'capture' },
  'scripts/browserView/openBench.py': { writes: 1, kind: 'capture' },
}

export const TS_WRITE = /appendFileSync\(|writeFileSync\(|Bun\.write\(|\bwriteFile\(|createWriteStream\(|copyFileSync\(|cpSync\(/g
export const PY_WRITE = /\.write_text\(|\.write_bytes\(|json\.dump\(|\bopen\([^)\n]*["'](?:w|a|x)[bt+]?["']|os\.fdopen\(|shutil\.copy\w*\(/g

function writesIn(file: string, text: string): number {
  return (text.match(file.endsWith('.py') ? PY_WRITE : TS_WRITE) ?? []).length
}

function checkedFile(file: string): boolean {
  if (/\.py$/.test(file)) return !/(^|\/)test_[^/]*\.py$|Test\.py$|^python\/fixtures\//.test(file)
  return /\.(ts|mjs)$/.test(file) && !file.endsWith('.test.ts') && !file.endsWith('.d.ts')
}

const files = spawnSync('git', ['ls-files', 'src', 'scripts', 'bin', 'python', 'hermesPlugin'], { windowsHide: true, encoding: 'utf8' }).stdout.split(/\r?\n/).filter((f) => f && checkedFile(f))
const problems: string[] = []
const looser: string[] = []
for (const file of files) {
  const writes = writesIn(file, readFileSync(file, 'utf8'))
  const allowed = ALLOWED[file]
  if (!writes) {
    if (allowed) looser.push(`${file} no longer writes to disk; drop it from ALLOWED`)
    continue
  }
  if (!allowed) problems.push(`${file} writes to disk ${writes} time(s) but isn't on the list: put what it stores in log.db (src/inbox/store, src/storage), or add it to ALLOWED in scripts/checks/checkOneDatabase.ts with a kind from WHY if it truly is one`)
  else if (writes > allowed.writes) problems.push(`${file} writes to disk ${writes} time(s), more than the ${allowed.writes} listed (${allowed.kind}): a new loose store; put it in log.db`)
  else if (writes < allowed.writes) looser.push(`${file}: ${writes} write(s) now, ${allowed.writes} listed; lower it`)
}
for (const file of Object.keys(ALLOWED)) if (!files.includes(file)) looser.push(`${file} is listed but gone; drop it from ALLOWED`)
if (problems.length) {
  console.error(`oneDatabase: ${problems.length} loose store(s) outside log.db (issue #96)`)
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(`oneDatabase: no new loose store in TypeScript or Python; every shared state is in log.db, and the ${Object.keys(ALLOWED).length} listed writers keep only repo files, captures, datasets, indexes, media, logs, private session files and the old-file fallback for a machine whose log.db is not made yet`)
for (const l of looser) console.log(`  note: ${l}`)
