import { existsSync, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { DEFAULT_COPY_STYLE, styleHint, styleProblems } from '../../copy/style/index'
import { watermarkReadingOf } from '../../copy/watermark/index'
import type { SendAction, SendPlan, SendProblem, SendRequest } from './types'

export const TWEET_URL = /^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[A-Za-z0-9_]+\/status\/\d+/

export const WITH_TEXT: readonly SendAction[] = ['reply', 'quote', 'dm', 'post']

export const BY_USER: readonly SendAction[] = ['dm', 'follow']

export const NEW_POST = 'newPost'

export type MediaKind = 'image' | 'gif' | 'video'

export const MEDIA_KINDS: Record<string, MediaKind> = { '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.webp': 'image', '.gif': 'gif', '.mp4': 'video', '.mov': 'video' }

export const MEDIA_MAX_BYTES: Record<MediaKind, number> = { image: 5 * 1024 * 1024, gif: 15 * 1024 * 1024, video: 512 * 1024 * 1024 }

export type SizeOf = (path: string) => number | null

export const fileSize: SizeOf = (path) => (existsSync(path) ? statSync(path).size : null)

export function mediaKindOf(path: string): MediaKind | null {
  return MEDIA_KINDS[extname(path).toLowerCase()] ?? null
}

export function mediaProblem(paths: readonly string[], sizeOf: SizeOf = fileSize): SendProblem | null {
  if (!paths.length) return null
  const kinds: MediaKind[] = []
  for (const path of paths) {
    const kind = mediaKindOf(path)
    if (!kind) return { code: 'mediaInvalid', detail: `${path}: X takes ${Object.keys(MEDIA_KINDS).join(' ')} files` }
    const bytes = sizeOf(path)
    if (bytes === null) return { code: 'mediaInvalid', detail: `${path}: no such file` }
    if (bytes === 0) return { code: 'mediaInvalid', detail: `${path}: the file is empty` }
    if (bytes > MEDIA_MAX_BYTES[kind]) return { code: 'mediaInvalid', detail: `${path}: ${(bytes / 1024 / 1024).toFixed(1)} MB is over X's ${MEDIA_MAX_BYTES[kind] / 1024 / 1024} MB for a ${kind}` }
    kinds.push(kind)
  }
  const moving = kinds.filter((k) => k !== 'image').length
  if (moving && paths.length > 1) return { code: 'mediaInvalid', detail: 'a video or gif goes on a post alone: one file, no images beside it' }
  if (paths.length > 4) return { code: 'mediaInvalid', detail: `${paths.length} images: X takes up to 4 on one post` }
  return null
}

export function targetOf(request: Pick<SendRequest, 'action' | 'tweetUrl' | 'userId'>): string | undefined {
  if (request.action === 'post') return NEW_POST
  return BY_USER.includes(request.action) ? request.userId : request.tweetUrl
}

export function planSend(request: SendRequest, sizeOf: SizeOf = fileSize): SendPlan {
  const target = targetOf(request)?.trim()
  if (!target) return { ok: false, problem: { code: 'targetMissing', detail: BY_USER.includes(request.action) ? `${request.action} needs --userId, the person from treg research` : `${request.action} needs --tweet, the post's url` } }
  if (request.action !== 'post' && !BY_USER.includes(request.action) && !TWEET_URL.test(target)) return { ok: false, problem: { code: 'tweetUrlInvalid', detail: `${target} isn't an x.com post url (https://x.com/<handle>/status/<id>)` } }
  if (BY_USER.includes(request.action) && !/^\d+$/.test(target)) return { ok: false, problem: { code: 'userIdInvalid', detail: `${target} isn't an X user id (digits only)` } }
  const text = request.text?.trim()
  if (WITH_TEXT.includes(request.action) && !text) return { ok: false, problem: { code: 'textMissing', detail: `${request.action} needs --text` } }
  if (text && !request.skipStyleCheck) {
    const style = request.style?.trim() || DEFAULT_COPY_STYLE
    const problems = styleProblems(text, style)
    if (problems.length) return { ok: false, problem: { code: 'styleFailed', detail: `the ${style} style check failed: ${problems.join(', ')} (${styleHint(style)})` } }
  }
  const watermark = text ? watermarkReadingOf(text) : null
  if (watermark?.level === 'artifacts') return { ok: false, problem: { code: 'aiArtifacts', detail: `the copy carries what AI chat interfaces leave in text: ${watermark.findings.filter((f) => f.deterministic).map((f) => `${f.label} ×${f.count}`).join(', ')}` } }
  const media = (request.media ?? []).map((m) => m.trim()).filter(Boolean).map((m) => resolve(m))
  if (media.length && request.action !== 'post') return { ok: false, problem: { code: 'mediaInvalid', detail: `${request.action} takes no media: only a post does` } }
  const badMedia = mediaProblem(media, sizeOf)
  if (badMedia) return { ok: false, problem: badMedia }
  const approvedBy = request.approvedBy?.trim()
  if (request.live && !approvedBy) return { ok: false, problem: { code: 'notApproved', detail: `${request.action} sends on X: --approvedBy <who approved it> is needed with --live` } }
  return {
    ok: true,
    target,
    ...(watermark ? { watermark } : {}),
    spec: {
      action: request.action,
      live: request.live,
      approvedBy,
      ...(request.action === 'post' ? {} : BY_USER.includes(request.action) ? { userId: target } : { tweetUrl: target }),
      ...(text ? { text } : {}),
      ...(media.length ? { media } : {})
    }
  }
}
