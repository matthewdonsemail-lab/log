interface HarEntry {
  request?: { postData?: { text?: string } }
  response?: { content?: { text?: string } }
}

const entriesOf = (har: unknown): HarEntry[] => (har as { log?: { entries?: HarEntry[] } })?.log?.entries ?? []

/** The parsed JSON bodies of every GraphQL response to `name` in a HAR, in order; a streamed body's first part. Pure. */
export function graphqlResponses(har: unknown, name: string): unknown[] {
  const out: unknown[] = []
  for (const entry of entriesOf(har)) {
    if (!(entry.request?.postData?.text ?? '').includes(`fb_api_req_friendly_name=${name}`)) continue
    for (const part of (entry.response?.content?.text ?? '').split('\n')) {
      try {
        out.push(JSON.parse(part))
        break
      } catch {
        // a part still being written, or not JSON
      }
    }
  }
  return out
}

/** Every response text in a HAR, pages and GraphQL alike: where data preloaded into a page lives. Pure. */
export function responseTexts(har: unknown): string[] {
  return entriesOf(har).map((e) => e.response?.content?.text ?? '').filter(Boolean)
}
