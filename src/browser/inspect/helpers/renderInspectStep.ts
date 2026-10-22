import type { InspectStepResult } from '../types'

export function redactFieldValue(line: string): string {
  return line.replace(/^(\s*-?\s*(?:textbox|searchbox|combobox|spinbutton)\b.*?):\s+\S.*$/, '$1: <redacted>')
}

export function renderInspectStep(result: InspectStepResult, showElements = 40): string {
  if (result.stopped) return `Inspect session stopped after ${result.steps ?? 0} step(s).`
  if (result.code && !result.step) return `Failed: ${result.code}${result.detail ? ` (${result.detail})` : ''}`
  const lines = [`${result.step}: ${result.ok ? 'done' : `failed (${result.error})`}`, `  Page: ${result.url} "${result.title ?? ''}"`]
  lines.push(`  ${result.requests ?? 0} request(s) in this step${result.notable?.length ? ':' : ''}`)
  for (const line of result.notable ?? []) lines.push(`    ${line}`)
  if (result.mouse) lines.push(`  mouse: ${result.mouse.legs} humanized leg(s), ${result.mouse.idleMoves} idle drift move(s) (mouse.json)`)
  if (result.rea) lines.push(`  rea: exit ${result.rea.code}${result.rea.evidenceId ? `, ${result.rea.evidenceId}` : ''}${result.rea.records !== undefined ? `, ${result.rea.records} record(s)` : ''}`)
  const elements = result.interactive ?? []
  const total = result.interactiveTotal ?? elements.length
  const fresh = result.interactiveNew === undefined ? '' : `, ${result.interactiveNew} new since the last step${result.interactiveNew ? ', listed first' : ''}`
  lines.push(`  ${total} element(s) on the page${fresh}${elements.length ? ' (use the ref to click/type):' : ''}`)
  for (const line of elements.slice(0, showElements)) lines.push(`    ${redactFieldValue(line)}`)
  if (elements.length > showElements) lines.push(`    … ${elements.length - showElements} more in ${result.folder}/snapshot.yml`)
  if (result.folder) lines.push(`  Recorded: ${result.folder} (snapshot.yml, screenshot.png, network.har, rea.json)`)
  return lines.join('\n')
}
