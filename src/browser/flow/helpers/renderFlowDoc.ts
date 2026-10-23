import type { AnswerCheck, FlowDefinition } from '../types'

export function checkText(check: AnswerCheck): string {
  const want = check.present ? 'present' : check.home ? (check.home === 'uid' ? "the account's id" : `the account's home ${check.home}`) : check.sent ? `what we sent as \`${check.sent}\`` : `\`${JSON.stringify(check.is)}\``
  return `\`${check.answer}\` ${check.present ? 'is' : check.home === 'city' ? 'names' : '='} ${want}${check.code ? ` (else \`${check.code}\`)` : ''}`
}

export function renderFlowDoc(flow: FlowDefinition, requestDoc: (name: string) => string | null = () => null): string {
  const out = [
    `# Flow: \`${flow.name}\``,
    '',
    flow.summary,
    '',
    `Built by \`log flow fromInspect\` from the recording \`${flow.source.runDir}\` (account ${flow.source.account}). Run it on any account with \`log flow run ${flow.name} --account <a> --live\`, or over MCP as the tool \`${toolName(flow.name)}\` (rule 31).`,
    '',
    '## Params',
    ''
  ]
  for (const p of flow.params) out.push(`- \`${p.name}\` (${p.kind}): ${p.description}`)
  if (!flow.params.length) out.push('None.')
  out.push('', '## Steps', '', '| # | Step | Does | Confirmed by | Facebook must answer (rule 73) | Recorded |', '| --- | --- | --- | --- | --- | --- |')
  flow.steps.forEach((s, i) => {
    const does =
      s.action === 'goto' ? `open \`${s.url}\`` : s.role ? `${s.action} ${s.role} "${s.name}"${s.value ? ` with \`${s.value}\`` : ''}` : s.action
    const doc = s.expect ? requestDoc(s.expect) : null
    const confirmed = s.expect ? (doc ? `[\`${s.expect}\`](${doc})` : `\`${s.expect}\``) : '—'
    const recorded = `${s.recorded.step}${s.recorded.ms ? `, ${s.recorded.ms} ms` : ''}${s.recorded.reaEvidenceId ? `, rea \`${s.recorded.reaEvidenceId}\`` : ''}`
    const answers = s.answers?.length ? s.answers.map((a) => `\`${a.call}\` 2xx${a.says.length ? `: ${a.says.map(checkText).join('; ')}` : ''}`).join('<br>') : '—'
    out.push(`| ${i + 1} | \`${s.id}\` | ${does.replace(/\|/g, '/')} | ${confirmed} | ${answers.replace(/\|/g, '/')} | ${recorded} |`)
  })
  out.push('', '## Machine', '', '```mermaid', 'stateDiagram-v2', `  [*] --> ${flow.steps[0]?.id ?? 'done'}`)
  flow.steps.forEach((s, i) => {
    out.push(`  ${s.id} --> ${flow.steps[i + 1]?.id ?? 'done'}${s.expect ? `: ${s.expect}` : ''}`)
    out.push(`  ${s.id} --> failed`)
  })
  out.push('  done --> [*]', '```', '')
  return out.join('\n')
}

export function toolName(flow: string): string {
  return `flow${flow[0].toUpperCase()}${flow.slice(1)}`
}
