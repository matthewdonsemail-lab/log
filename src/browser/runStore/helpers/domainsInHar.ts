import { createReadStream } from 'node:fs'
import { domainOf } from '../../../rea/facebookClient/index.ts'

const NAME = /fb_api_req_friendly_name=([A-Za-z0-9_]+)/g
const OVERLAP = 300

export function countDomains(text: string, counts: Record<string, number>, upTo = text.length): void {
  for (const match of text.matchAll(NAME)) {
    if (match.index! >= upTo) break
    const domain = domainOf(match[1])
    counts[domain] = (counts[domain] ?? 0) + 1
  }
}

export async function domainsInHar(path: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  let carry = ''
  for await (const chunk of createReadStream(path, { encoding: 'utf8', highWaterMark: 4 << 20 })) {
    const text = carry + chunk
    const upTo = Math.max(0, text.length - OVERLAP)
    countDomains(text, counts, upTo)
    carry = text.slice(upTo)
  }
  countDomains(carry, counts)
  return counts
}
