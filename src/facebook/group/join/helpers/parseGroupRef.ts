import type { GroupRef } from '../types'

const SLUG = /^[A-Za-z0-9.\-_]{3,}$/

export function parseGroupRef(raw: string): { ok: true; group: GroupRef } | { ok: false; error: string } {
  const text = raw.trim()
  let key: string | null = null
  if (/^https?:\/\//i.test(text)) {
    let url: URL
    try {
      url = new URL(text)
    } catch {
      return { ok: false, error: `"${text}" is not a URL` }
    }
    if (!/(^|\.)facebook\.com$/i.test(url.hostname)) return { ok: false, error: `"${url.hostname}" is not facebook.com` }
    const match = /^\/groups\/([^/?#]+)/.exec(url.pathname)
    if (!match) return { ok: false, error: `${url.pathname} is not a group page (/groups/<id or name>/)` }
    key = decodeURIComponent(match[1])
  } else {
    key = text.replace(/^\/?groups\//, '').replace(/\/.*$/, '')
  }
  if (!key || !SLUG.test(key) || ['search', 'feed', 'discover', 'joins', 'create'].includes(key)) {
    return { ok: false, error: `"${text}" names no group: give its URL, its id or its name in the URL` }
  }
  return { ok: true, group: { key, numeric: /^\d+$/.test(key), url: `https://www.facebook.com/groups/${key}/` } }
}
