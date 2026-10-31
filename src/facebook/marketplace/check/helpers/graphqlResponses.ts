interface HarEntry {
  request?: { postData?: { text?: string } }
  response?: { content?: { text?: string } }
}

const entriesOf = (har: unknown): HarEntry[] => (har as { log?: { entries?: HarEntry[] } })?.log?.entries ?? []

export function graphqlResponses(har: unknown, name: string): unknown[] {
  const out: unknown[] = []
  for (const entry of entriesOf(har)) {
    if (!(entry.request?.postData?.text ?? '').includes(`fb_api_req_friendly_name=${name}`)) continue
    for (const part of (entry.response?.content?.text ?? '').split('\n')) {
      try {
        out.push(JSON.parse(part))
        break
      } catch {
      }
    }
  }
  return out
}

export function responseTexts(har: unknown): string[] {
  return entriesOf(har).map((e) => e.response?.content?.text ?? '').filter(Boolean)
}
