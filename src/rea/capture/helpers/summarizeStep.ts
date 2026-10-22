export interface StepSummary {
  requests: number
  graphql: Record<string, number>
  pages: string[]
  uploads: number
  failed: Record<string, number>
}

interface HarEntry {
  request?: { method?: string; url?: string; headers?: { name: string; value: string }[]; postData?: { text?: string } }
  response?: { status?: number; content?: { mimeType?: string } }
}

const operation = (entry: HarEntry): string | null => {
  const header = entry.request?.headers?.find((h) => h.name.toLowerCase() === 'x-fb-friendly-name')
  if (header) return header.value
  const body = entry.request?.postData?.text ?? ''
  const match = body.match(/(?:^|&)fb_api_req_friendly_name=([^&]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function summarizeStep(har: { log?: { entries?: HarEntry[] } }): StepSummary {
  const summary: StepSummary = { requests: 0, graphql: {}, pages: [], uploads: 0, failed: {} }
  for (const entry of har.log?.entries ?? []) {
    summary.requests++
    let url: URL
    try {
      url = new URL(entry.request?.url ?? '')
    } catch {
      continue
    }
    const name = operation(entry)
    if (name) summary.graphql[name] = (summary.graphql[name] ?? 0) + 1
    const status = entry.response?.status ?? 0
    if (entry.request?.method === 'GET' && (entry.response?.content?.mimeType ?? '').includes('text/html') && !summary.pages.includes(url.pathname)) {
      summary.pages.push(url.pathname)
    }
    if (url.hostname.startsWith('upload.')) summary.uploads++
    if (status >= 400 || status <= 0) {
      const key = `${status} ${url.hostname}${url.pathname.slice(0, 60)}`
      summary.failed[key] = (summary.failed[key] ?? 0) + 1
    }
  }
  return summary
}

export function renderStepSummary(index: number, step: string, summary: StepSummary, evidenceId: string | null): string {
  const lines = [`### ${index}. ${step}`, '', `${summary.requests} requests${evidenceId ? ` · rea \`${evidenceId}\`` : ''}`]
  const ops = Object.entries(summary.graphql)
  if (ops.length) lines.push(`- GraphQL: ${ops.map(([n, c]) => (c > 1 ? `\`${n}\` ×${c}` : `\`${n}\``)).join(', ')}`)
  if (summary.pages.length) lines.push(`- Pages: ${summary.pages.map((p) => `\`${p}\``).join(', ')}`)
  if (summary.uploads) lines.push(`- Uploads: ${summary.uploads}`)
  const failed = Object.entries(summary.failed)
  if (failed.length) lines.push(`- Failed: ${failed.map(([k, c]) => `\`${k}\`${c > 1 ? ` ×${c}` : ''}`).join(', ')}`)
  return lines.join('\n')
}
