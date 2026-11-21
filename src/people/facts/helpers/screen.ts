import { spawn } from 'node:child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { modelByKey } from '../../../models/manifest/index'
import { placeOf } from '../../../models/store/index'
import { MARK_MIN, PROMISE_KINDS, PROMISE_MARK_MIN, PRONOUNS_LISTENER, PRONOUNS_SPEAKER, SCREEN_ASK_MS, SCREEN_BATCH, SCREEN_KINDS, SCREEN_MIN_CHARS, SCREEN_MODEL_KEY, SCREEN_START_MS } from '../types'
import type { Candidate, ChatLine, ScreenAnswer, ScreenMark, Screener } from '../types'

export const SCREEN_PATH = fileURLToPath(new URL('../../../../python/facts/screen.py', import.meta.url))

export class ScreenUnavailable extends Error {
  readonly code = 'factScreenUnavailable'
}

export function gliner2Screener(modelDir: string | null = placeOf(modelByKey(SCREEN_MODEL_KEY)), python: string = process.env.LOG_PYTHON || 'python'): Screener {
  let child: ChildProcessWithoutNullStreams | null = null
  let buffer = ''
  const waiting: ((line: string) => void)[] = []
  const nextLine = (ms: number): Promise<string> => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new ScreenUnavailable(`factScreenUnavailable: the fact screen gave no answer in ${Math.round(ms / 1000)} s`)), ms)
    waiting.push((line) => {
      clearTimeout(timer)
      resolve(line)
    })
  })
  const start = async () => {
    if (child) return
    if (!modelDir) throw new ScreenUnavailable('factScreenUnavailable: no place for the fact model; run log models --fetch')
    child = spawn(python, [SCREEN_PATH, modelDir], { windowsHide: true, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => {
      buffer += chunk
      let at = buffer.indexOf('\n')
      while (at >= 0) {
        const line = buffer.slice(0, at).trim()
        buffer = buffer.slice(at + 1)
        if (line.startsWith('{')) waiting.shift()?.(line)
        at = buffer.indexOf('\n')
      }
    })
    child.stderr.on('data', () => undefined)
    child.on('error', () => waiting.shift()?.(JSON.stringify({ ok: false, error: 'the fact screen could not start' })))
    child.on('exit', () => {
      child = null
      while (waiting.length) waiting.shift()?.(JSON.stringify({ ok: false, error: 'the fact screen stopped' }))
    })
    const ready = JSON.parse(await nextLine(SCREEN_START_MS)) as { ok: boolean; error?: string }
    if (!ready.ok) throw new ScreenUnavailable(`factScreenUnavailable: ${ready.error ?? 'the fact model did not load'}; run log models --fetch and check gliner2 is installed in LOG_PYTHON`)
  }
  return {
    model: modelByKey(SCREEN_MODEL_KEY).id,
    async screen(texts) {
      if (!texts.length) return { marks: [], ms: 0 }
      await start()
      const asked = nextLine(SCREEN_ASK_MS)
      child!.stdin.write(`${JSON.stringify({ texts, batchSize: SCREEN_BATCH })}\n`)
      const answer = JSON.parse(await asked) as { ok: boolean; error?: string; marks?: ScreenMark[]; ms?: number }
      if (!answer.ok || !answer.marks) throw new ScreenUnavailable(`factScreenUnavailable: ${answer.error ?? 'no marks'}`)
      return { marks: answer.marks, ms: answer.ms ?? 0 }
    },
    stop() {
      child?.stdin.end()
      child?.kill()
      child = null
    },
  }
}

export function isCandidate(line: Pick<ChatLine, 'text'>, mark: ScreenMark): boolean {
  return line.text.trim().length >= SCREEN_MIN_CHARS && SCREEN_KINDS.includes(mark.kind) && mark.confidence >= (PROMISE_KINDS.has(mark.kind) ? PROMISE_MARK_MIN : MARK_MIN)
}

export async function screenLines(lines: readonly ChatLine[], screener: Screener, before: (line: ChatLine) => ChatLine[]): Promise<{ candidates: Candidate[]; marks: { line: ChatLine; mark: ScreenMark }[]; perMessageMs: number[] }> {
  const asked = lines.filter((l) => l.text.trim().length >= SCREEN_MIN_CHARS)
  const marks: { line: ChatLine; mark: ScreenMark }[] = []
  const perMessageMs: number[] = []
  for (let i = 0; i < asked.length; i += SCREEN_BATCH) {
    const batch = asked.slice(i, i + SCREEN_BATCH)
    const answer: ScreenAnswer = await screener.screen(batch.map((l) => l.text))
    batch.forEach((line, n) => marks.push({ line, mark: answer.marks[n] }))
    perMessageMs.push(...batch.map(() => answer.ms / batch.length))
  }
  const candidates = marks.filter((m) => m.mark && isCandidate(m.line, m.mark)).map((m) => ({ ...m.line, mark: m.mark, before: before(m.line) }))
  return { candidates, marks, perMessageMs }
}

export function endpointsOf(mark: ScreenMark, sides: { speaker: string; listener: string }, known: ReadonlyMap<string, string>): { label: string; head: string; tail: string }[] {
  const resolve = (end: string): string | null => {
    const word = end.trim().toLowerCase().replace(/^@/, '')
    if (PRONOUNS_SPEAKER.has(word)) return sides.speaker
    if (PRONOUNS_LISTENER.has(word)) return sides.listener
    return known.get(word) ?? null
  }
  return mark.relations.flatMap((r) => {
    const head = resolve(r.head)
    const tail = resolve(r.tail)
    return head && tail && head !== tail ? [{ label: r.label, head, tail }] : []
  })
}
