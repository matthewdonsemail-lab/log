import type { FlowDefinition } from '../types'

/**
 * A flow's documentation, from its definition and the recording behind it:
 * what it does, its params, each step with the element it acts on and the
 * request that confirms it (linked to that request's doc in
 * docs/facebookClient), rea's Evidence per step, and the machine as a
 * diagram. Pure. `requestDoc` maps a request name to its doc path, if there is one.
 */
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
  out.push('', '## Steps', '', '| # | Step | Does | Confirmed by | Recorded |', '| --- | --- | --- | --- | --- |')
  flow.steps.forEach((s, i) => {
    const does =
      s.action === 'goto' ? `open \`${s.url}\`` : s.role ? `${s.action} ${s.role} "${s.name}"${s.value ? ` with \`${s.value}\`` : ''}` : s.action
    const doc = s.expect ? requestDoc(s.expect) : null
    const confirmed = s.expect ? (doc ? `[\`${s.expect}\`](${doc})` : `\`${s.expect}\``) : '—'
    const recorded = `${s.recorded.step}${s.recorded.ms ? `, ${s.recorded.ms} ms` : ''}${s.recorded.reaEvidenceId ? `, rea \`${s.recorded.reaEvidenceId}\`` : ''}`
    out.push(`| ${i + 1} | \`${s.id}\` | ${does.replace(/\|/g, '/')} | ${confirmed} | ${recorded} |`)
  })
  out.push('', '## Machine', '', '```mermaid', 'stateDiagram-v2', `  [*] --> ${flow.steps[0]?.id ?? 'done'}`)
  flow.steps.forEach((s, i) => {
    out.push(`  ${s.id} --> ${flow.steps[i + 1]?.id ?? 'done'}${s.expect ? `: ${s.expect}` : ''}`)
    out.push(`  ${s.id} --> failed`)
  })
  out.push('  done --> [*]', '```', '')
  return out.join('\n')
}

/** `profileSetup` → `flowProfileSetup`: the flow's MCP tool. Pure. */
export function toolName(flow: string): string {
  return `flow${flow[0].toUpperCase()}${flow.slice(1)}`
}
