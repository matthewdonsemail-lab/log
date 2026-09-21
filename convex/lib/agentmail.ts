/** Send email alerts through AgentMail (https://agentmail.to). Plain text only: post text is untrusted and never becomes HTML. */

export const AGENTMAIL_URL = 'https://api.agentmail.to/v0'

export type DigestHit = { score: number; intent: string | null; reason: string | null; phrase: string; platform: string; author: string; excerpt: string; url: string }

/** A single plain address: no spaces, no line breaks, no angle brackets, so it can never carry a second recipient or a header. */
export function isEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@<>,;"']+@[^\s@<>,;"']+\.[^\s@<>,;"']+$/.test(value)
}

const PLATFORM_NAMES: Record<string, string> = { reddit: 'Reddit', x: 'X', facebook: 'Facebook' }
const INTENT_WORDS: Record<string, string> = {
  looking_for_help: 'wants help', buying: 'ready to buy', complaint: 'complaint', promotion: 'promotion', discussion: 'discussion', other: 'other',
}

/** Subject and body for one email. The subject is fixed text plus a count; nothing from a post goes in it. */
export function renderDigest(hits: DigestHit[], siteUrl: string): { subject: string; text: string } {
  const subject = hits.length === 1 ? '1 strong match on ListeningKit' : `${hits.length} strong matches on ListeningKit`
  const blocks = hits.map(hit => {
    const where = PLATFORM_NAMES[hit.platform] ?? hit.platform
    const intent = hit.intent ? `, ${INTENT_WORDS[hit.intent] ?? hit.intent}` : ''
    const lines = [`${hit.score}/100${intent} · "${hit.phrase}" on ${where} · ${hit.author}`]
    if (hit.reason) lines.push(hit.reason)
    if (hit.excerpt) lines.push(`> ${hit.excerpt.replace(/\s+/g, ' ').slice(0, 240)}`)
    lines.push(hit.url)
    return lines.join('\n')
  })
  const footer = `Open ListeningKit: ${siteUrl}/dashboard/keywords\nTurn these emails off in Settings, Notifications.`
  return { subject, text: [...blocks, footer].join('\n\n') }
}

/** One send. Errors say what happened in plain words and never include the response body or the key. */
export async function sendEmail(
  fetcher: typeof fetch, apiKey: string, inboxId: string, message: { to: string; subject: string; text: string },
): Promise<void> {
  const res = await fetcher(`${AGENTMAIL_URL}/inboxes/${encodeURIComponent(inboxId)}/messages/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: message.to, subject: message.subject, text: message.text }),
    signal: AbortSignal.timeout(20_000),
  })
  if (res.status === 401 || res.status === 403) throw new Error('AgentMail refused the API key')
  if (res.status === 404) throw new Error('The AgentMail inbox was not found')
  if (res.status === 429) throw new Error('AgentMail is rate limiting sends, will retry')
  if (!res.ok) throw new Error(`AgentMail answered HTTP ${res.status}`)
}
