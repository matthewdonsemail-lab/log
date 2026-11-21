import { join } from 'node:path'
import { logHome } from '../../config/logHome/index'
import { fileUrl, megabytes, pipSpecOf, shortRevision } from '../manifest/index'
import type { LocalModel, ModelFile } from '../manifest/index'
import { JUDGE_DIR_NAME } from './types'
import type { CheckOptions, FetchAction, ModelCheck, ModelFetch, ModelsDeps, ModelStatus } from './types'

type Env = Record<string, string | undefined>

export function modelsHome(env: Env = process.env): string {
  return join(logHome(env), 'models')
}

export function hfCacheDir(env: Env = process.env): string {
  return join(modelsHome(env), 'hf')
}

export function judgeModelDir(env: Env = process.env): string {
  return env.LOG_JUDGE_MODEL?.trim() || join(modelsHome(env), JUDGE_DIR_NAME)
}

export function placeOf(model: LocalModel, env: Env = process.env): string | null {
  if (model.loader === 'huggingfaceHub') return model.key === 'judge' ? judgeModelDir(env) : join(hfCacheDir(env), model.id, model.revision)
  if (model.loader === 'transformersJs') return join(hfCacheDir(env), model.id, model.revision)
  return null
}

function hashKind(file: ModelFile): 'sha256' | 'gitSha1' | null {
  return file.sha256 ? 'sha256' : file.gitSha1 ? 'gitSha1' : null
}

async function fileProblem(path: string, file: ModelFile, deps: ModelsDeps, verify: boolean): Promise<'missing' | 'mismatched' | null> {
  const size = deps.size(path)
  if (size === null) return 'missing'
  if (size !== file.size) return 'mismatched'
  const kind = hashKind(file)
  if (!verify || !kind) return null
  return (await deps.hash(path, kind)) === (file.sha256 ?? file.gitSha1) ? null : 'mismatched'
}

function base(model: LocalModel, place: string | null): Omit<ModelCheck, 'status' | 'ready' | 'installed' | 'problems'> {
  return { key: model.key, id: model.id, revision: model.revision, source: model.source, process: model.process, bytes: model.bytes, place }
}

export async function checkModel(model: LocalModel, deps: ModelsDeps, options: CheckOptions = {}): Promise<ModelCheck> {
  const place = deps.place(model)
  if (model.source === 'pip') {
    const installed = deps.pipVersion(model.id)
    const status: ModelStatus = installed === null ? 'notInstalled' : installed === model.revision ? 'ready' : 'wrongVersion'
    return { ...base(model, place), status, ready: status === 'ready', installed, problems: status === 'ready' ? [] : [installed === null ? `${model.id} is not installed in LOG_PYTHON` : `${model.id} ${installed} is installed, not ${model.revision}`] }
  }
  const problems: string[] = []
  let missing = 0
  for (const file of model.files) {
    const problem = place ? await fileProblem(join(place, file.path), file, deps, options.verify === true) : 'missing'
    if (problem === 'missing') missing++
    if (problem) problems.push(`${file.path} ${problem}`)
  }
  const status: ModelStatus = !problems.length ? 'ready' : missing === model.files.length ? 'missing' : 'mismatched'
  const older = status === 'ready' ? undefined : deps.legacy(model).find((dir) => model.files.every((file) => deps.size(join(dir, file.path)) === file.size))
  if (older) problems.unshift(`a copy sits at ${older}; --fetch moves it here after checking its hashes, no download`)
  return { ...base(model, place), status, ready: status === 'ready', installed: status === 'ready' ? model.revision : null, problems }
}

export async function checkModels(models: readonly LocalModel[], deps: ModelsDeps, options: CheckOptions = {}): Promise<ModelCheck[]> {
  const out: ModelCheck[] = []
  for (const model of models) out.push(await checkModel(model, deps, options))
  return out
}

async function fetchFile(model: LocalModel, place: string, file: ModelFile, deps: ModelsDeps): Promise<FetchAction> {
  const target = join(place, file.path)
  if (!(await fileProblem(target, file, deps, true))) return 'already'
  for (const dir of deps.legacy(model)) {
    const candidate = join(dir, file.path)
    if (candidate === target || (await fileProblem(candidate, file, deps, true))) continue
    if (deps.move(candidate, target) && !(await fileProblem(target, file, deps, true))) return 'adopted'
  }
  deps.log(`downloading ${model.id}@${shortRevision(model.revision)} ${file.path} (${megabytes(file.size)})`)
  const got = await deps.download(fileUrl(model, file.path), target)
  if (!got.ok) throw new Error(`${file.path}: ${got.detail ?? 'download failed'}`)
  if (await fileProblem(target, file, deps, true)) {
    deps.remove(target)
    throw new Error(`${file.path}: the download does not match the pinned revision's hash`)
  }
  return 'downloaded'
}

export async function fetchModel(model: LocalModel, deps: ModelsDeps): Promise<ModelFetch> {
  if (model.source === 'pip') {
    const before = await checkModel(model, deps)
    if (before.ready) return { ...before, action: 'already', detail: `${model.id} ${model.revision} installed` }
    const installed = deps.pipInstall(pipSpecOf(model))
    const after = await checkModel(model, deps)
    return { ...after, action: installed.ok && after.ready ? 'installed' : 'failed', detail: installed.ok ? (after.ready ? `installed ${pipSpecOf(model)}` : after.problems.join('; ')) : `pip: ${installed.detail ?? 'failed'}` }
  }
  const place = deps.place(model)
  const actions: FetchAction[] = []
  let failure = ''
  if (!place) failure = 'no place to keep it'
  for (const file of place ? model.files : []) {
    try {
      actions.push(await fetchFile(model, place!, file, deps))
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error)
      break
    }
  }
  const after = await checkModel(model, deps)
  const action: FetchAction = failure || !after.ready ? 'failed' : actions.includes('downloaded') ? 'downloaded' : actions.includes('adopted') ? 'adopted' : 'already'
  const counts = (['downloaded', 'adopted'] as const).map((a) => [a, actions.filter((x) => x === a).length] as const).filter(([, n]) => n).map(([a, n]) => `${n} ${a}`)
  return { ...after, action, detail: failure || (counts.length ? `${counts.join(', ')}, verified` : 'every file verified') }
}

export async function fetchModels(models: readonly LocalModel[], deps: ModelsDeps): Promise<ModelFetch[]> {
  const out: ModelFetch[] = []
  for (const model of models) out.push(await fetchModel(model, deps))
  return out
}

const STATUS_TEXT: Record<ModelStatus, string> = {
  ready: 'present, matches',
  missing: 'not fetched yet',
  mismatched: 'present, does not match',
  notInstalled: 'not installed',
  wrongVersion: 'another version installed',
}

export function modelLine(check: ModelCheck | ModelFetch): string {
  const said = 'action' in check ? `${check.action}${check.detail ? ` (${check.detail})` : ''}` : `${STATUS_TEXT[check.status]}${check.problems.length ? ` (${check.problems.slice(0, 3).join('; ')}${check.problems.length > 3 ? `; ${check.problems.length - 3} more` : ''})` : ''}`
  return `${check.key}: ${check.id}@${shortRevision(check.revision)}, ${megabytes(check.bytes)}, ${check.process}: ${said}`
}

export function modelsText(checks: readonly (ModelCheck | ModelFetch)[]): string {
  return checks.map(modelLine).join('\n')
}

export function modelsSummary(checks: readonly (ModelCheck | ModelFetch)[]): string {
  if (!checks.length) return 'no local models'
  const bad = checks.filter((c) => !c.ready)
  return bad.length ? `${checks.length - bad.length}/${checks.length} on the pinned revision; not yet: ${bad.map((c) => c.key).join(', ')}` : `all ${checks.length} on the pinned revision`
}

export async function readyPinned(id: string, deps: ModelsDeps, models: readonly LocalModel[]): Promise<ModelCheck | ModelFetch | null> {
  const model = models.find((m) => m.id === id && m.source === 'huggingFace')
  if (!model) return null
  const check = await checkModel(model, deps)
  if (check.ready) return check
  try {
    return await fetchModel(model, deps)
  } catch {
    return check
  }
}
