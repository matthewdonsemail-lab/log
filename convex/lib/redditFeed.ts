import type { NormalizedPost } from './posts'

/** Reddit asks automated readers for a descriptive User-Agent. */
export const REDDIT_UA = 'ListeningKit/1.0 (social listening; +https://github.com/matthewdonsemail-lab/log)'

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === '#') {
      const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(point) && point > 0 && point < 0x110000 ? String.fromCodePoint(point) : whole
    }
    return ENTITIES[code.toLowerCase()] ?? whole
  })
}

function tag(block: string, name: string): string | null {
  const found = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(block)
  return found ? found[1] : null
}

/** Reddit's Atom feed carries the post body as escaped HTML. Reduce it to readable text. */
function bodyText(escapedHtml: string): string {
  const html = decode(escapedHtml)
  const text = decode(html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]*>/g, ' '))
  return text
    .replace(/submitted by\s+\/u\/\S+(\s*\[(?:link|comments)\])*\s*$/i, '')
    .replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Parse the Atom feed of /r/<sub>/new. Reddit's feed has no scores or comment counts, so those
 * come back as 0 and the caller must treat metrics as unknown.
 */
export function parseRedditAtom(xml: string): NormalizedPost[] {
  const posts: NormalizedPost[] = []
  for (const entry of xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []) {
    const id = tag(entry, 'id')?.trim()
    const link = /<link\s[^>]*href="([^"]+)"/.exec(entry)?.[1]
    if (!id || !/^t3_[a-z0-9]{1,12}$/.test(id) || !link) continue
    const decoded = decode(link)
    if (!/^https:\/\/(www\.|old\.)?reddit\.com\//.test(decoded)) continue
    // One canonical form, so a post read from any host dedupes against every other source.
    const url = decoded.replace(/^https:\/\/(www\.|old\.)?reddit\.com\//, 'https://reddit.com/')
    const title = decode(tag(entry, 'title') ?? '').trim()
    const author = decode(/<author>[\s\S]*?<name>([^<]*)<\/name>/.exec(entry)?.[1] ?? '').replace(/^\/?u\//, '').trim()
    const stamp = Date.parse(tag(entry, 'published') ?? tag(entry, 'updated') ?? '')
    const body = bodyText(tag(entry, 'content') ?? '')
    posts.push({
      externalId: id,
      authorName: author || 'unknown',
      body: body ? [body.slice(0, 4000)] : [],
      ...(title ? { title: title.slice(0, 500) } : {}),
      url,
      ...(Number.isFinite(stamp) ? { timestamp: new Date(stamp).toISOString() } : {}),
      likes: 0,
      comments: 0,
    })
  }
  return posts
}

/** Newest posts straight from Reddit. Throws with a plain reason when Reddit refuses or answers with something else. */
export async function fetchRedditRss(fetcher: typeof fetch, subreddit: string, limit: number): Promise<NormalizedPost[]> {
  const host = 'www.reddit.com'
  let res: Response
  try {
    res = await fetcher(`https://${host}/r/${encodeURIComponent(subreddit)}/new/.rss?limit=${limit}`, {
      headers: { 'User-Agent': REDDIT_UA },
      redirect: 'manual', // a redirect means Reddit sent us to a login page
      signal: AbortSignal.timeout(12_000),
    })
  } catch {
    throw new Error(`could not reach ${host}`)
  }
  if (res.status >= 300 && res.status < 400) throw new Error(`${host} asked for a login`)
  if (!res.ok) throw new Error(`${host} answered HTTP ${res.status}`)
  const posts = parseRedditAtom(await res.text())
  if (posts.length === 0) throw new Error(`${host} returned no posts`)
  return posts
}

export type RedditAppCredentials = { id: string; secret: string }

type Listing = { data?: { children?: { data?: Record<string, unknown> }[] } }

/**
 * Reddit's official API with application-only OAuth: the app gets its own request budget
 * instead of sharing the crowded budget of the server's address. Metrics are real here.
 */
export async function fetchRedditApi(
  fetcher: typeof fetch,
  subreddit: string,
  limit: number,
  creds: RedditAppCredentials,
): Promise<NormalizedPost[]> {
  let token: string
  try {
    const res = await fetcher('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${creds.id}:${creds.secret}`)}`,
        'User-Agent': REDDIT_UA,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      redirect: 'manual',
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) throw new Error(`Reddit app sign-in answered HTTP ${res.status}`)
    const body = (await res.json()) as { access_token?: unknown }
    if (typeof body.access_token !== 'string' || !body.access_token) throw new Error('Reddit app sign-in returned no token')
    token = body.access_token
  } catch (error) {
    throw new Error(error instanceof Error && error.message.startsWith('Reddit app') ? error.message : 'could not sign in to the Reddit API')
  }
  let listing: Listing
  try {
    const res = await fetcher(`https://oauth.reddit.com/r/${encodeURIComponent(subreddit)}/new?limit=${limit}&raw_json=1`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': REDDIT_UA },
      redirect: 'manual',
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) throw new Error(`Reddit API answered HTTP ${res.status}`)
    listing = (await res.json()) as Listing
  } catch (error) {
    throw new Error(error instanceof Error && error.message.startsWith('Reddit API') ? error.message : 'could not reach the Reddit API')
  }
  const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0)
  const posts: NormalizedPost[] = []
  for (const child of listing.data?.children ?? []) {
    const row = child.data ?? {}
    const id = typeof row.id === 'string' ? row.id : ''
    const permalink = typeof row.permalink === 'string' ? row.permalink : ''
    if (!/^[a-z0-9]{1,12}$/.test(id) || !permalink) continue
    const title = typeof row.title === 'string' ? row.title.trim() : ''
    const text = typeof row.selftext === 'string' ? row.selftext.trim() : ''
    const created = typeof row.created_utc === 'number' ? new Date(row.created_utc * 1000) : null
    posts.push({
      externalId: `t3_${id}`,
      authorName: typeof row.author === 'string' && row.author ? row.author : 'unknown',
      body: text ? [text.slice(0, 4000)] : [],
      ...(title ? { title: title.slice(0, 500) } : {}),
      url: `https://reddit.com${permalink}`,
      ...(created && Number.isFinite(created.getTime()) ? { timestamp: created.toISOString() } : {}),
      likes: count(row.score),
      comments: count(row.num_comments),
    })
  }
  if (posts.length === 0) throw new Error('Reddit API returned no posts')
  return posts
}
