import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

type Kind = 'repo' | 'capture' | 'dataset' | 'index' | 'media' | 'log' | 'session'

const WHY: Record<Kind, string> = {
  repo: 'writes files inside the repo (docs, skills, scaffolds)',
  capture: 'a raw browser or engine capture, or its per-run artifacts, kept as files on purpose (rules 19, 22) and pruned once analysed (rule 66)',
  dataset: 'a dataset or export that other tools read as a file',
  index: 'a search or model index in a format its library owns',
  media: 'a media file (audio, image, video)',
  log: 'a log people watch as it is written (the live log, rule 26), a process log, or the private day log (~/.logCli/devlog)',
  session: 'a private per-run or per-account session file (cookies, specs, OAuth), never shared state',
}

const ALLOWED: Record<string, { writes: number; kind: Kind }> = {
  'src/directApi/governor/client.ts': { writes: 1, kind: 'session' },
  'scripts/checks/checkAgentHooks.ts': { writes: 1, kind: 'repo' },
  'scripts/checks/checkBrowserParity.ts': { writes: 1, kind: 'repo' },
  'scripts/checks/checkNoComments.ts': { writes: 1, kind: 'repo' },
  'scripts/checks/checkUseCases.ts': { writes: 1, kind: 'repo' },
  'scripts/commitLog/commitLog.mjs': { writes: 4, kind: 'log' },
  'scripts/datasets/buildInterestEffect.ts': { writes: 1, kind: 'dataset' },
  'scripts/datasets/buildReelViewers.ts': { writes: 1, kind: 'dataset' },
  'scripts/directApi/buildFlowMap.ts': { writes: 3, kind: 'repo' },
  'scripts/directApi/liveRead.ts': { writes: 2, kind: 'capture' },
  'scripts/docs/buildDocs.ts': { writes: 1, kind: 'repo' },
  'scripts/docs/syncSiteDocs.mjs': { writes: 4, kind: 'repo' },
  'scripts/docs/syncSiteSkills.mjs': { writes: 2, kind: 'repo' },
  'scripts/fbk/tryAccount.ts': { writes: 1, kind: 'capture' },
  'scripts/media/personaPictures.ts': { writes: 1, kind: 'dataset' },
  'scripts/useCases/benchRouter.ts': { writes: 1, kind: 'dataset' },
  'src/agentHooks/opencode/client.ts': { writes: 1, kind: 'repo' },
  'src/auth/session/client.ts': { writes: 2, kind: 'session' },
  'src/browser/flow/client.ts': { writes: 2, kind: 'capture' },
  'src/browser/inspect/client.ts': { writes: 5, kind: 'capture' },
  'src/browser/run/client.ts': { writes: 4, kind: 'capture' },
  'src/browser/runStore/client.ts': { writes: 3, kind: 'capture' },
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
  'src/inbox/watch/client.ts': { writes: 3, kind: 'log' },
  'src/marketplace/host/helpers/progress.ts': { writes: 2, kind: 'capture' },
  'src/mcp/oauth/client.ts': { writes: 1, kind: 'session' },
  'src/media/persona/client.ts': { writes: 3, kind: 'dataset' },
  'src/media/photo/client.ts': { writes: 1, kind: 'dataset' },
  'src/observability/liveLog/index.ts': { writes: 1, kind: 'log' },
  'src/platformKit/session/client.ts': { writes: 6, kind: 'session' },
  'src/rea/capture/client.ts': { writes: 7, kind: 'capture' },
  'src/runtime/bridge/client.ts': { writes: 1, kind: 'session' },
  'src/rea/facebookClient/client.ts': { writes: 6, kind: 'capture' },
  'src/rea/inspectMap/client.ts': { writes: 6, kind: 'capture' },
  'src/rea/platformClient/client.ts': { writes: 4, kind: 'capture' },
  'src/scaffold/platform/client.ts': { writes: 2, kind: 'repo' },
  'src/scaffold/platform/helpers/templates.ts': { writes: 2, kind: 'repo' },
  'src/search/conversations/client.ts': { writes: 4, kind: 'index' },
  'src/specs/anchors/client.ts': { writes: 1, kind: 'repo' },
  'src/subq/stepReading/client.ts': { writes: 4, kind: 'capture' },
  'src/subq/stepReading/helpers/stepExchanges.ts': { writes: 1, kind: 'capture' },
  'src/twenty/graphql/helpers/localAccounts.ts': { writes: 1, kind: 'session' },
  'src/twitter/account/session/client.ts': { writes: 6, kind: 'session' },
  'src/voice/pairs/client.ts': { writes: 3, kind: 'index' },
  'src/voice/phrases/client.ts': { writes: 1, kind: 'index' },
  'src/warmup/viewer/client.ts': { writes: 1, kind: 'dataset' },
}

const WRITE = /appendFileSync\(|writeFileSync\(/g

const files = spawnSync('git', ['ls-files', 'src/**/*.ts', 'scripts/**/*.ts', 'scripts/**/*.mjs', 'bin/*.ts'], { windowsHide: true, encoding: 'utf8' }).stdout.split(/\r?\n/).filter((f) => f && !f.endsWith('.test.ts'))
const problems: string[] = []
const looser: string[] = []
for (const file of files) {
  const writes = (readFileSync(file, 'utf8').match(WRITE) ?? []).length
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
console.log(`oneDatabase: no new loose store; every shared state is in log.db, and the ${Object.keys(ALLOWED).length} listed writers keep only repo files, captures, datasets, indexes, media, logs and private session files`)
for (const l of looser) console.log(`  note: ${l}`)
